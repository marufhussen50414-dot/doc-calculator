import { DocumentType } from '../types';

/**
 * Configuration for all available document types
 * 
 * This is the single source of truth for document options.
 * To add a new document type:
 * 1. Add a new entry to this array
 * 2. Create the corresponding component
 * 3. Add the route in App.tsx
 */
export const DOCUMENTS: DocumentType[] = [
  {
    id: 'busta-paga',
    name: 'Busta Paga',
    description: 'Calculate payslip components',
    isActive: true,
    icon: '💰',
  },
  {
    id: 'certificazione-unica',
    name: 'Certificazione Unica',
    description: 'Annual tax certification',
    isActive: false, // Placeholder - not yet implemented
    icon: '📄',
  },
];
