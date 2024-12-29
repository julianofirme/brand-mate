import Groq from 'groq-sdk';

const groqClient = new Groq({
  apiKey: process.env['GROQ_API_KEY'], // This is the default and can be omitted
});

export { groqClient } 