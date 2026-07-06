const GA_MEASUREMENT_ID = "G-GGY95C3RHZ";

let gaLoaded = false;

// Injects gtag.js and starts sending events. Only call this after the user
// has accepted the cookie-consent banner (see CookieConsentBanner.tsx).
export function loadGoogleAnalytics(): void {
  if (gaLoaded || (window as any).gtag) return;
  gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: unknown[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}
