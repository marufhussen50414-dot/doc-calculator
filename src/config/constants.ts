/**
 * Application Constants
 * 
 * Central location for all app-wide constants.
 * Modify these values to customize the application behavior.
 */

export const APP_CONFIG = {
  // Application Name
  name: 'Calcolatore Documenti',
  
  // Currency Settings
  currency: 'EUR',
  locale: 'it-IT',
  
  // Decimal Places for Calculations
  decimalPlaces: 2,
  
  // UI Settings
  defaultView: 'home',
  animationDuration: 300, // milliseconds
  
  // Feature Flags (for future use)
  features: {
    enableExport: false, // Future: Export results to PDF/Excel
    enableHistory: false, // Future: Save calculation history
    enableMultiCurrency: false, // Future: Support multiple currencies
  },
};

/**
 * Validation Rules
 */
export const VALIDATION = {
  // Minimum and maximum values for financial inputs
  minValue: -999999999.99,
  maxValue: 999999999.99,
  
  // Number format validation
  allowNegative: true,
  decimalSeparator: ',',
  thousandSeparator: '.',
};

/**
 * UI Text Constants
 */
export const UI_TEXT = {
  home: {
    title: 'Calcolatore Documenti',
    subtitle: 'Seleziona il tipo di documento da calcolare',
    footer: 'Sistema modulare per il calcolo di documenti fiscali e retributivi',
  },
  
  buttons: {
    back: 'Torna alla Home',
    calculate: 'Calcola',
    reset: 'Reset',
  },
  
  status: {
    active: 'Attivo',
    comingSoon: 'Prossimamente',
  },
};
