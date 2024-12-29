import { createGroq } from '@ai-sdk/groq';

const groqClient = createGroq({
  apiKey: process.env['GROQ_API_KEY'], // This is the default and can be omitted
});

export { groqClient } 