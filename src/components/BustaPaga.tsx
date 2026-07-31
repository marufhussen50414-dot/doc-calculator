import { useState, useMemo } from 'react';
import { CalculatorInputs } from '../types';
import { UNIFIED_CALCULATOR, searchFields } from '../config/unifiedCalculator';
import { FormulaModal } from './FormulaModal';
import { TargetCalculator } from './TargetCalculator';

interface BustaPagaProps {
  onBack: () => void;
}

type CalculatorMode = 'standard' | 'target' | 'multi';

/**
 * Busta Paga Calculator Component
 * 
 * Updated validation logic: Only marks required fields that belong to the active formula.
 */
export const BustaPaga: React.FC<BustaPagaProps> = ({ onBack }) => {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [outputField, setOutputField] = useState<string>('netto_busta');
  const [outputFields, setOutputFields] = useState<Set<string>>(new Set(['netto_busta']));
  const [inputs, setInputs] = useState<{ [key: string]: string | number }>({});
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const calculator = UNIFIED_CALCULATOR;
  
  const filteredFields = useMemo(() => {
    return searchFields(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (fieldId: string, value: string) => {
    if (value === '') {
      const newInputs = { ...inputs };
      delete newInputs[fieldId];
      setInputs(newInputs);
    } else {
      setInputs((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
    }
    setShowResult(false);
    setAttempted(false);
  };

  const handleOutputFieldChange = (fieldId: string) => {
    setOutputField(fieldId);
    setOutputFields(new Set([fieldId]));
    setShowResult(false);
    setAttempted(false);
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
    setAttempted(false);
    
    const newInputs = { ...inputs };
    newOutputFields.forEach(field => {
      delete newInputs[field];
    });
    setInputs(newInputs);
    setShowResult(false);
    setResults({});
  };

  const convertInputsToNumbers = (inputs: { [key: string]: string | number }): CalculatorInputs => {
    const numericInputs: CalculatorInputs = {};
    Object.keys(inputs).forEach(key => {
      const value = inputs[key];
      numericInputs[key] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    });
    return numericInputs;
  };

  /**
   * CORRECTED: Define exact required fields based on the formula requirement 
   * instead of locking all input fields blindly.
   */
  const getRequiredFields = (outputFieldId: string): string[] => {
    if (outputFieldId === 'netto_busta') {
      // Netto in busta requires these core fields based on its formula
      return ['totale_competenze', 'totale_trattenute', 'arr_preced', 'arr_attuale'];
    }
    
    // For other fields, fall back to general inputs except the output itself
    return calculator.fields
      .filter((f: any) => f.id !== outputFieldId && f.category !== 'TFR')
      .map((f: any) => f.id);
  };

  const areRequiredFieldsFilled = (outputFieldId: string): { valid: boolean; missing: string[] } => {
    const required = getRequiredFields(outputFieldId);
    const missing = required.filter(fieldId => {
      const value = inputs[fieldId];
      return value === undefined || value === '' || value === null;
    });
    return { valid: missing.length === 0, missing };
  };

  const handleCalculate = () => {
    setAttempted(true);
    const validation = areRequiredFieldsFilled(outputField);
    if (!validation.valid) {
      setShowResult(false);
      return;
    }
    
    const numericInputs = convertInputsToNumbers(inputs);
    const calculatedResult = calculator.calculate(numericInputs, outputField);
    if (calculatedResult !== null) {
      setResults({ [outputField]: calculatedResult });
      setShowResult(true);
    }
  };

  const handleMultiCalculate = () => {
    setAttempted(true);

    const allRequiredFields = new Set<string>();
    outputFields.forEach(field => {
      const required = getRequiredFields(field);
      required.forEach(r => allRequiredFields.add(r));
    });

    const missingFields = Array.from(allRequiredFields).filter(fieldId => {
      const value = inputs[fieldId];
      return value === undefined || value === '' || value === null;
    });

    if (missingFields.length > 0) {
      setShowResult(false);
      return;
    }

    const numericInputs = convertInputsToNumbers(inputs);
    const calculatedResults: { [key: string]: number } = {};
    let allSuccessful = true;

    outputFields.forEach(field => {
      const result = calculator.calculate(numericInputs, field);
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
    setAttempted(false);
    if (mode === 'standard') {
      setOutputField('netto_busta');
      setOutputFields(new Set(['netto_busta']));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Calculation Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleModeChange('standard')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'standard' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-800">Standard</div>
              <div className="text-xs text-gray-600 mt-1">Calculate a single field</div>
            </button>

            <button
              onClick={() => handleModeChange('target')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'target' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">🎪</div>
              <div className="font-semibold text-gray-800">Target</div>
              <div className="text-xs text-gray-600 mt-1">Set a goal</div>
            </button>

            <button
              onClick={() => handleModeChange('multi')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'multi' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">🔢</div>
              <div className="font-semibold text-gray-800">Multi</div>
              <div className="text-xs text-gray-600 mt-1">Calculate multiple fields</div>
            </button>
          </div>
        </div>

        {mode === 'target' ? (
          <TargetCalculator onBack={() => setMode('standard')} />
        ) : mode === 'multi' ? (
          <MultiModeCalculator
            calculator={calculator}
            filteredFields={filteredFields}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            outputFields={outputFields}
            inputs={inputs}
            results={results}
            showResult={showResult}
            attempted={attempted}
            getRequiredFields={getRequiredFields}
            onOutputToggle={handleMultiOutputToggle}
            onInputChange={handleInputChange}
            onCalculate={handleMultiCalculate}
            onReset={handleReset}
            formatCurrency={formatCurrency}
            getFieldLabel={getFieldLabel}
          />
        ) : (
          <StandardModeCalculator
            calculator={calculator}
            filteredFields={filteredFields}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            outputField={outputField}
            inputs={inputs}
            results={results}
            showResult={showResult}
            attempted={attempted}
            getRequiredFields={getRequiredFields}
            onOutputFieldChange={handleOutputFieldChange}
            onInputChange={handleInputChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            formatCurrency={formatCurrency}
            getFieldLabel={getFieldLabel}
          />
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            View Formula and Calculation Logic
          </button>
        </div>
      </div>

      <FormulaModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />
    </div>
  );
};

interface StandardModeCalculatorProps {
  calculator: any;
  filteredFields: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  outputField: string;
  inputs: { [key: string]: string | number };
  results: { [key: string]: number };
  showResult: boolean;
  attempted: boolean;
  getRequiredFields: (outputFieldId: string) => string[];
  onOutputFieldChange: (fieldId: string) => void;
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  formatCurrency: (value: number) => string;
  getFieldLabel: (fieldId: string) => string;
}

const StandardModeCalculator: React.FC<StandardModeCalculatorProps> = ({
  calculator,
  filteredFields,
  searchQuery,
  onSearchChange,
  outputField,
  inputs,
  results,
  showResult,
  attempted,
  getRequiredFields,
  onOutputFieldChange,
  onInputChange,
  onCalculate,
  onReset,
  formatCurrency,
  getFieldLabel,
}) => {
  const requiredFieldIds = getRequiredFields(outputField);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select the field to calculate (output):
          </label>
          
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search fields..."
                className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
            {filteredFields.map((field: any) => (
              <button
                key={field.id}
                onClick={() => onOutputFieldChange(field.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  outputField === field.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-800 text-sm">{field.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter the known values:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFields
              .filter((field: any) => field.id !== outputField)
              .map((field: any) => {
                const isRequired = requiredFieldIds.includes(field.id);
                const isEmpty = !inputs[field.id];
                const showError = attempted && isRequired && isEmpty;

                return (
                  <div key={field.id} className="relative">
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {showError && <span className="text-red-500 ml-1 font-bold">*</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <input
                        id={field.id}
                        type="number"
                        step="0.01"
                        value={inputs[field.id] || ''}
                        onChange={(e) => onInputChange(field.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                          showError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onCalculate} className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-semibold shadow-md">
            Calculate
          </button>
          <button onClick={onReset} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
            Reset
          </button>
        </div>
      </div>

      {showResult && results[outputField] !== undefined && (
        <div className="bg-white rounded border-2 border-gray-800 shadow-sm p-6 text-center">
          <p className="text-xs font-medium text-gray-600 mb-2 uppercase">{getFieldLabel(outputField)}</p>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(results[outputField])}</p>
        </div>
      )}
    </>
  );
};

interface MultiModeCalculatorProps {
  calculator: any;
  filteredFields: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  outputFields: Set<string>;
  inputs: { [key: string]: string | number };
  results: { [key: string]: number };
  showResult: boolean;
  attempted: boolean;
  getRequiredFields: (outputFieldId: string) => string[];
  onOutputToggle: (fieldId: string) => void;
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  formatCurrency: (value: number) => string;
  getFieldLabel: (fieldId: string) => string;
}

const MultiModeCalculator: React.FC<MultiModeCalculatorProps> = ({
  filteredFields,
  searchQuery,
  onSearchChange,
  outputFields,
  inputs,
  results,
  showResult,
  attempted,
  getRequiredFields,
  onOutputToggle,
  onInputChange,
  onCalculate,
  onReset,
  formatCurrency,
  getFieldLabel,
}) => {
  const requiredFieldIds = Array.from(outputFields).flatMap(field => getRequiredFields(field));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Select fields to calculate:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFields.map((field: any) => (
            <button
              key={field.id}
              onClick={() => onOutputToggle(field.id)}
              className={`p-4 rounded-lg border-2 text-left ${
                outputFields.has(field.id) ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200'
              }`}
            >
              <span className="font-medium text-gray-800 text-sm">{field.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Enter the known values:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFields
            .filter((field: any) => !outputFields.has(field.id))
            .map((field: any) => {
              const isRequired = requiredFieldIds.includes(field.id);
              const isEmpty = !inputs[field.id];
              const showError = attempted && isRequired && isEmpty;

              return (
                <div key={field.id} className="relative">
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {showError && <span className="text-red-500 ml-1 font-bold">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      id={field.id}
                      type="number"
                      step="0.01"
                      value={inputs[field.id] || ''}
                      onChange={(e) => onInputChange(field.id, e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg ${
                        showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onCalculate} className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold">
          Calculate All
        </button>
        <button onClick={onReset} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold">
          Reset
        </button>
      </div>

      {showResult && Object.keys(results).length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(results).map(([fieldId, value]) => (
            <div key={fieldId} className="bg-white rounded border border-gray-300 p-4">
              <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase">{getFieldLabel(fieldId)}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
