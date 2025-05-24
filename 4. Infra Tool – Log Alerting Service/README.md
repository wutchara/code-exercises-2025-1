## ⚙️ 4. Infra Tool – Log Alerting Service

### Problem
Create a service that watches a log file and sends an alert when specific keywords are detected.

<br />

### Features
- Real-time log file monitoring
- Support for keyword patterns
- Alert via webhook or email
- Configurable via YAML/JSON
- Optional: containerized with Docker

<br />

### Sample Config
```yaml
keywords:
  - "ERROR"
  - "timeout"
alert:
  type: "webhook"
  url: "https://hooks.example.com/alert"
```

<br />

### Skills Practiced
- File system event handling
- Config-driven design
- Webhook/email integrations
- Containerization (optional)
