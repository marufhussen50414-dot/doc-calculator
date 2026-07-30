/**
 * Type definitions for the document calculator application
 */

/**
 * Represents a document type available in the application
 */
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
}

/**
 * Represents a field in a calculator
 */
export interface CalculatorField {
  id: string;
  label: string;
  description?: string;
  sign?: '+' | '-'; // For fields that can be positive or negative
}

/**
 * Configuration for a calculator
 */
export interface CalculatorConfig {
  id: string;
  name: string;
  fields: CalculatorField[];
  calculate: (inputs: CalculatorInputs, outputField: string) => number | null;
}

/**
 * Input values for calculator
 */
export interface CalculatorInputs {
  [fieldId: string]: number;
}

/**
 * State for the application
 */
export interface AppState {
  currentView: 'home' | string;
  selectedDocument?: string;
}
