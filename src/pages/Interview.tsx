import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader, ArrowLeft } from 'lucide-react';
import { generateInterviewResponse } from '../lib/gemini';
import { api } from '../lib/api';
import type { Resume, InterviewQuestion } from '../lib/types';
import QuestionList from '../components/QuestionList';
import toast from 'react-hot-toast';

export default function Interview() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [resumeContext, setResumeContext] = useState<Resume | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadResumeAndQuestions();
  }, []);

  const loadResumeAndQuestions = async () => {
    try {
      setIsLoading(true);
      const resume = await api.getLatestResume();
      setResumeContext(resume);
      
      if (resume) {
        const session = await api.createInterviewSession(resume._id);
        setSessionId(session._id);

        // Create initial questions based on resume analysis
        const questions = [];
        
        // Technical questions
        for (const q of resume.analysis.technicalQuestions) {
          const question = await api.saveQuestion(
            session._id,
            q.question,
            'technical'
          );
          questions.push(question);
        }

        // Behavioral questions
        for (const q of resume.analysis.behavioralQuestions) {
          const question = await api.saveQuestion(
            session._id,
            q.question,
            'behavioral'
          );
          questions.push(question);
        }

        setQuestions(questions);
        if (questions.length > 0) {
          setCurrentQuestion(questions[0]);
          // Add AI's first question to the chat
          setMessages([{ 
            role: 'ai', 
            content: `${questions[0].question}\n\nPlease provide your response to this question.` 
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading resume and questions:', error);
      toast.error('Failed to load interview questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = (question: InterviewQuestion) => {
    setCurrentQuestion(question);
    setMessages([{ 
      role: 'ai', 
      content: `${question.question}\n\nPlease provide your response to this question.` 
    }]);
    if (question.answer) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: question.answer! },
        { role: 'ai', content: 'Would you like to try answering this question again, or shall we move on to the next one?' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentQuestion) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (currentQuestion) {
        await api.updateQuestionAnswer(currentQuestion._id, userMessage);
        
        // Update questions list with the new answer
        setQuestions(prev => prev.map(q => 
          q._id === currentQuestion._id 
            ? { ...q, answer: userMessage }
            : q
        ));
      }

      const aiResponse = await generateInterviewResponse(
        currentQuestion.question,
        `Question Context: ${currentQuestion.context || 'Not provided'}\nUser's Answer: ${userMessage}`
      );
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error in interview response:', error);
      toast.error('Failed to process your response');
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error processing your response. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!resumeContext) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No Resume Found</h2>
        <p className="text-gray-600 mb-8">Please upload your resume first to start the interview practice.</p>
        <a
          href="/upload"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Upload Resume
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Interview Practice</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Questions Panel */}
        <div className="md:col-span-1 space-y-6">
          <QuestionList
            questions={questions}
            currentQuestion={currentQuestion}
            onSelectQuestion={handleSelectQuestion}
            type="technical"
          />
          <QuestionList
            questions={questions}
            currentQuestion={currentQuestion}
            onSelectQuestion={handleSelectQuestion}
            type="behavioral"
          />
        </div>

        {/* Chat Panel */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto mb-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !currentQuestion}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading || !currentQuestion}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}