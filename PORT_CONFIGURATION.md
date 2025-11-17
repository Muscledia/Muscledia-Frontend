# Port Configuration

## Current Port Setup

### Backend Ports (DO NOT CHANGE)
- **Port 8080**: Backend API Gateway
- **Port 8081**: (Possibly another backend service)

### Frontend Port (Expo Metro Bundler)
- **Port 19000**: Expo development server (configured in package.json)

## How to Change Expo Port

If you need to use a different port for Expo, update the `dev` script in `package.json`:

```json
"scripts": {
  "dev": "cross-env EXPO_NO_TELEMETRY=1 expo start --port YOUR_PORT_NUMBER"
}
```

### Common Port Options
- **19000** - Default Expo Go port (current setting)
- **19001** - Alternative Expo port
- **3000** - Common React/Node.js port (if available)
- **8082** - Next sequential port after backend

## Running the App

```bash
npm run dev
```

This will start the Expo server on port 19000.

## Troubleshooting

### If Port 19000 is Also in Use

1. **Check what's using the port:**
   ```bash
   lsof -ti:19000
   ```

2. **Kill the process if needed:**
   ```bash
   kill -9 $(lsof -ti:19000)
   ```

3. **Or use a different port:**
   Update package.json to use another port like 19001 or 8082

### If Expo Won't Start

1. **Clear Expo cache:**
   ```bash
   expo start -c --port 19000
   ```

2. **Clear Metro cache:**
   ```bash
   rm -rf node_modules/.cache
   ```

3. **Restart with clear cache:**
   ```bash
   npm run dev -- -c
   ```

## Backend Connection

The app connects to your backend via the configuration in `config/api.ts`:
- Development (iOS Simulator): `http://localhost:8080`
- Development (Android Emulator): `http://10.0.2.2:8080`
- Physical Device: Update with your computer's IP address

The Expo port (19000) is separate from the backend port (8080) and they don't conflict.

