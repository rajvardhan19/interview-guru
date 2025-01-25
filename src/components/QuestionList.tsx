import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { InterviewQuestion } from '../lib/types';

interface QuestionListProps {
  questions: InterviewQuestion[];
  currentQuestion: InterviewQuestion | null;
  onSelectQuestion: (question: InterviewQuestion) => void;
  type: 'technical' | 'behavioral';
}

export default function QuestionList({ questions, currentQuestion, onSelectQuestion, type }: QuestionListProps) {
  const filteredQuestions = questions.filter(q => q.type === type);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">
        {type === 'technical' ? 'Technical Questions' : 'Behavioral Questions'}
      </h2>
      <div className="space-y-2">
        {filteredQuestions.map((question) => (
          <button
            key={question._id}
            onClick={() => onSelectQuestion(question)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentQuestion?._id === question._id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{question.question}</p>
                {question.answer && (
                  <p className="text-sm text-gray-600 mt-1">
                    Status: Answered
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
