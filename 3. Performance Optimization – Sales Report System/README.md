## 📈 3. Performance Optimization – Sales Report System

### Problem
A reporting endpoint is taking 2–3 seconds to respond. Your task is to reduce this to under 300ms while maintaining accuracy.

<br />

### Sample Scenario
```sql
SELECT SUM(amount) 
FROM sales 
WHERE store_id = 1001 
AND sale_date BETWEEN '2025-05-01' AND '2025-05-31'
```

<br />

### Optimization Goals
- Index tuning
- Caching frequent queries
- Parallelization or batching
- Background pre-aggregation (e.g., hourly rollups)

### Skills Practiced
- Query performance profiling
- Caching strategies (e.g., Redis)
- Asynchronous processing
- Database indexing


