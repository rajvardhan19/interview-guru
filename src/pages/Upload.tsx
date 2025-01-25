import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, Loader, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from '../lib/gemini';
import { api } from '../lib/api';

export default function Upload() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const extractTextFromFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:3001/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract text from file');
      }
      
      const { text } = await response.json();
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text from ${file.type} file`);
    }
  };

  const processResume = async (file: File) => {
    if (!file) {
      toast.error('Please provide a valid file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const toastId = toast.loading('Processing resume...');

    try {
      console.log('Processing file:', file.name, 'Type:', file.type); // Debug log
      const text = await extractTextFromFile(file);

      // Validate file content
      if (!text.trim()) {
        throw new Error('The file appears to be empty');
      }

      console.log('Text extracted, length:', text.length); // Debug log

      toast.loading('Analyzing resume...', { id: toastId });
      const analysisJson = await analyzeResume(text);
      
      let analysis;
      try {
        analysis = JSON.parse(analysisJson);
        
        if (!analysis || typeof analysis !== 'object') {
          throw new Error('Invalid analysis format');
        }
      } catch (parseError) {
        console.error('Analysis parsing error:', parseError);
        throw new Error('Failed to parse the analysis results');
      }

      await api.createResume(text, {
        technicalSkills: analysis.technical_skills || [],
        yearsExperience: analysis.years_experience || 0,
        keyProjects: analysis.key_projects || [],
        technicalQuestions: analysis.technical_questions || [],
        behavioralQuestions: analysis.behavioral_questions || []
      });

      toast.success('Resume analyzed successfully!', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      console.error('Resume processing error:', error); // Debug log
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process resume';
      
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('Please upload a valid file');
      return;
    }

    const file = acceptedFiles[0];
    await processResume(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/rtf': ['.rtf']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
        <p className="text-gray-600 mb-8">
          Upload your resume and our AI will analyze it to create personalized interview questions.
        </p>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-indigo-600 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <Loader className="h-12 w-12 text-indigo-600 animate-spin" />
              <p className="mt-4 text-lg text-gray-600">Analyzing your resume...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-red-600">
              <AlertCircle className="h-12 w-12" />
              <p className="mt-4 text-lg">Error processing resume</p>
              <p className="text-sm">{error}</p>
              <p className="mt-2 text-sm text-gray-500">Try uploading again</p>
            </div>
          ) : (
            <>
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">
                {isDragActive
                  ? 'Drop your resume here...'
                  : 'Drag and drop your resume, or click to select file'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, RTF
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes your resume for key skills and experience</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Question Generation</h3>
              <p className="text-gray-600">Creates personalized technical and behavioral questions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Response Guidelines</h3>
              <p className="text-gray-600">Provides tailored guidance for answering each question</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">4</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Practice Mode</h3>
              <p className="text-gray-600">Interactive interview simulation with real-time feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}