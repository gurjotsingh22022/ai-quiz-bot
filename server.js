const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY); // Replace "key" with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/api/gemini/process/quiz', async(req, res) => {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log(req.body)
      const { text, username, password } = req.body;

      if(!username || !password)
      {
        return res.status(400).json({ error: 'Username and Password needed' });
      }

      if(!username===process.env.USERNAME || !password===process.env.PASSWORD)
      {
        return res.status(400).json({ error: 'Access Denied! Login with correct username and password' });
      }


    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Generate content using Gemini AI
    const prompt = `
    The following text contains a potential question and its options. Identify if it contains question and its options, and return the most appropriate answer's option or whatever list type it has. If it doesn't contain question and its options then return "Please provide both a question and its options". Here is the text:
    "${text}"`;
    const result = await model.generateContent(prompt);

    // Respond with success
    return res.status(200).json({ result:result.response.candidates[0].content.parts[0].text.trim(), success: true });
  } catch (error) {
    console.error('Error in AI processing:', error);

    // Respond with error
    return res.status(500).json({ message: 'Error Occurred', success: false });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});