import React from 'react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formula Modal Component
 * 
 * Displays calculation formulas sequentially.
 */
export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-indigo-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📐 Formula</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Serialized Formulas */}
        <div className="p-6 space-y-6">
          
          {/* Formula 1 */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              Formula 1
            </h3>
            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-indigo-600">NETTO IN BUSTA</span> ={' '}
                <span className="font-bold text-green-600">TOTALE COMPETENZE</span> -{' '}
                (<span className="font-bold text-red-600">TOTALE TRATTENUTE</span> +{' '}
                (± <span className="font-bold text-orange-600">ARR. PRECED.</span>)) ±{' '}
                <span className="font-bold text-blue-600">ARR. ATTUALE</span>
              </div>
            </div>
          </div>

          {/* Formula 2 (TFR Spettante Azienda) */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              Formula 2 (TFR Calculation)
            </h3>
            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto shadow-sm">
              <div className="text-gray-700">
                <span className="font-bold text-emerald-600">F.do TFR al 31/12 AP</span> +{' '}
                <span className="font-bold text-teal-600">TFR Annuo Progr.</span> ={' '}
                <span className="font-bold text-indigo-600">TFR Spettante Azienda</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
