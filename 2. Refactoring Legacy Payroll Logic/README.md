## 🔄 2. Refactoring Legacy Payroll Logic

### Problem
You are given a payroll calculation module filled with deeply nested if-else blocks. Refactor the code to make it more maintainable, extensible, and testable.

<br />

### Example Input
```json
{
  "employee_type": "contractor",
  "working_hours": 120,
  "bonus": true
}
```

<br />

### Legacy Output
```json
{
  "total_pay": 50000
}
```

<br />

### Goal
Refactor using patterns like Strategy or Chain of Responsibility to support:
- New employee types
- Custom tax/billing logic
- Separated bonus calculation

<br />

### Skills Practiced
- Clean code & separation of concerns
- Design patterns
- Unit testing & mockability
