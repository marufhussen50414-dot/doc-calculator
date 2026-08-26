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
  // 5. IMPON. CONTRIBUTIVO ANNO
  '5_imponibile_contributivo_anno': 'গত মাসের IMPON. CONTRIBUTIVO ANNO + চলতি মাসের IMPON. CONTRIB. ARROT. MESE এর মান দিন:',
  'imponibile_contributivo_anno': 'গত মাসের IMPON. CONTRIBUTIVO ANNO + চলতি মাসের IMPON. CONTRIB. ARROT. MESE এর মান দিন:',
  '5_impon_contributivo_anno': 'গত মাসের IMPON. CONTRIBUTIVO ANNO + চলতি মাসের IMPON. CONTRIB. ARROT. MESE এর মান দিন:',
  'impon_contributivo_anno': 'গত মাসের IMPON. CONTRIBUTIVO ANNO + চলতি মাসের IMPON. CONTRIB. ARROT. MESE এর মান দিন:',

  // 6. CONTRIBUTI ANNO
  '6_contributi_anno': 'গত মাসের CONTRIBUTI ANNO + চলতি মাসের (INPS + FIS) কন্ট্রিবিউশন:',
  'contributi_anno': 'গত মাসের CONTRIBUTI ANNO + চলতি মাসের (INPS + FIS) কন্ট্রিবিউশন:',

  // 20. IMPONIBILE FISCALE (Anno)
  '20_imponibile_fiscale_anno': 'গত মাসের IMPONIBILE FISCALE (ANNO) + চলতি মাসের IMPONIBILE FISCALE (MESE) এর মান দিন:',
  'imponibile_fiscale_anno': 'গত মাসের IMPONIBILE FISCALE (ANNO) + চলতি মাসের IMPONIBILE FISCALE (MESE) এর মান দিন:',

  // 17/22. DETR. LAV. DIPENDENTE (Anno)
  '22_detr_lav_dip_anno': 'গত মাসের DETR. LAV. DIPENDENTE (ANNO) + চলতি মাসের DETR. LAV. DIPENDENTE (MESE) এর মান দিন:',
  'detr_lav_dip_anno': 'গত মাসের DETR. LAV. DIPENDENTE (ANNO) + চলতি মাসের DETR. LAV. DIPENDENTE (MESE) এর মান দিন:',
  '17_detr_lav_dipendente_anno': 'গত মাসের DETR. LAV. DIPENDENTE (ANNO) + চলতি মাসের DETR. LAV. DIPENDENTE (MESE) এর মান দিন:',
  'detr_lav_dipendente_anno': 'গত মাসের DETR. LAV. DIPENDENTE (ANNO) + চলতি মাসের DETR. LAV. DIPENDENTE (MESE) এর মান দিন:',

  // 34. TFR ANNUO PROGR.
  '34_tfr_annuo_progr': 'গত মাসের TFR ANNUO PROGR এবং চলতি মাসের TFR MESE এর মান দিন:',
  'tfr_annuo_progr': 'গত মাসের TFR ANNUO PROGR এবং চলতি মাসের TFR MESE এর মান দিন:',

  // 25. RETRIBUZIONE UTILE TFR
  '25_retribuzione_utile_tfr': 'উক্ত মাসের Retribuzione Ordinaria , Festività , 13.ma mensilità , 14.ma mensilità এর মান দিন:',
  'retribuzione_utile_tfr': 'উক্ত মাসের Retribuzione Ordinaria , Festività , 13.ma mensilità , 14.ma mensilità এর মান দিন:',

  // 5. TOTALE CONTRIBUTI
  '5_totale_contributi': 'উক্ত মাসের C/DIPENDENTE যেমন INPS , FIS , ENTE BIL. এর মান দিন:',
  'totale_contributi': 'উক্ত মাসের C/DIPENDENTE যেমন INPS , FIS , ENTE BIL. এর মান দিন:',

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

  // 7. IRPEF LORDA (Monthly) এর জন্য মোড স্টেট - Formula 1 রিমুভ করা হয়েছে
  const [irpefLordaMonthlyMode, setIrpefLordaMonthlyMode] = useState<'alternative' | 'formula3' | 'formula4'>('alternative');
  
  // Totale Trattenute এর জন্য মোড স্টেট
  const [totaleTrattenuteMode, setTotaleTrattenuteMode] = useState<'formula1' | 'formula2' | 'formula3'>('formula1');

  // Totale Contributi (9) এর জন্য মোড স্টেট (Standard vs Alternative)
  const [totaleContributiMode, setTotaleContributiMode] = useState<'formula1' | 'formula2' | 'formula3' | 'alternative'>('formula1');

  // 19. IRPEF + IMP. SOST. এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [irpefImpSostMode, setIrpefImpSostMode] = useState<'formula1' | 'formula2'>('formula1');

  // 12. DETR. LAV. DIPENDENTE (Monthly) এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [detrLavDipMonthlyMode, setDetrLavDipMonthlyMode] = useState<'formula1' | 'formula2'>('formula1');

  // 25. RETRIBUZIONE UTILE TFR এর জন্য মোড স্টেট (Standard Formula vs Alternative Mode)
  const [retribuzioneUtileTfrMode, setRetribuzioneUtileTfrMode] = useState<'formula' | 'alternative'>('formula');
  const [retribuzioneUtileTfrCustomFields, setRetribuzioneUtileTfrCustomFields] = useState<CustomDynamicField[]>([
    { id: '1', label: 'মান ১', value: '' },
    { id: '2', label: 'মান ২', value: '' }
  ]);

  // 26. CONTR. AGG. TFR এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [contrAggTfrMode, setContrAggTfrMode] = useState<'formula1' | 'formula2'>('formula1');

  // 13. IRPEF NETTA (Monthly) এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [irpefNettaMonthlyMode, setIrpefNettaMonthlyMode] = useState<'formula1' | 'formula2'>('formula1');

  // ADDIZIONALI এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [addizionaliMode, setAddizionaliMode] = useState<'formula1' | 'formula2'>('formula1');

  // NEW: 6. IMPONIBILE FISCALE (Monthly) এর জন্য মোড স্টেট (Formula 1 vs Formula 2)
  const [imponibileFiscaleMonthlyMode, setImponibileFiscaleMonthlyMode] = useState<'formula1' | 'formula2'>('formula1');

  const calculator = UNIFIED_CALCULATOR;

  const filteredFields = useMemo(() => {
    const fields = searchFields(searchQuery).map((field: any) => ({ ...field }));
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const addizionaliField = { id: 'addizionali', label: 'ADDIZIONALI' };
    
    // NEW: IMPONIBILE FISCALE ADJUSTMENT ফিল্ড
    const adjustmentField = { id: 'imponibile_fiscale_adjustment', label: 'IMPONIBILE FISCALE ADJUSTMENT' };

    // ADDIZIONALI ফিল্ড যোগ করুন
    if (!normalizedQuery || addizionaliField.label.toLowerCase().includes(normalizedQuery)) {
      if (!fields.some((field: any) => field.id === addizionaliField.id)) {
        const impostaIndex = fields.findIndex((field: any) =>
          String(field.label || '').toLowerCase().includes('imposta sostitutiva')
        );
        const irpefImpSostIndex = fields.findIndex((field: any) =>
          String(field.label || '').toLowerCase().includes('irpef + imp. sost.')
        );
        const insertIndex = impostaIndex >= 0
          ? impostaIndex + 1
          : irpefImpSostIndex >= 0
            ? irpefImpSostIndex + 1
            : fields.length;
        fields.splice(insertIndex, 0, addizionaliField);
      }
    }

    // NEW: IMPONIBILE FISCALE ADJUSTMENT ফিল্ড যোগ করুন
    if (!normalizedQuery || adjustmentField.label.toLowerCase().includes(normalizedQuery)) {
      if (!fields.some((field: any) => field.id === adjustmentField.id)) {
        const fiscaleAnnoIndex = fields.findIndex((field: any) =>
          String(field.label || '').toLowerCase().includes('imponibile fiscale (anno)')
        );
        const insertIndex = fiscaleAnnoIndex >= 0 ? fiscaleAnnoIndex + 1 : fields.length;
        fields.splice(insertIndex, 0, adjustmentField);
      }
    }

    if (!normalizedQuery) {
      return fields.map((field: any, index: number) => ({
        ...field,
        label: `${index + 1}. ${String(field.label || '').replace(/^\d+\.\s*/, '')}`,
      }));
    }

    return fields;
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
    setIrpefLordaMonthlyMode('alternative');
    setTotaleTrattenuteMode('formula1');
    setTotaleContributiMode('formula1');
    setIrpefImpSostMode('formula1');
    setDetrLavDipMonthlyMode('formula1');
    setRetribuzioneUtileTfrMode('formula');
    setContrAggTfrMode('formula1');
    setIrpefNettaMonthlyMode('formula1');
    setAddizionaliMode('formula1');
    setImponibileFiscaleMonthlyMode('formula1'); // NEW
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

  // 3. IMPON. CONTRIBUTIVO MESE ফিল্ড চিহ্নিত করার ফাংশন
  const isImponContributivoMeseField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'impon_contributivo_mese' ||
      lower === '2_impon_contributivo_mese' ||
      lower.includes('impon_contributivo_mese') ||
      lower.includes('impon. contributivo mese') ||
      label.includes('impon. contributivo mese') ||
      label.includes('2. impon. contributivo mese');
  };

  // IMPONIBILE FISCALE ADJUSTMENT ফিল্ড চিহ্নিত করার ফাংশন
  const isImponibileFiscaleAdjustmentField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'imponibile_fiscale_adjustment' ||
      lower.includes('imponibile_fiscale_adjustment') ||
      lower.includes('imponibile fiscale adjustment') ||
      label.includes('imponibile fiscale adjustment');
  };

  const getRequiredFields = (outputFieldId: string): string[] => {
    let required = outputFieldId === 'addizionali'
      ? (addizionaliMode === 'formula1'
        ? ['addizionali_f1_totale_trattenute', 'addizionali_f1_irpef_imp_sost', 'addizionali_f1_totale_contributi']
        : ['addizionali_f2_totale_trattenute', 'addizionali_f2_totale_contributi', 'addizionali_f2_irpef_netta', 'addizionali_f2_imposta_sostitutiva'])
      : isImpostaSostitutivaField(outputFieldId)
        ? ['imposta_sostitutiva_totale_trattenute', 'imposta_sostitutiva_totale_contributi', 'imposta_sostitutiva_addizionali', 'imposta_sostitutiva_irpef_netta']
        : isImponContribArrotMeseField(outputFieldId)
          ? ['contr_agg_tfr']
          : isImponibileFiscaleMonthlyField(outputFieldId)
            ? (imponibileFiscaleMonthlyMode === 'formula1'
                ? ['imponibile_contributivo', 'totale_contributi_for_fiscale', 'adjustment']
                : ['irpef_lorda_mese_for_fiscale'])
            : isImponContributivoMeseField(outputFieldId)
              ? ['imponibile_fiscale', 'totale_contributi_for_contributivo', 'adjustment_contributivo']
              : isImponibileFiscaleAdjustmentField(outputFieldId)
                ? ['imponibile_fiscale', 'imponibile_contributivo', 'totale_contributi_for_adjustment']
                : calculator.getRequiredInputsForField(outputFieldId);
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

    // 0. 5. IMPON. CONTRIBUTIVO ANNO
    const isImponContributivoAnno = lower.includes('impon_contributivo_anno') || lower.includes('imponibile_contributivo_anno') || label.includes('impon. contributivo anno') || label.includes('5. impon');

    // 0.1 6. CONTRIBUTI ANNO
    const isContributiAnno = lower.includes('contributi_anno') || label.includes('contributi anno') || label.includes('6. contributi');

    // ১. 34. TFR ANNUO PROGR.
    const isTfrAnnuo = lower.includes('tfr_annuo') || lower.includes('tfr_progr') || label.includes('tfr annuo') || label.includes('34. tfr');
    
    // ২. 22. DETR. LAV. DIPENDENTE (Anno)
    const isDetrLavDipAnno = (lower.includes('detr_lav_dip') || label.includes('detr. lav. dipendente')) && (lower.includes('anno') || label.includes('anno'));
    
    // ৩. 20. IMPONIBILE FISCALE (Anno)
    const isImponibileFiscaleAnno = (lower.includes('imponibile_fiscale') || label.includes('imponibile fiscale')) && (lower.includes('anno') || label.includes('anno'));

    return isImponContributivoAnno || isContributiAnno || isTfrAnnuo || isDetrLavDipAnno || isImponibileFiscaleAnno;
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

  const isImponContribArrotMeseField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'impon_contrib_arrot_mese' ||
      lower === '4_impon_contrib_arrot_mese' ||
      lower.includes('impon_contrib_arrot_mese') ||
      label.includes('impon. contrib. arrot. mese');
  };

  const isImponibileFiscaleMonthlyField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'imponibile_fiscale_mese' ||
      lower === '6_imponibile_fiscale_mese' ||
      lower.includes('imponibile_fiscale_mese') ||
      lower.includes('imponibile fiscale (monthly)') ||
      label.includes('imponibile fiscale (monthly)') ||
      label.includes('imponibile fiscale (mese)') ||
      label.includes('6. imponibile fiscale (monthly)');
  };

  const isImpostaSostitutivaField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'imposta_sostitutiva' ||
      lower === 'imposta_sostitutiva_mese' ||
      lower === '15_imposta_sostitutiva_mese' ||
      lower.includes('imposta_sostitutiva') ||
      label.includes('imposta sostitutiva (monthly)');
  };

  const isIrpefNettaMonthlyField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const lower = fieldId.toLowerCase();
    return lower === 'irpef_netta_mese' || lower === '18_irpef_netta_mese' || lower.includes('irpef_netta_monthly') || lower.includes('18._irpef_netta');
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

    if (isIrpefNettaMonthlyField(outputFieldId)) {
      if (irpefNettaMonthlyMode === 'formula2') {
        const f2Fields = ['irpef_netta_f2_totale_trattenute', 'irpef_netta_f2_totale_contributi', 'irpef_netta_f2_addizionali', 'irpef_netta_f2_imposta_sostitutiva'];
        const missingFields = f2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
      const fields = ['irpef_lorda_mese', 'detr_lav_dip'];
      const missingFields = fields.filter(fId => {
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
      if (retribuzioneUtileTfrMode === 'alternative') {
        const hasValue = retribuzioneUtileTfrCustomFields.some(f => f.value !== '' && !isNaN(parseFloat(f.value)));
        return { valid: hasValue, missing: hasValue ? [] : ['custom_fields'] };
      }
      const fields = ['tfr_mese', 'contr_agg_tfr'];
      const missingFields = fields.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missingFields.length === 0, missing: missingFields };
    }

    if (isContrAggTfrField(outputFieldId)) {
      if (contrAggTfrMode === 'formula2') {
        const fields = ['impon_contrib_arrot_mese'];
        const missingFields = fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
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
      } else if (totaleTrattenuteMode === 'formula2') {
        const formula2Fields = ['irpef_imp_sost', 'totale_contributi', 'addizionali_field'];
        const missingFields = formula2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else {
        const formula3Fields = ['tt_f3_irpef_netta', 'tt_f3_totale_contributi', 'tt_f3_addizionali', 'tt_f3_imposta_sostitutiva'];
        const missingFields = formula3Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
    }

    if (outputFieldId === 'totale_contributi') {
      if (totaleContributiMode === 'formula1') {
        const tcFields = ['totale_trattenute_input', 'irpef_imp_sost_input', 'addizionali_input'];
        const missingFields = tcFields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else if (totaleContributiMode === 'formula2') {
        const tc2Fields = ['tc_f2_totale_trattenute', 'tc_f2_irpef_netta', 'tc_f2_addizionali', 'tc_f2_imposta_sostitutiva'];
        const missingFields = tc2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else if (totaleContributiMode === 'formula3') {
        const tc3Fields = ['tc_f3_imponibile_contributivo', 'tc_f3_adjustment', 'tc_f3_imponibile_fiscale'];
        const missingFields = tc3Fields.filter(fId => {
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
        const f2Fields = ['irpef_f2_totale_trattenute', 'irpef_f2_totale_contributi', 'irpef_f2_addizionali'];
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

    // 7. IRPEF LORDA (Monthly) - Formula 1 রিমুভ করা হয়েছে
    if (outputField === 'irpef_lorda_mese') {
      if (irpefLordaMonthlyMode === 'alternative') {
        const altFields = ['alt_irpef_imp_sost', 'alt_detr_lav_dip', 'alt_imposta_sost'];
        const missingAlt = altFields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingAlt.length === 0, missing: missingAlt };
      } else if (irpefLordaMonthlyMode === 'formula3') {
        const f3Fields = ['f3_irpef_netta', 'f3_detr_lav_dip'];
        const missingF3 = f3Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingF3.length === 0, missing: missingF3 };
      } else if (irpefLordaMonthlyMode === 'formula4') {
        const f4Fields = ['f4_imponibile_fiscale'];
        const missingF4 = f4Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingF4.length === 0, missing: missingF4 };
      }
    }

    if (outputField === 'detr_lav_dipendente_mese') {
      if (detrLavDipMonthlyMode === 'formula2') {
        const dld2Fields = ['dld2_irpef_lorda', 'dld2_irpef_netta'];
        const missingDld2 = dld2Fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingDld2.length === 0, missing: missingDld2 };
      }
    }

    // 6. IMPONIBILE FISCALE (Monthly) validation - NEW with 2 modes
    if (isImponibileFiscaleMonthlyField(outputFieldId)) {
      if (imponibileFiscaleMonthlyMode === 'formula1') {
        const required = ['imponibile_contributivo', 'totale_contributi_for_fiscale', 'adjustment'];
        const missing = required.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missing.length === 0, missing };
      } else {
        // Formula 2: IMPONIBILE FISCALE = IRPEF LORDA (Monthly) / 0.23
        const required = ['irpef_lorda_mese_for_fiscale'];
        const missing = required.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missing.length === 0, missing };
      }
    }

    // 3. IMPON. CONTRIBUTIVO MESE validation
    if (isImponContributivoMeseField(outputFieldId)) {
      const required = ['imponibile_fiscale', 'totale_contributi_for_contributivo', 'adjustment_contributivo'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

    // IMPONIBILE FISCALE ADJUSTMENT validation
    if (isImponibileFiscaleAdjustmentField(outputFieldId)) {
      const required = ['imponibile_fiscale', 'imponibile_contributivo', 'totale_contributi_for_adjustment'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
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

    // 6. IMPONIBILE FISCALE (Monthly) - NEW with 2 modes
    if (isImponibileFiscaleMonthlyField(outputField)) {
      if (imponibileFiscaleMonthlyMode === 'formula1') {
        const imponibileContributivo = parseFloat(String(inputs['imponibile_contributivo'])) || 0;
        const totaleContributi = parseFloat(String(inputs['totale_contributi_for_fiscale'])) || 0;
        const adjustment = parseFloat(String(inputs['adjustment'])) || 0;
        const calculatedImponibileFiscale = imponibileContributivo - totaleContributi + adjustment;
        setResults({ [outputField]: calculatedImponibileFiscale });
        setShowResult(true);
      } else {
        // Formula 2: IMPONIBILE FISCALE = IRPEF LORDA (Monthly) / 0.23
        const irpefLorda = parseFloat(String(inputs['irpef_lorda_mese_for_fiscale'])) || 0;
        const calculatedImponibileFiscale = irpefLorda / 0.23;
        setResults({ [outputField]: calculatedImponibileFiscale });
        setShowResult(true);
      }
      return;
    }

    // IMPONIBILE FISCALE ADJUSTMENT calculation
    if (isImponibileFiscaleAdjustmentField(outputField)) {
      const imponibileFiscale = parseFloat(String(inputs['imponibile_fiscale'])) || 0;
      const imponibileContributivo = parseFloat(String(inputs['imponibile_contributivo'])) || 0;
      const totaleContributi = parseFloat(String(inputs['totale_contributi_for_adjustment'])) || 0;
      const calculatedAdjustment = imponibileFiscale - imponibileContributivo + totaleContributi;
      setResults({ [outputField]: calculatedAdjustment });
      setShowResult(true);
      return;
    }

    // 3. IMPON. CONTRIBUTIVO MESE calculation
    if (isImponContributivoMeseField(outputField)) {
      const imponibileFiscale = parseFloat(String(inputs['imponibile_fiscale'])) || 0;
      const totaleContributi = parseFloat(String(inputs['totale_contributi_for_contributivo'])) || 0;
      const adjustment = parseFloat(String(inputs['adjustment_contributivo'])) || 0;
      const calculatedImponContributivo = imponibileFiscale + totaleContributi - adjustment;
      setResults({ [outputField]: calculatedImponContributivo });
      setShowResult(true);
      return;
    }

    if (isImpostaSostitutivaField(outputField)) {
      const totaleTrattenute = parseFloat(String(inputs['imposta_sostitutiva_totale_trattenute'])) || 0;
      const totaleContributi = parseFloat(String(inputs['imposta_sostitutiva_totale_contributi'])) || 0;
      const addizionali = parseFloat(String(inputs['imposta_sostitutiva_addizionali'])) || 0;
      const irpefNetta = parseFloat(String(inputs['imposta_sostitutiva_irpef_netta'])) || 0;
      const calculatedImpostaSostitutiva = totaleTrattenute - totaleContributi - addizionali - irpefNetta;
      setResults({ [outputField]: calculatedImpostaSostitutiva });
      setShowResult(true);
      return;
    }

    if (isIrpefNettaMonthlyField(outputField)) {
      if (irpefNettaMonthlyMode === 'formula2') {
        const totTrattenute = parseFloat(String(inputs['irpef_netta_f2_totale_trattenute'])) || 0;
        const totContributi = parseFloat(String(inputs['irpef_netta_f2_totale_contributi'])) || 0;
        const addizionali = parseFloat(String(inputs['irpef_netta_f2_addizionali'])) || 0;
        const impostaSostitutiva = parseFloat(String(inputs['irpef_netta_f2_imposta_sostitutiva'])) || 0;
        const calculatedIrpefNettaF2 = totTrattenute - totContributi - addizionali - impostaSostitutiva;
        setResults({ [outputField]: calculatedIrpefNettaF2 });
        setShowResult(true);
        return;
      }
      const irpefLorda = parseFloat(String(inputs['irpef_lorda_mese'])) || 0;
      const detrLavDip = parseFloat(String(inputs['detr_lav_dip'])) || 0;
      const calculatedIrpefNetta = irpefLorda - detrLavDip;
      setResults({ [outputField]: calculatedIrpefNetta });
      setShowResult(true);
      return;
    }

    if (isImponContribArrotMeseField(outputField)) {
      const contrAggTfr = parseFloat(String(inputs['contr_agg_tfr'])) || 0;
      const calculatedImponContribArrotMese = contrAggTfr / 0.005;
      setResults({ [outputField]: calculatedImponContribArrotMese });
      setShowResult(true);
      return;
    }

    if (outputField === 'addizionali') {
      if (addizionaliMode === 'formula1') {
        const totaleTrattenute = parseFloat(String(inputs['addizionali_f1_totale_trattenute'])) || 0;
        const irpefImpSost = parseFloat(String(inputs['addizionali_f1_irpef_imp_sost'])) || 0;
        const totaleContributi = parseFloat(String(inputs['addizionali_f1_totale_contributi'])) || 0;
        const calculatedAddizionali = totaleTrattenute - irpefImpSost - totaleContributi;
        setResults({ [outputField]: calculatedAddizionali });
        setShowResult(true);
      } else {
        const totaleTrattenute = parseFloat(String(inputs['addizionali_f2_totale_trattenute'])) || 0;
        const totaleContributi = parseFloat(String(inputs['addizionali_f2_totale_contributi'])) || 0;
        const irpefNetta = parseFloat(String(inputs['addizionali_f2_irpef_netta'])) || 0;
        const impostaSostitutiva = parseFloat(String(inputs['addizionali_f2_imposta_sostitutiva'])) || 0;
        const calculatedAddizionali = totaleTrattenute - totaleContributi - irpefNetta - impostaSostitutiva;
        setResults({ [outputField]: calculatedAddizionali });
        setShowResult(true);
      }
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
      if (retribuzioneUtileTfrMode === 'alternative') {
        const totalSum = retribuzioneUtileTfrCustomFields.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
        setResults({ [outputField]: totalSum });
        setShowResult(true);
        return;
      }
      const tfrMese = parseFloat(String(inputs['tfr_mese'])) || 0;
      const contrAggTfr = parseFloat(String(inputs['contr_agg_tfr'])) || 0;
      const calculatedRetribuzioneUtileTfr = (tfrMese + contrAggTfr) * 13.5;
      setResults({ [outputField]: calculatedRetribuzioneUtileTfr });
      setShowResult(true);
      return;
    }

    if (isContrAggTfrField(outputField)) {
      if (contrAggTfrMode === 'formula2') {
        const imponContribArrotMese = parseFloat(String(inputs['impon_contrib_arrot_mese'])) || 0;
        const calculatedContrAggTfrF2 = imponContribArrotMese * 0.005;
        setResults({ [outputField]: calculatedContrAggTfrF2 });
        setShowResult(true);
        return;
      }
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
        const addizionaliField = parseFloat(String(inputs['addizionali_field'])) || 0;

        const calculatedTrattenute = irpefImpSost + totaleContributi + addizionaliField;
        setResults({ [outputField]: calculatedTrattenute });
        setShowResult(true);
      } else if (totaleTrattenuteMode === 'formula3') {
        const irpefNetta = parseFloat(String(inputs['tt_f3_irpef_netta'])) || 0;
        const totaleContributiF3 = parseFloat(String(inputs['tt_f3_totale_contributi'])) || 0;
        const addizionaliF3 = parseFloat(String(inputs['tt_f3_addizionali'])) || 0;
        const impostaSostitutivaF3 = parseFloat(String(inputs['tt_f3_imposta_sostitutiva'])) || 0;

        const calculatedTrattenuteF3 = irpefNetta + totaleContributiF3 + addizionaliF3 + impostaSostitutivaF3;
        setResults({ [outputField]: calculatedTrattenuteF3 });
        setShowResult(true);
      }
      return;
    }

    if (outputField === 'totale_contributi') {
      if (totaleContributiMode === 'formula1') {
        const totaleTrattenuteVal = parseFloat(String(inputs['totale_trattenute_input'])) || 0;
        const irpefImpSostVal = parseFloat(String(inputs['irpef_imp_sost_input'])) || 0;
        const addizionaliVal = parseFloat(String(inputs['addizionali_input'])) || 0;

        const calculatedTotaleContributi = totaleTrattenuteVal - irpefImpSostVal - addizionaliVal;
        setResults({ [outputField]: calculatedTotaleContributi });
        setShowResult(true);
      } else if (totaleContributiMode === 'formula2') {
        const totaleTrattenuteF2 = parseFloat(String(inputs['tc_f2_totale_trattenute'])) || 0;
        const irpefNettaF2 = parseFloat(String(inputs['tc_f2_irpef_netta'])) || 0;
        const addizionaliF2 = parseFloat(String(inputs['tc_f2_addizionali'])) || 0;
        const impostaSostitutivaF2 = parseFloat(String(inputs['tc_f2_imposta_sostitutiva'])) || 0;

        const calculatedTotaleContributiF2 = totaleTrattenuteF2 - irpefNettaF2 - addizionaliF2 - impostaSostitutivaF2;
        setResults({ [outputField]: calculatedTotaleContributiF2 });
        setShowResult(true);
      } else if (totaleContributiMode === 'formula3') {
        const imponibileContributivoF3 = parseFloat(String(inputs['tc_f3_imponibile_contributivo'])) || 0;
        const adjustmentF3 = parseFloat(String(inputs['tc_f3_adjustment'])) || 0;
        const imponibileFiscaleF3 = parseFloat(String(inputs['tc_f3_imponibile_fiscale'])) || 0;

        const calculatedTotaleContributiF3 = imponibileContributivoF3 + adjustmentF3 - imponibileFiscaleF3;
        setResults({ [outputField]: calculatedTotaleContributiF3 });
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
        const addizionali = parseFloat(String(inputs['irpef_f2_addizionali'])) || 0;

        const calculatedIrpefImpSost = totTrattenute - totContributi - addizionali;
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

    // 7. IRPEF LORDA (Monthly) - Formula 1 রিমুভ করা হয়েছে
    if (outputField === 'irpef_lorda_mese') {
      if (irpefLordaMonthlyMode === 'alternative') {
        const irpefImpSost = parseFloat(String(inputs['alt_irpef_imp_sost'])) || 0;
        const detrLavDip = parseFloat(String(inputs['alt_detr_lav_dip'])) || 0;
        const impostaSost = parseFloat(String(inputs['alt_imposta_sost'])) || 0;
        const calculatedAltResult = (irpefImpSost + detrLavDip) - impostaSost;
        setResults({ [outputField]: calculatedAltResult });
        setShowResult(true);
        return;
      } else if (irpefLordaMonthlyMode === 'formula3') {
        const irpefNetta = parseFloat(String(inputs['f3_irpef_netta'])) || 0;
        const detrLavDip = parseFloat(String(inputs['f3_detr_lav_dip'])) || 0;
        const calculatedF3Result = irpefNetta + detrLavDip;
        setResults({ [outputField]: calculatedF3Result });
        setShowResult(true);
        return;
      } else if (irpefLordaMonthlyMode === 'formula4') {
        const imponibileFiscale = parseFloat(String(inputs['f4_imponibile_fiscale'])) || 0;
        const calculatedF4Result = imponibileFiscale * 0.23;
        setResults({ [outputField]: calculatedF4Result });
        setShowResult(true);
        return;
      }
    }

    if (outputField === 'detr_lav_dipendente_mese') {
      if (detrLavDipMonthlyMode === 'formula2') {
        const irpefLordaDld = parseFloat(String(inputs['dld2_irpef_lorda'])) || 0;
        const irpefNettaDld = parseFloat(String(inputs['dld2_irpef_netta'])) || 0;
        const calculatedDetrLavDip = irpefLordaDld - irpefNettaDld;
        setResults({ [outputField]: calculatedDetrLavDip });
        setShowResult(true);
        return;
      }
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
      let result: number | null = null;
      if (isImponibileFiscaleMonthlyField(field)) {
        if (imponibileFiscaleMonthlyMode === 'formula1') {
          const imponibileContributivo = numericInputs['imponibile_contributivo'] || 0;
          const totaleContributi = numericInputs['totale_contributi_for_fiscale'] || 0;
          const adjustment = numericInputs['adjustment'] || 0;
          result = imponibileContributivo - totaleContributi + adjustment;
        } else {
          const irpefLorda = numericInputs['irpef_lorda_mese_for_fiscale'] || 0;
          result = irpefLorda / 0.23;
        }
      } else if (isImponibileFiscaleAdjustmentField(field)) {
        const imponibileFiscale = numericInputs['imponibile_fiscale'] || 0;
        const imponibileContributivo = numericInputs['imponibile_contributivo'] || 0;
        const totaleContributi = numericInputs['totale_contributi_for_adjustment'] || 0;
        result = imponibileFiscale - imponibileContributivo + totaleContributi;
      } else if (isImponContributivoMeseField(field)) {
        const imponibileFiscale = numericInputs['imponibile_fiscale'] || 0;
        const totaleContributi = numericInputs['totale_contributi_for_contributivo'] || 0;
        const adjustment = numericInputs['adjustment_contributivo'] || 0;
        result = imponibileFiscale + totaleContributi - adjustment;
      } else if (isImponContribArrotMeseField(field)) {
        result = ((numericInputs['contr_agg_tfr'] || 0) / 0.005);
      } else if (isImpostaSostitutivaField(field)) {
        result = ((numericInputs['imposta_sostitutiva_totale_trattenute'] || 0) - (numericInputs['imposta_sostitutiva_totale_contributi'] || 0) - (numericInputs['imposta_sostitutiva_addizionali'] || 0) - (numericInputs['imposta_sostitutiva_irpef_netta'] || 0));
      } else if (field === 'addizionali') {
        result = (addizionaliMode === 'formula1'
          ? ((numericInputs['addizionali_f1_totale_trattenute'] || 0) - (numericInputs['addizionali_f1_irpef_imp_sost'] || 0) - (numericInputs['addizionali_f1_totale_contributi'] || 0))
          : ((numericInputs['addizionali_f2_totale_trattenute'] || 0) - (numericInputs['addizionali_f2_totale_contributi'] || 0) - (numericInputs['addizionali_f2_irpef_netta'] || 0) - (numericInputs['addizionali_f2_imposta_sostitutiva'] || 0)));
      } else {
        result = calculator.calculate(numericInputs, field);
      }
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

  const formatFullPrecision = (value: number): string => {
    // ফ্লোটিং পয়েন্ট এর সামান্য ভুল (যেমন 56.40289999999) দূর করার জন্য রাউন্ড করা হচ্ছে
    const rounded = Math.round(value * 1e8) / 1e8;
    let str = rounded.toString();
    if (!str.includes('.')) {
      str = str + '.00';
    } else {
      const decimals = str.split('.')[1];
      if (decimals.length === 1) {
        str = str + '0';
      }
    }
    return str;
  };

  const getFieldLabel = (fieldId: string): string => {
    if (fieldId === 'addizionali') return 'ADDIZIONALI';
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
            formatFullPrecision={formatFullPrecision}
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
            detrLavDipMonthlyMode={detrLavDipMonthlyMode}
            onDetrLavDipMonthlyModeChange={setDetrLavDipMonthlyMode}
            retribuzioneUtileTfrMode={retribuzioneUtileTfrMode}
            onRetribuzioneUtileTfrModeChange={setRetribuzioneUtileTfrMode}
            retribuzioneUtileTfrCustomFields={retribuzioneUtileTfrCustomFields}
            onRetribuzioneUtileTfrCustomFieldChange={(id, val) => {
              setRetribuzioneUtileTfrCustomFields(retribuzioneUtileTfrCustomFields.map(f => f.id === id ? { ...f, value: val } : f));
            }}
            onAddRetribuzioneUtileTfrCustomField={() => {
              setRetribuzioneUtileTfrCustomFields([
                ...retribuzioneUtileTfrCustomFields,
                { id: Date.now().toString(), label: 'নতুন মান', value: '' }
              ]);
            }}
            onRemoveRetribuzioneUtileTfrCustomField={(id) => {
              if (retribuzioneUtileTfrCustomFields.length > 2) {
                setRetribuzioneUtileTfrCustomFields(retribuzioneUtileTfrCustomFields.filter(f => f.id !== id));
              }
            }}
            contrAggTfrMode={contrAggTfrMode}
            onContrAggTfrModeChange={setContrAggTfrMode}
            irpefNettaMonthlyMode={irpefNettaMonthlyMode}
            onIrpefNettaMonthlyModeChange={setIrpefNettaMonthlyMode}
            addizionaliMode={addizionaliMode}
            onAddizionaliModeChange={setAddizionaliMode}
            addValueResult={addValueResult}
            onCalculateAddValue={handleCalculateAddValue}
            onResetAddValue={handleResetAddValue}
            imponibileFiscaleMonthlyMode={imponibileFiscaleMonthlyMode} // NEW
            onImponibileFiscaleMonthlyModeChange={setImponibileFiscaleMonthlyMode} // NEW
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
  formatFullPrecision: (value: number) => string;
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
  irpefLordaMonthlyMode: 'alternative' | 'formula3' | 'formula4';
  onIrpefLordaMonthlyModeChange: (mode: 'alternative' | 'formula3') => void;
  totaleTrattenuteMode: 'formula1' | 'formula2' | 'formula3';
  onTotaleTrattenuteModeChange: (mode: 'formula1' | 'formula2' | 'formula3') => void;
  totaleContributiMode: 'formula1' | 'formula2' | 'formula3' | 'alternative';
  onTotaleContributiModeChange: (mode: 'formula' | 'alternative') => void;
  irpefImpSostMode: 'formula1' | 'formula2';
  onIrpefImpSostModeChange: (mode: 'formula1' | 'formula2') => void;
  detrLavDipMonthlyMode: 'formula1' | 'formula2';
  onDetrLavDipMonthlyModeChange: (mode: 'formula1' | 'formula2') => void;
  retribuzioneUtileTfrMode: 'formula' | 'alternative';
  onRetribuzioneUtileTfrModeChange: (mode: 'formula' | 'alternative') => void;
  retribuzioneUtileTfrCustomFields: CustomDynamicField[];
  onRetribuzioneUtileTfrCustomFieldChange: (id: string, value: string) => void;
  onAddRetribuzioneUtileTfrCustomField: () => void;
  onRemoveRetribuzioneUtileTfrCustomField: (id: string) => void;
  contrAggTfrMode: 'formula1' | 'formula2';
  onContrAggTfrModeChange: (mode: 'formula1' | 'formula2') => void;
  irpefNettaMonthlyMode: 'formula1' | 'formula2';
  onIrpefNettaMonthlyModeChange: (mode: 'formula1' | 'formula2') => void;
  addizionaliMode: 'formula1' | 'formula2';
  onAddizionaliModeChange: (mode: 'formula1' | 'formula2') => void;
  addValueResult: number | null;
  onCalculateAddValue: () => void;
  onResetAddValue: () => void;
  // NEW props for 6. IMPONIBILE FISCALE (Monthly)
  imponibileFiscaleMonthlyMode: 'formula1' | 'formula2';
  onImponibileFiscaleMonthlyModeChange: (mode: 'formula1' | 'formula2') => void;
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
  formatFullPrecision,
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
  detrLavDipMonthlyMode,
  onDetrLavDipMonthlyModeChange,
  retribuzioneUtileTfrMode,
  onRetribuzioneUtileTfrModeChange,
  retribuzioneUtileTfrCustomFields,
  onRetribuzioneUtileTfrCustomFieldChange,
  onAddRetribuzioneUtileTfrCustomField,
  onRemoveRetribuzioneUtileTfrCustomField,
  contrAggTfrMode,
  onContrAggTfrModeChange,
  irpefNettaMonthlyMode,
  onIrpefNettaMonthlyModeChange,
  addizionaliMode,
  onAddizionaliModeChange,
  addValueResult,
  onCalculateAddValue,
  onResetAddValue,
  imponibileFiscaleMonthlyMode, // NEW
  onImponibileFiscaleMonthlyModeChange, // NEW
}) => {
  const requiredFieldIds = outputField ? getRequiredFields(outputField) : [];
  const isTotaleCompetenzeField = outputField === 'totale_comp';
  const isTotaleTrattenuteField = outputField === 'totale_trattenute';
  const isTotaleContributiField = outputField === 'totale_contributi';
  
  // 7. IRPEF LORDA (Monthly) - এখন শুধু 2টি অপশন
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
  const isIrpefNettaMonthlyField = outputField ? (
    outputField.toLowerCase() === 'irpef_netta_mese' ||
    outputField.toLowerCase() === '18_irpef_netta_mese' ||
    outputField.toLowerCase().includes('irpef_netta_monthly') ||
    outputField.toLowerCase().includes('18._irpef_netta')
  ) : false;
  const isDetrLavDipMonthlyField = outputField === 'detr_lav_dipendente_mese';
  const isImponContribArrotMeseField = outputField ? (
    outputField.toLowerCase() === 'impon_contrib_arrot_mese' ||
    outputField.toLowerCase() === '4_impon_contrib_arrot_mese' ||
    outputField.toLowerCase().includes('impon_contrib_arrot_mese') ||
    getFieldLabel(outputField).toLowerCase().includes('impon. contrib. arrot. mese')
  ) : false;
  const isAddizionaliField = outputField === 'addizionali';
  const isImpostaSostitutivaField = outputField ? (
    outputField.toLowerCase() === 'imposta_sostitutiva' ||
    outputField.toLowerCase() === 'imposta_sostitutiva_mese' ||
    outputField.toLowerCase() === '15_imposta_sostitutiva_mese' ||
    outputField.toLowerCase().includes('imposta_sostitutiva') ||
    getFieldLabel(outputField).toLowerCase().includes('imposta sostitutiva (monthly)')
  ) : false;
  
  // 6. IMPONIBILE FISCALE (Monthly)
  const isImponibileFiscaleMonthlyField = outputField ? (
    outputField.toLowerCase() === 'imponibile_fiscale_mese' ||
    outputField.toLowerCase() === '6_imponibile_fiscale_mese' ||
    outputField.toLowerCase().includes('imponibile_fiscale_mese') ||
    outputField.toLowerCase().includes('imponibile fiscale (monthly)') ||
    getFieldLabel(outputField).toLowerCase().includes('imponibile fiscale (monthly)') ||
    getFieldLabel(outputField).toLowerCase().includes('imponibile fiscale (mese)') ||
    getFieldLabel(outputField).toLowerCase().includes('6. imponibile fiscale (monthly)')
  ) : false;

  const isImponContributivoMeseField = outputField ? (
    outputField.toLowerCase() === 'impon_contributivo_mese' ||
    outputField.toLowerCase() === '2_impon_contributivo_mese' ||
    outputField.toLowerCase().includes('impon_contributivo_mese') ||
    getFieldLabel(outputField).toLowerCase().includes('impon. contributivo mese') ||
    getFieldLabel(outputField).toLowerCase().includes('2. impon. contributivo mese')
  ) : false;

  const isImponibileFiscaleAdjustmentField = outputField ? (
    outputField.toLowerCase() === 'imponibile_fiscale_adjustment' ||
    outputField.toLowerCase().includes('imponibile_fiscale_adjustment') ||
    outputField.toLowerCase().includes('imponibile fiscale adjustment') ||
    getFieldLabel(outputField).toLowerCase().includes('imponibile fiscale adjustment')
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

              {/* 6. IMPONIBILE FISCALE (Monthly) - NEW with 2 modes */}
              {isImponibileFiscaleMonthlyField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="imponibileFiscaleMonthlyMode"
                        checked={imponibileFiscaleMonthlyMode === 'formula1'}
                        onChange={() => onImponibileFiscaleMonthlyModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="imponibileFiscaleMonthlyMode"
                        checked={imponibileFiscaleMonthlyMode === 'formula2'}
                        onChange={() => onImponibileFiscaleMonthlyModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {imponibileFiscaleMonthlyMode === 'formula1' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE CONTRIBUTIVO</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inputs['imponibile_contributivo'] || ''}
                              onChange={(e) => onInputChange('imponibile_contributivo', e.target.value)}
                              placeholder="0.00"
                              className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                                attempted && !inputs['imponibile_contributivo'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          {attempted && !inputs['imponibile_contributivo'] && (
                            <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inputs['totale_contributi_for_fiscale'] || ''}
                              onChange={(e) => onInputChange('totale_contributi_for_fiscale', e.target.value)}
                              placeholder="0.00"
                              className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                                attempted && !inputs['totale_contributi_for_fiscale'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          {attempted && !inputs['totale_contributi_for_fiscale'] && (
                            <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADJUSTMENT (প্লাস বা মাইনাস হতে পারে)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['adjustment'] || ''}
                            onChange={(e) => onInputChange('adjustment', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['adjustment'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['adjustment'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Formula 2: IMPONIBILE FISCALE = IRPEF LORDA (Monthly) / 0.23
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF LORDA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_lorda_mese_for_fiscale'] || ''}
                            onChange={(e) => onInputChange('irpef_lorda_mese_for_fiscale', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_lorda_mese_for_fiscale'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_lorda_mese_for_fiscale'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IMPONIBILE FISCALE ADJUSTMENT */}
              {isImponibileFiscaleAdjustmentField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE FISCALE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['imponibile_fiscale'] || ''}
                            onChange={(e) => onInputChange('imponibile_fiscale', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['imponibile_fiscale'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['imponibile_fiscale'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE CONTRIBUTIVO</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['imponibile_contributivo'] || ''}
                            onChange={(e) => onInputChange('imponibile_contributivo', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['imponibile_contributivo'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['imponibile_contributivo'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['totale_contributi_for_adjustment'] || ''}
                          onChange={(e) => onInputChange('totale_contributi_for_adjustment', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['totale_contributi_for_adjustment'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['totale_contributi_for_adjustment'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. IRPEF LORDA (Monthly) - Formula 1 রিমুভ, শুধু 2টি অপশন */}
              {isIrpefLordaMonthlyField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefLordaMonthlyMode"
                        checked={irpefLordaMonthlyMode === 'alternative'}
                        onChange={() => onIrpefLordaMonthlyModeChange('alternative')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefLordaMonthlyMode"
                        checked={irpefLordaMonthlyMode === 'formula3'}
                        onChange={() => onIrpefLordaMonthlyModeChange('formula3')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefLordaMonthlyMode"
                        checked={irpefLordaMonthlyMode === 'formula4'}
                        onChange={() => onIrpefLordaMonthlyModeChange('formula4')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 3</span>
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
                  {irpefLordaMonthlyMode === 'formula3' && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">18. IRPEF NETTA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['f3_irpef_netta'] || ''}
                            onChange={(e) => onInputChange('f3_irpef_netta', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['f3_irpef_netta'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['f3_irpef_netta'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">DETR. LAV. DIPENDENTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['f3_detr_lav_dip'] || ''}
                            onChange={(e) => onInputChange('f3_detr_lav_dip', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['f3_detr_lav_dip'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['f3_detr_lav_dip'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  )}
                  {irpefLordaMonthlyMode === 'formula4' && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE FISCALE (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['f4_imponibile_fiscale'] || ''}
                            onChange={(e) => onInputChange('f4_imponibile_fiscale', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['f4_imponibile_fiscale'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['f4_imponibile_fiscale'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. IMPON. CONTRIBUTIVO MESE */}
              {isImponContributivoMeseField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE FISCALE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['imponibile_fiscale'] || ''}
                            onChange={(e) => onInputChange('imponibile_fiscale', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['imponibile_fiscale'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['imponibile_fiscale'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['totale_contributi_for_contributivo'] || ''}
                            onChange={(e) => onInputChange('totale_contributi_for_contributivo', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['totale_contributi_for_contributivo'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['totale_contributi_for_contributivo'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ADJUSTMENT (প্লাস বা মাইনাস হতে পারে)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inputs['adjustment_contributivo'] || ''}
                          onChange={(e) => onInputChange('adjustment_contributivo', e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                            attempted && !inputs['adjustment_contributivo'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {attempted && !inputs['adjustment_contributivo'] && (
                        <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 18. IRPEF NETTA (Monthly) */}
              {isIrpefNettaMonthlyField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefNettaMonthlyMode"
                        checked={irpefNettaMonthlyMode === 'formula1'}
                        onChange={() => onIrpefNettaMonthlyModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="irpefNettaMonthlyMode"
                        checked={irpefNettaMonthlyMode === 'formula2'}
                        onChange={() => onIrpefNettaMonthlyModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {irpefNettaMonthlyMode === 'formula1' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">17. IRPEF LORDA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_lorda_mese'] || ''}
                            onChange={(e) => onInputChange('irpef_lorda_mese', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_lorda_mese'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_lorda_mese'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">DETR. LAV. DIPENDENTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['detr_lav_dip'] || ''}
                            onChange={(e) => onInputChange('detr_lav_dip', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['detr_lav_dip'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['detr_lav_dip'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_netta_f2_totale_trattenute'] || ''}
                            onChange={(e) => onInputChange('irpef_netta_f2_totale_trattenute', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_netta_f2_totale_trattenute'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_netta_f2_totale_trattenute'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_netta_f2_totale_contributi'] || ''}
                            onChange={(e) => onInputChange('irpef_netta_f2_totale_contributi', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_netta_f2_totale_contributi'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_netta_f2_totale_contributi'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_netta_f2_addizionali'] || ''}
                            onChange={(e) => onInputChange('irpef_netta_f2_addizionali', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_netta_f2_addizionali'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_netta_f2_addizionali'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPOSTA SOSTITUTIVA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_netta_f2_imposta_sostitutiva'] || ''}
                            onChange={(e) => onInputChange('irpef_netta_f2_imposta_sostitutiva', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['irpef_netta_f2_imposta_sostitutiva'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['irpef_netta_f2_imposta_sostitutiva'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 25. RETRIBUZIONE UTILE TFR */}
              {isRetribuzioneUtileTfrField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="retribuzioneUtileTfrMode"
                        checked={retribuzioneUtileTfrMode === 'formula'}
                        onChange={() => onRetribuzioneUtileTfrModeChange('formula')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Standard Formula</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="retribuzioneUtileTfrMode"
                        checked={retribuzioneUtileTfrMode === 'alternative'}
                        onChange={() => onRetribuzioneUtileTfrModeChange('alternative')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Alternative Mode</span>
                    </label>
                  </div>

                  {retribuzioneUtileTfrMode === 'formula' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TFR MESE</label>
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
                        <label className="block text-xs font-semibold text-gray-700 mb-1">CONTR. AGG. TFR</label>
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
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-700 tracking-wide flex-1 pr-2">
                          {outputField && CUSTOM_FIELD_TITLES[outputField]
                            ? CUSTOM_FIELD_TITLES[outputField]
                            : `${outputField ? getFieldLabel(outputField) : 'RETRIBUZIONE UTILE TFR'}:`}
                        </span>
                        <button
                          onClick={onAddRetribuzioneUtileTfrCustomField}
                          type="button"
                          className="flex-shrink-0 flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                        >
                          <span>+ Add Value</span>
                        </button>
                      </div>
                      {retribuzioneUtileTfrCustomFields.map((field) => {
                        const canDelete = retribuzioneUtileTfrCustomFields.length > 2;
                        return (
                          <div key={field.id} className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                              <input
                                type="number"
                                step="0.01"
                                value={field.value}
                                onChange={(e) => onRetribuzioneUtileTfrCustomFieldChange(field.id, e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={!canDelete}
                              onClick={() => canDelete && onRemoveRetribuzioneUtileTfrCustomField(field.id)}
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

              {/* IMPON. CONTRIB. ARROT. MESE */}
              {isImponContribArrotMeseField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">CONTR. AGG. TFR</label>
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
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="contrAggTfrMode"
                        checked={contrAggTfrMode === 'formula1'}
                        onChange={() => onContrAggTfrModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="contrAggTfrMode"
                        checked={contrAggTfrMode === 'formula2'}
                        onChange={() => onContrAggTfrModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {contrAggTfrMode === 'formula1' ? (
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
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPON. CONTRIB. ARROT. MESE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['impon_contrib_arrot_mese'] || ''}
                            onChange={(e) => onInputChange('impon_contrib_arrot_mese', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['impon_contrib_arrot_mese'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['impon_contrib_arrot_mese'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                    </div>
                  )}
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
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleTrattenuteMode"
                        checked={totaleTrattenuteMode === 'formula3'}
                        onChange={() => onTotaleTrattenuteModeChange('formula3')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 3</span>
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
                  ) : totaleTrattenuteMode === 'formula2' ? (
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
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['addizionali_field'] || ''}
                            onChange={(e) => onInputChange('addizionali_field', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF NETTA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tt_f3_irpef_netta'] || ''}
                            onChange={(e) => onInputChange('tt_f3_irpef_netta', e.target.value)}
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
                            value={inputs['tt_f3_totale_contributi'] || ''}
                            onChange={(e) => onInputChange('tt_f3_totale_contributi', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tt_f3_addizionali'] || ''}
                            onChange={(e) => onInputChange('tt_f3_addizionali', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPOSTA SOSTITUTIVA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tt_f3_imposta_sostitutiva'] || ''}
                            onChange={(e) => onInputChange('tt_f3_imposta_sostitutiva', e.target.value)}
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
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleContributiMode"
                        checked={totaleContributiMode === 'formula1'}
                        onChange={() => onTotaleContributiModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleContributiMode"
                        checked={totaleContributiMode === 'formula2'}
                        onChange={() => onTotaleContributiModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="totaleContributiMode"
                        checked={totaleContributiMode === 'formula3'}
                        onChange={() => onTotaleContributiModeChange('formula3')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 3</span>
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

                  {totaleContributiMode === 'formula1' ? (
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
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['addizionali_input'] || ''}
                            onChange={(e) => onInputChange('addizionali_input', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : totaleContributiMode === 'formula2' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f2_totale_trattenute'] || ''}
                            onChange={(e) => onInputChange('tc_f2_totale_trattenute', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF NETTA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f2_irpef_netta'] || ''}
                            onChange={(e) => onInputChange('tc_f2_irpef_netta', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f2_addizionali'] || ''}
                            onChange={(e) => onInputChange('tc_f2_addizionali', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPOSTA SOSTITUTIVA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f2_imposta_sostitutiva'] || ''}
                            onChange={(e) => onInputChange('tc_f2_imposta_sostitutiva', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : totaleContributiMode === 'formula3' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE CONTRIBUTIVO</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f3_imponibile_contributivo'] || ''}
                            onChange={(e) => onInputChange('tc_f3_imponibile_contributivo', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADJUSTMENT</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f3_adjustment'] || ''}
                            onChange={(e) => onInputChange('tc_f3_adjustment', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPONIBILE FISCALE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['tc_f3_imponibile_fiscale'] || ''}
                            onChange={(e) => onInputChange('tc_f3_imponibile_fiscale', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-700 tracking-wide flex-1 pr-2">
                          {outputField && CUSTOM_FIELD_TITLES[outputField] 
                            ? CUSTOM_FIELD_TITLES[outputField] 
                            : `${outputField ? getFieldLabel(outputField) : 'TOTALE CONTRIBUTI'}:`}
                        </span>
                        <button
                          onClick={onAddCustomField}
                          type="button"
                          className="flex-shrink-0 flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
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
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['irpef_f2_addizionali'] || ''}
                            onChange={(e) => onInputChange('irpef_f2_addizionali', e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* কাস্টম Dynamic Field অপশন (5, 6, 20, 22, 34 ইত্যাদি ফিল্ডের জন্য) */}
              {!isTotaleCompetenzeField && !isTotaleTrattenuteField && !isTotaleContributiField && !isIrpefImpSostField && !isTfrMeseField && !isRetribuzioneUtileTfrField && !isContrAggTfrField && !isImponContribArrotMeseField && !isIrpefNettaMonthlyField && !isImponibileFiscaleMonthlyField && !isImponContributivoMeseField && !isImponibileFiscaleAdjustmentField && !isIrpefLordaMonthlyField && isAnnuoField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-700 tracking-wide flex-1 pr-2 leading-relaxed">
                        {outputField && CUSTOM_FIELD_TITLES[outputField] 
                          ? CUSTOM_FIELD_TITLES[outputField] 
                          : `${outputField ? getFieldLabel(outputField) : ''} calculate er jonno man din:`}
                      </span>
                      <button
                        onClick={onAddCustomField}
                        type="button"
                        className="flex-shrink-0 flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
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

              {/* ADDIZIONALI */}
              {isImpostaSostitutivaField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input type="number" step="0.01" value={inputs['imposta_sostitutiva_totale_trattenute'] || ''} onChange={(e) => onInputChange('imposta_sostitutiva_totale_trattenute', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['imposta_sostitutiva_totale_trattenute'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                      </div>
                      {attempted && !inputs['imposta_sostitutiva_totale_trattenute'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input type="number" step="0.01" value={inputs['imposta_sostitutiva_totale_contributi'] || ''} onChange={(e) => onInputChange('imposta_sostitutiva_totale_contributi', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['imposta_sostitutiva_totale_contributi'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                      </div>
                      {attempted && !inputs['imposta_sostitutiva_totale_contributi'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ADDIZIONALI</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input type="number" step="0.01" value={inputs['imposta_sostitutiva_addizionali'] || ''} onChange={(e) => onInputChange('imposta_sostitutiva_addizionali', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['imposta_sostitutiva_addizionali'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                      </div>
                      {attempted && !inputs['imposta_sostitutiva_addizionali'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF NETTA</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                        <input type="number" step="0.01" value={inputs['imposta_sostitutiva_irpef_netta'] || ''} onChange={(e) => onInputChange('imposta_sostitutiva_irpef_netta', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['imposta_sostitutiva_irpef_netta'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                      </div>
                      {attempted && !inputs['imposta_sostitutiva_irpef_netta'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                    </div>
                  </div>
                </div>
              )}

              {isAddizionaliField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input type="radio" name="addizionaliMode" checked={addizionaliMode === 'formula1'} onChange={() => onAddizionaliModeChange('formula1')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input type="radio" name="addizionaliMode" checked={addizionaliMode === 'formula2'} onChange={() => onAddizionaliModeChange('formula2')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {addizionaliMode === 'formula1' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f1_totale_trattenute'] || ''} onChange={(e) => onInputChange('addizionali_f1_totale_trattenute', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f1_totale_trattenute'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f1_totale_trattenute'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF + IMP. SOST.</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f1_irpef_imp_sost'] || ''} onChange={(e) => onInputChange('addizionali_f1_irpef_imp_sost', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f1_irpef_imp_sost'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f1_irpef_imp_sost'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f1_totale_contributi'] || ''} onChange={(e) => onInputChange('addizionali_f1_totale_contributi', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f1_totale_contributi'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f1_totale_contributi'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE TRATTENUTE</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f2_totale_trattenute'] || ''} onChange={(e) => onInputChange('addizionali_f2_totale_trattenute', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f2_totale_trattenute'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f2_totale_trattenute'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TOTALE CONTRIBUTI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f2_totale_contributi'] || ''} onChange={(e) => onInputChange('addizionali_f2_totale_contributi', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f2_totale_contributi'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f2_totale_contributi'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF NETTA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f2_irpef_netta'] || ''} onChange={(e) => onInputChange('addizionali_f2_irpef_netta', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f2_irpef_netta'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f2_irpef_netta'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IMPOSTA SOSTITUTIVA</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input type="number" step="0.01" value={inputs['addizionali_f2_imposta_sostitutiva'] || ''} onChange={(e) => onInputChange('addizionali_f2_imposta_sostitutiva', e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${attempted && !inputs['addizionali_f2_imposta_sostitutiva'] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                        </div>
                        {attempted && !inputs['addizionali_f2_imposta_sostitutiva'] && <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 12. DETR. LAV. DIPENDENTE (Monthly) */}
              {isDetrLavDipMonthlyField && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="detrLavDipMonthlyMode"
                        checked={detrLavDipMonthlyMode === 'formula1'}
                        onChange={() => onDetrLavDipMonthlyModeChange('formula1')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 1</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="detrLavDipMonthlyMode"
                        checked={detrLavDipMonthlyMode === 'formula2'}
                        onChange={() => onDetrLavDipMonthlyModeChange('formula2')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Formula 2</span>
                    </label>
                  </div>

                  {detrLavDipMonthlyMode === 'formula2' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF LORDA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['dld2_irpef_lorda'] || ''}
                            onChange={(e) => onInputChange('dld2_irpef_lorda', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['dld2_irpef_lorda'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['dld2_irpef_lorda'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">IRPEF NETTA (Monthly)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs['dld2_irpef_netta'] || ''}
                            onChange={(e) => onInputChange('dld2_irpef_netta', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                              attempted && !inputs['dld2_irpef_netta'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {attempted && !inputs['dld2_irpef_netta'] && (
                          <span className="text-[10px] text-red-500 mt-1 block">This field is required</span>
                        )}
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
                !isImponContribArrotMeseField &&
                !isIrpefNettaMonthlyField &&
                !isAddizionaliField &&
                !isImpostaSostitutivaField &&
                !isImponibileFiscaleMonthlyField &&
                !isImponContributivoMeseField &&
                !isImponibileFiscaleAdjustmentField &&
                !isIrpefLordaMonthlyField &&
                (!isIrpefImpSostField || irpefImpSostMode === 'formula1') &&
                (!isDetrLavDipMonthlyField || detrLavDipMonthlyMode === 'formula1')) && (
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
                <div className="mt-6 p-4 bg-white border border-black rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-black">
                      {getFieldLabel(outputField).replace(/^\d+\.\s*/, '')}
                    </span>
                    <span className="text-xl font-bold text-black">
                      {formatCurrency(results[outputField] || 0)}
                    </span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-black">
                      {formatFullPrecision(results[outputField] || 0)} €
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Add Value Formula</h3>
              <button
                type="button"
                onClick={onAddCustomField}
                className="flex-shrink-0 flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
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

function allTotalTrattenuteFields(fields: string[]) {
  return fields;
}
