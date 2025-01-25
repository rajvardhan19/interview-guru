import mongoose from 'mongoose';

// Define schemas
const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
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

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  createdAt: { type: Date, default: Date.now }
});

const interviewQuestionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
  question: { type: String, required: true },
  answer: String,
  type: { type: String, required: true, enum: ['technical', 'behavioral'] },
  createdAt: { type: Date, default: Date.now }
});

// Initialize models
let Resume: mongoose.Model<any>;
let InterviewSession: mongoose.Model<any>;
let InterviewQuestion: mongoose.Model<any>;

try {
  // Try to get existing models
  Resume = mongoose.model('Resume');
  InterviewSession = mongoose.model('InterviewSession');
  InterviewQuestion = mongoose.model('InterviewQuestion');
} catch {
  // Create new models if they don't exist
  Resume = mongoose.model('Resume', resumeSchema);
  InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
  InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
}

export { Resume, InterviewSession, InterviewQuestion };