import { useEffect, useRef } from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import { FaBluesky } from "react-icons/fa6";
import { footerStyles } from "../../styles/footer-styles";

const currentYear = new Date().getFullYear();
const copyrightText = `© ${currentYear} MTG Artist Connection`;

const KOFI_WIDGET_URL = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
const PAYPAL_SDK_URL = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";

// Load the Ko-fi inline widget SDK once globally
let kofiSdkPromise: Promise<void> | null = null;
function loadKofiSdk(): Promise<void> {
  if ((window as any).kofiwidget2) return Promise.resolve();
  if (kofiSdkPromise) return kofiSdkPromise;
  kofiSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KOFI_WIDGET_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      kofiSdkPromise = null;
      reject(new Error("Failed to load Ko-fi SDK"));
    };
    document.head.appendChild(script);
  });
  return kofiSdkPromise;
}

const KofiButton = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    renderedRef.current = false;

    loadKofiSdk()
      .then(() => {
        if (renderedRef.current || !el) return;
        const kofi = (window as any).kofiwidget2;
        if (!kofi) return;
        renderedRef.current = true;
        kofi.init("Support us", "#2d4a36", "Y8Y71T8GEF");
        el.innerHTML = kofi.getHTML();
        const anchor = el.querySelector("a");
        if (anchor && anchor.href) {
          anchor.href += "?utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=kofi_support_click";

          // Add click handler directly to the anchor tag
          anchor.addEventListener("click", (e) => {
            if ((window as any).gtag) {
              // Prevent immediate navigation
              e.preventDefault();

              // Fire GA event with callback
              (window as any).gtag("event", "kofi_support_click", {
                event_category: "donations",
                event_label: "kofi_footer",
                event_callback: () => {
                  // Navigate after event is sent
                  window.location.href = anchor.href;
                },
              });

              // Fallback: navigate after 300ms if callback doesn't fire
              setTimeout(() => {
                window.location.href = anchor.href;
              }, 300);
            }
          });
        }
      })
      .catch(console.error);

    return () => {
      renderedRef.current = true;
      if (el) el.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} />;
};

// Load the PayPal SDK once globally, reuse across mounts
let paypalSdkPromise: Promise<void> | null = null;
function loadPayPalSdk(): Promise<void> {
  if ((window as any).PayPal) return Promise.resolve();
  if (paypalSdkPromise) return paypalSdkPromise;
  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYPAL_SDK_URL;
    script.charset = "UTF-8";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      paypalSdkPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.head.appendChild(script);
  });
  return paypalSdkPromise;
}

const PayPalButton = () => {
  const renderedRef = useRef(false);

  useEffect(() => {
    renderedRef.current = false;
    loadPayPalSdk()
      .then(() => {
        if (renderedRef.current) return;
        const PayPal = (window as any).PayPal;
        if (!PayPal) return;
        renderedRef.current = true;
        PayPal.Donation.Button({
          env: "production",
          hosted_button_id: "MGFDPBZZ9PKGY",
          image: {
            src: "https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif",
            alt: "Donate with PayPal button",
            title: "PayPal - The safer, easier way to pay online!",
          },
        }).render("#paypal-donate-button");
      })
      .catch(console.error);

    return () => {
      renderedRef.current = true;
      const el = document.getElementById("paypal-donate-button");
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <div
      id="paypal-donate-button"
      onClick={() => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "paypal_support_click", {
            event_category: "donations",
            event_label: "paypal_footer",
            utm_source: "mtgartistconnection",
            utm_medium: "referral",
            utm_campaign: "paypal_support_click",
          });
        }
      }}
    />
  );
};

const Footer = () => {
  return (
    <>
      <Box sx={footerStyles.supportBanner}>
        <Container>
          <Box sx={footerStyles.supportBannerInner}>
            <Typography sx={footerStyles.supportHeading}>
              Enjoying MTG Artist Connection?
            </Typography>
            <Typography sx={footerStyles.supportBody}>
              If this site helped you find an artist, track down a signature, or
              prep for a convention, consider supporting it.
            </Typography>
            <Box sx={footerStyles.supportActions}>
              <KofiButton />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  Prefer PayPal? Donate here
                </Typography>
                <PayPalButton />
              </Box>
            </Box>
            <Typography sx={footerStyles.supportSubtext}>
              MTG Artist Connection is free to use and run by the community —
              support helps keep it updated, ad-light, and growing.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Box sx={footerStyles.footerContainer}>
        <Container>
          <Box sx={footerStyles.footerContent}>
            <Typography sx={footerStyles.footerText}>{copyrightText}</Typography>
            <Box sx={footerStyles.footerLinks}>
              <Link href="/privacypolicy" sx={footerStyles.link}>Privacy Policy</Link>
              <Link href="/termsofservice" sx={footerStyles.link}>Terms of Service</Link>
              <Link href="/affiliate-disclosure" sx={footerStyles.link}>Affiliate Disclosure</Link>
              <Link href="/contact" sx={footerStyles.link}>Contact</Link>
              <Link href="https://bsky.app/profile/mtgartistconnect.bsky.social" target="_blank" rel="noopener noreferrer" sx={footerStyles.iconLink}>
                <FaBluesky size={20} />
              </Link>
              <Link href="https://www.manapool.com?ref=mtgartistconnection" target="_blank" rel="noopener noreferrer" sx={footerStyles.iconLink}>
                <img
                  src="/MP_Badges_partner_light.svg"
                  alt="Manapool Partner"
                  style={{ height: '20px', width: 'auto' }}
                />
              </Link>
            </Box>
            <Typography sx={{
              fontSize: '0.75rem',
              color: '#9e9e9e',
              textAlign: 'center',
              marginTop: 1,
              maxWidth: '800px',
              margin: '8px auto 0',
            }}>
              MTG Artist Connection is a participant in affiliate programs with eBay, Original Magic Art, and Manapool.
              When you purchase through these links, you support this site at no additional cost to you.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Footer;