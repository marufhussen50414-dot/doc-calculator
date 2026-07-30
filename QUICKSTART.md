# 🚀 Quick Start Guide

## For Users

### Using the Busta Paga Calculator

1. **Open the application** - You'll see the home screen with document options
2. **Click on "Busta Paga"** - The payslip calculator card
3. **Select what to calculate** - Choose which value you want to find
4. **Enter the known values** - Input the other fields
5. **Click "Calcola"** - Get your result!

### Example Calculation

**Goal**: Find NETTO IN BUSTA

**Known values**:
- TOTALE COMPETENZE: €2,500.00
- TOTALE TRATTENUTE: €800.00
- ARR. PRECED.: €0.00
- ARR. ATTUALE: €100.00

**Result**: €1,800.00

---

## For Developers

### Installation

```bash
# Clone or download the project
cd your-project-folder

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 5-Minute Tutorial: Add a New Calculator

#### Example: Simple Tax Calculator

**1. Add document configuration** (`src/config/documents.ts`):

```typescript
{
  id: 'tax-calculator',
  name: 'Calcolo Tasse',
  description: 'Calcola le tasse sul reddito',
  isActive: true,
  icon: '💵',
}
```

**2. Create calculator config** (`src/config/calculators.ts`):

```typescript
export const TAX_CALCULATOR: CalculatorConfig = {
  id: 'tax-calculator',
  name: 'Calcolatore Tasse',
  fields: [
    { id: 'gross_income', label: 'Reddito Lordo' },
    { id: 'tax_rate', label: 'Aliquota (%)' },
    { id: 'tax_amount', label: 'Importo Tasse' },
    { id: 'net_income', label: 'Reddito Netto' },
  ],
  calculate: (inputs, outputField) => {
    const { gross_income = 0, tax_rate = 0, tax_amount = 0, net_income = 0 } = inputs;
    
    switch (outputField) {
      case 'tax_amount':
        return gross_income * (tax_rate / 100);
      case 'net_income':
        return gross_income - (gross_income * (tax_rate / 100));
      case 'gross_income':
        return net_income / (1 - (tax_rate / 100));
      case 'tax_rate':
        return (tax_amount / gross_income) * 100;
      default:
        return null;
    }
  },
};

// Register it
export const CALCULATORS = {
  'busta-paga': BUSTA_PAGA_CALCULATOR,
  'tax-calculator': TAX_CALCULATOR, // Add here
};
```

**3. Create component** (`src/components/TaxCalculator.tsx`):

```typescript
import React, { useState } from 'react';
import { CalculatorInputs } from '../types';
import { CALCULATORS } from '../config/calculators';

interface TaxCalculatorProps {
  onBack: () => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onBack }) => {
  const [outputField, setOutputField] = useState('tax_amount');
  const [inputs, setInputs] = useState<CalculatorInputs>({});
  const [result, setResult] = useState<number | null>(null);

  const calculator = CALCULATORS['tax-calculator'];

  const handleCalculate = () => {
    const calculatedResult = calculator.calculate(inputs, outputField);
    setResult(calculatedResult);
  };

  // ... rest similar to BustaPaga component
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* Your UI here */}
    </div>
  );
};
```

**4. Add route** (`src/App.tsx`):

```typescript
import { TaxCalculator } from './components/TaxCalculator';

// In renderView():
case 'tax-calculator':
  return <TaxCalculator onBack={handleBackToHome} />;
```

**Done!** 🎉 Your new calculator is ready!

---

## Common Customizations

### Change Color Scheme

**Primary color** (currently indigo):
```typescript
// Replace all instances of:
bg-indigo-600 → bg-blue-600
text-indigo-600 → text-blue-600
border-indigo-600 → border-blue-600
```

### Add Field Validation

```typescript
const handleInputChange = (fieldId: string, value: string) => {
  const numValue = parseFloat(value);
  
  // Add validation
  if (numValue < 0 || numValue > 999999) {
    alert('Valore non valido!');
    return;
  }
  
  setInputs(prev => ({ ...prev, [fieldId]: numValue }));
};
```

### Format Numbers Differently

```typescript
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
```

### Add Export to PDF (Future)

```typescript
// Install library
npm install jspdf

// Use in component
import jsPDF from 'jspdf';

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text(`Result: ${result}`, 10, 10);
  doc.save('result.pdf');
};
```

---

## File Editing Cheat Sheet

| What to Change | Where to Edit |
|----------------|---------------|
| Add new document | `src/config/documents.ts` |
| Add new calculator | `src/config/calculators.ts` |
| Change UI text | Component files or `src/config/constants.ts` |
| Add new component | `src/components/YourComponent.tsx` |
| Add new route | `src/App.tsx` |
| Change colors | Tailwind classes in components |
| Add animations | `src/index.css` |

---

## Troubleshooting

### Calculator not showing on home screen?
→ Check `isActive: true` in `documents.ts`

### Calculation returns wrong result?
→ Review `calculate` function in `calculators.ts`

### TypeScript errors?
→ Ensure all types are imported from `src/types/index.ts`

### Build fails?
→ Run `npm run build` and check error messages

### Styling not working?
→ Ensure Tailwind classes are spelled correctly

---

## Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check for linting errors
npm run type-check      # TypeScript type checking
```

---

## Next Steps

1. ✅ Explore the existing Busta Paga calculator
2. ✅ Read through the code comments
3. ✅ Try adding a simple calculator
4. ✅ Customize the styling
5. ✅ Deploy to production!

---

## Resources

- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev

---

**Happy coding!** 🚀

If you have questions, check:
1. This guide
2. README.md
3. ARCHITECTURE.md
4. Code comments
