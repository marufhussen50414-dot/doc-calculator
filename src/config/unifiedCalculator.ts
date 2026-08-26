export interface CalculatorField {
  id: string;
  label: string;
  category: string;
}

interface FormulaConfig {
  inputs: string[];
  alternativeInputs?: string[];
  mainFormulaTitle: string;
  alternativeFormulaTitle?: string;
  calculate: (
    inputs: { [key: string]: number },
    mode?: 'standard' | 'alternative',
    customValues?: number[]
  ) => number;
}

const FORMULA_REGISTRY: { [key: string]: FormulaConfig } = {
  netto_busta: {
    inputs: ['totale_competenze', 'totale_trattenute', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle:
      'NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + (± ARR. PRECED.)) ± ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;

      return tc - (tt + ap) + aa;
    },
  },

  totale_competenze: {
    inputs: ['netto_busta', 'totale_trattenute', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle:
      'TOTALE COMPETENZE = NETTO IN BUSTA + (TOTALE TRATTENUTE + ARR. PRECED.) - ARR. ATTUALE',
    calculate: (inputs) => {
      const netto = inputs['netto_busta'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;

      return netto + (tt + ap) - aa;
    },
  },

  totale_trattenute: {
    inputs: ['totale_competenze', 'netto_busta', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle:
      'TOTALE TRATTENUTE = TOTALE COMPETENZE - NETTO IN BUSTA - ARR. PRECED. + ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const netto = inputs['netto_busta'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;

      return tc - netto - ap + aa;
    },
  },

  arr_preced: {
    inputs: ['totale_competenze', 'netto_busta', 'totale_trattenute', 'arr_attuale'],
    mainFormulaTitle:
      'ARR. PRECED. = TOTALE COMPETENZE - NETTO IN BUSTA - TOTALE TRATTENUTE + ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const netto = inputs['netto_busta'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const aa = inputs['arr_attuale'] || 0;

      return tc - netto - tt + aa;
    },
  },

  arr_attuale: {
    inputs: ['netto_busta', 'totale_competenze', 'totale_trattenute', 'arr_preced'],
    mainFormulaTitle:
      'ARR. ATTUALE = NETTO IN BUSTA + TOTALE TRATTENUTE + ARR. PRECED. - TOTALE COMPETENZE',
    calculate: (inputs) => {
      const netto = inputs['netto_busta'] || 0;
      const tc = inputs['totale_competenze'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;

      return netto + tt + ap - tc;
    },
  },

  tfr_spettante_azienda: {
    inputs: ['f_do_tfr_ap', 'tfr_annuo_progr'],
    mainFormulaTitle:
      'TFR SPETTANTE AZIENDA = F.DO TFR AL 31/12 AP + TFR ANNUO PROGR.',
    calculate: (inputs) => {
      const fdo = inputs['f_do_tfr_ap'] || 0;
      const tfrProg = inputs['tfr_annuo_progr'] || 0;

      return fdo + tfrProg;
    },
  },

  f_do_tfr_ap: {
    inputs: ['tfr_spettante_azienda', 'tfr_annuo_progr'],
    mainFormulaTitle:
      'F.DO TFR AL 31/12 AP = TFR SPETTANTE AZIENDA - TFR ANNUO PROGR.',
    calculate: (inputs) => {
      const tfrSpettante = inputs['tfr_spettante_azienda'] || 0;
      const tfrProg = inputs['tfr_annuo_progr'] || 0;

      return tfrSpettante - tfrProg;
    },
  },

  tfr_annuo_progr: {
    inputs: ['tfr_spettante_azienda', 'f_do_tfr_ap'],
    mainFormulaTitle:
      'TFR ANNUO PROGR. = TFR SPETTANTE AZIENDA - F.DO TFR AL 31/12 AP',
    calculate: (inputs) => {
      const tfrSpettante = inputs['tfr_spettante_azienda'] || 0;
      const fdo = inputs['f_do_tfr_ap'] || 0;

      return tfrSpettante - fdo;
    },
  },

  imponibile_fiscale_mese: {
    inputs: ['irpef_lorda_mese'],
    mainFormulaTitle:
      'IMPONIBILE FISCALE (MONTHLY) = IRPEF LORDA (MONTHLY) / 0.23',
    calculate: (inputs) => {
      const lorda = inputs['irpef_lorda_mese'] || 0;

      return lorda / 0.23;
    },
  },

  imponibile_fiscale_anno: {
    inputs: [],
    mainFormulaTitle: 'IMPONIBILE FISCALE (ANNO)',
    calculate: () => 0,
  },

  irpef_lorda_anno: {
    inputs: [],
    mainFormulaTitle: 'IRPEF LORDA (ANNO)',
    calculate: () => 0,
  },

  detr_lav_dipendente_anno: {
    inputs: ['detr_lav_dipendente_mese'],
    mainFormulaTitle:
      'DETR. LAV. DIPENDENTE (ANNO) = SUM OF MONTHLY DEDUCTIONS',
    calculate: (inputs, _mode, customValues) => {
      if (customValues && customValues.length > 0) {
        return customValues.reduce((acc, val) => acc + (val || 0), 0);
      }

      return inputs['detr_lav_dipendente_mese'] || 0;
    },
  },

  irpef_lorda_mese: {
    inputs: ['imponibile_fiscale_mese'],
    alternativeInputs: [
      'irpef_imp_sost',
      'detr_lav_dipendente_mese',
      'imposta_sostitutiva_mese',
    ],
    mainFormulaTitle:
      'IRPEF LORDA (MONTHLY) = IMPONIBILE FISCALE MESE × 23%',
    alternativeFormulaTitle:
      'IRPEF LORDA = (IRPEF + IMP. SOST.) + DETR. LAV. DIPENDENTE - IMPOSTA SOSTITUTIVA',
    calculate: (inputs, mode = 'standard') => {
      if (mode === 'alternative') {
        const impSostTot = inputs['irpef_imp_sost'] || 0;
        const detr = inputs['detr_lav_dipendente_mese'] || 0;
        const sost = inputs['imposta_sostitutiva_mese'] || 0;

        return impSostTot + detr - sost;
      }

      const imp = inputs['imponibile_fiscale_mese'] || 0;

      return (imp * 23) / 100;
    },
  },

  detr_lav_dipendente_mese: {
    inputs: [
      'irpef_lorda_mese',
      'irpef_imp_sost',
      'imposta_sostitutiva_mese',
    ],
    mainFormulaTitle:
      'DETR. LAV. DIPENDENTE = IRPEF LORDA - (IRPEF + IMP. SOST.) + IMPOSTA SOSTITUTIVA',
    calculate: (inputs) => {
      const lorda = inputs['irpef_lorda_mese'] || 0;
      const impSostTot = inputs['irpef_imp_sost'] || 0;
      const sost = inputs['imposta_sostitutiva_mese'] || 0;

      return lorda - impSostTot + sost;
    },
  },

  irpef_imp_sost: {
    inputs: [
      'irpef_lorda_mese',
      'detr_lav_dipendente_mese',
      'imposta_sostitutiva_mese',
    ],
    mainFormulaTitle:
      'IRPEF + IMP. SOST. = IRPEF LORDA - DETR. LAV. DIPENDENTE + IMPOSTA SOSTITUTIVA',
    calculate: (inputs) => {
      const lorda = inputs['irpef_lorda_mese'] || 0;
      const detr = inputs['detr_lav_dipendente_mese'] || 0;
      const sost = inputs['imposta_sostitutiva_mese'] || 0;

      return lorda - detr + sost;
    },
  },
};

export const UNIFIED_CALCULATOR = {
  fields: [
    // নতুন ৭টি FIELD — কোনো FORMULA নেই
    {
      id: 'retribuzione_mensile',
      label: 'RETRIBUZIONE MENSILE',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'paga_base_conglobata',
      label: 'PAGA BASE CONGLOBATA',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'contingenza',
      label: 'CONTINGENZA',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'scatti_anz',
      label: 'SCATTI ANZ.',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'retribuzione_giornaliera',
      label: 'RETRIBUZIONE GIORNALIERA',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'retribuzione_oraria',
      label: 'RETRIBUZIONE ORARIA',
      category: 'RETRIBUZIONE',
    },
    {
      id: 'retribuzione_ordinaria',
      label: 'RETRIBUZIONE ORDINARIA',
      category: 'RETRIBUZIONE',
    },

    {
      id: 'impon_contributivo_anno',
      label: '1. IMPON. CONTRIBUTIVO ANNO',
      category: 'CONTRIBUTIONS',
    },
    {
      id: 'contributi_anno',
      label: '2. CONTRIBUTI ANNO',
      category: 'CONTRIBUTIONS',
    },
    {
      id: 'impon_contributivo_mese',
      label: '3. IMPON. CONTRIBUTIVO MESE',
      category: 'CONTRIBUTIONS',
    },
    {
      id: 'impon_contrib_arrot_mese',
      label: '4. IMPON. CONTRIB. ARROT. MESE',
      category: 'CONTRIBUTIONS',
    },
    {
      id: 'totale_contributi',
      label: '5. TOTALE CONTRIBUTI',
      category: 'CONTRIBUTIONS',
    },
    {
      id: 'imponibile_fiscale_mese',
      label: '6. IMPONIBILE FISCALE (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'irpef_lorda_mese',
      label: '7. IRPEF LORDA (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'detr_lav_dipendente_mese',
      label: '8. DETR. LAV. DIPENDENTE (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'detr_coniuge_mese',
      label: '9. DETR. CONIUGE (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'detr_figli_mese',
      label: '10. DETR. FIGLI (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'detr_altri_familiari_mese',
      label: '11. DETR. ALTRI FAMILIARI (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'detr_oneri_mese',
      label: '12. DETR. ONERI (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'irpef_netta_mese',
      label: '13. IRPEF NETTA (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'irpef_imp_sost',
      label: '14. IRPEF + IMP. SOST.',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'imposta_sostitutiva_mese',
      label: 'IMPOSTA SOSTITUTIVA (MONTHLY)',
      category: 'TAXES - MONTHLY',
    },
    {
      id: 'imponibile_fiscale_anno',
      label: '15. IMPONIBILE FISCALE (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'irpef_lorda_anno',
      label: '16. IRPEF LORDA (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'detr_lav_dipendente_anno',
      label: '17. DETR. LAV. DIPENDENTE (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'detr_coniuge_anno',
      label: '18. DETR. CONIUGE (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'detr_figli_anno',
      label: '19. DETR. FIGLI (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'detr_altri_familiari_anno',
      label: '20. DETR. ALTRI FAMILIARI (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'detr_oneri_canoni_anno',
      label: '21. DETR. ONERI/CANONI (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'irpef_netta_anno',
      label: '22. IRPEF NETTA (ANNO)',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'irpef_trattenuta',
      label: '23. IRPEF TRATTENUTA',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'irpef_conguaglio',
      label: '24. IRPEF CONGUAGLIO',
      category: 'TAXES - ANNUAL',
    },
    {
      id: 'retribuzione_utile_tfr',
      label: '25. RETRIBUZIONE UTILE TFR',
      category: 'TFR',
    },
    {
      id: 'contr_agg_tfr',
      label: '26. CONTR. AGG. TFR',
      category: 'TFR',
    },
    {
      id: 'tfr_mese',
      label: '27. TFR MESE',
      category: 'TFR',
    },
    {
      id: 'tfr_annuo_progr',
      label: '28. TFR ANNUO PROGR.',
      category: 'TFR',
    },
    {
      id: 'f_do_tfr_ap',
      label: '29. F.DO TFR 31/12 AP',
      category: 'TFR',
    },
    {
      id: 'anticipazioni_anno',
      label: '30. ANTICIPAZIONI ANNO',
      category: 'TFR',
    },
    {
      id: 'tfr_spettante_azienda',
      label: '31. TFR SPETTANTE AZIENDA',
      category: 'TFR',
    },
    {
      id: 'tfr_fdo_pensione',
      label: '32. TFR A F.DO PENSIONE',
      category: 'TFR',
    },
    {
      id: 'totale_competenze',
      label: '33. TOTALE COMPETENZE',
      category: 'EARNINGS',
    },
    {
      id: 'totale_trattenute',
      label: '34. TOTALE TRATTENUTE',
      category: 'DEDUCTIONS',
    },
    {
      id: 'arr_preced',
      label: '35. ARR. PRECED.',
      category: 'ADJUSTMENTS',
    },
    {
      id: 'arr_attuale',
      label: '36. ARR. ATTUALE',
      category: 'ADJUSTMENTS',
    },
    {
      id: 'netto_busta',
      label: '37. NETTO IN BUSTA',
      category: 'NET PAY',
    },
  ] as CalculatorField[],

  getRequiredInputsForField: (
    outputFieldId: string,
    mode: 'standard' | 'alternative' = 'standard'
  ): string[] => {
    const config = FORMULA_REGISTRY[outputFieldId];

    if (!config) {
      return [];
    }

    if (mode === 'alternative' && config.alternativeInputs) {
      return config.alternativeInputs;
    }

    return config.inputs;
  },

  calculate: (
    inputs: { [key: string]: number },
    outputField: string,
    mode: 'standard' | 'alternative' = 'standard',
    customValues?: number[]
  ): number | null => {
    const config = FORMULA_REGISTRY[outputField];

    if (config) {
      return config.calculate(inputs, mode, customValues);
    }

    // নতুন ৭টি FIELD-এর জন্য কোনো FORMULA নেই।
    // তাই user যে value input করবে, সেটিই result হিসেবে ফেরত যাবে।
    return inputs[outputField] !== undefined ? inputs[outputField] : null;
  },
};

export const searchFields = (query: string) => {
  if (!query) {
    return UNIFIED_CALCULATOR.fields;
  }

  const lowerQuery = query.toLowerCase();

  return UNIFIED_CALCULATOR.fields.filter(
    (field) =>
      field.label.toLowerCase().includes(lowerQuery) ||
      field.id.toLowerCase().includes(lowerQuery)
  );
};
