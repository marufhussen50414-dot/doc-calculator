import React from 'react';
import { DocumentType } from '../types';
import { DOCUMENTS } from '../config/documents';

interface HomePageProps {
  onSelectDocument: (documentId: string) => void;
}

/**
 * Home Page Component
 * 
 * Displays a grid of document cards that users can select.
 * Active documents are clickable, inactive ones show as "Coming Soon".
 */
export const HomePage: React.FC<HomePageProps> = ({ onSelectDocument }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Document Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Select the type of document to calculate
          </p>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.map((doc: DocumentType) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onSelectDocument}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Modular system for calculating tax and payroll documents</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Document Card Component
 * 
 * Represents a single document type option.
 * Shows different styling for active vs inactive documents.
 */
interface DocumentCardProps {
  document: DocumentType;
  onSelect: (documentId: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect }) => {
  const handleClick = () => {
    if (document.isActive) {
      onSelect(document.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
        ${
          document.isActive
            ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:-translate-y-1'
            : 'opacity-60 cursor-not-allowed'
        }
      `}
    >
      {/* Active Indicator */}
      {document.isActive && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      )}

      {/* Coming Soon Badge for inactive documents */}
      {!document.isActive && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Coming Soon
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Icon */}
        <div className="text-5xl mb-4">{document.icon}</div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {document.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm">
          {document.description}
        </p>

        {/* Action Hint */}
        {document.isActive && (
          <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
            <span>Open Calculator</span>
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Border Accent */}
      <div
        className={`h-1 ${
          document.isActive ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      />
    </div>
  );
};
