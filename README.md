# Ryan's AI Job Application Tailor

A smart web application that helps job seekers create tailored cover letters and CV bullet points using AI. Simply upload your resume, paste a job description, and get personalized application materials in seconds.

## Features

- **Resume Upload**: Support for .txt and .pdf file formats
- **Job Description Input**: Paste any job description to tailor your application
- **AI-Generated Content**: Creates custom cover letters and CV bullet points
- **Application History**: Track your previous applications
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS for styling
- Lucide React for icons

**Backend:**
- Node.js
- Express.js server

**AI Integration:**
- GitHub AI API (Free tier)
- Model: GPT-4.1

**Development Tools:**
- Vite for build tooling
- ESLint for code linting
- PostCSS for CSS processing

## Project Structure

```
jobap/
├── .vercel/                    # Vercel deployment config
├── api/                        # Backend API routes
│   └── generate-application.js # Main AI generation endpoint
├── plugins/                    # Vite plugins
│   └── visual-editor/         # Visual editor configuration
├── public/                     # Static assets
│   └── .htaccess              # Server configuration
├── src/                        # Frontend source code
│   ├── components/            # React components
│   │   └── ui/               # UI components
│   │       ├── button.jsx
│   │       ├── toast.jsx
│   │       └── toaster.jsx
│   ├── lib/                   # Utility libraries
│   │   └── utils.js
│   ├── services/              # API services
│   │   └── ai-service.js
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles
│   └── main.jsx               # Application entry point
├── tools/                     # Development tools
│   └── generate-films.js      # Utility scripts
├── .gitignore                 # Git ignore rules
├── .nvmrc                     # Node version specification
├── index.html                 # HTML entry point
├── package-lock.json          # Dependency lock file
├── package.json               # Project dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vercel.json                # Vercel deployment config
└── vite.config.js             # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (version specified in .nvmrc)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jobap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file and add your GitHub AI API key
GITHUB_AI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Upload Resume**: Drag and drop or click to upload your resume (.txt or .pdf)
2. **Paste Job Description**: Copy and paste the job description you're applying for
3. **Generate**: Click "Generate Application" to create tailored content
4. **Review**: Check your custom cover letter and CV bullet points
5. **Apply**: Use the generated content in your job application

## API Limitations

This application currently uses the free GitHub AI API with daily usage limits. If you encounter rate limiting, please try again later or consider upgrading to a paid plan.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please reach out to ryanhuang1234567890@gmail.com
