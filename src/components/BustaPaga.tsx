import { useState, useMemo } from 'react';
import { CalculatorInputs } from '../types';
import { UNIFIED_CALCULATOR, searchFields } from '../config/unifiedCalculator';
import { FormulaModal } from './FormulaModal';
import { TargetCalculator } from './TargetCalculator';

interface BustaPagaProps {
  onBack: () => void;
}

type CalculatorMode = 'standard' | 'target' | 'multi';

interface CustomDynamicField {
  id: string;
  label: string;
  value: string;
}

export const BustaPaga: React.FC<BustaPagaProps> = ({ onBack }) => {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [outputField, setOutputField] = useState<string | null>(null);
  const [outputFields, setOutputFields] = useState<Set<string>>(new Set());
  const [inputs, setInputs] = useState<{ [key: string]: string | number }>({});
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enableRounding, setEnableRounding] = useState<boolean>(false);

  // TFR Anno Progr মোড স্টেট
  const [tfrAnnuoMode, setTfrAnnuoMode] = useState<'formula' | 'custom'>('formula');
  const [customDynamicFields, setCustomDynamicFields] = useState<CustomDynamicField[]>([
    { id: '1', label: 'আগের মাসের TFR Mese', value: '' },
    { id: '2', label: 'আগের মাসের Annuo Progr.', value: '' }
  ]);

  // Imponibile Fiscale Anno বিশেষ অপশন স্টেট
  const [imponibileAnnoMode, setImponibileAnnoMode] = useState<'formula' | 'custom'>('formula');
  const [customImponibileFields, setCustomImponibileFields] = useState<CustomDynamicField[]>([
    { id: '1', label: 'আগের মাসগুলোর Imponibile Fiscale Anno', value: '' },
    { id: '2', label: 'চলতি মাসের Imponibile Fiscale Mese', value: '' }
  ]);

  // IRPEF Lorda Monthly বিশেষ অপশন স্টেট (সঠিক ফিল্ডে সেট করা হলো)
  const [irpefLordaMonthlyMode, setIrpefLordaMonthlyMode] = useState<'formula' | 'alternative'>('formula');

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
    const isRoundingField = fieldId === 'arr_preced' || fieldId === 'arr_attuale';
    if (!enableRounding && isRoundingField) {
      setToastMessage("Please turn ON 'Rounding' to select and calculate this field.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setOutputField(fieldId);
    setOutputFields(new Set([fieldId]));
    setShowResult(false);
    setAttempted(false);
    setResults({});
    setInputs({});
    setTfrAnnuoMode('formula');
    setImponibileAnnoMode('formula');
    setIrpefLordaMonthlyMode('formula');
  };

  const handleMultiOutputToggle = (fieldId: string) => {
    const isRoundingField = fieldId === 'arr_preced' || fieldId === 'arr_attuale';
    if (!enableRounding && isRoundingField) {
      setToastMessage("Please turn ON 'Rounding' to select this field.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const newOutputFields = new Set(outputFields);
    if (newOutputFields.has(fieldId)) {
      newOutputFields.delete(fieldId);
    } else {
      newOutputFields.add(fieldId);
    }
    setOutputFields(newOutputFields);
    setAttempted(false);
    setInputs({});
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

  const getRequiredFields = (outputFieldId: string): string[] => {
    let required = calculator.getRequiredInputsForField(outputFieldId);
    if (!enableRounding) {
      required = required.filter(id => id !== 'arr_preced' && id !== 'arr_attuale');
    }
    return required;
  };

  const areRequiredFieldsFilled = (outputFieldId: string): { valid: boolean; missing: string[] } => {
    if (outputFieldId === 'tfr_annuo_progr' && tfrAnnuoMode === 'custom') {
      const hasValue = customDynamicFields.some(f => f.value !== '' && !isNaN(parseFloat(f.value)));
      return { valid: hasValue, missing: hasValue ? [] : ['custom_fields'] };
    }

    if (outputFieldId === 'imponibile_fiscale_anno' && imponibileAnnoMode === 'custom') {
      const hasValue = customImponibileFields.some(f => f.value !== '' && !isNaN(parseFloat(f.value)));
      return { valid: hasValue, missing: hasValue ? [] : ['custom_imponibile_fields'] };
    }

    // সঠিক আইডি 'irpef_lorda_mese' চেক করা হলো
    if (outputFieldId === 'irpef_lorda_mese' && irpefLordaMonthlyMode === 'alternative') {
      const val = inputs['alt_base_value'];
      const isValid = val !== undefined && val !== '' && !isNaN(parseFloat(String(val)));
      return { valid: isValid, missing: isValid ? [] : ['alt_base_value'] };
    }

    const required = getRequiredFields(outputFieldId);
    const missing = required.filter(fieldId => {
      const value = inputs[fieldId];
      return value === undefined || value === '' || value === null;
    });
    return { valid: missing.length === 0, missing };
  };

  const handleCalculate = () => {
    if (!outputField) return;
    setAttempted(true);
    const validation = areRequiredFieldsFilled(outputField);
    if (!validation.valid) {
      setShowResult(false);
      return;
    }
    
    if (outputField === 'tfr_annuo_progr' && tfrAnnuoMode === 'custom') {
      const totalSum = customDynamicFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
      setResults({ [outputField]: totalSum });
      setShowResult(true);
      return;
    }

    if (outputField === 'imponibile_fiscale_anno' && imponibileAnnoMode === 'custom') {
      const totalSum = customImponibileFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
      setResults({ [outputField]: totalSum });
      setShowResult(true);
      return;
    }

    if (outputField === 'irpef_lorda_mese' && irpefLordaMonthlyMode === 'alternative') {
      const altVal = parseFloat(String(inputs['alt_base_value'])) || 0;
      setResults({ [outputField]: altVal });
      setShowResult(true);
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
    if (outputFields.size === 0) return;
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
    setCustomDynamicFields([
      { id: '1', label: 'আগের মাসের TFR Mese', value: '' },
      { id: '2', label: 'আগের মাসের Annuo Progr.', value: '' }
    ]);
    setCustomImponibileFields([
      { id: '1', label: 'আগের মাসগুলোর Imponibile Fiscale Anno', value: '' },
      { id: '2', label: 'চলতি মাসের Imponibile Fiscale Mese', value: '' }
    ]);
    if (mode === 'standard') {
      setOutputField(null);
      setOutputFields(new Set());
    } else if (mode === 'multi') {
      setOutputFields(new Set());
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
    return calculator.fields.find((f: any) => f.id === fieldId)?.label || fieldId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 relative">
      
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center space-x-3 border-l-4 border-amber-500 animate-bounce">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
          <div className="lg:col-span-5 bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
            <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Rounding:</span>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const newRoundingState = !enableRounding;
                    setEnableRounding(newRoundingState);
                    if (!newRoundingState) {
                      setInputs(prev => {
                        const updated = { ...prev };
                        delete updated['arr_preced'];
                        delete updated['arr_attuale'];
                        return updated;
                      });
                      if (outputField === 'arr_preced' || outputField === 'arr_attuale') {
                        setOutputField(null);
                        setShowResult(false);
                      }
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    enableRounding ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableRounding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-2 text-xs font-medium text-gray-600 w-8">
                  {enableRounding ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Calculation Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleModeChange('standard')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'standard' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-800 text-sm">Standard</div>
                <div className="text-xs text-gray-600 mt-1">Calculate a single field</div>
              </button>

              <button
                onClick={() => handleModeChange('target')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'target' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🎪</div>
                <div className="font-semibold text-gray-800 text-sm">Target</div>
                <div className="text-xs text-gray-600 mt-1">Set a goal</div>
              </button>

              <button
                onClick={() => handleModeChange('multi')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'multi' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🔢</div>
                <div className="font-semibold text-gray-800 text-sm">Multi</div>
                <div className="text-xs text-gray-600 mt-1">Calculate multiple fields</div>
              </button>
            </div>
          </div>
        </div>

        {mode === 'target' ? (
          <div className="flex justify-end">
            <div className="w-full max-w-4xl">
              <TargetCalculator onBack={() => setMode('standard')} />
            </div>
          </div>
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
            enableRounding={enableRounding}
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
            enableRounding={enableRounding}
            tfrAnnuoMode={tfrAnnuoMode}
            onTfrAnnuoModeChange={setTfrAnnuoMode}
            customDynamicFields={customDynamicFields}
            onCustomFieldChange={(id, val) => {
              setCustomDynamicFields(customDynamicFields.map(f => f.id === id ? { ...f, value: val } : f));
            }}
            onAddCustomField={() => {
              setCustomDynamicFields([
                ...customDynamicFields,
                { id: Date.now().toString(), label: 'আগের মাসের TFR Mese অথবা Annuo Progr.', value: '' }
              ]);
            }}
            imponibileAnnoMode={imponibileAnnoMode}
            onImponibileAnnoModeChange={setImponibileAnnoMode}
            customImponibileFields={customImponibileFields}
            onCustomImponibileFieldChange={(id, val) => {
              setCustomImponibileFields(customImponibileFields.map(f => f.id === id ? { ...f, value: val } : f));
            }}
            onAddImponibileField={() => {
              setCustomImponibileFields([
                ...customImponibileFields,
                { id: Date.now().toString(), label: 'আগের মাসের বা চলতি মাসের Imponibile Fiscale', value: '' }
              ]);
            }}
            irpefLordaMonthlyMode={irpefLordaMonthlyMode}
            onIrpefLordaMonthlyModeChange={setIrpefLordaMonthlyMode}
          />
        )}

        <div className="mt-6 text-right max-w-7xl mx-auto pr-2">
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
  outputField: string | null;
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
  enableRounding: boolean;
  tfrAnnuoMode: 'formula' | 'custom';
  onTfrAnnuoModeChange: (mode: 'formula' | 'custom') => void;
  customDynamicFields: CustomDynamicField[];
  onCustomFieldChange: (id: string, value: string) => void;
  onAddCustomField: () => void;
  imponibileAnnoMode: 'formula' | 'custom';
  onImponibileAnnoModeChange: (mode: 'formula' | 'custom') => void;
  customImponibileFields: CustomDynamicField[];
  onCustomImponibileFieldChange: (id: string, value: string) => void;
  onAddImponibileField: () => void;
  irpefLordaMonthlyMode: 'formula' | 'alternative';
  onIrpefLordaMonthlyModeChange: (mode: 'formula' | 'alternative') => void;
}

const StandardModeCalculator: React.FC<StandardModeCalculatorProps> = ({
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
  enableRounding,
  tfrAnnuoMode,
  onTfrAnnuoModeChange,
  customDynamicFields,
  onCustomFieldChange,
  onAddCustomField,
  imponibileAnnoMode,
  onImponibileAnnoModeChange,
  customImponibileFields,
  onCustomImponibileFieldChange,
  onAddImponibileField,
  irpefLordaMonthlyMode,
  onIrpefLordaMonthlyModeChange,
}) => {
  const requiredFieldIds = outputField ? getRequiredFields(outputField) : [];
  const isTfrAnnuoField = outputField === 'tfr_annuo_progr';
  const isImponibileAnnoField = outputField === 'imponibile_fiscale_anno';
  // সঠিক ফিল্ড আইডি 'irpef_lorda_mese' চেক করা হচ্ছে
  const isIrpefLordaMonthlyField = outputField === 'irpef_lorda_mese';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
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

          <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: '470px' }}>
            {filteredFields.map((field: any) => {
              const isSelected = outputField === field.id;
              const isRoundingField = field.id === 'arr_preced' || field.id === 'arr_attuale';
              const isDisabled = !enableRounding && isRoundingField;

              return (
                <button
                  key={field.id}
                  onClick={() => onOutputFieldChange(field.id)}
                  className={`p-3.5 rounded-lg border-2 text-left transition-all ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                      : isSelected 
                      ? 'border-indigo-600 bg-indigo-50 shadow-md font-semibold text-indigo-900 ring-2 ring-indigo-200' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{field.label}</span>
                    {isDisabled && (
                      <span className="text-[10px] uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                        Rounding Off
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {!outputField ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-base font-medium text-gray-700">Please select a field from the left list first.</p>
              <p className="text-xs text-gray-400 mt-1">Required inputs will appear here automatically.</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Enter the required values for {getFieldLabel(outputField)}:
              </label>

              {/* TFR ANNUO PROGR অপশন */}
              {isTfrAnnuoField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="tfrAnnuoMode" 
                        checked={tfrAnnuoMode === 'formula'} 
                        onChange={() => onTfrAnnuoModeChange('formula')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Standard Formula</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="tfrAnnuoMode" 
                        checked={tfrAnnuoMode === 'custom'} 
                        onChange={() => onTfrAnnuoModeChange('custom')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Alternative Sum (TFR Mese / Annuo Progr.)</span>
                    </label>
                  </div>

                  {tfrAnnuoMode === 'custom' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">
                          বর্তমান বা আগের মাসের মানগুলো যোগ করুন:
                        </span>
                        <button
                          onClick={onAddCustomField}
                          type="button"
                          className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                          <span>+ Add Value</span>
                        </button>
                      </div>

                      {customDynamicFields.map((field) => (
                        <div key={field.id} className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={field.value}
                            onChange={(e) => onCustomFieldChange(field.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IMPONIBILE FISCALE ANNO অপশন */}
              {isImponibileAnnoField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="imponibileAnnoMode" 
                        checked={imponibileAnnoMode === 'formula'} 
                        onChange={() => onImponibileAnnoModeChange('formula')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Standard Formula</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="imponibileAnnoMode" 
                        checked={imponibileAnnoMode === 'custom'} 
                        onChange={() => onImponibileAnnoModeChange('custom')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Alternative Sum (Previous Months + Current Month)</span>
                    </label>
                  </div>

                  {imponibileAnnoMode === 'custom' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">
                          আগের মাসগুলোর মোট Imponibile Anno এবং চলতি মাসের Imponibile Mese যোগ করুন:
                        </span>
                        <button
                          onClick={onAddImponibileField}
                          type="button"
                          className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                          <span>+ Add Value</span>
                        </button>
                      </div>

                      {customImponibileFields.map((field) => (
                        <div key={field.id} className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={field.value}
                            onChange={(e) => onCustomImponibileFieldChange(field.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IRPEF LORDA MONTHLY অপশন (সঠিক স্থানে যুক্ত করা হলো) */}
              {isIrpefLordaMonthlyField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="irpefLordaMonthlyMode" 
                        checked={irpefLordaMonthlyMode === 'formula'} 
                        onChange={() => onIrpefLordaMonthlyModeChange('formula')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Standard Formula</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="irpefLordaMonthlyMode" 
                        checked={irpefLordaMonthlyMode === 'alternative'} 
                        onChange={() => onIrpefLordaMonthlyModeChange('alternative')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Alternative Mode</span>
                    </label>
                  </div>

                  {irpefLordaMonthlyMode === 'alternative' && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Alternative Base Value
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['alt_base_value'] || ''}
                          onChange={(e) => onInputChange('alt_base_value', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* সাধারণ বা ফর্মুলা ইনপুট সেকশন */}
              {((!isTfrAnnuoField || tfrAnnuoMode === 'formula') && 
                (!isImponibileAnnoField || imponibileAnnoMode === 'formula') && 
                (!isIrpefLordaMonthlyField || irpefLordaMonthlyMode === 'formula')) && (
                <>
                  {requiredFieldIds.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No specific inputs are required for this field. You can calculate directly.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {requiredFieldIds.map((fieldId: string) => {
                        const fieldObj = filteredFields.find((f: any) => f.id === fieldId) || 
                                         UNIFIED_CALCULATOR.fields.find((f: any) => f.id === fieldId);
                        if (!fieldObj) return null;

                        const isRequired = true;
                        const isEmpty = !inputs[fieldId];
                        const showError = attempted && isRequired && isEmpty;

                        return (
                          <div key={fieldId} className="relative">
                            <label htmlFor={fieldId} className="block text-xs font-semibold text-gray-700 mb-1">
                              {fieldObj.label}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                              <input
                                id={fieldId}
                                type="number"
                                step="0.01"
                                value={inputs[fieldId] || ''}
                                onChange={(e) => onInputChange(fieldId, e.target.value)}
                                placeholder="0.00"
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:border-transparent transition-all ${
                                  showError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                                }`}
                              />
                            </div>
                            {showError && (
                              <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={onCalculate}
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md text-sm"
                >
                  Calculate
                </button>
                <button
                  onClick={onReset}
                  className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Reset
                </button>
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Result:</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {formatCurrency(results[outputField] || 0)}
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
  const allRequiredFields = useMemo(() => {
    const unionSet = new Set<string>();
    outputFields.forEach(fieldId => {
      const reqs = getRequiredFields(fieldId);
      reqs.forEach(r => unionSet.add(r));
    });
    return Array.from(unionSet);
  }, [outputFields, getRequiredFields]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select fields to calculate (Multiple):
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

          <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: '470px' }}>
            {filteredFields.map((field: any) => {
              const isSelected = outputFields.has(field.id);
              const isRoundingField = field.id === 'arr_preced' || field.id === 'arr_attuale';
              const isDisabled = !enableRounding && isRoundingField;

              return (
                <button
                  key={field.id}
                  onClick={() => onOutputToggle(field.id)}
                  className={`p-3.5 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                      : isSelected 
                      ? 'border-indigo-600 bg-indigo-50 shadow-md font-semibold text-indigo-900 ring-2 ring-indigo-200' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <span className="font-medium text-sm">{field.label}</span>
                  <div className="flex items-center space-x-2">
                    {isDisabled && (
                      <span className="text-[10px] uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                        Off
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {outputFields.size === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-base font-medium text-gray-700">Please select one or more fields from the left.</p>
              <p className="text-xs text-gray-400 mt-1">Unified required inputs will appear here automatically.</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Enter required values for selected fields:
              </label>

              {allRequiredFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No specific inputs are required for these fields. You can calculate directly.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allRequiredFields.map((fieldId: string) => {
                    const fieldObj = filteredFields.find((f: any) => f.id === fieldId) || 
                                     UNIFIED_CALCULATOR.fields.find((f: any) => f.id === fieldId);
                    if (!fieldObj) return null;

                    const isEmpty = !inputs[fieldId];
                    const showError = attempted && isEmpty;

                    return (
                      <div key={fieldId} className="relative">
                        <label htmlFor={fieldId} className="block text-xs font-semibold text-gray-700 mb-1">
                          {fieldObj.label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            id={fieldId}
                            type="number"
                            step="0.01"
                            value={inputs[fieldId] || ''}
                            onChange={(e) => onInputChange(fieldId, e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:border-transparent transition-all ${
                              showError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                            }`}
                          />
                        </div>
                        {showError && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={onCalculate}
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md text-sm"
                >
                  Calculate All Selected
                </button>
                <button
                  onClick={onReset}
                  className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Reset
                </button>
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Calculated Results:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from(outputFields).map(fieldId => {
                      const resValue = results[fieldId];
                      if (resValue === undefined) return null;
                      return (
                        <div key={fieldId} className="bg-white p-3 rounded border border-emerald-200 shadow-sm">
                          <div className="text-xs text-gray-500 mb-1 font-medium">{getFieldLabel(fieldId)}</div>
                          <div className="text-lg font-bold text-emerald-900">{formatCurrency(resValue)}</div>
                        </div>
                      );
                    })}
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
