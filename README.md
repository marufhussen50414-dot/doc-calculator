# 📊 Calcolatore Documenti - Busta Paga & Certificazioni

A clean, modular, and config-driven web application for calculating Italian payroll and tax documents.

## 🎯 Features

### Currently Available
- **Busta Paga Calculator** 💰
  - Calculate any component of an Italian payslip
  - Exact formula implementation: `NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + (± ARR. PRECED.)) ± ARR. ATTUALE`
  - **Three calculation modes:**
    - 🎯 **Standard Mode**: Calculate a single output field
    - 🎪 **Target Mode**: Set a target value and see what adjustments are needed
    - 🔢 **Multi Mode**: Calculate multiple fields simultaneously
  - Formula viewer modal with complete calculation logic
  - Clean, intuitive UI with real-time calculation

### Coming Soon
- **Certificazione Unica** 📄 (Placeholder ready)

## 🏗️ Architecture

This application is built with modularity and extensibility in mind:

### Tech Stack
- **React** - Component-based UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool

### Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Home screen with document cards
│   ├── BustaPaga.tsx    # Busta Paga calculator
│   └── CertificazioneUnica.tsx  # CU placeholder
├── config/             # Configuration files (modular!)
│   ├── documents.ts    # Document type definitions
│   └── calculators.ts  # Calculator configurations & formulas
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main app with routing

```

## 📝 How to Add New Documents/Calculators

The application is designed to be easily extensible. Follow these steps:

### 1. Add Document Configuration

Edit `src/config/documents.ts`:

```typescript
{
  id: 'new-document',
  name: 'New Document Name',
  description: 'Description of the document',
  isActive: true,  // Set to true when ready
  icon: '📋',
}
```

### 2. Create Calculator Configuration (if needed)

Edit `src/config/calculators.ts`:

```typescript
export const NEW_CALCULATOR: CalculatorConfig = {
  id: 'new-document',
  name: 'Calculator Name',
  fields: [
    { id: 'field1', label: 'Field 1', description: '...' },
    // ... more fields
  ],
  calculate: (inputs, outputField) => {
    // Implement your calculation logic
    return calculatedValue;
  },
};

// Add to CALCULATORS registry
export const CALCULATORS = {
  'busta-paga': BUSTA_PAGA_CALCULATOR,
  'new-document': NEW_CALCULATOR,  // Add here
};
```

### 3. Create Component

Create `src/components/NewDocument.tsx` following the same pattern as existing components.

### 4. Add Route

Update `src/App.tsx`:

```typescript
import { NewDocument } from './components/NewDocument';

// In renderView():
case 'new-document':
  return <NewDocument onBack={handleBackToHome} />;
```

## 🧮 Busta Paga Calculator

### Formula Components

| Component | Description |
|-----------|-------------|
| **TOTALE COMPETENZE** | Total gross earnings |
| **TOTALE TRATTENUTE** | Total deductions (taxes, contributions) |
| **ARR. PRECED.** | Previous adjustments (± can be positive or negative) |
| **ARR. ATTUALE** | Current adjustments (± can be positive or negative) |
| **NETTO IN BUSTA** | Net amount in payslip |

### Exact Formula

```
NETTO IN BUSTA = TOTALE COMPETENZE - (TOTALE TRATTENUTE + (± ARR. PRECED.)) ± ARR. ATTUALE
```

### Calculation Modes

The calculator offers three powerful modes:

#### 🎯 Standard Mode
Select one output field and input the other four values. The calculator solves for the selected field.

#### 🎪 Target Mode
Set a target value for any field (e.g., "I want NETTO IN BUSTA to be €2,000") and the system will:
- Show what value another field needs to be
- Calculate the difference from current value
- Suggest the required adjustment

#### 🔢 Multi Mode
Select multiple fields as outputs and calculate them all simultaneously with the same inputs.

### Additional Features
- **Formula Viewer**: Click "Visualizza Formula" to see complete calculation logic and formulas
- **Negative Values**: Full support for positive and negative adjustments
- **Real-time Calculations**: Instant results as you input values

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📐 Code Quality

- **Type Safety**: Full TypeScript implementation
- **Comments**: Well-documented code throughout
- **Modularity**: Config-driven architecture
- **Reusability**: Component-based design
- **Maintainability**: Clear separation of concerns

## 🎨 Design Principles

1. **Config-Driven**: All document types and calculators are defined in config files
2. **Modular**: Each calculator is a separate component
3. **Extensible**: Easy to add new document types without modifying core code
4. **User-Friendly**: Clean UI with clear instructions
5. **Responsive**: Works on all device sizes

## 📄 License

This project is open source and available for use.

## 🤝 Contributing

To add new features:

1. Add configuration in `src/config/`
2. Create new component in `src/components/`
3. Update routing in `src/App.tsx`
4. Test thoroughly
5. Document your changes

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
