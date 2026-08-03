export interface CalculatorField {
  id: string;
  label: string;
  category: string;
}

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
   * ফর্মুলার সাথে নিখুঁতভাবে সিঙ্ক করার জন্য প্রতিটি ফিল্ডের প্রয়োজনীয় ইনপুট ম্যাপিং।
   */
  getRequiredInputsForField: (outputFieldId: string): string[] => {
    switch (outputFieldId) {
      // Formula 1: Net Pay calculation
      case 'netto_busta':
        return ['totale_competenze', 'totale_trattenute', 'arr_preced', 'arr_attuale'];

      // Totale Competenze (উদাহরণস্বরূপ: বেসিক, ওভারটাইম এবং এলাউন্স যোগ করে মোট competenze বের করা)
      case 'totale_competenze':
        return ['sett_retr', 'gg_retr']; // আপনার ফর্মুলা অনুযায়ী এখানে ফিল্ড আইডিগুলো বসাতে পারেন

      // Totale Trattenute (ট্যাক্স এবং কন্ট্রিবিউশন যোগ করে মোট কর্তন)
      case 'totale_trattenute':
        return ['totale_contributi', 'irpef_trattenuta'];

      // যদি অন্য কোনো ফিল্ডের জন্য ফর্মুলা থাকে, তাদের ইনপুটগুলো এখানে যুক্ত করে দিন:
      // case 'field_id':
      //   return ['input_1', 'input_2'];

      default:
        return []; // যদি নির্দিষ্ট কোনো ফর্মুলা রেজিস্টার্ড না থাকে
    }
  },

  calculate: (inputs: { [key: string]: number }, outputField: string): number | null => {
    if (outputField === 'netto_busta') {
      const totaleCompetenze = inputs['totale_competenze'] || 0;
      const totaleTrattenute = inputs['totale_trattenute'] || 0;
      const arrPreced = inputs['arr_preced'] || 0;
      const arrAttuale = inputs['arr_attuale'] || 0;
      return totaleCompetenze - (totaleTrattenute + arrPreced) + arrAttuale;
    }

    if (outputField === 'totale_competenze') {
      const settRetr = inputs['sett_retr'] || 0;
      const ggRetr = inputs['gg_retr'] || 0;
      return settRetr + ggRetr; // আপনার ফর্মুলার লজিক অনুযায়ী ক্যালকুলেশন
    }

    if (outputField === 'totale_trattenute') {
      const totaleContributi = inputs['totale_contributi'] || 0;
      const irpefTrattenuta = inputs['irpef_trattenuta'] || 0;
      return totaleContributi + irpefTrattenuta;
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
