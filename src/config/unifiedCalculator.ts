export interface CalculatorField {
  id: string;
  label: string;
  category: string;
  description?: string;
}

export const UNIFIED_CALCULATOR = {
  fields: [
    { 
      id: 'sett_retr', 
      label: '1. SETT. RETR.', 
      category: 'Working Days',
      description: 'এই মাসে কর্মীর মোট কত সপ্তাহের বেতন পরিশোধ করা হয়েছে, তার হিসাব বা সপ্তাহের সংখ্যা প্রকাশ করে।' 
    },
    { 
      id: 'gg_retr', 
      label: '2. GG. RETR.', 
      category: 'Working Days',
      description: 'চলতি মাসে কর্মীর মোট কত দিনের বেতন বা পারিশ্রমিক দেওয়া হয়েছে, তার মোট দিন সংখ্যা।' 
    },
    { 
      id: 'gg_lav', 
      label: '3. GG. LAV.', 
      category: 'Working Days',
      description: 'কর্মী বাস্তবে এই মাসে কত দিন অফিসে বা কর্মক্ষেত্রে উপস্থিত হয়ে কাজ করেছেন, তার হিসাব।' 
    },
    { 
      id: 'ore_lav', 
      label: '4. ORE LAV.', 
      category: 'Working Days',
      description: 'কর্মী এই পুরো মাসে মোট কত ঘণ্টা কাজ করেছেন, তার পরিমাণ।' 
    },
    { 
      id: 'impon_contributivo_anno', 
      label: '5. IMPON. CONTRIBUTIVO ANNO', 
      category: 'Contributions',
      description: 'বছরের শুরু থেকে বর্তমান মাস পর্যন্ত সোশ্যাল সিকিউরিটি ট্যাক্স বা ইনপন (INPS) গণনার জন্য মোট করযোগ্য আয়ের পরিমাণ।' 
    },
    { 
      id: 'contributi_anno', 
      label: '6. CONTRIBUTI ANNO', 
      category: 'Contributions',
      description: 'বছরের শুরু থেকে এ পর্যন্ত সোশ্যাল সিকিউরিটি বাবদ মোট কত টাকা কন্ট্রিবিউশন বা অবদান কেটে রাখা হয়েছে তার যোগফল।' 
    },
    { 
      id: 'impon_contributivo_mese', 
      label: '7. IMPON. CONTRIBUTIVO MESE', 
      category: 'Contributions',
      description: 'চলতি মাসের সোশ্যাল সিকিউরিটি ট্যাক্স বা ইনপন গণনার ভিত্তি বা করযোগ্য মাসিক আয়।' 
    },
    { 
      id: 'impon_contrib_arrot_mese', 
      label: '8. IMPON. CONTRIB. ARROT. MESE', 
      category: 'Contributions',
      description: 'হিসাব ও রাউন্ডিংয়ের সুবিধার্থে চলতি মাসের সোশ্যাল সিকিউরিটি ট্যাক্সেবল ইনকামকে পূর্ণসংখ্যায় রূপান্তর করার পর প্রাপ্ত মান।' 
    },
    { 
      id: 'totale_contributi', 
      label: '9. TOTALE CONTRIBUTI', 
      category: 'Contributions',
      description: 'চলতি মাসে কর্মীর বেতন থেকে কাটা মোট সোশ্যাল সিকিউরিটি কন্ট্রিবিউশনের (INPS) চূড়ান্ত পরিমাণ।' 
    },
    { 
      id: 'imponibile_fiscale_mese', 
      label: '10. IMPONIBILE FISCALE (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'চলতি মাসের মূল ট্যাক্সযোগ্য আয় (মোট আয় থেকে সোশ্যাল সিকিউরিটি কন্ট্রিবিউশন বাদ দেওয়ার পর যার ওপর আয়কর ধরা হয়)।' 
    },
    { 
      id: 'irpef_lorda_mese', 
      label: '11. IRPEF LORDA (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'মাসিক ট্যাক্সযোগ্য আয়ের ওপর সরকারি নিয়মের ব্র্যাকেট অনুযায়ী ধার্যকৃত মোট গ্রস বা প্রাথমিক আয়কর।' 
    },
    { 
      id: 'detr_lav_dipendente_mese', 
      label: '12. DETR. LAV. DIPENDENTE (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'চাকুরিজীবী হওয়ার সুবাদে সরকার থেকে প্রাপ্ত মাসিক ট্যাক্স ছাড় বা রিবেট, যা গ্রস ট্যাক্স থেকে কমানো হয়।' 
    },
    { 
      id: 'gg_mese', 
      label: '13. GG (Mese)', 
      category: 'Taxes - Monthly',
      description: 'মাসিক ট্যাক্স ডিডাকশন বা ছাড় গণনার জন্য বিবেচ্য দিনের সংখ্যা।' 
    },
    { 
      id: 'detr_coniuge_mese', 
      label: '14. DETR. CONIUGE (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'স্বামী বা স্ত্রীর জন্য প্রযোজ্য মাসিক ট্যাক্স ছাড় বা রিবেটের পরিমাণ।' 
    },
    { 
      id: 'detr_figli_mese', 
      label: '15. DETR. FIGLI (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'সন্তান বা পোষ্যদের জন্য সরকার থেকে প্রাপ্ত মাসিক ট্যাক্স ছাড়ের পরিমাণ।' 
    },
    { 
      id: 'detr_altri_familiari_mese', 
      label: '16. DETR. ALTRI FAMILIARI (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'পরিবারের অন্যান্য নির্ভরশীল সদস্য বা পোষ্যদের জন্য প্রাপ্ত মাসিক ট্যাক্স ছাড়।' 
    },
    { 
      id: 'detr_oneri_mese', 
      label: '17. DETR. ONERI (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'বিভিন্ন খরচ, চিকিৎসা ব্যয় বা অন্যান্য অনুমোদিত খাতের জন্য মাসিক ট্যাক্স ছাড়।' 
    },
    { 
      id: 'irpef_netta_mese', 
      label: '18. IRPEF NETTA (Monthly)', 
      category: 'Taxes - Monthly',
      description: 'সমস্ত ট্যাক্স ছাড় বাদ দেওয়ার পর চলতি মাসের প্রকৃত পরিশোধযোগ্য নিট আয়কর।' 
    },
    { 
      id: 'irpef_imp_sost', 
      label: '19. IRPEF + IMP. SOST.', 
      category: 'Taxes - Monthly',
      description: 'নিট আয়কর এবং অন্য কোনো বিশেষ আয়ের ওপর প্রযোজ্য বিকল্প ট্যাক্সের মোট যোগফল।' 
    },
    { 
      id: 'imponibile_fiscale_anno', 
      label: '20. IMPONIBILE FISCALE (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে বর্তমান মাস পর্যন্ত জমে থাকা মোট করযোগ্য আয়।' 
    },
    { 
      id: 'irpef_lorda_anno', 
      label: '21. IRPEF LORDA (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের এ পর্যন্ত মোট করযোগ্য আয়ের ওপর হিসাব করা মোট গ্রস আয়কর।' 
    },
    { 
      id: 'detr_lav_dipendente_anno', 
      label: '22. DETR. LAV. DIPENDENTE (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে এ পর্যন্ত চাকুরিজীবী হিসেবে প্রাপ্ত মোট ট্যাক্স ছাড়ের জমা পরিমাণ।' 
    },
    { 
      id: 'gg_anno', 
      label: '23. GG (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের এ পর্যন্ত বার্ষিক ট্যাক্স গণনার জন্য মোট কাজের বা ছাড়ের দিন সংখ্যা।' 
    },
    { 
      id: 'detr_coniuge_anno', 
      label: '24. DETR. CONIUGE (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে স্বামী/স্ত্রীর জন্য প্রাপ্ত মোট ট্যাক্স ছাড়।' 
    },
    { 
      id: 'detr_figli_anno', 
      label: '25. DETR. FIGLI (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে সন্তানদের জন্য প্রাপ্ত মোট ট্যাক্স ছাড়।' 
    },
    { 
      id: 'detr_altri_familiari_anno', 
      label: '26. DETR. ALTRI FAMILIARI (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের এ পর্যন্ত অন্যান্য নির্ভরশীলদের জন্য প্রাপ্ত মোট ট্যাক্স ছাড়।' 
    },
    { 
      id: 'detr_oneri_canoni_anno', 
      label: '27. DETR. ONERI/CANONI (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে বাড়িভাড়া বা অন্যান্য অনুমোদিত খরচের ওপর প্রাপ্ত বার্ষিক ট্যাক্স ছাড়।' 
    },
    { 
      id: 'irpef_netta_anno', 
      label: '28. IRPEF NETTA (Anno)', 
      category: 'Taxes - Annual',
      description: 'বছরের এ পর্যন্ত সমস্ত ছাড় বাদ দেওয়ার পর প্রকৃত নিট আয়করের পরিমাণ।' 
    },
    { 
      id: 'irpef_trattenuta', 
      label: '29. IRPEF TRATTENUTA', 
      category: 'Taxes - Annual',
      description: 'বছরের শুরু থেকে এ পর্যন্ত কর্মীর বেতন থেকে ইতিমধ্যে কেটে রাখা মোট আয়করের পরিমাণ।' 
    },
    { 
      id: 'irpef_conguaglio', 
      label: '30. IRPEF CONGUAGLIO', 
      category: 'Taxes - Annual',
      description: 'বছরের শেষে বা নির্দিষ্ট সময়ে ট্যাক্সের হিসাব মেলানোর জন্য অতিরিক্ত কর্তন বা রিফান্ড বাবদ অ্যাডজাস্টমেন্ট।' 
    },
    { 
      id: 'retribuzione_utile_tfr', 
      label: '31. RETRIBUZIONE UTILE TFR', 
      category: 'TFR',
      description: 'টিএফআর বা গ্র্যাচুইটি (TFR) হিসাব করার জন্য নির্ধারিত মাসিক বা বার্ষিক বেতনের ভিত্তি।' 
    },
    { 
      id: 'contr_agg_tfr', 
      label: '32. CONTR. AGG. TFR', 
      category: 'TFR',
      description: 'টিএফআর ফান্ডের ওপর প্রযোজ্য অতিরিক্ত কন্ট্রিবিউশন বা অবদানের পরিমাণ।' 
    },
    { 
      id: 'tfr_mese', 
      label: '33. TFR MESE', 
      category: 'TFR',
      description: 'চলতি মাসে কর্মীর জন্য জমাকৃত টিএফআর বা গ্র্যাচুইটির নির্দিষ্ট অংশ।' 
    },
    { 
      id: 'tfr_annuo_progr', 
      label: '34. TFR ANNUO PROGR.', 
      category: 'TFR',
      description: 'বছরের শুরু থেকে এ পর্যন্ত টিএফআর ফান্ডের প্রগতিশীল বা জমাকৃত মোট পরিমাণ।' 
    },
    { 
      id: 'f_do_tfr_ap', 
      label: '35. F.DO TFR 31/12 AP', 
      category: 'TFR',
      description: 'গত বছরের ৩১শে ডিসেম্বর পর্যন্ত টিএফআর ফান্ডের মোট উদ্বৃত্ত বা ব্যালেন্স।' 
    },
    { 
      id: 'anticipazioni_anno', 
      label: '36. ANTICIPAZIONI ANNO', 
      category: 'TFR',
      description: 'চলتی বছরে টিএফআর ফান্ড থেকে অগ্রিম উত্তোলিত বা এডভান্স নেওয়া টাকার পরিমাণ।' 
    },
    { 
      id: 'tfr_spettante_azienda', 
      label: '37. TFR SPETTANTE AZIENDA', 
      category: 'TFR',
      description: 'কোম্পানির কাছে জমা থাকা বা কোম্পানির দায়িত্বে থাকা টিএফআরের চূড়ান্ত অংশ।' 
    },
    { 
      id: 'tfr_fdo_pensione', 
      label: '38. TFR A F.DO PENSIONE', 
      category: 'TFR',
      description: 'কোম্পানির কাছে না রেখে কোনো এক্সটার্নাল পেনশন ফান্ডে স্থানান্তরিত টিএফআরের পরিমাণ।' 
    },
    { 
      id: 'totale_competenze', 
      label: '39. TOTALE COMPETENZE', 
      category: 'Earnings',
      description: 'চলতি মাসে কর্মী মূল বেতন, ওভারটাইম ও অন্যান্য ভাতা মিলিয়ে মোট কত টাকা পাওনা হয়েছেন।' 
    },
    { 
      id: 'totale_trattenute', 
      label: '40. TOTALE TRATTENUTE', 
      category: 'Deductions',
      description: 'এই মাসে কর্মীর বেতন থেকে ট্যাক্স, ইনপন এবং অন্যান্য খাতে মোট কত টাকা কেটে রাখা হয়েছে তার যোগফল।' 
    },
    { 
      id: 'arr_preced', 
      label: '41. ARR. PRECED.', 
      category: 'Adjustments',
      description: 'গত মাসের হিসাবের বা রাউন্ডিংয়ের কারণে ঝুলে থাকা আগের জের।' 
    },
    { 
      id: 'arr_attuale', 
      label: '42. ARR. ATTUALE', 
      category: 'Adjustments',
      description: 'চলتی মাসের পে-স্লিপের হিসাব নিখুঁত ও রাউন্ড ফিগারে মেলানোর জন্য সামান্য যোগ বা বিয়োগ।' 
    },
    { 
      id: 'netto_busta', 
      label: '43. NETTO IN BUSTA', 
      category: 'Net Pay',
      description: 'সমস্ত আয় থেকে কর্তন বাদ দিয়ে এবং রাউন্ডিং হিসাব করার পর কর্মী হাতে বা ব্যাংকে যে প্রকৃত নিট বেতন পান।' 
    }
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
