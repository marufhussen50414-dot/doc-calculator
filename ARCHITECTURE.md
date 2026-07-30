# 🏛️ Architecture Documentation

## Overview

This application uses a **config-driven, modular architecture** that makes it easy to add, modify, or remove document calculators without touching the core codebase.

## Core Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI logic, no business rules
- **Config**: All document types, fields, and formulas
- **Types**: Centralized TypeScript definitions
- **Utils**: Reusable helper functions

### 2. **Single Source of Truth**
- Document types → `src/config/documents.ts`
- Calculator logic → `src/config/calculators.ts`
- App constants → `src/config/constants.ts`

### 3. **Type Safety**
- Full TypeScript implementation
- No `any` types
- Strict type checking enabled

## File Structure Deep Dive

```
src/
├── components/              # React Components
│   ├── HomePage.tsx        # Document selection grid
│   ├── BustaPaga.tsx       # Busta Paga calculator UI
│   └── CertificazioneUnica.tsx  # CU placeholder
│
├── config/                 # Configuration (Modify here!)
│   ├── documents.ts        # Document type registry
│   ├── calculators.ts      # Calculator configurations
│   └── constants.ts        # App-wide constants
│
├── types/                  # TypeScript Definitions
│   └── index.ts            # All type definitions
│
├── utils/                  # Utility Functions
│   └── cn.ts              # Class name utilities
│
├── App.tsx                 # Main app + routing
├── main.tsx               # React entry point
└── index.css              # Global styles + animations
```

## Data Flow

```
User Interaction
       ↓
   Component (UI)
       ↓
   Config (Logic)
       ↓
  Calculation Engine
       ↓
    Result Display
```

## Key Concepts

### Document Types (`DocumentType`)

Defines a document option on the home screen:

```typescript
interface DocumentType {
  id: string;           // Unique identifier
  name: string;         // Display name
  description: string;  // Short description
  isActive: boolean;    // Whether it's clickable
  icon: string;         // Emoji/icon for the card
}
```

**Location**: `src/config/documents.ts`

### Calculator Configuration (`CalculatorConfig`)

Defines how a calculator works:

```typescript
interface CalculatorConfig {
  id: string;              // Matches document ID
  name: string;            // Calculator name
  fields: CalculatorField[]; // All input/output fields
  calculate: (inputs, outputField) => number | null; // The magic!
}
```

**Location**: `src/config/calculators.ts`

### Calculator Fields (`CalculatorField`)

Individual fields in a calculator:

```typescript
interface CalculatorField {
  id: string;          // Unique field ID
  label: string;       // Display label
  description?: string; // Help text
  sign?: '+' | '-';    // Optional: can be negative
}
```

## How Calculations Work

### Busta Paga Example

1. **User selects output field**: e.g., "NETTO IN BUSTA"
2. **User inputs other fields**: Competenze, Trattenute, etc.
3. **Calculate function is called**:
   ```typescript
   calculate(inputs, 'netto_busta') → result
   ```
4. **Switch statement determines formula**:
   ```typescript
   switch (outputField) {
     case 'netto_busta':
       return totale_competenze - (totale_trattenute + arr_preced) + arr_attuale;
     // ... other cases
   }
   ```

### Adding Your Own Formula

To add a new calculator:

```typescript
// 1. Define the calculator config
export const MY_CALCULATOR: CalculatorConfig = {
  id: 'my-document',
  name: 'My Calculator',
  fields: [
    { id: 'field_a', label: 'Field A' },
    { id: 'field_b', label: 'Field B' },
    { id: 'result', label: 'Result' },
  ],
  calculate: (inputs, outputField) => {
    const { field_a = 0, field_b = 0, result = 0 } = inputs;
    
    switch (outputField) {
      case 'result':
        return field_a + field_b; // Your formula
      case 'field_a':
        return result - field_b;  // Reverse calculation
      case 'field_b':
        return result - field_a;  // Reverse calculation
      default:
        return null;
    }
  },
};

// 2. Register it
export const CALCULATORS = {
  'busta-paga': BUSTA_PAGA_CALCULATOR,
  'my-document': MY_CALCULATOR, // Add here
};
```

## Component Communication

### Parent → Child (Props)
```typescript
<BustaPaga onBack={handleBackToHome} />
```

### Child → Parent (Callbacks)
```typescript
// In child component
<button onClick={onBack}>Back</button>

// Parent receives the event
const handleBackToHome = () => { /* ... */ };
```

