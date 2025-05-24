## 📦 5. Advanced TypeScript – Dynamic Form Builder

### Problem
Build a React (or Vue/Svelte) component that dynamically renders a form based on a provided schema.

<br />

### Sample Schema Input
```json
{
  "title": "User Registration",
  "fields": [
    { "name": "username", "type": "text", "required": true },
    { "name": "age", "type": "number", "min": 18 },
    { "name": "newsletter", "type": "checkbox" }
  ]
}
```

<br />

### Expected Behavior
- Render correct input types
- Show validation errors
- Emit validated form data on submit

### Skills Practiced
- TypeScript generics & type safety
- Dynamic component rendering
- Validation schema handling
- Modular form architecture