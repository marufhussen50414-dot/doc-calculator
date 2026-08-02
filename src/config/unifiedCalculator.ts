export interface CalculatorField {
  id: string;
  label: string;
  category: string;
  description?: string;
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
    { id: 'imponibile_fiscale_mese', label: '10. IMPONIBILE FISCALE (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_lorda_mese', label: '11. IRPEF LORDA (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_lav_dipendente_mese', label: '12. DETR. LAV. DIPENDENTE (MESE)', category: 'Taxes - Monthly' },
    { id: 'gg_mese', label: '13. GG (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_coniuge_mese', label: '14. DETR. CONIUGE (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_figli_mese', label: '15. DETR. FIGLI (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_altri_familiari_mese', label: '16. DETR. ALTRI FAMILIARI (MESE)', category: 'Taxes - Monthly' },
    { id: 'detr_oneri_mese', label: '17. DETR. ONERI (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_netta_mese', label: '18. IRPEF NETTA (MESE)', category: 'Taxes - Monthly' },
    { id: 'imposta_sostitutiva_imponibile_mese', label: '19. IMPOSTA SOSTITUTIVA IMPONIBILE (MESE)', category: 'Taxes - Monthly' },
    { id: 'imposta_sostitutiva_imposta_mese', label: '20. IMPOSTA SOSTITUTIVA IMPOSTA (MESE)', category: 'Taxes - Monthly' },
    { id: 'irpef_imp_sost', label: '21. IRPEF + IMP. SOST.', category: 'Taxes - Monthly' },
    { id: 'imponibile_fiscale_anno', label: '22. IMPONIBILE FISCALE (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_lorda_anno', label: '23. IRPEF LORDA (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_lav_dipendente_anno', label: '24. DETR. LAV. DIPENDENTE (ANNO)', category: 'Taxes - Annual' },
    { id: 'gg_anno', label: '25. GG (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_coniuge_anno', label: '26. DETR. CONIUGE (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_figli_anno', label: '27. DETR. FIGLI (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_altri_familiari_anno', label: '28. DETR. ALTRI FAMILIARI (ANNO)', category: 'Taxes - Annual' },
    { id: 'detr_oneri_canoni_anno', label: '29. DETR. ONERI/CANONI (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_netta_anno', label: '30. IRPEF NETTA (ANNO)', category: 'Taxes - Annual' },
    { id: 'irpef_trattenuta', label: '31. IRPEF TRATTENUTA', category: 'Taxes - Annual' },
    { id: 'irpef_conguaglio', label: '32. IRPEF CONGUAGLIO', category: 'Taxes - Annual' },
    { id: 'imposta_sostitutiva_imponibile_anno', label: '33. IMPOSTA SOSTITUTIVA IMPONIBILE (ANNO)', category: 'Taxes - Annual' },
    { id: 'imposta_sostitutiva_imposta_anno', label: '34. IMPOSTA SOSTITUTIVA IMPOSTA (ANNO)', category: 'Taxes - Annual' },
    { id: 'imposta_sostitutiva_trattenuta_anno', label: '35. IMPOSTA SOSTITUTIVA TRATTENUTA (ANNO)', category: 'Taxes - Annual' },
    { id: 'imposta_sostitutiva_conguaglio_anno', label: '36. IMPOSTA SOSTITUTIVA CONGUAGLIO (ANNO)', category: 'Taxes - Annual' },
    { id: 'cong_irpef_imp_sost', label: '37. CONG. IRPEF + IMP. SOST.', category: 'Taxes - Annual' },
    { id: 'retribuzione_utile_tfr', label: '38. RETRIBUZIONE UTILE TFR', category: 'TFR' },
    { id: 'contr_agg_tfr', label: '39. CONTR. AGG. TFR', category: 'TFR' },
    { id: 'tfr_mese', label: '40. TFR MESE', category: 'TFR' },
    { id: 'tfr_annuo_progr', label: '41. TFR ANNUO PROGR.', category: 'TFR' },
    { id: 'f_do_tfr_ap', label: '42. F.DO TFR 31/12 AP', category: 'TFR' },
    { id: 'anticipazioni_anno', label: '43. ANTICIPAZIONI ANNO', category: 'TFR' },
    { id: 'tfr_spettante_azienda', label: '44. TFR SPETTANTE AZIENDA', category: 'TFR' },
    { id: 'tfr_fdo_pensione', label: '45. TFR A F.DO PENSIONE', category: 'TFR' },
    { id: 'anf_tabella', label: '46. ANF TABELLA', category: 'ANF' },
    { id: 'anf_n_compon', label: '47. ANF N.COMPON.', category: 'ANF' },
    { id: 'anf_figli_min', label: '48. ANF FIGLI MIN.', category: 'ANF' },
    { id: 'anf_liv_reddito', label: '49. ANF LIV.REDDITO', category: 'ANF' },
    { id: 'anf_giorni', label: '50. ANF GIORNI', category: 'ANF' },
    { id: 'anf_importo_assegno', label: '51. ANF IMPORTO ASSEGNO', category: 'ANF' },
    { id: 'totale_competenze', label: '52. TOTALE COMPETENZE', category: 'Earnings' },
    { id: 'totale_trattenute', label: '53. TOTALE TRATTENUTE', category: 'Deductions' },
    { id: 'arr_preced', label: '54. ARR. PRECED.', category: 'Adjustments' },
    { id: 'arr_attuale', label: '55. ARR. ATTUALE', category: 'Adjustments' },
    { id: 'netto_busta', label: '56. NETTO IN BUSTA', category: 'Net Pay' }
  ] as CalculatorField[],

  calculate: (inputs: { [key: string]: number }, outputField: string): number | null => {
    if (outputField === 'netto_busta') {
      const totaleCompetenze = inputs['totale_competenze'] || 0;
      const totaleTrattenute = inputs['totale_trattenute'] || 0;
      const arrPreced = inputs['arr_preced'] || 0;
      const arrAttuale = inputs['arr_attuale'] || 0;
      return totaleCompetenze - (totaleTrattenute + arrPreced) + arrAttuale;
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
