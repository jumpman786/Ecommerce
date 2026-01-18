// src/lib/posthog.js (rename from .ts to .js)
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_KEY,
  {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    captureAppLifecycleEvents: true,
  }
);

export async function initPostHog() {
  try {
    await posthog.register({
      app_version: '1.0.0',
      platform: 'mobile',
    });
    console.log('✅ PostHog initialized successfully');
  } catch (error) {
    console.error('❌ PostHog initialization failed:', error);
  }
}