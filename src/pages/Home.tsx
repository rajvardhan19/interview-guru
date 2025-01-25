import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Users, Brain } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Prepare for Interviews</span>
          <span className="block text-indigo-600">with AI-Powered Insights</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Upload your resume and get personalized interview questions. Practice with AI-generated responses and improve your interview skills.
        </p>
        
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Resume</h3>
              <p className="mt-2 text-gray-500">Get personalized interview questions based on your experience</p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-center">
                <Brain className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">AI Analysis</h3>
              <p className="mt-2 text-gray-500">Receive AI-powered feedback and suggested answers</p>
              <Link
                to="/dashboard"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Analysis
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Interview Mode</h3>
              <p className="mt-2 text-gray-500">Practice interviews with AI-generated questions</p>
              <Link
                to="/interview"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Practice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;