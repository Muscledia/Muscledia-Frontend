# Muscledia Integration Specification

## 🔧 Dependencies Added

```json
{
    "@tanstack/react-query": "^5.90.5",     // Data fetching & caching
    "@tanstack/react-query-devtools": "^5.90.2",      // Debugging queries
    "axios": "^1.12.2",       // HTTP client
    "axios-retry": "^4.5.0",     // Request retry logic
}
```

types/
Request/Response interfaces matching backend DTOs


config/
api.ts - API endpoints and configurations
environment.ts - Environment-specific settings

Environment Management: Different URLs for dev/prod
Maintainability: Change endpoints in one place
Scalability: Easy to add new services
Security: Keep sensitive config separate


services/
Each service will handle one domain

providers/
QueryProvider.jsx - brain of the application, handles all API data, for example if we use the same fetch() func with this provider first one will be called, the second one will get data from smart caching (for example fetch(user with id:1);)