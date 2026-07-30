# 🚀 Quick Reference Guide

## Busta Paga Calculator - Quick Commands

### 🎯 Standard Mode (Quick Calculation)
```
1. Click "🎯 Standard"
2. Select output field
3. Enter 4 input values
4. Click "Calcola"
```
**Time**: ~30 seconds

---

### 🎪 Target Mode (Goal Planning)
```
1. Click "🎪 Target"
2. Select target field → Set target value
3. Select adjustment field
4. Enter current values
5. Click "Calcola Aggiustamento"
6. Review suggestion
```
**Time**: ~1 minute

---

### 🔢 Multi Mode (Batch Calculate)
```
1. Click "🔢 Multi"
2. Select 2+ output fields
3. Enter remaining values
4. Click "Calcola Tutti"
```
**Time**: ~45 seconds

---

### 📐 View Formula
```
Click "Visualizza Formula..." at bottom → Read → Close
```

---

## Common Tasks

### Task: Verify my payslip
**Use**: 🎯 Standard Mode
- Select: NETTO IN BUSTA
- Enter: Other 4 values from payslip
- Compare result with actual netto

### Task: "I want €2,000 net"
**Use**: 🎪 Target Mode
- Target: NETTO IN BUSTA = €2,000
- Adjust: TOTALE COMPETENZE
- See: What gross salary you need

### Task: Calculate multiple unknowns
**Use**: 🔢 Multi Mode
- Select: Multiple output fields
- Enter: What you know
- Get: All unknowns at once

---

## Field Reference

| Field | Abbr. | Type | Can be - |
|-------|-------|------|----------|
| TOTALE COMPETENZE | TC | Input/Output | No |
| TOTALE TRATTENUTE | TT | Input/Output | No |
| ARR. PRECED. | AP | Input/Output | Yes ± |
| ARR. ATTUALE | AA | Input/Output | Yes ± |
| NETTO IN BUSTA | NIB | Input/Output | No |

---

## Formula (Quick)

```
NIB = TC - (TT + AP) + AA
```

Or rearranged:
```
NIB = TC - TT - AP + AA
```

---

## Keyboard Shortcuts (Future)

Currently all mouse/touch. Future:
- `Tab` - Next field
- `Enter` - Calculate
- `Esc` - Close modal
- `Ctrl+R` - Reset

---

## Tips

### 💡 Pro Tips
1. Use **Standard** for daily work
2. Use **Target** for planning
3. Use **Multi** when you have partial data
4. Check **Formula** if unsure

### ⚡ Speed Tips
1. Keep common values ready
2. Use Target mode "Apply" to save time
3. Multi mode for batch work
4. Reset before switching modes

### ✅ Accuracy Tips
1. Double-check input values
2. Watch for negative signs (±)
3. ARR fields can be negative
4. Compare with actual payslip

---

## Troubleshooting

### Result seems wrong?
1. Check all inputs are correct
2. Verify negative/positive signs
3. Check you're in right mode
4. View formula to understand

### Can't select a field?
- In Standard: Only 1 output allowed
- In Multi: At least 1 must be output
- Some fields may be auto-excluded

### Button won't click?
- Check all required fields are filled
- Try Reset and start over
- Refresh page if needed

---

## Mobile Quick Guide

### Portrait (Phone)
- Single column layout
- Scroll to see all options
- Larger buttons for touch
- Swipe through results

### Landscape (Tablet)
- 2-column layout
- Side-by-side inputs
- More visible at once
- Touch-optimized

---

## Example Workflows

### 1. Verify Last Payslip
```
Mode: Standard
Output: NETTO IN BUSTA
Inputs: (from payslip)
- TOTALE COMPETENZE: €2,450
- TOTALE TRATTENUTE: €785
- ARR. PRECED.: €0
- ARR. ATTUALE: €0
Calculate → Compare
```

### 2. Plan Raise Request
```
Mode: Target
Target Field: NETTO IN BUSTA
Target Value: €2,000 (desired)
Adjust Field: TOTALE COMPETENZE
Current Values: (your current situation)
Calculate → See required gross
```

### 3. Understand Bonus Impact
```
Mode: Standard
Output: NETTO IN BUSTA
Inputs: (add bonus to competenze)
- TOTALE COMPETENZE: €2,450 + €500
Calculate → See new netto
```

### 4. Tax Impact Analysis
```
Mode: Multi
Outputs: NETTO + ARR_ATTUALE
Inputs: Vary TRATTENUTE
Calculate → Compare scenarios
```

---

## Remember

- 💾 **No data saved** - everything resets on refresh
- 🔒 **Private** - all calculations local
- ⚡ **Instant** - no waiting for servers
- 📱 **Works offline** - no internet needed (after load)

---

## Get Help

1. Read **Formula Modal** (comprehensive)
2. Check **Info Section** (bottom of page)
3. Review **FEATURES.md** (detailed guide)
4. See **Examples** in documentation

---

## File Locations

```
Documentation/
├── README.md              - Main guide
├── FEATURES.md           - Feature details
├── UPDATES_SUMMARY.md    - What's new
├── QUICK_REFERENCE.md    - This file
└── ARCHITECTURE.md       - Technical docs
```

---

**Need more detail? Check FEATURES.md**
**Want to understand code? Check ARCHITECTURE.md**
**New to the app? Start with README.md**
