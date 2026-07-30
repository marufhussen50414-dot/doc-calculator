# 📚 Formula Examples & Patterns

This document provides examples of different calculator formulas you can implement.

## Pattern 1: Simple Addition/Subtraction

**Example**: Net = Gross - Deductions

```typescript
export const SIMPLE_CALCULATOR: CalculatorConfig = {
  id: 'simple',
  name: 'Simple Calculator',
  fields: [
    { id: 'gross', label: 'Gross Amount' },
    { id: 'deductions', label: 'Deductions' },
    { id: 'net', label: 'Net Amount' },
  ],
  calculate: (inputs, outputField) => {
    const { gross = 0, deductions = 0, net = 0 } = inputs;
    
    switch (outputField) {
      case 'net':
        return gross - deductions;
      case 'gross':
        return net + deductions;
      case 'deductions':
        return gross - net;
      default:
        return null;
    }
  },
};
```

---

## Pattern 2: Percentage Calculations

**Example**: Tax = Income × Rate

```typescript
export const PERCENTAGE_CALCULATOR: CalculatorConfig = {
  id: 'percentage',
  name: 'Percentage Calculator',
  fields: [
    { id: 'amount', label: 'Amount' },
    { id: 'percentage', label: 'Percentage (%)' },
    { id: 'result', label: 'Result' },
  ],
  calculate: (inputs, outputField) => {
    const { amount = 0, percentage = 0, result = 0 } = inputs;
    
    switch (outputField) {
      case 'result':
        return amount * (percentage / 100);
      case 'amount':
        return (result / percentage) * 100;
      case 'percentage':
        return (result / amount) * 100;
      default:
        return null;
    }
  },
};
```

---

## Pattern 3: Multi-Step Calculations

**Example**: Busta Paga (Current Implementation)

```typescript
// Formula: NETTO = COMPETENZE - (TRATTENUTE + ARR_PREV) + ARR_CURR

export const MULTI_STEP_CALCULATOR: CalculatorConfig = {
  id: 'multi-step',
  name: 'Multi-Step Calculator',
  fields: [
    { id: 'a', label: 'Value A' },
    { id: 'b', label: 'Value B' },
    { id: 'c', label: 'Value C' },
    { id: 'd', label: 'Value D' },
    { id: 'result', label: 'Result' },
  ],
  calculate: (inputs, outputField) => {
    const { a = 0, b = 0, c = 0, d = 0, result = 0 } = inputs;
    
    // Formula: result = a - (b + c) + d
    switch (outputField) {
      case 'result':
        return a - (b + c) + d;
      case 'a':
        return result + (b + c) - d;
      case 'b':
        return a - result - c + d;
      case 'c':
        return a - result - b + d;
      case 'd':
        return result + b + c - a;
      default:
        return null;
    }
  },
};
```

---

## Pattern 4: Compound Interest

**Example**: Future Value Calculator

```typescript
export const COMPOUND_INTEREST_CALCULATOR: CalculatorConfig = {
  id: 'compound-interest',
  name: 'Compound Interest',
  fields: [
    { id: 'principal', label: 'Principal (P)' },
    { id: 'rate', label: 'Interest Rate (% annual)' },
    { id: 'time', label: 'Time (years)' },
    { id: 'future_value', label: 'Future Value (FV)' },
  ],
  calculate: (inputs, outputField) => {
    const { principal = 0, rate = 0, time = 0, future_value = 0 } = inputs;
    
    // Formula: FV = P(1 + r)^t
    switch (outputField) {
      case 'future_value':
        return principal * Math.pow(1 + (rate / 100), time);
      case 'principal':
        return future_value / Math.pow(1 + (rate / 100), time);
      case 'rate':
        return (Math.pow(future_value / principal, 1 / time) - 1) * 100;
      case 'time':
        return Math.log(future_value / principal) / Math.log(1 + (rate / 100));
      default:
        return null;
    }
  },
};
```

---

## Pattern 5: Ratios and Proportions

**Example**: Proportion Calculator

