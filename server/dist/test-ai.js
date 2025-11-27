"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 1. Try loading .env from server root
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
}
// 2. Check API Key
const apiKey = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY present:', !!apiKey);
if (apiKey) {
    console.log('GEMINI_API_KEY length:', apiKey.length);
    console.log('GEMINI_API_KEY start:', apiKey.substring(0, 5) + '...');
}
else {
    console.error('GEMINI_API_KEY is missing or empty');
    process.exit(1);
}
// 3. Test Gemini API
async function testGemini() {
    console.log('Initializing Gemini Client...');
    try {
        // List models
        /*
        const genAI = new GoogleGenerativeAI(apiKey as string);
        // Note: listModels is not directly on genAI instance in some versions,
        // but let's try to just use the model we know exists or debug the error.
        // Actually, the error message suggests calling ListModels.
        // In the Node SDK, it might be different.
        */
        // Let's try 'gemini-1.0-pro' which is the stable version of 'gemini-pro'
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
        console.log('Sending test prompt to gemini-1.0-pro...');
        const prompt = 'Hello';
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('----------------------------------------');
        console.log('SUCCESS! AI Response:');
        console.log(text);
        console.log('----------------------------------------');
    }
    catch (error) {
        console.error('----------------------------------------');
        console.error('FAILURE! API Error:');
        console.error(error.message);
        if (error.response) {
            console.error('Response details:', JSON.stringify(error.response, null, 2));
        }
        console.error('----------------------------------------');
    }
}
testGemini();
