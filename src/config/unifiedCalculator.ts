export interface CalculatorField {
  id: string;
  label: string;
  category: string;
  description?: string;
}

export const UNIFIED_CALCULATOR = {
  fields: [
    // --- আগের ফিল্ডসমূহ ---
    { id: 'totale_competenze', label: 'TOTALE COMPETENZE', category: 'Earnings', description: 'Sum of all gross pay items' },
    { id: 'totale_trattenute', label: 'TOTALE TRATTENUTE', category: 'Deductions', description: 'Sum of all deductions' },
    { id: 'arr_preced', label: 'ARR. PRECED.', category: 'Adjustments', description: 'Previous period adjustments' },
    { id: 'arr_attuale', label: 'ARR. ATTUALE', category: 'Adjustments', description: 'Current period adjustments' },
    { id: 'netto_busta', label: 'NETTO IN BUSTA', category: 'Net Pay', description: 'Net amount the employee receives' },

    // --- নতুন যুক্ত হওয়া হেডার ও ওয়ার্কিং ডেজ ফিল্ডসমূহ ---
    { id: 'sett_retr', label: 'SETT. RETR.', category: 'Working Days' },
    { id: 'gg_retr', label: 'GG. RETR.', category: 'Working Days' },
    { id: 'gg_lav', label: 'GG. LAV.', category: 'Working Days' },
    { id: 'ore_lav', label: 'ORE LAV.', category: 'Working Days' },
    { id: 'impon_contributivo_anno', label: 'IMPON. CONTRIBUTIVO ANNO', category: 'Contributions' },
    { id: 'contributi_anno', label: 'CONTRIBUTI ANNO', category: 'Contributions' },
    { id: 'impon_contributivo_mese', label: 'IMPON. CONTRIBUTIVO MESE', category: 'Contributions' },
    { id: 'impon_contrib_arrot_mese', label: 'IMPON. CONTRIB. ARROT. MESE', category: 'Contributions' },
    { id: 'totale_contributi', label: 'TOTALE CONTRIBUTI', category: 'Contributions' },

    // --- মাসিক ট্যাক্স (MESE) ফিল্ডসমূহ ---
    { id: 'imponibile_fiscale_mese', label: 'IMPONIBILE FISCALE (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_lorda_mese', label: 'IRPEF LORDA (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_lav_dipendente_mese', label: 'DETR. LAV. DIPENDENTE (MESE)', category: 'Taxes - Monthly' },
    { id: 'gg_mese', label: 'GG (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_coniuge_mese', label: 'DETR. CONIUGE (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_figli_mese', label: 'DETR. FIGLI (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_altri_familiari_mese', label: 'DETR. ALTRI FAMILIARI (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_oneri_mese', label: 'DETR. ONERI (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_netta_mese', label: 'IRPEF NETTA (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_imp_sost', label: 'IRPEF + IMP. SOST.', category: 'Taxes - Monthly' },

    // --- বার্ষিক ট্যাক্স (ANNO) ফিল্ডসমূহ ---
    { id: 'imponibile_fiscale_anno', label: 'IMPONIBILE FISCALE (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_lorda_anno', label: 'IRPEF LORDA (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_lav_dipendente_anno', label: 'DETR. LAV. DIPENDENTE (ANNO)', category: 'Taxes - Annual' },
    { id: 'gg_anno', label: 'GG (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_coniuge_anno', label: 'DETR. CONIUGE (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_figli_anno', label: 'DETR. FIGLI (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_altri_familiari_anno', label: 'DETR. ALTRI FAMILIARI (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_oneri_canoni_anno', label: 'DETR. ONERI/CANONI (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_netta_anno', label: 'IRPEF NETTA (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_trattenuta', label: 'IRPEF TRATTENUTA', category: 'Taxes - Annual' },
    { id: 'irpef_conguaglio', label: 'IRPEF CONGUAGLIO', category: 'Taxes - Annual' },

    // --- টিএফআর (TFR) ফিল্ডসমূহ ---
    { id: 'retribuzione_utile_tfr', label: 'RETRIBUZIONE UTILE TFR', category: 'TFR' },
    { id: 'contr_agg_tfr', label: 'CONTR. AGG. TFR', category: 'TFR' },
    { id: 'tfr_mese', label: 'TFR MESE', category: 'TFR' },
    { id: 'tfr_annuo_progr', label: 'TFR ANNUO PROGR.', category: 'TFR' },
    { id: 'f_do_tfr_ap', label: 'F.DO TFR 31/12 AP', category: 'TFR' },
    { id: 'anticipazioni_anno', label: 'ANTICIPAZIONI ANNO', category: 'TFR' },
    { id: 'tfr_spettante_azienda', label: 'TFR SPETTANTE AZIENDA', category: 'TFR' }
  ] as CalculatorField[],

  calculate: (inputs: { [key: string]: number }, outputField: string): number | null => {
    // আগের মূল ফর্মুলা লজিক অপরিবর্তিত রাখা হয়েছে
    if (outputField === 'netto_busta') {
      const totaleCompetenze = inputs['totale_competenze'] || 0;
      const totaleTrattenute = inputs['totale_trattenute'] || 0;
      const arrPreced = inputs['arr_preced'] || 0;
      const arrAttuale = inputs['arr_attuale'] || 0;
      return totaleCompetenze - (totaleTrattenute + arrPreced) + arrAttuale;
    }

    // নতুন যোগ করা ফিল্ডগুলোর জন্য ডিফল্ট রিটার্ন (ভবিষ্যতে লজিক যোগ করার জন্য প্রস্তুত)
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
