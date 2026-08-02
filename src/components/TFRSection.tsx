import { useState } from 'react';
import { CalculatorInputs } from '../types';
import { TFR_CALCULATOR } from '../config/tfrCalculator';

/**
 * TFR Section Component - Collapsible Accordion
 * 
 * A clean, minimalist collapsible section for TFR calculations
 * integrated seamlessly into the main Busta Paga page
 */
export const TFRSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [outputField, setOutputField] = useState<string>('tfr_mese');
  const [inputs, setInputs] = useState<CalculatorInputs>({});
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const calculator = TFR_CALCULATOR;

  const handleInputChange = (fieldId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      [fieldId]: numValue,
    }));
    setShowResult(false);
  };

  const handleOutputFieldChange = (fieldId: string) => {
    setOutputField(fieldId);
    setShowResult(false);
    setResult(null);
    const newInputs = { ...inputs };
    delete newInputs[fieldId];
    setInputs(newInputs);
  };

  const handleCalculate = () => {
    const calculatedResult = calculator.calculate(inputs, outputField);
    if (calculatedResult !== null) {
      setResult(calculatedResult);
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setInputs({});
    setResult(null);
    setShowResult(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getFieldLabel = (fieldId: string): string => {
    return calculator.fields.find(f => f.id === fieldId)?.label || fieldId;
  };

  return (
    <div className="mt-8">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💼</div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">
                TFR Details & Calculation
              </h3>
              <p className="text-sm text-gray-600">
                Employee severance indemnity calculator
              </p>
            </div>
          </div>
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-6 border-2 border-green-100 animate-fadeIn">
          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  About TFR (Trattamento di Fine Rapporto)
                </h4>
                <p className="text-sm text-green-800">
                  Monthly TFR = (Useful Salary ÷ 13.5) + Additional Contribution (~6.91% of annual salary)
                </p>
              </div>
            </div>
          </div>

          {/* Output Field Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select field to calculate:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {calculator.fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => handleOutputFieldChange(field.id)}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${
                      outputField === field.id
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 text-sm">
                      {field.label}
                    </span>
                    {outputField === field.id && (
                      <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Enter known values:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculator.fields
                .filter((field) => field.id !== outputField)
                .map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        €
                      </span>
                      <input
                        id={field.id}
                        type="number"
                        step="0.01"
                        value={inputs[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCalculate}
              className="flex-1 bg-green-600 text-white py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg text-sm"
            >
              Calculate
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              Reset
            </button>
          </div>

          {/* Result Display */}
          {showResult && result !== null && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 animate-fadeIn">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">✅ Result</h4>
              <div className="bg-white rounded-md p-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">{getFieldLabel(outputField)}</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(result)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Formula Reference */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors flex items-center justify-between">
                <span>📐 View TFR Formulas</span>
                <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-2 text-xs text-gray-600 bg-purple-50 rounded-md p-3">
                <div className="bg-white p-2 rounded">
                  <strong>Monthly TFR:</strong> TFR MESE = (RETRIBUZIONE UTILE TFR ÷ 13.5) + CONTR. AGG. TFR
                </div>
                <div className="bg-white p-2 rounded">
                  <strong>Company Liability / Spettante:</strong> F.do TFR al 31/12 AP + TFR Annuo Progr. = TFR Spettante Azienda
                </div>
                <div className="bg-white p-2 rounded">
                  <strong>Detailed Company Liability:</strong> TFR SPETTANTE = F.DO TFR 31/12 AP + TFR ANNUO PROGR. - ANTICIPAZIONI - TFR A F.DO PENSIONE
                </div>
              </div>
            </details>
          </div>

          {/* Field Descriptions */}
          <div className="mt-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors flex items-center justify-between">
                <span>ℹ️ Field Explanations</span>
                <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>RETRIBUZIONE UTILE TFR:</strong> Monthly gross salary used for TFR calculation
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>CONTR. AGG. TFR:</strong> Additional employer contribution (typically 0.5%)
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>TFR MESE:</strong> Monthly TFR accrual (Salary ÷ 13.5 + Additional contribution)
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>TFR ANNUO PROGR.:</strong> Cumulative yearly TFR (sum of monthly accruals)
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>F.DO TFR 31/12 AP:</strong> Previous year closing balance (as of Dec 31)
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>ANTICIPAZIONI ANNO:</strong> Advances paid to employee during the year
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>TFR SPETTANTE AZIENDA:</strong> Total company TFR liability
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>TFR A F.DO PENSIONE:</strong> Amount transferred to pension fund
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
