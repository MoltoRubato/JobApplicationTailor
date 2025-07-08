import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export default async function handler(req, res) {
  console.log('🚀 API Function Called');
  console.log('📡 Method:', req.method);
  console.log('📡 Headers:', req.headers);
  console.log('📡 Body:', req.body);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { resume, jobDescription, type } = req.body;
    console.log('📋 Request data:', { resumeLength: resume?.length, jobDescLength: jobDescription?.length, type });

    const githubToken = process.env.GITHUB_TOKEN;
    console.log('🔑 GitHub Token exists:', !!githubToken);
    console.log('🔑 GitHub Token prefix:', githubToken ? githubToken.substring(0, 10) + '...' : 'NONE');

    if (!githubToken) {
      console.log('❌ No GitHub token found');
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    if (!resume || !jobDescription) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Resume and job description are required' });
    }

    let prompt;

    if (type === 'cover-letter') {
      prompt = `You are a professional career advisor. Write a compelling cover letter for this job application.

Resume Summary: ${resume.substring(0, 1500)}

Job Description: ${jobDescription.substring(0, 1000)}

Requirements:
1. Address the hiring manager professionally
2. Highlight relevant experience from the resume that matches the job requirements
3. Show genuine enthusiasm for the specific role and company
4. Connect the candidate's skills directly to job requirements
5. Include specific examples and achievements when possible
6. End with a strong call to action
7. Keep it concise and professional (3-4 paragraphs)

IMPORTANT: Write ONLY the cover letter content. Do not include any thinking process, explanations, or commentary. Start directly with "Dear Hiring Manager" and end with the signature.`;
      
    } else if (type === 'bullets') {
      prompt = `You are a professional resume writer. Create exactly 7 tailored CV bullet points for this job application.

Resume: ${resume.substring(0, 1500)}

Job Description: ${jobDescription.substring(0, 1000)}

Requirements:
1. Start each bullet point with a strong action verb
2. Include quantifiable achievements and metrics when possible
3. Highlight skills and experiences that directly match the job requirements
4. Make each bullet point concise but impactful (1-2 lines each)
5. Use keywords from the job description
6. Focus on accomplishments, not just responsibilities
7. Each bullet should demonstrate value and impact

Return exactly 7 bullet points in this format:
• [bullet point 1]
• [bullet point 2]
• [bullet point 3]
• [bullet point 4]
• [bullet point 5]
• [bullet point 6]
• [bullet point 7]

IMPORTANT: Write ONLY the bullet points. Do not include any thinking process or explanations.`;
      
    } else {
      console.log('❌ Invalid type:', type);
      return res.status(400).json({ message: 'Invalid type. Use "cover-letter" or "bullets"' });
    }

    console.log('🌐 Sending request to GitHub AI');

    // Initialize GitHub AI client
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1"; // You can change this to other available models
    
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(githubToken),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: model,
        temperature: 0.7,
        max_tokens: type === 'cover-letter' ? 1200 : 600,
        top_p: 1.0
      }
    });

    console.log('📬 Response status:', response.status);

    if (isUnexpected(response)) {
      console.error('💥 GitHub AI API error:', response.body.error);
      
      if (response.status === '503') {
        return res.status(503).json({
          message: 'AI model is loading, please try again in a few moments'
        });
      }

      return res.status(parseInt(response.status) || 500).json({
        message: 'AI generation failed',
        error: response.body.error
      });
    }

    console.log('📦 Raw AI Response:', response.body);

    // GitHub AI returns response in OpenAI format
    const content = response.body.choices?.[0]?.message?.content || '';
    
    if (!content) {
      console.error('❌ No content in response');
      return res.status(500).json({
        message: 'No content generated',
        error: 'Empty response from AI model'
      });
    }

    let result = content.trim();

    // Clean up the response for cover letters
    if (type === 'cover-letter') {
      result = cleanCoverLetterContent(result);
      
      // Check if the cover letter seems incomplete (doesn't end with proper closing)
      if (!isCompleteCoverLetter(result)) {
        console.log('⚠️ Cover letter appears incomplete, regenerating with higher token limit');
        
        // Try again with higher token limit
        const retryResponse = await client.path("/chat/completions").post({
          body: {
            messages: [
              {
                role: "user",
                content: prompt + "\n\nIMPORTANT: Make sure to complete the entire cover letter with a proper closing and signature."
              }
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 1.0
          }
        });
        
        if (!isUnexpected(retryResponse)) {
          const retryContent = retryResponse.body.choices?.[0]?.message?.content || '';
          if (retryContent) {
            result = cleanCoverLetterContent(retryContent.trim());
          }
        }
      }
      
      console.log('✅ Cover letter cleaned and ready');
      return res.status(200).json({ result });
    }

    if (type === 'bullets') {
      // Extract bullet points from the response
      const bullets = result
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
        .map(line => line.replace(/^[•\-*]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 7);

      // Ensure we have exactly 7 bullets
      if (bullets.length < 7) {
        console.log('⚠️ Not enough valid bullets generated, using fallbacks');
        const fallbackBullets = [
          'Led cross-functional teams to deliver projects 25% ahead of schedule',
          'Implemented innovative solutions that increased operational efficiency by 30%',
          'Collaborated with stakeholders to identify requirements and develop strategic initiatives',
          'Managed complex workflows and processes ensuring seamless execution',
          'Demonstrated expertise in problem-solving and analytical thinking',
          'Mentored team members and contributed to knowledge sharing initiatives',
          'Maintained strong communication with clients throughout project lifecycles'
        ];
        
        while (bullets.length < 7 && bullets.length < fallbackBullets.length) {
          bullets.push(fallbackBullets[bullets.length]);
        }
      }

      console.log('✅ Final bullet points:', bullets);
      return res.status(200).json({ result: bullets });
    }

  } catch (error) {
    console.error('💥 API Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
}

// Helper function to check if cover letter is complete
function isCompleteCoverLetter(content) {
  const lowerContent = content.toLowerCase();
  
  // Check for common closing phrases
  const closingPhrases = [
    'sincerely',
    'best regards',
    'kind regards',
    'yours faithfully',
    'yours sincerely',
    'thank you for your consideration',
    'look forward to hearing from you',
    'look forward to discussing'
  ];
  
  const hasClosing = closingPhrases.some(phrase => lowerContent.includes(phrase));
  
  // Check if it ends abruptly (common signs of incomplete text)
  const endsAbruptly = content.match(/[a-z,]\s*$/i) || // ends with lowercase letter or comma
                      content.includes('I am confident my') && !hasClosing || // common incomplete ending
                      content.split('\n').length < 3; // too short
  
  return hasClosing && !endsAbruptly;
}

// Helper function to clean cover letter content
function cleanCoverLetterContent(content) {
  // Remove any thinking process wrapped in <think> tags
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Remove any lines that start with common thinking indicators
  const thinkingPatterns = [
    /^(okay|alright|let me|let's|first|the|looking at|based on|given|considering)/i,
    /^(i need to|i should|i'll|i will|my task|the task|this is about)/i,
    /^(analysis|summary|review|assessment|evaluation)/i,
    /^(step \d+|point \d+|\d+\.|bullet)/i
  ];
  
  const lines = content.split('\n');
  const cleanedLines = [];
  let foundCoverLetterStart = false;
  
  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines at the beginning
    if (!line && !foundCoverLetterStart) continue;
    
    // Check if this looks like the start of a cover letter
    if (line.toLowerCase().includes('dear hiring manager') || 
        line.toLowerCase().includes('dear sir/madam') ||
        line.toLowerCase().includes('dear ') ||
        line.toLowerCase().includes('to whom it may concern')) {
      foundCoverLetterStart = true;
      cleanedLines.push(line);
      continue;
    }
    
    // If we haven't found the start yet, check if this line looks like thinking
    if (!foundCoverLetterStart) {
      const isThinking = thinkingPatterns.some(pattern => pattern.test(line));
      if (isThinking) continue;
      
      // If it's not thinking and we haven't found the start, this might be the start
      if (line.length > 20) {
        foundCoverLetterStart = true;
      }
    }
    
    if (foundCoverLetterStart && line) {
      cleanedLines.push(line);
    }
  }
  
  let result = cleanedLines.join('\n').trim();
  
  // Remove any remaining artifacts
  result = result.replace(/^[\s\S]*?(Dear [^,\n]+[,:])/i, '$1');
  
  // Ensure proper formatting
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive line breaks
  
  return result;
}