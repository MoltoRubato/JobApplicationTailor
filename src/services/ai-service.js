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

// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? 'https://your-app-name.vercel.app' 
//   : 'http://localhost:3000';

// export const generateApplication = async (resume, jobDescription) => {
//   try {
//     console.log('Generating application with AI...');
    
//     // Generate cover letter and bullets in parallel
//     const [coverLetterResponse, bulletsResponse] = await Promise.all([
//       fetch(`${API_BASE_URL}/api/generate-application`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           resume,
//           jobDescription,
//           type: 'cover-letter'
//         })
//       }),
//       fetch(`${API_BASE_URL}/api/generate-application`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           resume,
//           jobDescription,
//           type: 'bullets'
//         })
//       })
//     ]);

//     // Check if requests were successful
//     if (!coverLetterResponse.ok) {
//       const errorData = await coverLetterResponse.json();
//       throw new Error(`Cover letter generation failed: ${errorData.message}`);
//     }

//     if (!bulletsResponse.ok) {
//       const errorData = await bulletsResponse.json();
//       throw new Error(`Bullets generation failed: ${errorData.message}`);
//     }

//     const coverLetterData = await coverLetterResponse.json();
//     const bulletsData = await bulletsResponse.json();

//     return {
//       coverLetter: coverLetterData.result,
//       cvBullets: bulletsData.result
//     };

//   } catch (error) {
//     console.error('Error generating application:', error);
//     throw new Error(`Generation failed: ${error.message}`);
//   }
// };

// // Alternative function for testing locally
// export const generateApplicationLocal = async (resume, jobDescription) => {
//   try {
//     // For local development, use relative URLs
//     const [coverLetterResponse, bulletsResponse] = await Promise.all([
//       fetch('/api/generate-application', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           resume,
//           jobDescription,
//           type: 'cover-letter'
//         })
//       }),
//       fetch('/api/generate-application', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           resume,
//           jobDescription,
//           type: 'bullets'
//         })
//       })
//     ]);

//     if (!coverLetterResponse.ok || !bulletsResponse.ok) {
//       throw new Error('API request failed');
//     }

//     const coverLetterData = await coverLetterResponse.json();
//     const bulletsData = await bulletsResponse.json();

//     return {
//       coverLetter: coverLetterData.result,
//       cvBullets: bulletsData.result
//     };
//   } catch (error) {
//     console.error('Error generating application:', error);
//     throw error;
//   }
// };