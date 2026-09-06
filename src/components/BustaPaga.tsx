import { useState, useMemo } from 'react';
import { CalculatorInputs } from '../types';
import { UNIFIED_CALCULATOR, searchFields } from '../config/unifiedCalculator';
import { FormulaModal } from './FormulaModal';

interface BustaPagaProps {
  onBack: () => void;
}

type CalculatorMode = 'standard' | 'multi';

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

  // Temporary Calculator এর জন্য সম্পূর্ণ আলাদা, স্বাধীন স্টেট (অন্য কোনো ফর্মুলার সাথে শেয়ার করা হয় না)
  const [tempCalcFields, setTempCalcFields] = useState<CustomDynamicField[]>([
    { id: '1', label: 'মান ১', value: '' },
    { id: '2', label: 'মান ২', value: '' }
  ]);
  const [tempCalcOperator, setTempCalcOperator] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [tempCalcResult, setTempCalcResult] = useState<number | null>(null);

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

  // RETRIBUZIONE MENSILE এর জন্য মোড স্টেট (Formula 1 vs Formula 2 vs Formula 3)
  const [retribuzioneMensileMode, setRetribuzioneMensileMode] = useState<'formula1' | 'formula2' | 'formula3'>('formula1');

  // ---- NEW: RETRIBUZIONE GIORNALIERA এর জন্য মোড স্টেট (Formula 1 vs Formula 2) ----
  const [retribuzioneGiornalieraMode, setRetribuzioneGiornalieraMode] = useState<'formula1' | 'formula2'>('formula1');

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
      return fields;
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
    setImponibileFiscaleMonthlyMode('formula1');
    setRetribuzioneMensileMode('formula1');
    setRetribuzioneGiornalieraMode('formula1');
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

  // ---- PAGA BASE CONGLOBATA ----
  const isPagaBaseConglobataField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'paga_base_conglobata' ||
      lower.includes('paga_base_conglobata') ||
      label.includes('paga base conglobata');
  };

  // ---- CONTINGENZA ----
  const isContingenzaField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'contingenza' ||
      lower.includes('contingenza') ||
      label.includes('contingenza');
  };

  // ---- SCATTI ANZ. ----
  const isScattiAnzField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'scatti_anz' ||
      lower.includes('scatti_anz') ||
      label.includes('scatti anz');
  };

  // ---- RETRIBUZIONE ORARIA ----
  const isRetribuzioneOrariaField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'retribuzione_oraria' ||
      lower.includes('retribuzione_oraria') ||
      label.includes('retribuzione oraria');
  };

  // ---- RETRIBUZIONE ORDINARIA ----
  const isRetribuzioneOrdinariaField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'retribuzione_ordinaria' ||
      lower.includes('retribuzione_ordinaria') ||
      label.includes('retribuzione ordinaria');
  };

  // ---- RETRIBUZIONE GIORNALIERA ----
  const isRetribuzioneGiornalieraField = (fieldId: string | null): boolean => {
    if (!fieldId) return false;
    const field = calculator.fields.find((f: any) => f.id === fieldId);
    const lower = fieldId.toLowerCase();
    const label = (field?.label || '').toLowerCase();
    return lower === 'retribuzione_giornaliera' ||
      lower.includes('retribuzione_giornaliera') ||
      label.includes('retribuzione giornaliera');
  };

  const getRequiredFields = (outputFieldId: string): string[] => {
    // ---- RETRIBUZIONE GIORNALIERA ----
    if (isRetribuzioneGiornalieraField(outputFieldId)) {
      if (retribuzioneGiornalieraMode === 'formula1') {
        return ['retribuzione_mensile_for_giornaliera_f1', 'gg_retr_for_giornaliera_f1'];
      } else {
        return ['retribuzione_ordinaria_for_giornaliera_f2', 'gg_lav_for_giornaliera_f2'];
      }
    }

    // ---- PAGA BASE CONGLOBATA ----
    if (isPagaBaseConglobataField(outputFieldId)) {
      return ['retribuzione_mensile_for_paga_base', 'contingenza_for_paga_base', 'scatti_anz_for_paga_base'];
    }

    // ---- CONTINGENZA ----
    if (isContingenzaField(outputFieldId)) {
      return ['retribuzione_mensile_for_contingenza', 'paga_base_conglobata_for_contingenza', 'scatti_anz_for_contingenza'];
    }

    // ---- SCATTI ANZ. ----
    if (isScattiAnzField(outputFieldId)) {
      return ['retribuzione_mensile_for_scatti', 'paga_base_conglobata_for_scatti', 'contingenza_for_scatti'];
    }

    // ---- RETRIBUZIONE ORARIA ----
    if (isRetribuzioneOrariaField(outputFieldId)) {
      return ['retribuzione_mensile_for_oraria'];
    }

    // ---- RETRIBUZIONE ORDINARIA ----
    if (isRetribuzioneOrdinariaField(outputFieldId)) {
      return ['gg_lav_for_ordinaria', 'retribuzione_giornaliera_for_ordinaria'];
    }

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
    // ---- RETRIBUZIONE GIORNALIERA ----
    if (isRetribuzioneGiornalieraField(outputFieldId)) {
      if (retribuzioneGiornalieraMode === 'formula1') {
        const required = ['retribuzione_mensile_for_giornaliera_f1', 'gg_retr_for_giornaliera_f1'];
        const missing = required.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missing.length === 0, missing };
      } else {
        const required = ['retribuzione_ordinaria_for_giornaliera_f2', 'gg_lav_for_giornaliera_f2'];
        const missing = required.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missing.length === 0, missing };
      }
    }

    // ---- PAGA BASE CONGLOBATA ----
    if (isPagaBaseConglobataField(outputFieldId)) {
      const required = ['retribuzione_mensile_for_paga_base', 'contingenza_for_paga_base', 'scatti_anz_for_paga_base'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

    // ---- CONTINGENZA ----
    if (isContingenzaField(outputFieldId)) {
      const required = ['retribuzione_mensile_for_contingenza', 'paga_base_conglobata_for_contingenza', 'scatti_anz_for_contingenza'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

    // ---- SCATTI ANZ. ----
    if (isScattiAnzField(outputFieldId)) {
      const required = ['retribuzione_mensile_for_scatti', 'paga_base_conglobata_for_scatti', 'contingenza_for_scatti'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

    // ---- RETRIBUZIONE ORARIA ----
    if (isRetribuzioneOrariaField(outputFieldId)) {
      const required = ['retribuzione_mensile_for_oraria'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

    // ---- RETRIBUZIONE ORDINARIA ----
    if (isRetribuzioneOrdinariaField(outputFieldId)) {
      const required = ['gg_lav_for_ordinaria', 'retribuzione_giornaliera_for_ordinaria'];
      const missing = required.filter(fId => {
        const val = inputs[fId];
        return val === undefined || val === '' || isNaN(parseFloat(String(val)));
      });
      return { valid: missing.length === 0, missing };
    }

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

    if (outputFieldId === 'retribuzione_mensile') {
      if (retribuzioneMensileMode === 'formula1') {
        const fields = ['paga_base_conglobata', 'contingenza', 'scatti_anz'];
        const missingFields = fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else if (retribuzioneMensileMode === 'formula2') {
        const fields = ['retribuzione_giornaliera', 'rm_f2_gg_retr'];
        const missingFields = fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      } else {
        const fields = ['retribuzione_oraria'];
        const missingFields = fields.filter(fId => {
          const val = inputs[fId];
          return val === undefined || val === '' || isNaN(parseFloat(String(val)));
        });
        return { valid: missingFields.length === 0, missing: missingFields };
      }
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

    // ---- RETRIBUZIONE GIORNALIERA ----
    if (isRetribuzioneGiornalieraField(outputField)) {
      if (retribuzioneGiornalieraMode === 'formula1') {
        const retribuzioneMensile = parseFloat(String(inputs['retribuzione_mensile_for_giornaliera_f1'])) || 0;
        const ggRetr = parseFloat(String(inputs['gg_retr_for_giornaliera_f1'])) || 1;
        const calculatedRetribuzioneGiornaliera = retribuzioneMensile / ggRetr;
        setResults({ [outputField]: calculatedRetribuzioneGiornaliera });
        setShowResult(true);
      } else {
        const retribuzioneOrdinaria = parseFloat(String(inputs['retribuzione_ordinaria_for_giornaliera_f2'])) || 0;
        const ggLav = parseFloat(String(inputs['gg_lav_for_giornaliera_f2'])) || 1;
        const calculatedRetribuzioneGiornaliera = retribuzioneOrdinaria / ggLav;
        setResults({ [outputField]: calculatedRetribuzioneGiornaliera });
        setShowResult(true);
      }
      return;
    }

    // ---- PAGA BASE CONGLOBATA ----
    if (isPagaBaseConglobataField(outputField)) {
      const retribuzioneMensile = parseFloat(String(inputs['retribuzione_mensile_for_paga_base'])) || 0;
      const contingenza = parseFloat(String(inputs['contingenza_for_paga_base'])) || 0;
      const scattiAnz = parseFloat(String(inputs['scatti_anz_for_paga_base'])) || 0;
      const calculatedPagaBase = retribuzioneMensile - contingenza - scattiAnz;
      setResults({ [outputField]: calculatedPagaBase });
      setShowResult(true);
      return;
    }

    // ---- CONTINGENZA ----
    if (isContingenzaField(outputField)) {
      const retribuzioneMensile = parseFloat(String(inputs['retribuzione_mensile_for_contingenza'])) || 0;
      const pagaBaseConglobata = parseFloat(String(inputs['paga_base_conglobata_for_contingenza'])) || 0;
      const scattiAnz = parseFloat(String(inputs['scatti_anz_for_contingenza'])) || 0;
      const calculatedContingenza = retribuzioneMensile - pagaBaseConglobata - scattiAnz;
      setResults({ [outputField]: calculatedContingenza });
      setShowResult(true);
      return;
    }

    // ---- SCATTI ANZ. ----
    if (isScattiAnzField(outputField)) {
      const retribuzioneMensile = parseFloat(String(inputs['retribuzione_mensile_for_scatti'])) || 0;
      const pagaBaseConglobata = parseFloat(String(inputs['paga_base_conglobata_for_scatti'])) || 0;
      const contingenza = parseFloat(String(inputs['contingenza_for_scatti'])) || 0;
      const calculatedScattiAnz = retribuzioneMensile - pagaBaseConglobata - contingenza;
      setResults({ [outputField]: calculatedScattiAnz });
      setShowResult(true);
      return;
    }

    // ---- RETRIBUZIONE ORARIA ----
    if (isRetribuzioneOrariaField(outputField)) {
      const retribuzioneMensile = parseFloat(String(inputs['retribuzione_mensile_for_oraria'])) || 0;
      const calculatedRetribuzioneOraria = retribuzioneMensile / 172;
      setResults({ [outputField]: calculatedRetribuzioneOraria });
      setShowResult(true);
      return;
    }

    // ---- RETRIBUZIONE ORDINARIA ----
    if (isRetribuzioneOrdinariaField(outputField)) {
      const ggLav = parseFloat(String(inputs['gg_lav_for_ordinaria'])) || 0;
      const retribuzioneGiornaliera = parseFloat(String(inputs['retribuzione_giornaliera_for_ordinaria'])) || 0;
      const calculatedRetribuzioneOrdinaria = ggLav * retribuzioneGiornaliera;
      setResults({ [outputField]: calculatedRetribuzioneOrdinaria });
      setShowResult(true);
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

    if (outputField === 'retribuzione_mensile') {
      if (retribuzioneMensileMode === 'formula1') {
        const pagaBase = parseFloat(String(inputs['paga_base_conglobata'])) || 0;
        const contingenza = parseFloat(String(inputs['contingenza'])) || 0;
        const scattiAnz = parseFloat(String(inputs['scatti_anz'])) || 0;
        const calculatedRetribuzioneMensile = pagaBase + contingenza + scattiAnz;
        setResults({ [outputField]: calculatedRetribuzioneMensile });
        setShowResult(true);
      } else if (retribuzioneMensileMode === 'formula2') {
        const retribuzioneGiornaliera = parseFloat(String(inputs['retribuzione_giornaliera'])) || 0;
        const ggRetr = parseFloat(String(inputs['rm_f2_gg_retr'])) || 0;
        const calculatedRetribuzioneMensileF2 = retribuzioneGiornaliera * ggRetr;
        setResults({ [outputField]: calculatedRetribuzioneMensileF2 });
        setShowResult(true);
      } else {
        const retribuzioneOraria = parseFloat(String(inputs['retribuzione_oraria'])) || 0;
        const calculatedRetribuzioneMensileF3 = retribuzioneOraria * 172;
        setResults({ [outputField]: calculatedRetribuzioneMensileF3 });
        setShowResult(true);
      }
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

  // Temporary Calculator এর জন্য সম্পূর্ণ আলাদা ক্যালকুলেটর লজিক (Plus/Minus/গুণ/ভাগ)
  const handleCalculateTempCalc = () => {
    const values = tempCalcFields.map(f => parseFloat(f.value) || 0);
    if (values.length === 0) {
      setTempCalcResult(0);
      return;
    }
    let result: number;
    if (tempCalcOperator === 'add') {
      result = values.reduce((acc, val) => acc + val, 0);
    } else if (tempCalcOperator === 'subtract') {
      result = values.reduce((acc, val, idx) => (idx === 0 ? val : acc - val));
    } else if (tempCalcOperator === 'multiply') {
      result = values.reduce((acc, val) => acc * val, 1);
    } else {
      result = values.reduce((acc, val, idx) => (idx === 0 ? val : (val !== 0 ? acc / val : acc)));
    }
    setTempCalcResult(result);
  };

  const handleResetTempCalc = () => {
    setTempCalcResult(null);
    setTempCalcOperator('add');
    setTempCalcFields([
      { id: '1', label: 'মান ১', value: '' },
      { id: '2', label: 'মান ২', value: '' }
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

      // ---- RETRIBUZIONE GIORNALIERA ----
      if (isRetribuzioneGiornalieraField(field)) {
        if (retribuzioneGiornalieraMode === 'formula1') {
          const retribuzioneMensile = numericInputs['retribuzione_mensile_for_giornaliera_f1'] || 0;
          const ggRetr = numericInputs['gg_retr_for_giornaliera_f1'] || 1;
          result = retribuzioneMensile / ggRetr;
        } else {
          const retribuzioneOrdinaria = numericInputs['retribuzione_ordinaria_for_giornaliera_f2'] || 0;
          const ggLav = numericInputs['gg_lav_for_giornaliera_f2'] || 1;
          result = retribuzioneOrdinaria / ggLav;
        }
      }
      // ---- PAGA BASE CONGLOBATA ----
      else if (isPagaBaseConglobataField(field)) {
        const retribuzioneMensile = numericInputs['retribuzione_mensile_for_paga_base'] || 0;
        const contingenza = numericInputs['contingenza_for_paga_base'] || 0;
        const scattiAnz = numericInputs['scatti_anz_for_paga_base'] || 0;
        result = retribuzioneMensile - contingenza - scattiAnz;
      } 
      // ---- CONTINGENZA ----
      else if (isContingenzaField(field)) {
        const retribuzioneMensile = numericInputs['retribuzione_mensile_for_contingenza'] || 0;
        const pagaBaseConglobata = numericInputs['paga_base_conglobata_for_contingenza'] || 0;
        const scattiAnz = numericInputs['scatti_anz_for_contingenza'] || 0;
        result = retribuzioneMensile - pagaBaseConglobata - scattiAnz;
      }
      // ---- SCATTI ANZ. ----
      else if (isScattiAnzField(field)) {
        const retribuzioneMensile = numericInputs['retribuzione_mensile_for_scatti'] || 0;
        const pagaBaseConglobata = numericInputs['paga_base_conglobata_for_scatti'] || 0;
        const contingenza = numericInputs['contingenza_for_scatti'] || 0;
        result = retribuzioneMensile - pagaBaseConglobata - contingenza;
      }
      // ---- RETRIBUZIONE ORARIA ----
      else if (isRetribuzioneOrariaField(field)) {
        const retribuzioneMensile = numericInputs['retribuzione_mensile_for_oraria'] || 0;
        result = retribuzioneMensile / 172;
      }
      // ---- RETRIBUZIONE ORDINARIA ----
      else if (isRetribuzioneOrdinariaField(field)) {
        const ggLav = numericInputs['gg_lav_for_ordinaria'] || 0;
        const retribuzioneGiornaliera = numericInputs['retribuzione_giornaliera_for_ordinaria'] || 0;
        result = ggLav * retribuzioneGiornaliera;
      }
      else if (isImponibileFiscaleMonthlyField(field)) {
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
            <div className="grid grid-cols-2 gap-3">
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

        {mode === 'multi' ? (
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
            tempCalcFields={tempCalcFields}
            onTempCalcFieldChange={(id, val) => {
              setTempCalcFields(tempCalcFields.map(f => f.id === id ? { ...f, value: val } : f));
            }}
            onAddTempCalcField={() => {
              setTempCalcFields([
                ...tempCalcFields,
                { id: Date.now().toString(), label: 'নতুন মান', value: '' }
              ]);
            }}
            onRemoveTempCalcField={(id) => {
              if (tempCalcFields.length > 2) {
                setTempCalcFields(tempCalcFields.filter(f => f.id !== id));
              }
            }}
            tempCalcOperator={tempCalcOperator}
            onTempCalcOperatorChange={setTempCalcOperator}
            tempCalcResult={tempCalcResult}
            onCalculateTempCalc={handleCalculateTempCalc}
            onResetTempCalc={handleResetTempCalc}
            imponibileFiscaleMonthlyMode={imponibileFiscaleMonthlyMode}
            onImponibileFiscaleMonthlyModeChange={setImponibileFiscaleMonthlyMode}
            retribuzioneMensileMode={retribuzioneMensileMode}
            onRetribuzioneMensileModeChange={setRetribuzioneMensileMode}
            retribuzioneGiornalieraMode={retribuzioneGiornalieraMode}
            onRetribuzioneGiornalieraModeChange={setRetribuzioneGiornalieraMode}
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

// ... (StandardModeCalculator, MultiModeCalculator এবং allTotalTrattenuteFields ফাংশনগুলো আগের মতোই থাকবে - আপনার ফাইল থেকে এগুলো কপি করে নিন)
