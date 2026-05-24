import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.post('/categorize', async (req, res) => {
	try {
		const { description, amount } = req.body;

		const prompt = `
      You are a financial expense categorization assistant.

      Classify the transaction into ONE of:
      - Food
      - Transport
      - Housing
      - Utilities
      - Entertainment
      - Shopping
      - Software
      - Healthcare
      - Other

      Transaction:
      Description: ${description}
      Amount: ${amount}

      IMPORTANT RULES:
      - Return ONLY valid JSON
      - Do NOT include markdown or backticks
      - confidence must be a decimal between 0 and 1

      Return format:
      {
        "category": "",
        "confidence": 0.0,
        "reason": ""
      }
    `;

		const response = await client.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.2,
		});

		res.json(JSON.parse(response.choices[0].message.content));
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'AI categorization failed' });
	}
});

app.listen(3001, () => {
	console.log('Backend running on http://localhost:3001');
});
