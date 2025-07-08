export const generateApplication = async (resume, jobDescription) => {
  try {
    console.log('Generating application with AI...');
    
    // Use relative URLs for both development and production
    const [coverLetterResponse, bulletsResponse] = await Promise.all([
      fetch('/api/generate-application', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
          type: 'cover-letter'
        })
      }),
      fetch('/api/generate-application', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
          type: 'bullets'
        })
      })
    ]);

    // Check if requests were successful
    if (!coverLetterResponse.ok) {
      const errorData = await coverLetterResponse.json();
      throw new Error(`Cover letter generation failed: ${errorData.message}`);
    }

    if (!bulletsResponse.ok) {
      const errorData = await bulletsResponse.json();
      throw new Error(`Bullets generation failed: ${errorData.message}`);
    }

    const coverLetterData = await coverLetterResponse.json();
    const bulletsData = await bulletsResponse.json();

    return {
      coverLetter: coverLetterData.result,
      cvBullets: bulletsData.result
    };

  } catch (error) {
    console.error('Error generating application:', error);
    throw new Error(`Generation failed: ${error.message}`);
  }
};
