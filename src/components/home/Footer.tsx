import { MouseEvent } from "react";
import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Heart } from "@phosphor-icons/react";
import { footerStyles } from "../../styles/footer-styles";

const currentYear = new Date().getFullYear();

const KOFI_URL =
  "https://ko-fi.com/Y8Y71T8GEF?utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=kofi_support_click";

// Send the GA event before leaving; open the page from the event callback, or
// after 300ms if gtag never calls back (blocked/slow). Opens at most once.
const handleKofiClick = (e: MouseEvent<HTMLAnchorElement>) => {
  const gtag = (window as any).gtag;
  if (!gtag) return;
  e.preventDefault();

  let opened = false;
  const openKofi = () => {
    if (opened) return;
    opened = true;
    window.open(KOFI_URL, "_blank", "noopener,noreferrer");
  };

  gtag("event", "kofi_support_click", {
    event_category: "donations",
    event_label: "kofi_footer",
    event_callback: openKofi,
  });
  setTimeout(openKofi, 300);
};

const Footer = () => {
  return (
    <Box sx={footerStyles.footer}>
      <Box sx={footerStyles.mainRow}>
        <Box sx={footerStyles.supportRow}>
          <Box component="span" sx={footerStyles.supportText}>Enjoying the site?</Box>
          <Box
            component="a"
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleKofiClick}
            sx={footerStyles.supportButton}
          >
            Support us <Heart size={13} weight="fill" aria-hidden />
          </Box>
        </Box>

        <Box component="nav" aria-label="Footer" sx={footerStyles.links}>
          <Link component={RouterLink} to="/privacypolicy" sx={footerStyles.link}>Privacy</Link>
          <Link component={RouterLink} to="/termsofservice" sx={footerStyles.link}>Terms</Link>
          <Link component={RouterLink} to="/affiliate-disclosure" sx={footerStyles.link}>Affiliate Disclosure</Link>
          <Link component={RouterLink} to="/contact" sx={footerStyles.link}>Contact</Link>
          <Link href="https://bsky.app/profile/mtgartistconnect.bsky.social" target="_blank" rel="noopener noreferrer" sx={footerStyles.link}>
            Bluesky
          </Link>
          <Box component="span" sx={footerStyles.copyright}>
            © {currentYear}<Box component="span" sx={footerStyles.copyrightName}> MTG Artist Connection</Box>
          </Box>
        </Box>
      </Box>

      <Box sx={footerStyles.disclosureRow}>
        <Box component="p" sx={footerStyles.disclosure}>
          MTG Artist Connection is a participant in affiliate programs with eBay, Original Magic Art, and Manapool.
          When you purchase through these links, you support this site at no additional cost to you.
        </Box>
        <Link
          href="https://www.manapool.com?ref=mtgartistconnection"
          target="_blank"
          rel="noopener noreferrer"
          sx={footerStyles.partnerBadge}
        >
          <img src="/MP_Badges_partner_light.svg" alt="Manapool Partner" />
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
