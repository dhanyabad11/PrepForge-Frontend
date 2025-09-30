'use client';

import { useState } from 'react';

export default function Home() {
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'input' | 'questions' | 'mock'>('input');

  const handleGenerateQuestions = async () => {
    if (!jobRole.trim() || !company.trim()) {
      setError('Please fill both fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobRole, company }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentStep('questions');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startMockInterview = () => {
    setCurrentStep('mock');
  };

  const resetToHome = () => {
    setCurrentStep('input');
    setQuestions([]);
    setJobRole('');
    setCompany('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Input Screen */}
        {currentStep === 'input' && (
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-[var(--foreground)]">
                PrepForge
              </h1>
              <p className="text-lg text-gray-600">
                Generate personalized questions and practice with AI feedback
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="e.g., Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={isLoading || (!jobRole.trim() || !company.trim())}
                className="w-full py-4 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-lg"
              >
                {isLoading ? 'Generating Questions...' : 'Generate Questions'}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2 transition-opacity">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Questions Display Screen */}
        {currentStep === 'questions' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6">
                Your Generated Questions
              </h2>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="py-4 px-0 border-b border-[var(--border)] last:border-b-0">
                  <p className="text-lg text-[var(--foreground)]">
                    {index + 1}. {question}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={startMockInterview}
                className="py-3 px-8 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg transition-colors"
              >
                Start Mock Interview
              </button>
              <button
                onClick={resetToHome}
                className="py-3 px-8 text-gray-600 hover:text-[var(--foreground)] transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Mock Interview Mode */}
        {currentStep === 'mock' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Question 1 of {questions.length}</p>
              <button
                onClick={resetToHome}
                className="text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors"
              >
                End Mock
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Question 1: {questions[0]}
                </h3>
                <textarea
                  placeholder="Type your answer here..."
                  className="w-full h-40 p-4 bg-[var(--muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>

              <button className="w-full py-3 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg transition-colors">
                Submit Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}