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
  calculate: (inputs: { [key: string]: number }, mode?: 'standard' | 'alternative') => number;
}

const FORMULA_REGISTRY: { [key: string]: FormulaConfig } = {
  netto_busta: {
    inputs: ['totale_competenze', 'totale_trattenute', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle: 'NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + (± ARR. PRECED.)) ± ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;
      return tc - (tt + ap) + aa;
    }
  },

  totale_competenze: {
    inputs: ['netto_busta', 'totale_trattenute', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle: 'TOTALE COMPETENZE = NETTO IN BUSTA + (TOTALE TRATTENUTE + ARR. PRECED.) - ARR. ATTUALE',
    calculate: (inputs) => {
      const netto = inputs['netto_busta'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;
      return netto + (tt + ap) - aa;
    }
  },

  totale_trattenute: {
    inputs: ['totale_competenze', 'netto_busta', 'arr_preced', 'arr_attuale'],
    mainFormulaTitle: 'TOTALE TRATTENUTE = TOTALE COMPETENZE - NETTO IN BUSTA - ARR. PRECED. + ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const netto = inputs['netto_busta'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;
      return tc - netto - ap + aa;
    }
  },

  arr_preced: {
    inputs: ['totale_competenze', 'netto_busta', 'totale_trattenute', 'arr_attuale'],
    mainFormulaTitle: 'ARR. PRECED. = TOTALE COMPETENZE - NETTO IN BUSTA - TOTALE TRATTENUTE + ARR. ATTUALE',
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const netto = inputs['netto_busta'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const aa = inputs['arr_attuale'] || 0;
      return tc - netto - tt + aa;
    }
  },

  arr_attuale: {
    inputs: ['netto_busta', 'totale_competenze', 'totale_trattenute', 'arr_preced'],
    mainFormulaTitle: 'ARR. ATTUALE = NETTO IN BUSTA + TOTALE TRATTENUTE + ARR. PRECED. - TOTALE COMPETENZE',
    calculate: (inputs) => {
      const netto = inputs['netto_busta'] || 0;
      const tc = inputs['totale_competenze'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      return netto + tt + ap - tc;
    }
  },

  tfr_spettante_azienda: {
    inputs: ['f_do_tfr_ap', 'tfr_annuo_progr'],
    mainFormulaTitle: 'TFR Spettante Azienda = F.do TFR al 31/12 AP + TFR Annuo Progr.',
    calculate: (inputs) => {
      const fdo = inputs['f_do_tfr_ap'] || 0;
      const tfrProg = inputs['tfr_annuo_progr'] || 0;
      return fdo + tfrProg;
    }
  },

  f_do_tfr_ap: {
    inputs: ['tfr_spettante_azienda', 'tfr_annuo_progr'],
    mainFormulaTitle: 'F.do TFR al 31/12 AP = TFR Spettante Azienda - TFR Annuo Progr.',
    calculate: (inputs) => {
      const tfrSpettante = inputs['tfr_spettante_azienda'] || 0;
      const tfrProg = inputs['tfr_annuo_progr'] || 0;
      return tfrSpettante - tfrProg;
    }
  },

  tfr_annuo_progr: {
    inputs: ['tfr_spettante_azienda', 'f_do_tfr_ap'],
    mainFormulaTitle: 'TFR Annuo Progr. = TFR Spettante Azienda - F.do TFR al 31/12 AP',
    calculate: (inputs) => {
      const tfrSpettante = inputs['tfr_spettante_azienda'] || 0;
      const fdo = inputs['f_do_tfr_ap'] || 0;
      return tfrSpettante - fdo;
    }
  },

  // IRPEF LORDA (Monthly) - দুটি অপশন সহ কনফিগারেশন
  irpef_lorda_mese: {
    inputs: ['imponibile_fiscale_mese'],
    alternativeInputs: ['irpef_imp_sost', 'detr_lav_dipendente_mese', 'imposta_sostitutiva_mese'],
    mainFormulaTitle: 'IRPEF LORDA (Monthly) = Imponibile Fiscale Mese × 23%',
    alternativeFormulaTitle: 'IRPEF LORDA = (IRPEF + IMP. SOST.) + DETR. LAV. DIPENDENTE - IMPOSTA SOSTITUTIVA',
    calculate: (inputs, mode = 'standard') => {
      if (mode === 'alternative') {
        const impSostTot = inputs['irpef_imp_sost'] || 0;
        const detr = inputs['detr_lav_dipendente_mese'] || 0;
        const sost = inputs['imposta_sostitutiva_mese'] || 0;
        return impSostTot + detr - sost;
      } else {
        const imp = inputs['imponibile_fiscale_mese'] || 0;
        return (imp * 23) / 100;
      }
    }
  },


  detr_lav_dipendente_mese: {
    inputs: ['irpef_lorda_mese', 'irpef_imp_sost', 'imposta_sostitutiva_mese'],
    mainFormulaTitle: 'DETR. LAV. DIPENDENTE = IRPEF LORDA - (IRPEF + IMP. SOST.) + IMPOSTA SOSTITUTIVA',
    calculate: (inputs) => {
      const lorda = inputs['irpef_lorda_mese'] || 0;
      const impSostTot = inputs['irpef_imp_sost'] || 0;
      const sost = inputs['imposta_sostitutiva_mese'] || 0;
      return lorda - impSostTot + sost;
    }
  },

  irpef_imp_sost: {
    inputs: ['irpef_lorda_mese', 'detr_lav_dipendente_mese', 'imposta_sostitutiva_mese'],
    mainFormulaTitle: 'IRPEF + IMP. SOST. = IRPEF LORDA - DETR. LAV. DIPENDENTE + IMPOSTA SOSTITUTIVA',
    calculate: (inputs) => {
      const lorda = inputs['irpef_lorda_mese'] || 0;
      const detr = inputs['detr_lav_dipendente_mese'] || 0;
      const sost = inputs['imposta_sostitutiva_mese'] || 0;
      return lorda - detr + sost;
    }
  }
};

export const UNIFIED_CALCULATOR = {
  fields: [
    { id: 'sett_retr', label: '1. SETT. RETR.', category: 'Working Days' },
    { id: 'gg_retr', label: '2. GG. RETR.', category: 'Working Days' },
    { id: 'gg_lav', label: '3. GG. LAV.', category: 'Working Days' },
    { id: 'ore_lav', label: '4. ORE LAV.', category: 'Working Days' },
    { id: 'impon_contributivo_anno', label: '5. IMPON. CONTRIBUTIVO ANNO', category: 'Contributions' },
    { id: 'contributi_anno', label: '6. CONTRIBUTI ANNO', category: 'Contributions' },
    { id: 'impon_contributivo_mese', label: '7. IMPON. CONTRIBUTIVO MESE', category: 'Contributions' },
    { id: 'impon_contrib_arrot_mese', label: '8. IMPON. CONTRIB. ARROT. MESE', category: 'Contributions' },
    { id: 'totale_contributi', label: '9. TOTALE CONTRIBUTI', category: 'Contributions' },
    { id: 'imponibile_fiscale_mese', label: '10. IMPONIBILE FISCALE (Monthly)', category: 'Taxes - Monthly' },
    { id: 'irpef_lorda_mese', label: '11. IRPEF LORDA (Monthly)', category: 'Taxes - Monthly' },
    { id: 'detr_lav_dipendente_mese', label: '12. DETR. LAV. DIPENDENTE (Monthly)', category: 'Taxes - Monthly' },
    { id: 'gg_mese', label: '13. GG (Mese)', category: 'Taxes - Monthly' },
    { id: 'detr_coniuge_mese', label: '14. DETR. CONIUGE (Monthly)', category: 'Taxes - Monthly' },
    { id: 'detr_figli_mese', label: '15. DETR. FIGLI (Monthly)', category: 'Taxes - Monthly' },
    { id: 'detr_altri_familiari_mese', label: '16. DETR. ALTRI FAMILIARI (Monthly)', category: 'Taxes - Monthly' },
    { id: 'detr_oneri_mese', label: '17. DETR. ONERI (Monthly)', category: 'Taxes - Monthly' },
    { id: 'irpef_netta_mese', label: '18. IRPEF NETTA (Monthly)', category: 'Taxes - Monthly' },
    { id: 'irpef_imp_sost', label: '19. IRPEF + IMP. SOST.', category: 'Taxes - Monthly' },
    { id: 'imposta_sostitutiva_mese', label: 'IMPOSTA SOSTITUTIVA (Monthly)', category: 'Taxes - Monthly' },
    { id: 'imponibile_fiscale_anno', label: '20. IMPONIBILE FISCALE (Anno)', category: 'Taxes - Annual' },
    { id: 'irpef_lorda_anno', label: '21. IRPEF LORDA (Anno)', category: 'Taxes - Annual' },
    { id: 'detr_lav_dipendente_anno', label: '22. DETR. LAV. DIPENDENTE (Anno)', category: 'Taxes - Annual' },
    { id: 'gg_anno', label: '23. GG (Anno)', category: 'Taxes - Annual' },
    { id: 'detr_coniuge_anno', label: '24. DETR. CONIUGE (Anno)', category: 'Taxes - Annual' },
    { id: 'detr_figli_anno', label: '25. DETR. FIGLI (Anno)', category: 'Taxes - Annual' },
    { id: 'detr_altri_familiari_anno', label: '26. DETR. ALTRI FAMILIARI (Anno)', category: 'Taxes - Annual' },
    { id: 'detr_oneri_canoni_anno', label: '27. DETR. ONERI/CANONI (Anno)', category: 'Taxes - Annual' },
    { id: 'irpef_netta_anno', label: '28. IRPEF NETTA (Anno)', category: 'Taxes - Annual' },
    { id: 'irpef_trattenuta', label: '29. IRPEF TRATTENUTA', category: 'Taxes - Annual' },
    { id: 'irpef_conguaglio', label: '30. IRPEF CONGUAGLIO', category: 'Taxes - Annual' },
    { id: 'retribuzione_utile_tfr', label: '31. RETRIBUZIONE UTILE TFR', category: 'TFR' },
    { id: 'contr_agg_tfr', label: '32. CONTR. AGG. TFR', category: 'TFR' },
    { id: 'tfr_mese', label: '33. TFR MESE', category: 'TFR' },
    { id: 'tfr_annuo_progr', label: '34. TFR ANNUO PROGR.', category: 'TFR' },
    { id: 'f_do_tfr_ap', label: '35. F.DO TFR 31/12 AP', category: 'TFR' },
    { id: 'anticipazioni_anno', label: '36. ANTICIPAZIONI ANNO', category: 'TFR' },
    { id: 'tfr_spettante_azienda', label: '37. TFR SPETTANTE AZIENDA', category: 'TFR' },
    { id: 'tfr_fdo_pensione', label: '38. TFR A F.DO PENSIONE', category: 'TFR' },
    { id: 'totale_competenze', label: '39. TOTALE COMPETENZE', category: 'Earnings' },
    { id: 'totale_trattenute', label: '40. TOTALE TRATTENUTE', category: 'Deductions' },
    { id: 'arr_preced', label: '41. ARR. PRECED.', category: 'Adjustments' },
    { id: 'arr_attuale', label: '42. ARR. ATTUALE', category: 'Adjustments' },
    { id: 'netto_busta', label: '43. NETTO IN BUSTA', category: 'Net Pay' }
  ] as CalculatorField[],

  getRequiredInputsForField: (outputFieldId: string, mode: 'standard' | 'alternative' = 'standard'): string[] => {
    const config = FORMULA_REGISTRY[outputFieldId];
    if (!config) return [];
    if (outputFieldId === 'irpef_lorda_mese' && mode === 'alternative') {
      return config.alternativeInputs || [];
    }
    return config.inputs;
  },

  calculate: (inputs: { [key: string]: number }, outputField: string, mode: 'standard' | 'alternative' = 'standard'): number | null => {
    const config = FORMULA_REGISTRY[outputField];
    if (config) {
      return config.calculate(inputs, mode);
    }
    return inputs[outputField] !== undefined ? inputs[outputField] : null;
  }
};

export const searchFields = (query: string) => {
  if (!query) return UNIFIED_CALCULATOR.fields;
  const lowerQuery = query.toLowerCase();
  return UNIFIED_CALCULATOR.fields.filter(
    (field) =>
      field.label.toLowerCase().includes(lowerQuery) ||
      field.id.toLowerCase().includes(lowerQuery)
  );
};
