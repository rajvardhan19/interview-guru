import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Please define the VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function analyzeResume(resumeText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an expert resume analyzer. Analyze this resume and provide a structured assessment in valid JSON format.

    IMPORTANT: Your response must be ONLY valid JSON, with no additional text or formatting.

    Required JSON structure:
    {
      "technical_skills": ["skill1", "skill2"],
      "years_experience": number,
      "key_projects": [
        {
          "name": "Project Name",
          "description": "Brief project description"
        }
      ],
      "technical_questions": [
        {
          "question": "Technical question based on their skills",
          "context": "Why this question is relevant"
        }
      ],
      "behavioral_questions": [
        {
          "question": "Behavioral question based on experience",
          "context": "Why this question is relevant"
        }
      ]
    }

    Analysis requirements:
    1. Extract exactly 5 most relevant technical skills
    2. Calculate total years of experience (use 0 if unclear)
    3. List 2 most significant projects
    4. Generate 3 technical questions based on their strongest skills
    5. Generate 3 behavioral questions based on their experience

    Resume to analyze:
    ${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.trim()
      .replace(/^```json\s*/, '') // Remove JSON code block markers if present
      .replace(/```$/, '')        // Remove ending code block marker
      .trim();

    try {
      // Parse and validate the JSON structure
      const parsed = JSON.parse(cleanedText);
      
      // Validate required fields and types
      if (!Array.isArray(parsed.technical_skills)) throw new Error('technical_skills must be an array');
      if (typeof parsed.years_experience !== 'number') throw new Error('years_experience must be a number');
      if (!Array.isArray(parsed.key_projects)) throw new Error('key_projects must be an array');
      if (!Array.isArray(parsed.technical_questions)) throw new Error('technical_questions must be an array');
      if (!Array.isArray(parsed.behavioral_questions)) throw new Error('behavioral_questions must be an array');

      return cleanedText;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Failed to generate valid analysis format. Please try again.');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function generateInterviewResponse(question: string, context: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As an expert interviewer, provide detailed guidance for answering this interview question.
    
    Question: ${question}
    Context: ${context}
    
    Provide a structured response covering:
    1. Key points to emphasize
    2. Suggested answer structure (using STAR method if applicable)
    3. Important technical terms or concepts to mention
    4. Common pitfalls to avoid
    5. Example phrases or transitions to use
    
    Format the response in clear sections with markdown headings.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}