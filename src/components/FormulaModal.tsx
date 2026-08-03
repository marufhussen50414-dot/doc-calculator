import React from 'react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formula Modal Component
 * 
 * Displays all calculation formulas and logic in a modal overlay.
 */
export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📐 Formula and Calculation Logic</h2>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Formula */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              Main Formula
            </h3>
            <div className="bg-white rounded-md p-4 font-mono text-sm overflow-x-auto">
              <div className="text-gray-700">
                <span className="font-bold text-indigo-600">NETTO IN BUSTA</span> ={' '}
                <span className="font-bold text-green-600">TOTALE COMPETENZE</span> -{' '}
                (<span className="font-bold text-red-600">TOTALE TRATTENUTE</span> +{' '}
                (± <span className="font-bold text-orange-600">ARR. PRECED.</span>)) ±{' '}
                <span className="font-bold text-blue-600">ARR. ATTUALE</span>
              </div>
            </div>
          </div>

          {/* Component Definitions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Component Definitions
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-md border-l-4 border-green-500">
                <h4 className="font-semibold text-green-700 mb-1">TOTALE COMPETENZE</h4>
                <p className="text-sm text-gray-600">
                  Sum of all gross pay items (base salary, overtime, bonuses, etc.)
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border-l-4 border-red-500">
                <h4 className="font-semibold text-red-700 mb-1">TOTALE TRATTENUTE</h4>
                <p className="text-sm text-gray-600">
                  Sum of all deductions (income tax, social security contributions, additional taxes, etc.)
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-700 mb-1">ARR. PRECED.</h4>
                <p className="text-sm text-gray-600">
                  Previous period adjustments. Can be positive (credit) or negative (debit)
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-700 mb-1">ARR. ATTUALE</h4>
                <p className="text-sm text-gray-600">
                  Current period adjustments. Can be positive (credit) or negative (debit)
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border-l-4 border-indigo-500">
                <h4 className="font-semibold text-indigo-700 mb-1">NETTO IN BUSTA</h4>
                <p className="text-sm text-gray-600">
                  Net amount the employee actually receives
                </p>
              </div>
            </div>
          </div>

          {/* Reverse Calculations */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              Reverse Formulas (Backward Calculation)
            </h3>
            <div className="space-y-4">
              
              {/* Calculate TOTALE COMPETENZE */}
              <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">
                  To calculate TOTALE COMPETENZE:
                </h4>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                  COMPETENZE = NETTO + (TRATTENUTE + ARR. PRECED.) - ARR. ATTUALE
                </div>
              </div>

              {/* Calculate TOTALE TRATTENUTE */}
              <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">
                  To calculate TOTALE TRATTENUTE:
                </h4>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                  TRATTENUTE = COMPETENZE - NETTO - ARR. PRECED. + ARR. ATTUALE
                </div>
              </div>

              {/* Calculate ARR. PRECED. */}
              <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">
                  To calculate ARR. PRECED.:
                </h4>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                  ARR. PRECED. = COMPETENZE - NETTO - TRATTENUTE + ARR. ATTUALE
                </div>
              </div>

              {/* Calculate ARR. ATTUALE */}
              <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">
                  To calculate ARR. ATTUALE:
                </h4>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                  ARR. ATTUALE = NETTO + TRATTENUTE + ARR. PRECED. - COMPETENZE
                </div>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              📊 Example Calculation
            </h3>
            <div className="bg-white p-4 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-3">Data:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">TOTALE COMPETENZE:</span>
                  <span className="font-semibold">€ 2,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TOTALE TRATTENUTE:</span>
                  <span className="font-semibold">€ 800.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ARR. PRECED.:</span>
                  <span className="font-semibold">€ 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ARR. ATTUALE:</span>
                  <span className="font-semibold">€ 100.00</span>
                </div>
              </div>
              
              <div className="my-4 border-t border-gray-200"></div>
              
              <h4 className="font-semibold text-gray-800 mb-2">Calculation:</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs space-y-1">
                <div>NETTO = 2,500 - (800 + 0) + 100</div>
                <div>NETTO = 2,500 - 800 + 100</div>
                <div className="font-bold text-green-600">NETTO = € 1,800.00</div>
              </div>
            </div>
          </div>

          {/* Logic Notes */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              ⚠️ Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Adjustments (ARR. PRECED. and ARR. ATTUALE) can be both positive and negative</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>A positive adjustment increases the net, a negative adjustment reduces it</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Deductions are always subtracted from gross pay</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The system can calculate any component given the other four</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All amounts are expressed in Euros (€)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
