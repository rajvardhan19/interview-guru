import { connectToDatabase } from './mongodb';
import type { Resume, InterviewSession, InterviewQuestion } from './types';
import axios from 'axios';
import { config } from './config';

const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async createResume(content: string, analysis: any): Promise<InterviewQuestion> {
    try {
      const response = await axiosInstance.post('/resumes', { content, analysis });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getLatestResume(): Promise<Resume | null> {
    try {
      const response = await axiosInstance.get('/resumes/latest');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async createInterviewSession(resumeId: string): Promise<InterviewSession> {
    try {
      const response = await axiosInstance.post('/sessions', { resumeId });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async saveQuestion(sessionId: string, question: string, type: string): Promise<InterviewQuestion> {
    try {
      const response = await axiosInstance.post('/questions', { sessionId, question, type });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async updateQuestionAnswer(questionId: string, answer: string): Promise<InterviewQuestion> {
    try {
      const response = await axiosInstance.patch(`/questions/${questionId}`, { answer });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};