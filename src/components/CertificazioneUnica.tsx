import React from 'react';

interface CertificazioneUnicaProps {
  onBack: () => void;
}

/**
 * Certificazione Unica Component - Placeholder
 * 
 * This is a placeholder component for the Certificazione Unica (CU) calculator.
 * Content will be added in the future.
 */
export const CertificazioneUnica: React.FC<CertificazioneUnicaProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📄 Certificazione Unica
            </h1>
            <p className="text-gray-600">
              Calculator for Certificazione Unica (CU)
            </p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Content Coming Soon
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This section is under development. The calculator for Certificazione Unica 
            will be available soon.
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            🔜 Coming Soon
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 What is Certificazione Unica?
          </h3>
          <p className="text-sm text-blue-800">
            The Certificazione Unica (CU) is the document that certifies income from employment 
            and similar income, self-employment income, commissions and other income, as well as 
            the related withholdings made by the withholding agent in the reference fiscal year.
          </p>
        </div>
      </div>
    </div>
  );
};
