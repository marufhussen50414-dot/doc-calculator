import React, { useState } from 'react';
import { UNIFIED_CALCULATOR } from '../config/unifiedCalculator';

interface TargetCalculatorProps {
  onBack?: () => void;
}

/**
 * Target Calculator Component - Clean & Professional
 * 
 * Allows users to set a target value and see what's required to achieve it
 */
export const TargetCalculator: React.FC<TargetCalculatorProps> = () => {
  const [targetField, setTargetField] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');
  const [currentInputs, setCurrentInputs] = useState<{ [key: string]: string }>({});
  const [adjustmentField, setAdjustmentField] = useState<string>('');
  const [requiredValue, setRequiredValue] = useState<number | null>(null);

  const calculator = UNIFIED_CALCULATOR;

  const handleInputChange = (fieldId: string, value: string) => {
    setCurrentInputs((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setRequiredValue(null);
  };

  const handleCalculateTarget = () => {
    if (!targetField) {
      alert('দয়া করে বাম দিক থেকে একটি ফিল্ড সিলেক্ট করুন');
      return;
    }

    if (!targetValue || parseFloat(targetValue) === 0) {
      alert('Please enter a target value');
      return;
    }

    const inputFields = getRelevantInputFields();
    
    const missingFields = inputFields.filter((f: any) => {
      const value = currentInputs[f.id];
      return !value || value === '';
    });

    if (missingFields.length > 0) {
      alert(`Please fill all required fields:\n${missingFields.map((f: any) => f.label).join(', ')}`);
      return;
    }

    const inputs: any = {};
    inputs[targetField] = parseFloat(targetValue);
    
    Object.keys(currentInputs).forEach(key => {
      inputs[key] = parseFloat(currentInputs[key]) || 0;
    });

    const result = calculator.calculate(inputs, adjustmentField);
    
    if (result !== null) {
      setRequiredValue(result);
    } else {
      alert('Unable to calculate. Please check your inputs.');
    }
  };

  const handleReset = () => {
    setCurrentInputs({});
    setTargetValue('');
    setRequiredValue(null);
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

  const getRelevantInputFields = () => {
    if (!targetField) return [];

    return calculator.fields.filter(
      (f: any) => f.id !== targetField && f.id !== adjustmentField
    );
  };

  const inputFields = getRelevantInputFields();

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          How Target Mode Works
        </h3>
        <p className="text-sm text-purple-800">
          Set your target goal, choose which field to adjust, enter current values, and see what's required to reach your target.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Select Field */}
        <div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              1. Select the field to calculate (output):
            </label>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {calculator.fields.map((field: any) => (
                <button
                  key={field.id}
                  onClick={() => {
                    setTargetField(field.id);
                    setAdjustmentField(field.id);
                    setRequiredValue(null);
                    setCurrentInputs({});
                  }}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    targetField === field.id
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="font-medium text-gray-800 text-sm">{field.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Enter Known Values / Dynamic Inputs */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Enter the known values:
          </h3>

          {!targetField ? (
            <div className="text-center py-12 text-gray-500 font-medium">
              ⚠️ দয়া করে বাম দিক থেকে একটি ফিল্ড সিলেক্ট করুন।
            </div>
          ) : inputFields.length === 0 ? (
            <div className="text-center py-12 text-red-500 font-medium">
              ❌ এই ফিল্ডের জন্য কোনো ফর্মুলা পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {/* Target Value Input */}
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Target Value for {getFieldLabel(targetField)}:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={targetValue}
                    onChange={(e) => {
                      setTargetValue(e.target.value);
                      setRequiredValue(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Formula-based Required Input Fields */}
              {inputFields.map((field: any) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={currentInputs[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCalculateTarget}
                  className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md text-sm"
                >
                  Calculate Required Value
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Professional Target Result Display */}
      {requiredValue !== null && (
        <div className="bg-white rounded border-2 border-gray-800 shadow-sm animate-fadeIn">
          <div className="border-b-2 border-gray-800 px-5 py-3 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              Target Analysis
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-5 pb-5 border-b border-gray-300">
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Your Target Goal</p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-gray-700">{getFieldLabel(targetField)}:</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(targetValue))}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded border-2 border-gray-400 p-5">
              <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Required Value to Reach Target</p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{getFieldLabel(adjustmentField)}</p>
                <p className="text-4xl font-bold text-gray-900">{formatCurrency(requiredValue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
