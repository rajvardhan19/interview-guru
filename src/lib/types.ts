export interface Profile {
  _id: string;
  userId: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  userId: string;
  content: string;
  analysis: ResumeAnalysis | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  technicalSkills: string[];
  yearsExperience: number;
  keyProjects: {
    name: string;
    description: string;
  }[];
  technicalQuestions: {
    question: string;
    context: string;
  }[];
  behavioralQuestions: {
    question: string;
    context: string;
  }[];
}

export interface InterviewSession {
  _id: string;
  userId: string;
  resumeId: string;
  createdAt: string;
}

export interface InterviewQuestion {
  _id: string;
  sessionId: string;
  question: string;
  answer: string | null;
  type: 'technical' | 'behavioral';
  createdAt: string;
}