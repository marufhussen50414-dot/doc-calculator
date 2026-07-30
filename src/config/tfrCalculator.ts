import { CalculatorConfig, CalculatorInputs } from '../types';

/**
 * TFR (Trattamento di Fine Rapporto) Calculator Configuration
 * 
 * Components:
 * - RETRIBUZIONE UTILE TFR: Monthly salary useful for TFR calculation
 * - CONTR. AGG. TFR: Additional TFR contribution
 * - TFR MESE: Monthly TFR accrual (calculated as RETRIBUZIONE UTILE TFR / 13.5)
 * - TFR ANNUO PROGR.: Progressive yearly TFR total
 * - F.DO TFR 31/12 AP: Previous year's closing balance (Fondo TFR as of 31/12 previous year)
 * - ANTICIPAZIONI ANNO: Yearly advances paid to employee
 * - TFR SPETTANTE AZIENDA: Company's TFR liability (Closing balance + Progressive - Advances - Pension)
 * - TFR A F.DO PENSIONE: Amount transferred to pension fund
 * 
 * Standard formulas:
 * - TFR MESE = RETRIBUZIONE UTILE TFR / 13.5 + CONTR. AGG. TFR
 * - TFR ANNUO PROGR. = Sum of monthly TFR (can be input directly for simplicity)
 * - TFR SPETTANTE AZIENDA = F.DO TFR 31/12 AP + TFR ANNUO PROGR. - ANTICIPAZIONI ANNO - TFR A F.DO PENSIONE
 */
export const TFR_CALCULATOR: CalculatorConfig = {
  id: 'tfr-calculator',
  name: 'TFR Calculator',
  fields: [
    {
      id: 'retribuzione_utile_tfr',
      label: 'RETRIBUZIONE UTILE TFR',
      description: 'Monthly salary useful for TFR calculation',
    },
    {
      id: 'contr_agg_tfr',
      label: 'CONTR. AGG. TFR',
      description: 'Additional TFR contribution (0.5% employer contribution)',
    },
    {
      id: 'tfr_mese',
      label: 'TFR MESE',
      description: 'Monthly TFR accrual (Retribuzione / 13.5 + Additional contribution)',
    },
    {
      id: 'tfr_annuo_progr',
      label: 'TFR ANNUO PROGR.',
      description: 'Progressive yearly TFR total (sum of monthly accruals)',
    },
    {
      id: 'fdo_tfr_31_12_ap',
      label: 'F.DO TFR 31/12 AP',
      description: 'Previous year closing balance (Fund TFR as of 31/12 previous year)',
    },
    {
      id: 'anticipazioni_anno',
      label: 'ANTICIPAZIONI ANNO',
      description: 'Yearly advances paid to employee',
    },
    {
      id: 'tfr_spettante_azienda',
      label: 'TFR SPETTANTE AZIENDA',
      description: 'Company TFR liability (Closing balance + Progressive - Advances - Pension)',
    },
    {
      id: 'tfr_a_fdo_pensione',
      label: 'TFR A F.DO PENSIONE',
      description: 'Amount transferred to pension fund',
    },
  ],

  /**
   * Calculate the missing field based on TFR formulas
   * 
   * Main formulas:
   * 1. TFR MESE = RETRIBUZIONE UTILE TFR / 13.5 + CONTR. AGG. TFR
   * 2. TFR SPETTANTE AZIENDA = F.DO TFR 31/12 AP + TFR ANNUO PROGR. - ANTICIPAZIONI ANNO - TFR A F.DO PENSIONE
   * 
   * @param inputs - Object containing the known values
   * @param outputField - The field to calculate
   * @returns The calculated value or null if calculation is not possible
   */
  calculate: (inputs: CalculatorInputs, outputField: string): number | null => {
    const {
      retribuzione_utile_tfr = 0,
      contr_agg_tfr = 0,
      tfr_mese = 0,
      tfr_annuo_progr = 0,
      fdo_tfr_31_12_ap = 0,
      anticipazioni_anno = 0,
      tfr_spettante_azienda = 0,
      tfr_a_fdo_pensione = 0,
    } = inputs;

    switch (outputField) {
      // Formula 1: TFR MESE = RETRIBUZIONE UTILE TFR / 13.5 + CONTR. AGG. TFR
      case 'tfr_mese':
        return (retribuzione_utile_tfr / 13.5) + contr_agg_tfr;

      case 'retribuzione_utile_tfr':
        return (tfr_mese - contr_agg_tfr) * 13.5;

      case 'contr_agg_tfr':
        return tfr_mese - (retribuzione_utile_tfr / 13.5);

      // Formula 2: TFR SPETTANTE AZIENDA = F.DO TFR 31/12 AP + TFR ANNUO PROGR. - ANTICIPAZIONI ANNO - TFR A F.DO PENSIONE
      case 'tfr_spettante_azienda':
        return fdo_tfr_31_12_ap + tfr_annuo_progr - anticipazioni_anno - tfr_a_fdo_pensione;

      case 'fdo_tfr_31_12_ap':
        return tfr_spettante_azienda - tfr_annuo_progr + anticipazioni_anno + tfr_a_fdo_pensione;

      case 'tfr_annuo_progr':
        return tfr_spettante_azienda - fdo_tfr_31_12_ap + anticipazioni_anno + tfr_a_fdo_pensione;

      case 'anticipazioni_anno':
        return fdo_tfr_31_12_ap + tfr_annuo_progr - tfr_spettante_azienda - tfr_a_fdo_pensione;

      case 'tfr_a_fdo_pensione':
        return fdo_tfr_31_12_ap + tfr_annuo_progr - tfr_spettante_azienda - anticipazioni_anno;

      default:
        return null;
    }
  },
};

/**
 * Export for use in main calculators registry
 */
export default TFR_CALCULATOR;
