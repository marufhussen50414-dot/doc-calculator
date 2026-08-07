)}
                </>
              )}

              {attempted && !areRequiredFieldsFilled(outputField).valid && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round5" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Please fill in all required fields before calculating.</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onCalculate}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition"
                >
                  Calculate
                </button>
              </div>

              {showResult && results[outputField] !== undefined && (
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Result</span>
                    <h4 className="text-lg font-bold text-indigo-900">{getFieldLabel(outputField)}</h4>
                  </div>
                  <div className="text-2xl font-black text-indigo-700">
                    {formatCurrency(results[outputField])}
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
                  type="button"
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
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                    {isSelected && <span className="text-xs">✓</span>}
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
                <path strokeLinecap="round" strokeLinejoin="round5" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-base font-medium text-gray-700">Please select one or more fields from the left list.</p>
              <p className="text-xs text-gray-400 mt-1">Aggregated inputs will appear here automatically.</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Enter the required values for selected fields:
              </label>

              {allRequiredFieldIds.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No specific inputs are required for the selected fields.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allRequiredFieldIds.map((fieldId: string) => {
                    const fieldObj = filteredFields.find((f: any) => f.id === fieldId) || 
                                     UNIFIED_CALCULATOR.fields.find((f: any) => f.id === fieldId);
                    if (!fieldObj) return null;

                    const isEmpty = !inputs[fieldId];
                    const showError = attempted && isEmpty;

                    return (
                      <div key={fieldId} className="relative">
                        <label htmlFor={`multi-${fieldId}`} className="block text-xs font-semibold text-gray-700 mb-1">
                          {fieldObj.label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            id={`multi-${fieldId}`}
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
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onCalculate}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition"
                >
                  Calculate All
                </button>
              </div>

              {showResult && Object.keys(results).length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Calculation Results</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(results).map(([fieldId, val]) => (
                      <div key={fieldId} className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-900 truncate pr-2">{getFieldLabel(fieldId)}</span>
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