### State Management

Currently using **React useState** for simplicity.

For larger apps, consider:
- **React Context** for global state
- **Redux** for complex state management
- **Zustand** for lightweight state

## Routing Strategy

**Current**: Simple state-based routing
```typescript
const [currentView, setCurrentView] = useState('home');
```

**Future**: Consider React Router for:
- Deep linking
- Browser history
- URL parameters

## Styling Approach

**Tailwind CSS** with utility classes:

```typescript
// Good: Reusable, responsive, maintainable
<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl">

// Avoid: Inline styles
<div style={{ backgroundColor: 'white', padding: '24px' }}>
```

### Custom Animations

Defined in `src/index.css`:
```css
@keyframes fadeIn { /* ... */ }
.animate-fadeIn { /* ... */ }
```

## Type Safety Strategy

### 1. Define Types First
```typescript
// src/types/index.ts
export interface CalculatorInputs {
  [fieldId: string]: number;
}
```

### 2. Use Types Everywhere
```typescript
const [inputs, setInputs] = useState<CalculatorInputs>({});
```

### 3. No Type Assertions
Avoid `as any` or `as unknown` unless absolutely necessary.

## Adding New Features

### Adding a New Calculator

**Step-by-step checklist:**

- [ ] Add document to `src/config/documents.ts`
- [ ] Create calculator config in `src/config/calculators.ts`
- [ ] Create component in `src/components/YourComponent.tsx`
- [ ] Add route case in `src/App.tsx`
- [ ] Test calculation logic
- [ ] Update README.md

### Adding New Fields to Existing Calculator

1. Update `fields` array in calculator config
2. Update `calculate` function to handle new field
3. Component automatically picks up new fields!

**No component changes needed!** ✨

## Performance Considerations

### Current Optimizations
- ✅ Component-based code splitting
- ✅ Minimal re-renders
- ✅ Tailwind CSS purging

### Future Optimizations
- [ ] React.memo for expensive components
- [ ] useMemo for complex calculations
- [ ] Lazy loading for calculator components

## Testing Strategy (Future)

Recommended test structure:

```
tests/
├── unit/
│   ├── calculators.test.ts  # Test calculation logic
│   └── components.test.tsx  # Test UI components
├── integration/
│   └── flows.test.tsx       # Test user flows
└── e2e/
    └── scenarios.test.ts    # End-to-end tests
```

## Deployment

### Build Command
```bash
npm run build
```

### Output
- Single HTML file in `dist/index.html`
- All CSS and JS inlined
- Ready for static hosting

### Hosting Options
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ IE11 not supported (uses modern ES6+ features)

## Future Enhancements

### Planned Features
1. **Export Results**: PDF/Excel export
2. **Save History**: LocalStorage for calculations
3. **Dark Mode**: Theme switcher
4. **Multi-language**: i18n support
5. **Formulas Library**: Pre-built formula templates

### Architecture Improvements
1. **Context API**: Global state management
2. **React Router**: Proper routing
3. **Form Validation**: Zod/Yup integration
4. **Error Boundaries**: Better error handling
5. **Loading States**: Skeleton screens

## Common Patterns

### Pattern 1: Config-Driven Components

```typescript
// ✅ Good: Data-driven
fields.map(field => <Input key={field.id} {...field} />)

// ❌ Avoid: Hardcoded
<Input label="Field 1" />
<Input label="Field 2" />
```

### Pattern 2: Composition

```typescript
// ✅ Good: Composable components
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>

// ❌ Avoid: Monolithic components
<CardWithEverything title="..." body="..." />
```

### Pattern 3: Props vs State

```typescript
// ✅ Props: Data from parent
<BustaPaga onBack={handler} />

// ✅ State: Internal component data
const [inputs, setInputs] = useState({});
```

## Debugging Tips

### 1. Check Config First
If a document doesn't show → Check `documents.ts`
If calculation is wrong → Check `calculators.ts`

### 2. Console Logging
```typescript
console.log('Inputs:', inputs);
console.log('Result:', result);
```

### 3. React DevTools
Install React DevTools extension to inspect:
- Component hierarchy
- Props and state
- Performance

## Questions?

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check README.md
4. Inspect config files

---

**Remember**: The power of this architecture is in its simplicity. Don't overcomplicate things!
