import { useState } from 'react';
import { CalculatorInputs } from '../types';
import { TFR_CALCULATOR } from '../config/tfrCalculator';

type CalculatorMode = 'standard' | 'target' | 'multi';
type FormulaType = 'standard' | 'alternative';

interface TFRCalculatorProps {
  onBack?: () => void;
}

/**
 * TFR Calculator Component
 * 
 * Implements the TFR (Trattamento di Fine Rapporto) calculator with standard Italian formulas
 */
export const TFRCalculator: React.FC<TFRCalculatorProps> = () => {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [formulaType, setFormulaType] = useState<FormulaType>('standard');
  const [outputField, setOutputField] = useState<string>('tfr_mese');
  const [outputFields, setOutputFields] = useState<Set<string>>(new Set(['tfr_mese']));
  const [inputs, setInputs] = useState<CalculatorInputs>({});
  const [results, setResults] = useState<{ [key: string]: number }>({});
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
    setOutputFields(new Set([fieldId]));
    setShowResult(false);
    setResults({});
    const newInputs = { ...inputs };
    delete newInputs[fieldId];
    setInputs(newInputs);
  };

  const handleMultiOutputToggle = (fieldId: string) => {
    const newOutputFields = new Set(outputFields);
    if (newOutputFields.has(fieldId)) {
      if (newOutputFields.size > 1) {
        newOutputFields.delete(fieldId);
      }
    } else {
      newOutputFields.add(fieldId);
    }
    setOutputFields(newOutputFields);
    
    const newInputs = { ...inputs };
    newOutputFields.forEach(field => {
      delete newInputs[field];
    });
    setInputs(newInputs);
    setShowResult(false);
    setResults({});
  };

  const handleCalculate = () => {
    const calculatedResult = calculator.calculate(inputs, outputField, formulaType);
    if (calculatedResult !== null) {
      setResults({ [outputField]: calculatedResult });
      setShowResult(true);
    }
  };

  const handleMultiCalculate = () => {
    const calculatedResults: { [key: string]: number } = {};
    let allSuccessful = true;

    outputFields.forEach(field => {
      const result = calculator.calculate(inputs, field, formulaType);
      if (result !== null) {
        calculatedResults[field] = result;
      } else {
        allSuccessful = false;
      }
    });

    if (allSuccessful && Object.keys(calculatedResults).length > 0) {
      setResults(calculatedResults);
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setInputs({});
    setResults({});
    setShowResult(false);
    if (mode === 'standard') {
      setOutputField('tfr_mese');
      setOutputFields(new Set(['tfr_mese']));
    }
  };

  const handleModeChange = (newMode: CalculatorMode) => {
    setMode(newMode);
    handleReset();
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
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">
          💼 TFR (Trattamento di Fine Rapporto)
        </h3>
        <p className="text-sm text-green-800">
          Employee severance indemnity - calculated and accrued monthly. Standard Italian formula: Monthly TFR = (Useful Salary / 13.5) + Additional Contribution
        </p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Calculation Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleModeChange('standard')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'standard'
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold text-gray-800">Standard</div>
            <div className="text-xs text-gray-600 mt-1">
              Calculate a single field
            </div>
          </button>

          <button
            onClick={() => handleModeChange('target')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'target'
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-2">🎪</div>
            <div className="font-semibold text-gray-800">Target</div>
            <div className="text-xs text-gray-600 mt-1">
              Set a goal
            </div>
          </button>

          <button
            onClick={() => handleModeChange('multi')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'multi'
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-2">🔢</div>
            <div className="font-semibold text-gray-800">Multi</div>
            <div className="text-xs text-gray-600 mt-1">
              Calculate multiple fields
            </div>
          </button>
        </div>
      </div>

      {/* Formula Type Selection (Radio Buttons) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Calculation Formula Option:
        </label>
        <div className="flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="radio"
              name="formulaTypeSelection"
              checked={formulaType === 'standard'}
              onChange={() => setFormulaType('standard')}
              className="text-green-600 focus:ring-green-500"
            />
            Standard Formula
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="radio"
              name="formulaTypeSelection"
              checked={formulaType === 'alternative'}
              onChange={() => setFormulaType('alternative')}
              className="text-green-600 focus:ring-green-500"
            />
            Sub-Formula / Alternative (Backward Calc)
          </label>
        </div>
      </div>

      {/* Render appropriate mode */}
      {mode === 'target' ? (
        <TFRTargetMode calculator={calculator} />
      ) : mode === 'multi' ? (
        <TFRMultiMode
          calculator={calculator}
          outputFields={outputFields}
          inputs={inputs}
          results={results}
          showResult={showResult}
          onOutputToggle={handleMultiOutputToggle}
          onInputChange={handleInputChange}
          onCalculate={handleMultiCalculate}
          onReset={handleReset}
          formatCurrency={formatCurrency}
          getFieldLabel={getFieldLabel}
        />
      ) : (
        <TFRStandardMode
          calculator={calculator}
          outputField={outputField}
          inputs={inputs}
          results={results}
          showResult={showResult}
          onOutputFieldChange={handleOutputFieldChange}
          onInputChange={handleInputChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
          formatCurrency={formatCurrency}
          getFieldLabel={getFieldLabel}
        />
      )}

      {/* TFR Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ TFR Field Explanations</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>RETRIBUZIONE UTILE TFR:</strong> Monthly gross salary used for TFR calculation</li>
          <li>• <strong>CONTR. AGG. TFR:</strong> Additional employer contribution (typically 0.5%)</li>
          <li>• <strong>TFR MESE:</strong> Monthly TFR accrual (Salary / 13.5 + Additional contribution)</li>
          <li>• <strong>TFR ANNUO PROGR.:</strong> Cumulative yearly TFR (sum of monthly accruals)</li>
          <li>• <strong>F.DO TFR 31/12 AP:</strong> Previous year closing balance (as of Dec 31)</li>
          <li>• <strong>ANTICIPAZIONI ANNO:</strong> Advances paid to employee during the year</li>
          <li>• <strong>TFR SPETTANTE AZIENDA:</strong> Total company TFR liability</li>
          <li>• <strong>TFR A F.DO PENSIONE:</strong> Amount transferred to pension fund</li>
        </ul>
      </div>

      {/* Formula Reference */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3">📐 Key Formulas</h3>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-md">
            <p className="text-sm font-semibold text-gray-800 mb-1">Monthly TFR Accrual:</p>
            <code className="text-xs text-purple-700">
              TFR MESE = (RETRIBUZIONE UTILE TFR ÷ 13.5) + CONTR. AGG. TFR
            </code>
          </div>
          <div className="bg-white p-3 rounded-md">
            <p className="text-sm font-semibold text-gray-800 mb-1">Company TFR Liability:</p>
            <code className="text-xs text-purple-700">
              TFR SPETTANTE = F.DO TFR 31/12 AP + TFR ANNUO PROGR. - ANTICIPAZIONI - TFR A F.DO PENSIONE
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// Standard Mode Component
interface TFRStandardModeProps {
  calculator: any;
  outputField: string;
  inputs: CalculatorInputs;
  results: { [key: string]: number };
  showResult: boolean;
  onOutputFieldChange: (fieldId: string) => void;
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  formatCurrency: (value: number) => string;
  getFieldLabel: (fieldId: string) => string;
}

const TFRStandardMode: React.FC<TFRStandardModeProps> = ({
  calculator,
  outputField,
  inputs,
  results,
  showResult,
  onOutputFieldChange,
  onInputChange,
  onCalculate,
  onReset,
  formatCurrency,
  getFieldLabel,
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select the field to calculate (output):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {calculator.fields.map((field: any) => (
              <button
                key={field.id}
                onClick={() => onOutputFieldChange(field.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
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
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter the known values:
          </label>
          <div className="grid grid-cols-1 gap-4">
            {calculator.fields
              .filter((field: any) => field.id !== outputField)
              .map((field: any) => (
                <div key={field.id} className="relative">
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <input
                      id={field.id}
                      type="number"
                      step="0.01"
                      value={inputs[field.id] || ''}
                      onChange={(e) => onInputChange(field.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCalculate}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            Calculate
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {showResult && results[outputField] !== undefined && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-lg animate-fadeIn">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">✅ Result</h2>
          <div className="bg-white rounded-md p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{getFieldLabel(outputField)}</p>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(results[outputField])}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Multi Mode Component
interface TFRMultiModeProps {
  calculator: any;
  outputFields: Set<string>;
  inputs: CalculatorInputs;
  results: { [key: string]: number };
  showResult: boolean;
  onOutputToggle: (fieldId: string) => void;
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  formatCurrency: (value: number) => string;
  getFieldLabel: (fieldId: string) => string;
}

const TFRMultiMode: React.FC<TFRMultiModeProps> = ({
  calculator,
  outputFields,
  inputs,
  results,
  showResult,
  onOutputToggle,
  onInputChange,
  onCalculate,
  onReset,
  formatCurrency,
  getFieldLabel,
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select fields to calculate (output - minimum 1):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {calculator.fields.map((field: any) => (
              <button
                key={field.id}
                onClick={() => onOutputToggle(field.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    outputFields.has(field.id)
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">
                    {field.label}
                  </span>
                  {outputFields.has(field.id) && (
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter the known values:
          </label>
          <div className="grid grid-cols-1 gap-4">
            {calculator.fields
              .filter((field: any) => !outputFields.has(field.id))
              .map((field: any) => (
                <div key={field.id} className="relative">
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <input
                      id={field.id}
                      type="number"
                      step="0.01"
                      value={inputs[field.id] || ''}
                      onChange={(e) => onInputChange(field.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCalculate}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            Calculate All
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {showResult && Object.keys(results).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-lg animate-fadeIn">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">✅ Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(results).map(([fieldId, value]) => (
              <div key={fieldId} className="bg-white rounded-md p-4">
                <p className="text-xs text-gray-600 mb-1">{getFieldLabel(fieldId)}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Target Mode Component (Placeholder)
interface TFRTargetModeProps {
  calculator: any;
}

const TFRTargetMode: React.FC<TFRTargetModeProps> = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Target Mode</h3>
        <p className="text-gray-600">
          Target mode for TFR calculations coming soon!
        </p>
      </div>
    </div>
  );
};
