export interface CalculatorField {
  id: string;
  label: string;
  category: string;
}

// ফর্মুলার নির্ভরতা এবং হিসাবের লজিক রেজিস্ট্রি
interface FormulaConfig {
  inputs: string[];
  calculate: (inputs: { [key: string]: number }) => number;
}

const FORMULA_REGISTRY: { [key: string]: FormulaConfig } = {
  // 43. NETTO IN BUSTA (Formula 1)
  netto_busta: {
    inputs: ['totale_competenze', 'totale_trattenute', 'arr_preced', 'arr_attuale'],
    calculate: (inputs) => {
      const tc = inputs['totale_competenze'] || 0;
      const tt = inputs['totale_trattenute'] || 0;
      const ap = inputs['arr_preced'] || 0;
      const aa = inputs['arr_attuale'] || 0;
      return tc - (tt + ap) + aa;
    }
  },

  // 39. TOTALE COMPETENZE
  totale_competenze: {
    inputs: ['sett_retr', 'gg_retr', 'gg_lav'],
    calculate: (inputs) => {
      const sr = inputs['sett_retr'] || 0;
      const gr = inputs['gg_retr'] || 0;
      const gl = inputs['gg_lav'] || 0;
      return sr + gr + gl;
    }
  },

  // 40. TOTALE TRATTENUTE
  totale_trattenute: {
    inputs: ['totale_contributi', 'irpef_trattenuta'],
    calculate: (inputs) => {
      const tc = inputs['totale_contributi'] || 0;
      const it = inputs['irpef_trattenuta'] || 0;
      return tc + it;
    }
  },

  // 9. TOTALE CONTRIBUTI
  totale_contributi: {
    inputs: ['impon_contributivo_mese', 'contributi_anno'],
    calculate: (inputs) => {
      const icm = inputs['impon_contributivo_mese'] || 0;
      const ca = inputs['contributi_anno'] || 0;
      return icm + ca;
    }
  },

  // 18. IRPEF NETTA (Monthly)
  irpef_netta_mese: {
    inputs: ['irpef_lorda_mese', 'detr_lav_dipendente_mese', 'detr_coniuge_mese'],
    calculate: (inputs) => {
      const ilm = inputs['irpef_lorda_mese'] || 0;
      const dldm = inputs['detr_lav_dipendente_mese'] || 0;
      const dcm = inputs['detr_coniuge_mese'] || 0;
      return Math.max(0, ilm - (dldm + dcm));
    }
  }
  // আপনি চাইলে এখানে অন্য ফিল্ডগুলোর ফর্মুলা এবং ইনপুট এভাবে খুব সহজেই যুক্ত করতে পারবেন।
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

  /**
   * ডাইনামিক্যালি চেক করবে কোন ফিল্ডের জন্য কোন ইনপুটগুলো প্রয়োজন
   */
  getRequiredInputsForField: (outputFieldId: string): string[] => {
    const config = FORMULA_REGISTRY[outputFieldId];
    if (config) {
      return config.inputs;
    }
    return []; // যদি ফর্মুলা রেজিস্টারে না থাকে, কোনো ইনপুট দেখাবে না
  },

  /**
   * স্বয়ংক্রিয়ভাবে ফর্মুলা ডিটেক্ট করে সঠিক ক্যালকুলেশন সম্পন্ন করবে
   */
  calculate: (inputs: { [key: string]: number }, outputField: string): number | null => {
    const config = FORMULA_REGISTRY[outputField];
    if (config) {
      return config.calculate(inputs);
    }
    
    // যদি নির্দিষ্ট কোনো ফর্মুলা রেজিস্টার করা না থাকে, তবে ইনপুট ফিল্ডের নিজস্ব ভ্যালু রিটার্ন করবে
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
