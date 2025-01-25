import React, { useEffect, useState } from 'react';
import { BarChart, Users, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Resume } from '../lib/types';

export default function Dashboard() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        const latestResume = await api.getLatestResume();
        setResume(latestResume);
      } catch (err) {
        setError('Failed to load resume data');
        console.error('Error loading resume:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Welcome to InterviewPrep AI</h2>
        <p className="text-gray-600 mb-8">Get started by uploading your resume</p>
        <Link
          to="/upload"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <FileText className="w-5 h-5 mr-2" />
          Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Resume Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Technical Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {resume.analysis.technicalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Key Projects</h3>
              <div className="mt-2 space-y-2">
                {resume.analysis.keyProjects.map((project, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/interview"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Interview Practice
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}