import { track } from "@vercel/analytics";

// Custom events shown in Vercel → Analytics → Events.
// Wrapped so analytics can never break a user action.
export function trackEvent(name, props) {
  try {
    track(name, props);
  } catch {
    // ignore
  }
}
