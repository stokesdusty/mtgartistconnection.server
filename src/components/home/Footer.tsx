import { useEffect, useRef } from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import { FaBluesky } from "react-icons/fa6";
import { footerStyles } from "../../styles/footer-styles";
import { colors, spacing } from "../../styles/design-tokens";

const currentYear = new Date().getFullYear();
const copyrightText = `© ${currentYear} MTG Artist Connection`;

const KOFI_WIDGET_URL = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";

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
        kofi.init("Support us", colors.primary.main, "Y8Y71T8GEF");
        el.innerHTML = kofi.getHTML();
        const anchor = el.querySelector("a");
        if (anchor && anchor.href) {
          anchor.href += "?utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=kofi_support_click";
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";

          anchor.addEventListener("click", (e) => {
            if ((window as any).gtag) {
              e.preventDefault();

              (window as any).gtag("event", "kofi_support_click", {
                event_category: "donations",
                event_label: "kofi_footer",
                event_callback: () => {
                  window.open(anchor.href, "_blank", "noopener,noreferrer");
                },
              });

              setTimeout(() => {
                window.open(anchor.href, "_blank", "noopener,noreferrer");
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

const Footer = () => {
  return (
    <>
      <Box sx={footerStyles.supportBanner}>
        <Container>
          <Box sx={footerStyles.supportBannerInner}>
            <Typography component="span" sx={footerStyles.supportText}>
              Enjoying the site?
            </Typography>
            <KofiButton />
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
              color: colors.neutral[500],
              textAlign: 'center',
              marginTop: 1,
              maxWidth: '800px',
              margin: `${spacing.sm} auto 0`,
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