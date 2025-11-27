const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAusz0686YLWiyMkzjfBuFt_7l_ohrSaIY';

async function run() {
  const modelName = 'gemini-2.0-flash';
  console.log(`Testing model: ${modelName}...`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    console.log(`SUCCESS with ${modelName}:`, response.text());
  } catch (error) {
    console.log(`FAILED with ${modelName}:`, error.message);
  }
}

run();
