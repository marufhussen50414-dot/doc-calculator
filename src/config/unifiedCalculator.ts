import { CalculatorConfig, CalculatorField, CalculatorInputs } from '../types';
import { BUSTA_PAGA_CALCULATOR } from './calculators';
import { TFR_CALCULATOR } from './tfrCalculator';

/**
 * Unified Calculator Configuration
 * 
 * Combines all calculator fields (Busta Paga + TFR) into a single unified list.
 * All fields are searchable and can be calculated together.
 */

// Combine all fields from both calculators
const allFields: CalculatorField[] = [
  // Busta Paga fields
  ...BUSTA_PAGA_CALCULATOR.fields.map(field => ({
    ...field,
    category: 'Busta Paga',
  })),
  // TFR fields
  ...TFR_CALCULATOR.fields.map(field => ({
    ...field,
    category: 'TFR',
  })),
];

/**
 * Unified calculation function that routes to the appropriate calculator
 */
const unifiedCalculate = (inputs: CalculatorInputs, outputField: string): number | null => {
  // Check if the output field belongs to Busta Paga
  const bustaPagaField = BUSTA_PAGA_CALCULATOR.fields.find(f => f.id === outputField);
  if (bustaPagaField) {
    // Filter inputs to only include Busta Paga fields
    const bustaPagaInputs: CalculatorInputs = {};
    BUSTA_PAGA_CALCULATOR.fields.forEach(field => {
      if (inputs[field.id] !== undefined) {
        bustaPagaInputs[field.id] = inputs[field.id];
      }
    });
    return BUSTA_PAGA_CALCULATOR.calculate(bustaPagaInputs, outputField);
  }

  // Check if the output field belongs to TFR
  const tfrField = TFR_CALCULATOR.fields.find(f => f.id === outputField);
  if (tfrField) {
    // Filter inputs to only include TFR fields
    const tfrInputs: CalculatorInputs = {};
    TFR_CALCULATOR.fields.forEach(field => {
      if (inputs[field.id] !== undefined) {
        tfrInputs[field.id] = inputs[field.id];
      }
    });
    return TFR_CALCULATOR.calculate(tfrInputs, outputField);
  }

  return null;
};

/**
 * Unified Calculator
 * Combines Busta Paga and TFR into a single searchable interface
 */
export const UNIFIED_CALCULATOR: CalculatorConfig = {
  id: 'unified-calculator',
  name: 'Unified Payslip & TFR Calculator',
  fields: allFields,
  calculate: unifiedCalculate,
};

/**
 * Get fields by category for display purposes
 */
export const getFieldsByCategory = () => {
  const categories: { [key: string]: CalculatorField[] } = {};
  
  allFields.forEach(field => {
    const category = (field as any).category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(field);
  });
  
  return categories;
};

/**
 * Search fields by label or description
 */
export const searchFields = (query: string): CalculatorField[] => {
  if (!query.trim()) {
    return allFields;
  }
  
  const lowerQuery = query.toLowerCase();
  return allFields.filter(field => 
    field.label.toLowerCase().includes(lowerQuery) ||
    (field.description && field.description.toLowerCase().includes(lowerQuery))
  );
};
