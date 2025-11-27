"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConnections = exports.suggestTagsFromContent = exports.generateFlashcardsFromContent = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const apiKey = env_1.env.GEMINI_API_KEY;
console.log('AI Service - Loaded API Key:', apiKey ? (apiKey.substring(0, 5) + '...') : 'undefined');
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const generateFlashcardsFromContent = async (content) => {
    // Mock fallback if no key provided
    if (!env_1.env.GEMINI_API_KEY || env_1.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('Gemini API Key missing. Returning mock flashcards.');
        return [
            { question: 'What is the main concept here?', answer: 'This is a generated answer based on the content.' },
            { question: 'Why is this important?', answer: 'It helps in understanding the core topic.' },
            { question: 'How does it work?', answer: 'It functions by integrating various components.' }
        ];
    }
    const prompt = `
    Analyze the following text and generate 3-5 high-quality flashcards (Question and Answer pairs).
    Return ONLY a valid JSON array of objects with "question" and "answer" keys.
    Do not include markdown formatting like \`\`\`json.
    
    Text:
    ${content}
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('AI Raw Response (Flashcards):', text);
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        }
        catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('AI returned invalid JSON format');
        }
    }
    catch (error) {
        console.error('AI Flashcard Generation Error:', error);
        // Fallback on error
        return [
            { question: 'Error generating cards', answer: 'Please check your API key or try again.' }
        ];
    }
};
exports.generateFlashcardsFromContent = generateFlashcardsFromContent;
const suggestTagsFromContent = async (content) => {
    // Mock fallback if no key provided
    if (!env_1.env.GEMINI_API_KEY || env_1.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('Gemini API Key missing. Returning mock tags.');
        return ['mock-tag', 'concept', 'learning', 'ai-generated'];
    }
    const prompt = `
    Analyze the following text and suggest 3-5 relevant, concise tags (single words or short phrases).
    Return ONLY a valid JSON array of strings.
    Do not include markdown formatting.

    Text:
    ${content}
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('AI Raw Response:', text); // Log for debugging
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        }
        catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Failed Text:', text);
            throw new Error('AI returned invalid JSON format: ' + text.substring(0, 50) + '...');
        }
    }
    catch (error) {
        console.error('AI Tag Suggestion Error:', error);
        // Fallback on error
        return ['error', 'check-logs'];
    }
};
exports.suggestTagsFromContent = suggestTagsFromContent;
const findConnections = async (targetNode, candidateNodes) => {
    // Mock fallback
    if (!env_1.env.GEMINI_API_KEY || env_1.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('Gemini API Key missing. Returning mock connections.');
        return candidateNodes.slice(0, 2).map(node => ({
            to: node._id,
            label: 'related',
            reason: 'Mock connection based on similarity.'
        }));
    }
    const candidatesSummary = candidateNodes.map(n => ({
        id: n._id,
        title: n.title,
        excerpt: n.bodyMarkdown?.substring(0, 200) || ''
    }));
    const prompt = `
    Analyze the "Target Node" and the list of "Candidate Nodes".
    Identify which candidate nodes are semantically related to the target node.
    Return a JSON array of objects with the following structure:
    {
      "to": "candidate_node_id",
      "label": "related" | "prerequisite" | "part-of",
      "reason": "Short explanation of the connection"
    }
    
    Only include strong connections. If none, return an empty array.
    Do not include markdown formatting.

    Target Node:
    Title: ${targetNode.title}
    Content: ${targetNode.bodyMarkdown}

    Candidate Nodes:
    ${JSON.stringify(candidatesSummary, null, 2)}
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('AI Raw Response (Connections):', text);
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        }
        catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('AI returned invalid JSON format');
        }
    }
    catch (error) {
        console.error('AI Connection Search Error:', error);
        return [];
    }
};
exports.findConnections = findConnections;