```typescript
export const PROPORTION_CALCULATOR: CalculatorConfig = {
  id: 'proportion',
  name: 'Proportion Calculator',
  fields: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
    { id: 'x', label: 'X' },
  ],
  calculate: (inputs, outputField) => {
    const { a = 0, b = 0, c = 0, x = 0 } = inputs;
    
    // Formula: A/B = C/X  →  A×X = B×C
    switch (outputField) {
      case 'x':
        return (b * c) / a;
      case 'a':
        return (b * c) / x;
      case 'b':
        return (a * x) / c;
      case 'c':
        return (a * x) / b;
      default:
        return null;
    }
  },
};
```

---

## Pattern 6: Multiple Operations

**Example**: VAT Calculator

```typescript
export const VAT_CALCULATOR: CalculatorConfig = {
  id: 'vat',
  name: 'VAT Calculator',
  fields: [
    { id: 'net_price', label: 'Net Price (excl. VAT)' },
    { id: 'vat_rate', label: 'VAT Rate (%)' },
    { id: 'vat_amount', label: 'VAT Amount' },
    { id: 'gross_price', label: 'Gross Price (incl. VAT)' },
  ],
  calculate: (inputs, outputField) => {
    const { net_price = 0, vat_rate = 0, vat_amount = 0, gross_price = 0 } = inputs;
    
    switch (outputField) {
      case 'vat_amount':
        return net_price * (vat_rate / 100);
      
      case 'gross_price':
        return net_price + (net_price * (vat_rate / 100));
      
      case 'net_price':
        if (vat_amount > 0) {
          return (vat_amount / vat_rate) * 100;
        }
        return gross_price / (1 + (vat_rate / 100));
      
      case 'vat_rate':
        if (vat_amount > 0 && net_price > 0) {
          return (vat_amount / net_price) * 100;
        }
        return ((gross_price - net_price) / net_price) * 100;
      
      default:
        return null;
    }
  },
};
```

---

## Pattern 7: Conditional Logic

**Example**: Progressive Tax Calculator

```typescript
export const PROGRESSIVE_TAX_CALCULATOR: CalculatorConfig = {
  id: 'progressive-tax',
  name: 'Progressive Tax',
  fields: [
    { id: 'income', label: 'Annual Income' },
    { id: 'tax', label: 'Tax Amount' },
  ],
  calculate: (inputs, outputField) => {
    const { income = 0 } = inputs;
    
    // Example progressive tax brackets
    const calculateTax = (amount: number): number => {
      if (amount <= 15000) {
        return amount * 0.23; // 23%
      } else if (amount <= 28000) {
        return 3450 + (amount - 15000) * 0.27; // 27%
      } else if (amount <= 55000) {
        return 6960 + (amount - 28000) * 0.38; // 38%
      } else {
        return 17220 + (amount - 55000) * 0.41; // 41%
      }
    };
    
    switch (outputField) {
      case 'tax':
        return calculateTax(income);
      
      // Note: Reverse calculation for progressive tax is complex
      case 'income':
        // Would require iterative approximation
        return null;
      
      default:
        return null;
    }
  },
};
```

---

## Pattern 8: Time-Based Calculations

**Example**: Hourly Rate Calculator

```typescript
export const HOURLY_RATE_CALCULATOR: CalculatorConfig = {
  id: 'hourly-rate',
  name: 'Hourly Rate',
  fields: [
    { id: 'hours', label: 'Hours Worked' },
    { id: 'rate', label: 'Hourly Rate' },
    { id: 'total', label: 'Total Payment' },
  ],
  calculate: (inputs, outputField) => {
    const { hours = 0, rate = 0, total = 0 } = inputs;
    
    switch (outputField) {
      case 'total':
        return hours * rate;
      case 'hours':
        return total / rate;
      case 'rate':
        return total / hours;
      default:
        return null;
    }
  },
};
```

---

## Pattern 9: Area/Volume Calculations

**Example**: Rectangle Area

