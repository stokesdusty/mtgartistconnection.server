import { ReactNode } from "react";
import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { artistStyles } from "../../styles/artist-styles";
import { vault } from "../../styles/design-tokens";

interface ExternalLinkCardProps {
  href: string;
  /** Mono source label, e.g. "Original Magic Art". */
  eyebrow: string;
  /** Shorter eyebrow for ≤600px, e.g. "OMA". */
  mobileEyebrow?: string;
  title: ReactNode;
  /** Shorter title for ≤600px, e.g. "Playmats". */
  mobileTitle?: ReactNode;
  /** Accessible name when the visible text is terse. */
  ariaLabel?: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  isInternal?: boolean;
  onClick?: () => void;
}

/** Desktop and mobile copies of a label; CSS shows one of them. */
const Responsive = ({ full, short }: { full: ReactNode; short?: ReactNode }) =>
  short === undefined ? (
    <>{full}</>
  ) : (
    <>
      <Box component="span" sx={artistStyles.desktopOnly}>{full}</Box>
      <Box component="span" sx={artistStyles.mobileOnly}>{short}</Box>
    </>
  );

const ExternalLinkCard = ({
  href,
  eyebrow,
  mobileEyebrow,
  title,
  mobileTitle,
  ariaLabel,
  variant = 'secondary',
  external = false,
  isInternal = false,
  onClick,
}: ExternalLinkCardProps) => {
  const Arrow = isInternal ? ArrowRight : ArrowUpRight;
  const sx = [
    artistStyles.linkCard,
    variant === 'primary' ? artistStyles.linkCardPrimary : artistStyles.linkCardSecondary,
  ];

  const content = (
    <>
      <Box
        component="span"
        sx={[artistStyles.linkCardEyebrow, { opacity: variant === 'primary' ? 0.85 : 1, color: variant === 'primary' ? 'inherit' : vault.faint }]}
      >
        <Responsive full={eyebrow} short={mobileEyebrow} />
      </Box>
      <Box component="span" sx={artistStyles.linkCardTitle}>
        <span><Responsive full={title} short={mobileTitle} /></span>
        <Arrow size={16} weight="bold" aria-hidden />
      </Box>
    </>
  );

  if (isInternal) {
    return (
      <Box component={RouterLink} to={href} onClick={onClick} aria-label={ariaLabel} sx={sx}>
        {content}
      </Box>
    );
  }

  return (
    <Box
      component="a"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      sx={sx}
    >
      {content}
    </Box>
  );
};

export default ExternalLinkCard;
