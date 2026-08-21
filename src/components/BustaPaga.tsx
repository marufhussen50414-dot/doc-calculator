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

// ---------------------------------------------------------------------------
// প্রতিটি ফিল্ডের জন্য আলাদা আলাদা Title Text এখান থেকে সহজে এডিট করতে পারবেন:
// ---------------------------------------------------------------------------
const CUSTOM_FIELD_TITLES: Record<string, string> = {
  // 6. CONTRIBUTI ANNO
  '6_contributi_anno': '6. CONTRIBUTI ANNO calculate er jonno man din:',
  'contributi_anno': '6. CONTRIBUTI ANNO calculate er jonno man din:',

  // 20. IMPONIBILE FISCALE (Anno)
  '20_imponibile_fiscale_anno': 'IMPONIBILE FISCALE (Anno) calculate er jonno man din:',
  'imponibile_fiscale_anno': 'IMPONIBILE FISCALE (Anno) calculate er jonno man din:',

  // 22. DETR. LAV. DIPENDENTE (Anno)
  '22_detr_lav_dip_anno': '22. DETR. LAV. DIPENDENTE (Anno) calculate er jonno man din:',
  'detr_lav_dip_anno': '22. DETR. LAV. DIPENDENTE (Anno) calculate er jonno man din:',

  // 34. TFR ANNUO PROGR.
  '34_tfr_annuo_progr': 'গত মাসের TFR ANNUO PROGR এবং চলতি মাসের TFR MESE এর মান দিন:',
  'tfr_annuo_progr': 'গত মাসের TFR ANNUO PROGR এবং চলতি মাসের TFR MESE এর মান দিন:',

  // আপনার অন্য কোনো Field ID থাকলে এখানে নিচে নতুন লাইন যোগ করে নিতে পারবেন
};

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
  const [enableAddValueFormula, setEnableAddValueFormula] = useState<boolean>(false);

  // Add Value এর জন্য নিজস্ব স্টেট
  const [addValueResult, setAddValueResult] = useState<number | null>(null);

  const [annuoCustomMode, setAnnuoCustomMode] = useState<'formula' | 'custom'>('custom');
  const [customDynamicFields, setCustomDynamicFields] = useState<CustomDynamicField[]>([
    { id: '1', label: 'আগের মাসের মান', value: '' },
    { id: '2', label: 'চলতি মাসের মান', value: '' }
  ]);

  const [irpefLordaMonthlyMode, setIrpefLordaMonthlyMode] = useState<'formula' | 'alternative'>('formula');
  
  // Totale Trattenute এর জন্য মোড স্টেট
  const [totaleTrattenuteMode, setTotaleTrattenuteMode] = useState<'formula1' | 'formula2'>('formula1');

  // Totale Contributi (9) এর জন্য মোড স্টেট (Standard vs Alternative)
  const [totaleContributiMode, setTotaleContributiMode] = useState<'formula' | 'alternative'>('formula');

  // 19. IRPEF + IMP. SOST. এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [irpefImpSostMode, setIrpefImpSostMode] = useState<'formula1' | 'formula2'>('formula1');

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
    setAnnuoCustomMode('custom');
    setIrpefLordaMonthlyMode('formula');
    setTotaleTrattenuteMode('formula1');
    setTotaleContributiMode('formula');
    setIrpefImpSostMode('formula1');
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

  // নির্দিষ্ট হোয়াইটলিস্ট করা ফিল্ডগুলোর জন্যই কেবল Multiple Dynamic Field প্রযোজ্য
  const isAnnuoField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    if (
      fieldId === 'totale_comp' ||
      fieldId === 'totale_trattenute' ||
      fieldId === 'totale_contributi' ||
      fieldId.toLowerCase().includes('competenze')
    ) {
      return false;
    }

    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const label = (field?.label || '').toLowerCase();
    const lower = fieldId.toLowerCase();

    // 0. 6. CONTRIBUTI ANNO
    const isContributiAnno = lower.includes('contributi_anno') || label.includes('contributi anno') || label.includes('6. contributi');

    // ১. 34. TFR ANNUO PROGR.
    const isTfrAnnuo = lower.includes('tfr_annuo') || lower.includes('tfr_progr') || label.includes('tfr annuo') || label.includes('34. tfr');
    
    // ২. 22. DETR. LAV. DIPENDENTE (Anno)
    const isDetrLavDipAnno = (lower.includes('detr_lav_dip') || label.includes('detr. lav. dipendente')) && (lower.includes('anno') || label.includes('anno'));
    
    // ৩. 20. IMPONIBILE FISCALE (Anno)
    const isImponibileFiscaleAnno = (lower.includes('imponibile_fiscale') || label.includes('imponibile fiscale')) && (lower.includes('anno') || label.includes('anno'));

    return isContributiAnno || isTfrAnnuo || isDetrLavDipAnno || isImponibileFiscaleAnno;
  };

  const isIrpefImpSostField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const lower = fieldId.toLowerCase();
    return lower === 'irpef_imp_sost' || lower === '19_irpef_imp_sost' || lower.includes('irpef_imp_sost');
  };

  const isTfrMeseField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const lower = fieldId.toLowerCase();
    return lower === 'tfr_mese' || lower === '33_tfr_mese' || lower.includes('tfr_mese');
  };

  const isRetribuzioneUtileTfrField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const lower = fieldId.toLowerCase();
    return lower === 'retribuzione_utile_tfr' || lower === '31_retribuzione_utile_tfr' || lower.includes('retribuzione_utile_tfr');
  };

  const isContrAggTfrField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const lower = fieldId.toLowerCase();
    return lower === 'contr_agg_tfr' || lower === '32_contr_agg_tfr' || lower.includes('contr_agg_tfr');
  };

  const areRequiredFieldsFilled = (outputFieldId: string): { valid: boolean; missing: string[] } => {
    if (outputFieldId === 'totale_comp') {
      const formulaFields = ['netto', 'trattenute', 'arr_preced', 'arr_attuale'];
      const activeFormulaFields = enableRounding ? formulaFields : formulaFields.filter(f => f !== 'arr_preced' && f !== 'arr_attuale');
      const missingFields = activeFormulaFields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingFields.length === 0, missing: missingFields };
    }

    if (isTfrMeseField(outputFieldId)) {
      const tfrFields = ['retribuzione_utile_tfr', 'contr_agg_tfr'];
      const missingFields = tfrFields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingFields.length === 0, missing: missingFields };
    }

    if (isRetribuzioneUtileTfrField(outputFieldId)) {
      const fields = ['tfr_mese', 'contr_agg_tfr'];
      const missingFields = fields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingFields.length === 0, missing: missingFields };
    }

    if (isContrAggTfrField(outputFieldId)) {
      const fields = ['retribuzione_utile_tfr', 'tfr_mese'];
      const missingFields = fields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingFields.length === 0, missing: missingFields };
    }

    if (outputFieldId === 'totale_trattenute') {
      if (totaleTrattenuteMode === 'formula1') {
        const formula1Fields = ['competenze', 'netto', 'arr_preced', 'arr_attuale'];
        const activeFields = enableRounding ? formula1Fields : ['competenze', 'netto'];
        const missingFields = activeFields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else {
        const formula2Fields = ['irpef_imp_sost', 'totale_contributi', 'trattenute_field'];
        const missingFields = formula2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
    }

    if (outputFieldId === 'totale_contributi') {
      if (totaleContributiMode === 'formula') {
        const tcFields = ['totale_trattenute_input', 'irpef_imp_sost_input', 'trattenute_input'];
        const missingFields = tcFields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else {
        const hasValue = customDynamicFields.some(f => f.value !== '' && !isNaN(parseFloat(f.value)));
        return { valid: hasValue, missing: hasValue ? [] : ['custom_fields'] };
      }
    }

    if (isIrpefImpSostField(outputFieldId)) {
      if (irpefImpSostMode === 'formula1') {
        const required = getRequiredFields(outputFieldId);
        const missing = required.filter(fieldId => {
          const value = inputs[fieldId];
          return value === undefined || value === '' || value === null;
        });
        return { valid: missing.length === 0, missing };
      } else {
        const f2Fields = ['irpef_f2_totale_trattenute', 'irpef_f2_totale_contributi', 'irpef_f2_trattenute'];
        const missingFields = f2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
    }

    if (isAnnuoField(outputFieldId) && annuoCustomMode === 'custom') {
      const hasValue = customDynamicFields.some(f => f.value !== '' && !isNaN(parseFloat(f.value)));
      return { valid: hasValue, missing: hasValue ? [] : ['custom_fields'] };
    }

    if (outputField === 'irpef_lorda_mese' && irpefLordaMonthlyMode === 'alternative') {
      const altFields = ['alt_irpef_imp_sost', 'alt_detr_lav_dip', 'alt_imposta_sost'];
      const missingAlt = altFields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingAlt.length === 0, missing: missingAlt };
    }

    const required = getRequiredFields(outputFieldId);
    const missing = required.filter(fieldId => {
      const value = inputs[fieldId];
      return value === undefined || value === '' || value === null;
    });
    return { valid: missing.length === 0, missing };
  };

  // মেইন ফিল্ডের গণনা
  const handleCalculate = () => {
    if (!outputField) return;
    setAttempted(true);
    const validation = areRequiredFieldsFilled(outputField);
    if (!validation.valid) {
      setShowResult(false);
      return;
    }

    if (outputField === 'totale_comp') {
      const netto = parseFloat(String(inputs['netto'])) || 0;
      const trattenute = parseFloat(String(inputs['trattenute'])) || 0;
      const arrPreced = enableRounding ? (parseFloat(String(inputs['arr_preced'])) || 0) : 0;
      const arrAttuale = enableRounding ? (parseFloat(String(inputs['arr_attuale'])) || 0) : 0;
      const calculatedComp = netto + (trattenute + arrPreced) - arrAttuale;
      setResults({ [outputField]: calculatedComp });
      setShowResult(true);
      return;
    }

    if (isTfrMeseField(outputField)) {
      const retribuzioneUtileTfr = parseFloat(String(inputs['retribuzione_utile_tfr'])) || 0;
      const contrAggTfr = parseFloat(String(inputs['contr_agg_tfr'])) || 0;
      const calculatedTfrMese = (retribuzioneUtileTfr / 13.5) - contrAggTfr;
      setResults({ [outputField]: calculatedTfrMese });
      setShowResult(true);
      return;
    }

    if (isRetribuzioneUtileTfrField(outputField)) {
      const tfrMese = parseFloat(String(inputs['tfr_mese'])) || 0;
      const contrAggTfr = parseFloat(String(inputs['contr_agg_tfr'])) || 0;
      const calculatedRetribuzioneUtileTfr = (tfrMese + contrAggTfr) * 13.5;
      setResults({ [outputField]: calculatedRetribuzioneUtileTfr });
      setShowResult(true);
      return;
    }

    if (isContrAggTfrField(outputField)) {
      const retribuzioneUtileTfr = parseFloat(String(inputs['retribuzione_utile_tfr'])) || 0;
      const tfrMese = parseFloat(String(inputs['tfr_mese'])) || 0;
      const calculatedContrAggTfr = (retribuzioneUtileTfr / 13.5) - tfrMese;
      setResults({ [outputField]: calculatedContrAggTfr });
      setShowResult(true);
      return;
    }

    if (outputField === 'totale_trattenute') {
      if (totaleTrattenuteMode === 'formula1') {
        const competenze = parseFloat(String(inputs['competenze'])) || 0;
        const netto = parseFloat(String(inputs['netto'])) || 0;
        const arrPreced = enableRounding ? (parseFloat(String(inputs['arr_preced'])) || 0) : 0;
        const arrAttuale = enableRounding ? (parseFloat(String(inputs['arr_attuale'])) || 0) : 0;

        const calculatedTrattenute = competenze - netto - arrPreced + arrAttuale;
        setResults({ [outputField]: calculatedTrattenute });
        setShowResult(true);
      } else if (totaleTrattenuteMode === 'formula2') {
        const irpefImpSost = parseFloat(String(inputs['irpef_imp_sost'])) || 0;
        const totaleContributi = parseFloat(String(inputs['totale_contributi'])) || 0;
        const trattenuteField = parseFloat(String(inputs['trattenute_field'])) || 0;

        const calculatedTrattenute = irpefImpSost + totaleContributi + trattenuteField;
        setResults({ [outputField]: calculatedTrattenute });
        setShowResult(true);
      }
      return;
    }

    if (outputField === 'totale_contributi') {
      if (totaleContributiMode === 'formula') {
        const totaleTrattenuteVal = parseFloat(String(inputs['totale_trattenute_input'])) || 0;
        const irpefImpSostVal = parseFloat(String(inputs['irpef_imp_sost_input'])) || 0;
        const trattenuteVal = parseFloat(String(inputs['trattenute_input'])) || 0;

        const calculatedTotaleContributi = totaleTrattenuteVal - irpefImpSostVal - trattenuteVal;
        setResults({ [outputField]: calculatedTotaleContributi });
        setShowResult(true);
      } else {
        const totalSum = customDynamicFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
        setResults({ [outputField]: totalSum });
        setShowResult(true);
      }
      return;
    }

    if (isIrpefImpSostField(outputField)) {
      if (irpefImpSostMode === 'formula2') {
        const totTrattenute = parseFloat(String(inputs['irpef_f2_totale_trattenute'])) || 0;
        const totContributi = parseFloat(String(inputs['irpef_f2_totale_contributi'])) || 0;
        const trattenute = parseFloat(String(inputs['trattenute'])) || 0;

        const calculatedIrpefImpSost = totTrattenute - totContributi - trattenute;
        setResults({ [outputField]: calculatedIrpefImpSost });
        setShowResult(true);
        return;
      }
    }

    if (isAnnuoField(outputField) && annuoCustomMode === 'custom') {
      const totalSum = customDynamicFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
      setResults({ [outputField]: totalSum });
      setShowResult(true);
      return;
    }

    if (outputField === 'irpef_lorda_mese' && irpefLordaMonthlyMode === 'alternative') {
      const irpefImpSost = parseFloat(String(inputs['alt_irpef_imp_sost'])) || 0;
      const detrLavDip = parseFloat(String(inputs['alt_detr_lav_dip'])) || 0;
      const impostaSost = parseFloat(String(inputs['alt_imposta_sost'])) || 0;
      const calculatedAltResult = (irpefImpSost + detrLavDip) - impostaSost;
      setResults({ [outputField]: calculatedAltResult });
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

  // Add Value এর জন্য সম্পূর্ণ আলাদা ক্যালকুলেটর
  const handleCalculateAddValue = () => {
    const sum = customDynamicFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    setAddValueResult(sum);
  };

  const handleResetAddValue = () => {
    setAddValueResult(null);
    setCustomDynamicFields([
      { id: '1', label: 'আগের মাসের মান', value: '' },
      { id: '2', label: 'চলতি মাসের মান', value: '' }
    ]);
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
    setAddValueResult(null);
    setCustomDynamicFields([
      { id: '1', label: 'আগের মাসের মান', value: '' },
      { id: '2', label: 'চলতি মাসের মান', value: '' }
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
            <div className="space-y-3">
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

              <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Temporary Calculator:</span>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setEnableAddValueFormula(!enableAddValueFormula);
                      setAddValueResult(null);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      enableAddValueFormula ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enableAddValueFormula ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-2 text-xs font-medium text-gray-600 w-8">
                    {enableAddValueFormula ? 'ON' : 'OFF'}
                  </span>
                </div>
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
                <div className="text-2xl mb-2">🎯</div>
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
            enableAddValueFormula={enableAddValueFormula}
            isAnnuoField={isAnnuoField(outputField)}
            annuoCustomMode={annuoCustomMode}
            onAnnuoCustomModeChange={setAnnuoCustomMode}
            customDynamicFields={customDynamicFields}
            onCustomFieldChange={(id, val) => {
              setCustomDynamicFields(customDynamicFields.map(f => f.id === id ? { ...f, value: val } : f));
            }}
            onAddCustomField={() => {
              setCustomDynamicFields([
                ...customDynamicFields,
                { id: Date.now().toString(), label: 'আগের বা চলতি মাসের মান', value: '' }
              ]);
            }}
            onRemoveCustomField={(id) => {
              if (customDynamicFields.length > 2) {
                setCustomDynamicFields(customDynamicFields.filter(f => f.id !== id));
              }
            }}
            irpefLordaMonthlyMode={irpefLordaMonthlyMode}
            onIrpefLordaMonthlyModeChange={setIrpefLordaMonthlyMode}
            totaleTrattenuteMode={totaleTrattenuteMode}
            onTotaleTrattenuteModeChange={setTotaleTrattenuteMode}
            totaleContributiMode={totaleContributiMode}
            onTotaleContributiModeChange={setTotaleContributiMode}
            irpefImpSostMode={irpefImpSostMode}
            onIrpefImpSostModeChange={setIrpefImpSostMode}
            addValueResult={addValueResult}
            onCalculateAddValue={handleCalculateAddValue}
            onResetAddValue={handleResetAddValue}
          />
        )}

        <div className="mt-6 text-right max-w-7xl mx-auto pr-2">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
  enableAddValueFormula: boolean;
  isAnnuoField: boolean;
  annuoCustomMode: 'formula' | 'custom';
  onAnnuoCustomModeChange: (mode: 'formula' | 'custom') => void;
  customDynamicFields: CustomDynamicField[];
  onCustomFieldChange: (id: string, value: string) => void;
  onAddCustomField: () => void;
  onRemoveCustomField: (id: string) => void;
  irpefLordaMonthlyMode: 'formula' | 'alternative';
  onIrpefLordaMonthlyModeChange: (mode: 'formula' | 'alternative') => void;
  totaleTrattenuteMode: 'formula1' | 'formula2';
  onTotaleTrattenuteModeChange: (mode: 'formula1' | 'formula2') => void;
  totaleContributiMode: 'formula' | 'alternative';
  onTotaleContributiModeChange: (mode: 'formula' | 'alternative') => void;
  irpefImpSostMode: 'formula1' | 'formula2';
  onIrpefImpSostModeChange: (mode: 'formula1' | 'formula2') => void;
  addValueResult: number | null;
  onCalculateAddValue: () => void;
  onResetAddValue: () => void;
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
  enableAddValueFormula,
  isAnnuoField,
  customDynamicFields,
  onCustomFieldChange,
  onAddCustomField,
  onRemoveCustomField,
  irpefLordaMonthlyMode,
  onIrpefLordaMonthlyModeChange,
  totaleTrattenuteMode,
  onTotaleTrattenuteModeChange,
  totaleContributiMode,
  onTotaleContributiModeChange,
  irpefImpSostMode,
  onIrpefImpSostModeChange,
  addValueResult,
  onCalculateAddValue,
  onResetAddValue,
}) => {
  const requiredFieldIds = outputField ? getRequiredFields(outputField) : [];
  const isTotaleCompetenzeField = outputField === 'totale_comp';
  const isTotaleTrattenuteField = outputField === 'totale_trattenute';
  const isTotaleContributiField = outputField === 'totale_contributi';
  const isIrpefLordaMonthlyField = outputField === 'irpef_lorda_mese';
  const isIrpefImpSostField = outputField ? (
    outputField.toLowerCase() === 'irpef_imp_sost' ||
    outputField.toLowerCase() === '19_irpef_imp_sost' ||
    outputField.toLowerCase().includes('irpef_imp_sost')
  ) : false;
  const isTfrMeseField = outputField ? (
    outputField.toLowerCase() === 'tfr_mese' ||
    outputField.toLowerCase() === '33_tfr_mese' ||
    outputField.toLowerCase().includes('tfr_mese')
  ) : false;
  const isRetribuzioneUtileTfrField = outputField ? (
    outputField.toLowerCase() === 'retribuzione_utile_tfr' ||
    outputField.toLowerCase() === '31_retribuzione_utile_tfr' ||
    outputField.toLowerCase().includes('retribuzione_utile_tfr')
  ) : false;
  const isContrAggTfrField = outputField ? (
    outputField.toLowerCase() === 'contr_agg_tfr' ||
    outputField.toLowerCase() === '32_contr_agg_tfr' ||
    outputField.toLowerCase().includes('contr_agg_tfr')
  ) : false;

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

              {/* 31. RETRIBUZIONE UTILE TFR */}
              {isRetribuzioneUtileTfrField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">33. TFR MESE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['tfr_mese'] || ''}
                          onChange={(e) => onInputChange('tfr_mese', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['tfr_mese'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['tfr_mese'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">32. CONTR. AGG. TFR</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['contr_agg_tfr'] || ''}
                          onChange={(e) => onInputChange('contr_agg_tfr', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['contr_agg_tfr'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['contr_agg_tfr'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 32. CONTR. AGG. TFR */}
              {isContrAggTfrField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">31. RETRIBUZIONE UTILE TFR</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['retribuzione_utile_tfr'] || ''}
                          onChange={(e) => onInputChange('retribuzione_utile_tfr', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['retribuzione_utile_tfr'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['retribuzione_utile_tfr'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">33. TFR MESE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['tfr_mese'] || ''}
                          onChange={(e) => onInputChange('tfr_mese', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['tfr_mese'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['tfr_mese'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 33. TFR MESE */}
              {isTfrMeseField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">31. RETRIBUZIONE UTILE TFR</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['retribuzione_utile_tfr'] || ''}
                          onChange={(e) => onInputChange('retribuzione_utile_tfr', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['retribuzione_utile_tfr'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['retribuzione_utile_tfr'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">32. CONTR. AGG. TFR</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['contr_agg_tfr'] || ''}
                          onChange={(e) => onInputChange('contr_agg_tfr', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['contr_agg_tfr'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['contr_agg_tfr'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TOTALE COMPETENZE */}
              {isTotaleCompetenzeField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">NETTO IN BUSTA</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['netto'] || ''}
                          onChange={(e) => onInputChange('netto', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['trattenute'] || ''}
                          onChange={(e) => onInputChange('trattenute', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    {enableRounding && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">ARR. PRECED.</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inputs['arr_preced'] || ''}
                              onChange={(e) => onInputChange('arr_preced', e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">ARR. ATTUALE</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inputs['arr_attuale'] || ''}
                              onChange={(e) => onInputChange('arr_attuale', e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TOTALE TRATTENUTE */}
              {isTotaleTrattenuteField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleTrattenuteMode"
                        checked={totaleTrattenuteMode === 'formula1'}
                        onChange={() => onTotaleTrattenuteModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleTrattenuteMode"
                        checked={totaleTrattenuteMode === 'formula2'}
                        onChange={() => onTotaleTrattenuteModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>
                  
                  {totaleTrattenuteMode === 'formula1' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE COMPETENZE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['competenze'] || ''}
                            onChange={(e) => onInputChange('competenze', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">NETTO IN BUSTA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['netto'] || ''}
                            onChange={(e) => onInputChange('netto', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      {enableRounding && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ARR. PRECED.</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                value={inputs['arr_preced'] || ''}
                                onChange={(e) => onInputChange('arr_preced', e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">ARR. ATTUALE</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                value={inputs['arr_attuale'] || ''}
                                onChange={(e) => onInputChange('arr_attuale', e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF+IMP .SOST.</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_imp_sost'] || ''}
                            onChange={(e) => onInputChange('irpef_imp_sost', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['totale_contributi'] || ''}
                            onChange={(e) => onInputChange('totale_contributi', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['trattenute_field'] || ''}
                            onChange={(e) => onInputChange('trattenute_field', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 9. TOTALE CONTRIBUTI */}
              {isTotaleContributiField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleContributiMode"
                        checked={totaleContributiMode === 'formula'}
                        onChange={() => onTotaleContributiModeChange('formula')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Standard Formula</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleContributiMode"
                        checked={totaleContributiMode === 'alternative'}
                        onChange={() => onTotaleContributiModeChange('alternative')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Alternative Mode</span>
                    </label>
                  </div>

                  {totaleContributiMode === 'formula' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['totale_trattenute_input'] || ''}
                            onChange={(e) => onInputChange('totale_trattenute_input', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF + IMP. SOST.</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_imp_sost_input'] || ''}
                            onChange={(e) => onInputChange('irpef_imp_sost_input', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['trattenute_input'] || ''}
                            onChange={(e) => onInputChange('trattenute_input', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700 tracking-wide">
                          {outputField && CUSTOM_FIELD_TITLES[outputField] 
                            ? CUSTOM_FIELD_TITLES[outputField] 
                            : `${outputField ? getFieldLabel(outputField) : 'TOTALE CONTRIBUTI'}:`}
                        </span>
                        <button
                          onClick={onAddCustomField}
                          type="button"
                          className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                          <span>+ Add Value</span>
                        </button>
                      </div>
                      {customDynamicFields.map((field) => {
                        const canDelete = customDynamicFields.length > 2;
                        return (
                          <div key={field.id} className="flex items-center space-x-2">
                            <div className="relative flex-1">
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
                            <button
                              type="button"
                              disabled={!canDelete}
                              onClick={() => canDelete && onRemoveCustomField(field.id)}
                              className={`p-2 rounded-lg transition flex items-center justify-center flex-shrink-0 ${
                                canDelete
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                                  : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                              }`}
                              title={canDelete ? "Delete this field" : "Minimum 2 fields required, cannot delete"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 19. IRPEF + IMP. SOST. */}
              {isIrpefImpSostField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefImpSostMode"
                        checked={irpefImpSostMode === 'formula1'}
                        onChange={() => onIrpefImpSostModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefImpSostMode"
                        checked={irpefImpSostMode === 'formula2'}
                        onChange={() => onIrpefImpSostModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {irpefImpSostMode === 'formula2' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_f2_totale_trattenute'] || ''}
                            onChange={(e) => onInputChange('irpef_f2_totale_trattenute', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_f2_totale_contributi'] || ''}
                            onChange={(e) => onInputChange('irpef_f2_totale_contributi', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_f2_trattenute'] || ''}
                            onChange={(e) => onInputChange('irpef_f2_trattenute', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* কাস্টম Dynamic Field অপশন (6, 20, 22, 34 ইত্যাদি ফিল্ডের জন্য) */}
              {!isTotaleCompetenzeField && !isTotaleTrattenuteField && !isTotaleContributiField && !isIrpefImpSostField && !isTfrMeseField && !isRetribuzioneUtileTfrField && !isContrAggTfrField && isAnnuoField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-700 tracking-wide">
                        {outputField && CUSTOM_FIELD_TITLES[outputField] 
                          ? CUSTOM_FIELD_TITLES[outputField] 
                          : `${outputField ? getFieldLabel(outputField) : ''} calculate er jonno man din:`}
                      </span>
                      <button
                        onClick={onAddCustomField}
                        type="button"
                        className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        <span>+ Add Value</span>
                      </button>
                    </div>
                    {customDynamicFields.map((field) => {
                      const canDelete = customDynamicFields.length > 2;
                      return (
                        <div key={field.id} className="flex items-center space-x-2">
                          <div className="relative flex-1">
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
                          <button
                            type="button"
                            disabled={!canDelete}
                            onClick={() => canDelete && onRemoveCustomField(field.id)}
                            className={`p-2 rounded-lg transition flex items-center justify-center flex-shrink-0 ${
                              canDelete
                                ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                            }`}
                            title={canDelete ? "Delete this field" : "Minimum 2 fields required, cannot delete"}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IRPEF LORDA MONTHLY অপশন */}
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
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF + IMP. SOST.</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['alt_irpef_imp_sost'] || ''}
                            onChange={(e) => onInputChange('alt_irpef_imp_sost', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">DETR. LAV. DIPENDENTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['alt_detr_lav_dip'] || ''}
                            onChange={(e) => onInputChange('alt_detr_lav_dip', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPOSTA SOSTITUTIVA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['alt_imposta_sost'] || ''}
                            onChange={(e) => onInputChange('alt_imposta_sost', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(!isTotaleCompetenzeField &&
                !isTotaleTrattenuteField &&
                !isTotaleContributiField &&
                !isAnnuoField &&
                !isTfrMeseField &&
                !isRetribuzioneUtileTfrField &&
                !isContrAggTfrField &&
                (!isIrpefLordaMonthlyField || irpefLordaMonthlyMode === 'formula') &&
                (!isIrpefImpSostField || irpefImpSostMode === 'formula1')) && (
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
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
                >
                  Calculate
                </button>
                <button
                  onClick={onReset}
                  className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Reset
                </button>
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-800">Result ({getFieldLabel(outputField)}):</span>
                    <span className="text-xl font-bold text-emerald-900">
                      {formatCurrency(results[outputField] || 0)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* সম্পূর্ণ পৃথক Add Value Formula Card */}
        {enableAddValueFormula && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Add Value Formula</h3>
              <button
                type="button"
                onClick={onAddCustomField}
                className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <span>+ Add Value</span>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {customDynamicFields.map((field) => {
                const canDelete = customDynamicFields.length > 2;
                return (
                  <div key={field.id} className="flex items-center space-x-2">
                    <div className="relative flex-1">
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
                    <button
                      type="button"
                      disabled={!canDelete}
                      onClick={() => canDelete && onRemoveCustomField(field.id)}
                      className={`p-2 rounded-lg transition flex items-center justify-center flex-shrink-0 ${
                        canDelete
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                      }`}
                      title={canDelete ? "Delete this field" : "Minimum 2 fields required, cannot delete"}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCalculateAddValue}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md text-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={onResetAddValue}
                className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
              >
                Reset
              </button>
            </div>

            {addValueResult !== null && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Add Value Total:</span>
                  <span className="text-xl font-bold text-emerald-900">
                    {formatCurrency(addValueResult)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
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
    const fields = new Set<string>();
    outputFields.forEach(field => {
      const required = getRequiredFields(field);
      required.forEach(r => fields.add(r));
    });
    return Array.from(fields);
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
                  onClick={() => onOutputToggle(field.id)}
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
                    {isSelected && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                        Selected
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
          {outputFields.size === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-base font-medium text-gray-700">Please select one or more fields from the left list.</p>
              <p className="text-xs text-gray-400 mt-1">Required inputs for all selected fields will appear here.</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Enter required values for selected fields:
              </label>

              {allRequiredFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No specific inputs are required for the selected fields. You can calculate directly.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allTotalTrattenuteFields(allRequiredFields).map((fieldId: string) => {
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
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
                >
                  Calculate All
                </button>
                <button
                  onClick={onReset}
                  className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Reset
                </button>
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <h3 className="text-sm font-bold text-emerald-800 mb-2">Results:</h3>
                  {Array.from(outputFields).map(fieldId => (
                    <div key={fieldId} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-900">{getFieldLabel(fieldId)}:</span>
                      <span className="font-bold text-emerald-900">
                        {formatCurrency(results[fieldId] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for multi mode
function allTotalTrattenuteFields(fields: string[]) {
  return fields;
}
