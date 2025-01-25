import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import mammoth from 'mammoth';
import rtfParser from 'rtf-parser';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// MongoDB Connection
const MONGODB_URI = process.env.VITE_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the VITE_MONGODB_URI environment variable');
}

let db;

try {
  db = await mongoose.createConnection(MONGODB_URI).asPromise();
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

// Import pdf-parse using dynamic import
const getPdfParse = async () => {
  try {
    const module = await import('pdf-parse/lib/pdf-parse.js');
    return module.default;
  } catch (error) {
    console.error('Error importing pdf-parse:', error);
    throw new Error('PDF parsing module not available');
  }
};

// Models
const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  content: { type: String, required: true },
  analysis: {
    technicalSkills: [String],
    yearsExperience: Number,
    keyProjects: [{
      name: String,
      description: String
    }],
    technicalQuestions: [{
      question: String,
      context: String
    }],
    behavioralQuestions: [{
      question: String,
      context: String
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
  question: { type: String, required: true },
  answer: String,
  type: { type: String, required: true, enum: ['technical', 'behavioral'] },
  createdAt: { type: Date, default: Date.now }
});

const Resume = db.model('Resume', resumeSchema);
const InterviewSession = db.model('InterviewSession', sessionSchema);
const InterviewQuestion = db.model('InterviewQuestion', questionSchema);

// Routes
app.post('/api/resumes', async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resumes/latest', async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.query.userId })
      .sort({ createdAt: -1 });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const session = new InterviewSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const question = new InterviewQuestion(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/questions/:id', async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      { answer: req.body.answer },
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Text extraction endpoint
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let text = '';
    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    console.log('Processing file type:', mimeType);

    switch (mimeType) {
      case 'application/pdf':
        try {
          const pdfParse = await getPdfParse();
          const data = await pdfParse(buffer, {
            max: 0, // No page limit
            version: 'v2.0.550'
          });
          
          text = data.text || '';
          console.log('PDF text extracted, length:', text.length);
          
          if (!text.trim()) {
            throw new Error('No text content found in PDF');
          }
        } catch (pdfError) {
          console.error('PDF parsing error details:', pdfError);
          throw new Error(`Failed to parse PDF file: ${pdfError.message}`);
        }
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        try {
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError);
          throw new Error('Failed to parse DOCX file');
        }
        break;

      case 'application/msword':
        try {
          const docResult = await mammoth.extractRawText({ buffer });
          text = docResult.value;
        } catch (docError) {
          console.error('DOC parsing error:', docError);
          throw new Error('Failed to parse DOC file');
        }
        break;

      case 'text/plain':
        try {
          text = buffer.toString('utf-8');
        } catch (txtError) {
          console.error('Text parsing error:', txtError);
          throw new Error('Failed to parse text file');
        }
        break;

      case 'application/rtf':
        try {
          const parseRtf = promisify(rtfParser.string);
          const rtfResult = await parseRtf(buffer.toString());
          text = rtfResult.text;
        } catch (rtfError) {
          console.error('RTF parsing error:', rtfError);
          throw new Error('Failed to parse RTF file');
        }
        break;

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Clean up the extracted text
    text = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!text) {
      throw new Error('No text could be extracted from the file');
    }

    console.log('Final text length:', text.length);

    res.json({ text });
  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to extract text from file',
      details: error.stack
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});