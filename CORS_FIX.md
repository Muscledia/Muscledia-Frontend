# CORS Issue Fix for Muscledia

## Problem
When testing the app in a **web browser**, you're getting "Network Error" because of CORS (Cross-Origin Resource Sharing) restrictions. The browser blocks requests from `http://localhost:[PORT]` to `http://localhost:8080`.

## Quick Solutions

### Solution 1: Test on iOS Simulator (RECOMMENDED) ✅

1. In your terminal where Expo is running, press `i`
2. This will open the iOS Simulator
3. Try logging in/registering - it should work!

**Why this works:** Native apps don't have CORS restrictions.

### Solution 2: Test on Physical Device

1. Make sure your phone and computer are on the same WiFi network
2. In your terminal where Expo is running, you'll see a QR code
3. Scan it with your phone using:
   - iOS: Camera app
   - Android: Expo Go app
4. The app will open and use `http://192.168.1.45:8080` (your computer's IP)

### Solution 3: Configure Backend CORS for Web Testing

If you need to test on web, you need to configure your backend to allow the Expo web dev server origin.

#### Find your Expo web port:
When you open the app in browser, check the URL. It's usually:
- `http://localhost:8081`
- `http://localhost:19006` 
- Or check your terminal for "Web: http://localhost:[PORT]"

#### Update Backend CORS Configuration:

Your backend is running in Docker. You need to update the CORS configuration to allow your Expo web origin.

**For Spring Boot backend**, find and update your CORS configuration (usually in a `WebConfig` or `SecurityConfig` file):

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:8081",     // Add these
                "http://localhost:19006",     // Expo web ports
                "http://localhost:19000"      // 
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .exposedHeaders("Authorization")
            .allowCredentials(true);
    }
}
```

Then rebuild and restart your Docker container.

## Current API Configuration

Your `config/api.ts` is set up correctly:
- **iOS Simulator:** `http://localhost:8080` ✅
- **Android Emulator:** `http://10.0.2.2:8080` ✅
- **Physical Device:** `http://192.168.1.45:8080` ✅

## Recommendation

**Use iOS Simulator or a physical device for testing.** Web testing with React Native/Expo often has CORS complications that aren't present in production native builds.

