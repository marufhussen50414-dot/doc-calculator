import { CalculatorConfig, CalculatorInputs } from '../types';

/**
 * Busta Paga Calculator Configuration
 * 
 * Formula: NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + (± ARR. PRECED.)) ± ARR. ATTUALE
 * 
 * Components:
 * - TOTALE COMPETENZE: Total earnings/income
 * - TOTALE TRATTENUTE: Total deductions
 * - ARR. PRECED.: Previous adjustments (can be + or -)
 * - ARR. ATTUALE: Current adjustments (can be + or -)
 * - NETTO IN BUSTA: Net amount in payslip
 */
export const BUSTA_PAGA_CALCULATOR: CalculatorConfig = {
  id: 'busta-paga',
  name: 'Calcolatore Busta Paga',
  fields: [
    {
      id: 'totale_competenze',
      label: 'TOTALE COMPETENZE',
      description: 'Totale delle competenze (retribuzione lorda)',
    },
    {
      id: 'totale_trattenute',
      label: 'TOTALE TRATTENUTE',
      description: 'Totale delle trattenute (tasse, contributi, etc.)',
    },
    {
      id: 'arr_preced',
      label: 'ARR. PRECED.',
      description: 'Arretrati precedenti (± può essere positivo o negativo)',
      sign: '+',
    },
    {
      id: 'arr_attuale',
      label: 'ARR. ATTUALE',
      description: 'Arretrati attuali (± può essere positivo o negativo)',
      sign: '+',
    },
    {
      id: 'netto_busta',
      label: 'NETTO IN BUSTA',
      description: 'Importo netto da ricevere in busta paga',
    },
  ],
  
  /**
   * Calculate the missing field based on the formula
   * 
   * @param inputs - Object containing the known values
   * @param outputField - The field to calculate
   * @returns The calculated value or null if calculation is not possible
   */
  calculate: (inputs: CalculatorInputs, outputField: string): number | null => {
    const {
      totale_competenze = 0,
      totale_trattenute = 0,
      arr_preced = 0,
      arr_attuale = 0,
      netto_busta = 0,
    } = inputs;

    // Formula: NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + ARR. PRECED.) + ARR. ATTUALE
    // Simplified: NETTO_IN_BUSTA = TOTALE_COMPETENZE - TOTALE_TRATTENUTE - ARR_PRECED + ARR_ATTUALE

    switch (outputField) {
      case 'netto_busta':
        // NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + ARR. PRECED.) + ARR. ATTUALE
        return totale_competenze - (totale_trattenute + arr_preced) + arr_attuale;

      case 'totale_competenze':
        // TOTALE COMPETENZE = NETTO IN BUSTA + TOTALE TRATTENUTE + ARR. PRECED. - ARR. ATTUALE
        return netto_busta + (totale_trattenute + arr_preced) - arr_attuale;

      case 'totale_trattenute':
        // TOTALE TRATTENUTE = TOTALE COMPETENZE - NETTO IN BUSTA - ARR. PRECED. + ARR. ATTUALE
        return totale_competenze - netto_busta - arr_preced + arr_attuale;

      case 'arr_preced':
        // ARR. PRECED. = TOTALE COMPETENZE - NETTO IN BUSTA - TOTALE TRATTENUTE + ARR. ATTUALE
        return totale_competenze - netto_busta - totale_trattenute + arr_attuale;

      case 'arr_attuale':
        // ARR. ATTUALE = NETTO IN BUSTA + TOTALE TRATTENUTE + ARR. PRECED. - TOTALE COMPETENZE
        return netto_busta + totale_trattenute + arr_preced - totale_competenze;

      default:
        return null;
    }
  },
};

/**
 * Registry of all calculators
 * Add new calculators here as they are implemented
 */
export const CALCULATORS: { [key: string]: CalculatorConfig } = {
  'busta-paga': BUSTA_PAGA_CALCULATOR,
  // Add more calculators here in the future
  // 'certificazione-unica': CERTIFICAZIONE_UNICA_CALCULATOR,
  // 'tfr': TFR_CALCULATOR,
};