```typescript
export const RECTANGLE_CALCULATOR: CalculatorConfig = {
  id: 'rectangle',
  name: 'Rectangle Calculator',
  fields: [
    { id: 'length', label: 'Length' },
    { id: 'width', label: 'Width' },
    { id: 'area', label: 'Area' },
    { id: 'perimeter', label: 'Perimeter' },
  ],
  calculate: (inputs, outputField) => {
    const { length = 0, width = 0, area = 0, perimeter = 0 } = inputs;
    
    switch (outputField) {
      case 'area':
        return length * width;
      
      case 'perimeter':
        return 2 * (length + width);
      
      case 'length':
        if (area > 0) return area / width;
        if (perimeter > 0) return (perimeter / 2) - width;
        return null;
      
      case 'width':
        if (area > 0) return area / length;
        if (perimeter > 0) return (perimeter / 2) - length;
        return null;
      
      default:
        return null;
    }
  },
};
```

---

## Pattern 10: Loan/Mortgage Calculations

**Example**: Simple Loan Calculator

```typescript
export const LOAN_CALCULATOR: CalculatorConfig = {
  id: 'loan',
  name: 'Loan Calculator',
  fields: [
    { id: 'principal', label: 'Loan Amount' },
    { id: 'rate', label: 'Interest Rate (% annual)' },
    { id: 'months', label: 'Number of Months' },
    { id: 'monthly_payment', label: 'Monthly Payment' },
  ],
  calculate: (inputs, outputField) => {
    const { principal = 0, rate = 0, months = 0, monthly_payment = 0 } = inputs;
    
    // Monthly interest rate
    const r = (rate / 100) / 12;
    
    switch (outputField) {
      case 'monthly_payment':
        if (r === 0) return principal / months;
        return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      
      case 'principal':
        if (r === 0) return monthly_payment * months;
        return monthly_payment * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
      
      // Note: Solving for rate and months requires numerical methods
      case 'rate':
      case 'months':
        return null; // Complex - would need iterative solution
      
      default:
        return null;
    }
  },
};
```

---

## Tips for Creating Formulas

### 1. **Test Each Case**
```typescript
// Always test all output field scenarios
console.log(calculate({ a: 10, b: 5 }, 'c')); // Should work
console.log(calculate({ a: 10, c: 15 }, 'b')); // Should work
console.log(calculate({ b: 5, c: 15 }, 'a')); // Should work
```

### 2. **Handle Division by Zero**
```typescript
case 'result':
  if (denominator === 0) return null; // Or throw error
  return numerator / denominator;
```

### 3. **Round Appropriately**
```typescript
// For currency
return Math.round(value * 100) / 100;

// For percentages
return Math.round(value * 10000) / 100; // 2 decimal places
```

### 4. **Document Complex Formulas**
```typescript
/**
 * Formula: Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * - P = Principal loan amount
 * - r = Monthly interest rate (annual rate / 12)
 * - n = Number of months
 */
```

### 5. **Validate Input Ranges**
```typescript
calculate: (inputs, outputField) => {
  // Validate inputs
  if (inputs.percentage < 0 || inputs.percentage > 100) {
    return null; // Invalid percentage
  }
  // ... rest of calculation
}
```

---

## Real-World Italian Document Calculators

### TFR (Trattamento Fine Rapporto)

```typescript
export const TFR_CALCULATOR: CalculatorConfig = {
  id: 'tfr',
  name: 'TFR Calculator',
  fields: [
    { id: 'annual_salary', label: 'Retribuzione Annua Lorda' },
    { id: 'years', label: 'Anni di Servizio' },
    { id: 'tfr_amount', label: 'TFR Maturato' },
  ],
  calculate: (inputs, outputField) => {
    const { annual_salary = 0, years = 0, tfr_amount = 0 } = inputs;
    
    // TFR = (Retribuzione Annua / 13.5) × Anni
    switch (outputField) {
      case 'tfr_amount':
        return (annual_salary / 13.5) * years;
      case 'annual_salary':
        return (tfr_amount / years) * 13.5;
      case 'years':
        return tfr_amount / (annual_salary / 13.5);
      default:
        return null;
    }
  },
};
```

---

**Want to add your own?** Copy any pattern above and modify it to your needs!
