import React, { useState, useMemo } from 'react';

// Unified Calculator config & mock structure if not imported externally
const UNIFIED_CALCULATOR = {
  fields: []
};

interface BustaPagaProps {
  // Add any specific props here if needed
}

export const BustaPaga: React.FC<BustaPagaProps> = () => {
  const [activeTab, setActiveTab] = useState<'standard' | 'multi'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [outputField, setOutputField] = useState<string>('net_pay');
  const [outputFields, setOutputFields] = useState<Set<string>>(new Set(['net_pay']));
  const [inputs, setInputs] = useState<{ [key: string]: string | number }>({});
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [enableRounding, setEnableRounding] = useState(true);

  const filteredFields = useMemo(() => {
    return UNIFIED_CALCULATOR.fields.filter((f: any) => 
      f.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getRequiredFields = (fieldId: string) => {
    // Mock logic for required fields
    return [];
  };

  const areRequiredFieldsFilled = (fieldId: string) => {
    const reqs = getRequiredFields(fieldId);
    for (const r of reqs) {
      if (!inputs[r]) return { valid: false, missing: r };
    }
    return { valid: true, missing: null };
  };

  const onCalculate = () => {
    setAttempted(true);
    if (activeTab === 'standard') {
      const validation = areRequiredFieldsFilled(outputField);
      if (!validation.valid) return;
      // Perform standard calculation mock
      setResults({ [outputField]: 1500.00 });
      setShowResult(true);
    } else {
      // Perform multi calculation mock
      const newResults: { [key: string]: number } = {};
      outputFields.forEach(f => {
        newResults[f] = 1200.00;
      });
      setResults(newResults);
      setShowResult(true);
    }
  };

  const onReset = () => {
    setInputs({});
    setResults({});
    setShowResult(false);
    setAttempted(false);
  };

  const formatCurrency = (val: number) => {
    return `€ ${val.toFixed(2)}`;
  };

  const getFieldLabel = (id: string) => {
    return id;
  };

  const onOutputToggle = (fieldId: string) => {
    const newSet = new Set(outputFields);
    if (newSet.has(fieldId)) {
      newSet.delete(fieldId);
    } else {
      newSet.add(fieldId);
    }
    setOutputFields(newSet);
  };

  const onInputChange = (fieldId: string, value: string) => {
    setInputs(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('standard')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'standard' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Standard Mode
        </button>
        <button
          onClick={() => setActiveTab('multi')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'multi' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Multi Mode
        </button>
      </div>

      {activeTab === 'standard' ? (
        <StandardModeCalculator
          filteredFields={filteredFields}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          outputField={outputField}
          onOutputChange={setOutputField}
          inputs={inputs}
          results={results}
          showResult={showResult}
          attempted={attempted}
          getRequiredFields={getRequiredFields}
          areRequiredFieldsFilled={areRequiredFieldsFilled}
          onInputChange={onInputChange}
          onCalculate={onCalculate}
          onReset={onReset}
          formatCurrency={formatCurrency}
          getFieldLabel={getFieldLabel}
          enableRounding={enableRounding}
        />
      ) : (
        <MultiModeCalculator
          calculator={UNIFIED_CALCULATOR}
          filteredFields={filteredFields}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          outputFields={outputFields}
          inputs={inputs}
          results={results}
          showResult={showResult}
          attempted={attempted}
          getRequiredFields={getRequiredFields}
          onOutputToggle={onOutputToggle}
          onInputChange={onInputChange}
          onCalculate={onCalculate}
          onReset={onReset}
          formatCurrency={formatCurrency}
          getFieldLabel={getFieldLabel}
          enableRounding={enableRounding}
        />
      )}
    </div>
  );
};

interface StandardModeCalculatorProps {
  filteredFields: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  outputField: string;
  onOutputChange: (fieldId: string) => void;
  inputs: { [key: string]: string | number };
  results: { [key: string]: number };
  showResult: boolean;
  attempted: boolean;
  getRequiredFields: (fieldId: string) => string[];
  areRequiredFieldsFilled: (fieldId: string) => { valid: boolean; missing: string | null };
  onInputChange: (fieldId: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  formatCurrency: (value: number) => string;
  getFieldLabel: (fieldId: string) => string;
  enableRounding: boolean;
}

const StandardModeCalculator: React.FC<StandardModeCalculatorProps> = ({
  filteredFields,
  searchQuery,
  onSearchChange,
  outputField,
  onOutputChange,
  inputs,
  results,
  showResult,
  attempted,
  getRequiredFields,
  areRequiredFieldsFilled,
  onInputChange,
  onCalculate,
  onReset,
  formatCurrency,
  getFieldLabel,
  enableRounding,
}) => {
  const requiredFieldIds = useMemo(() => {
    return getRequiredFields(outputField);
  }, [outputField, getRequiredFields]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select output field:
          </label>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search fields..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFields.map((field: any) => (
              <button
                key={field.id}
                type="button"
                onClick={() => onOutputChange(field.id)}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium ${outputField === field.id ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'border-gray-200'}`}
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Required Inputs</h3>
          {requiredFieldIds.length === 0 ? (
            <div className="text-sm text-gray-500">No inputs required for this field.</div>
          ) : (
            <div className="space-y-4">
              {requiredFieldIds.map((fieldId) => (
                <div key={fieldId}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{getFieldLabel(fieldId)}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs[fieldId] || ''}
                    onChange={(e) => onInputChange(fieldId, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          )}

          {attempted && !areRequiredFieldsFilled(outputField).valid && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Please fill in all required fields before calculating.
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onCalculate}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
            >
              Calculate
            </button>
          </div>

          {showResult && results[outputField] !== undefined && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase">Result</span>
                <h4 className="text-lg font-bold text-indigo-900">{getFieldLabel(outputField)}</h4>
              </div>
              <div className="text-2xl font-black text-indigo-700">
                {formatCurrency(results[outputField])}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
  enableRounding: boolean;
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
  enableRounding,
}) => {
  const allRequiredFieldIds = useMemo(() => {
    const set = new Set<string>();
    outputFields.forEach(fieldId => {
      const required = getRequiredFields(fieldId);
      required.forEach(r => set.add(r));
    });
    return Array.from(set);
  }, [outputFields, getRequiredFields]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select fields to calculate (Multi Mode):
          </label>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search fields..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFields.map((field: any) => {
              const isSelected = outputFields.has(field.id);
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => onOutputToggle(field.id)}
                  className={`w-full p-3 rounded-lg border text-left text-sm font-medium flex items-center justify-between ${isSelected ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'border-gray-200'}`}
                >
                  <span>{field.label}</span>
                  <span>{isSelected ? '✓' : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {outputFields.size === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Please select one or more fields from the left list.
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Enter required values:</h3>
              <div className="space-y-4">
                {allRequiredFieldIds.map((fieldId: string) => (
                  <div key={fieldId}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{getFieldLabel(fieldId)}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs[fieldId] || ''}
                      onChange={(e) => onInputChange(fieldId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onCalculate}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
                >
                  Calculate All
                </button>
              </div>

              {showResult && Object.keys(results).length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 uppercase">Calculation Results</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(results).map(([fieldId, val]) => (
                      <div key={fieldId} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-900">{getFieldLabel(fieldId)}</span>
                        <span className="text-base font-black text-indigo-700">{formatCurrency(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
