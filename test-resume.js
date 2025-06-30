import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3000';

async function testResumeProcessing() {
  try {
    console.log('Testing resume processing...');

    const resumePath = path.join(__dirname, 'test-resume.pdf');
    const resumeBuffer = fs.readFileSync(resumePath);

    const formData = new FormData();
    formData.append('resume', new Blob([resumeBuffer]), 'test-resume.pdf');

    const processResponse = await axios.post(`${API_URL}/api/ai/process-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { resumeData, site } = processResponse.data;

    console.log('Resume data:', resumeData);
    console.log('Generated site:', site);

    if (!resumeData.name || !resumeData.industry || !resumeData.role || !resumeData.personality) {
      throw new Error('Resume data is missing required fields');
    }

    console.log('Resume processing test passed!');

    return resumeData;
  } catch (error) {
    console.error('Resume processing test failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

async function testPortfolioCreation(resumeData) {
  try {
    console.log('Testing portfolio creation...');

    const portfolioResponse = await axios.post(`${API_URL}/api/resume/create-portfolio`, {
      resumeData,
      userId: 'test-user', // Replace with a valid user ID
    });

    const { site } = portfolioResponse.data;

    console.log('Created portfolio site:', site);

    if (!site.subdomain) {
      throw new Error('Portfolio site is missing a subdomain');
    }

    console.log('Portfolio creation test passed!');
  } catch (error) {
    console.error('Portfolio creation test failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

async function runTests() {
  const resumeData = await testResumeProcessing();
  await testPortfolioCreation(resumeData);
}

runTests();
