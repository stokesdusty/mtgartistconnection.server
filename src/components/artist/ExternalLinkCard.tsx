import { Link, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CaretRight } from "@phosphor-icons/react";
import { artistStyles } from "../../styles/artist-styles";

interface ExternalLinkCardProps {
  href: string;
  label: string;
  logo?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  isInternal?: boolean;
  onClick?: () => void;
}

const ExternalLinkCard = ({
  href,
  label,
  logo,
  variant = 'secondary',
  external = false,
  isInternal = false,
  onClick,
}: ExternalLinkCardProps) => {
  const sx = variant === 'primary' ? artistStyles.linkCardPrimary : artistStyles.linkCardSecondary;
  const content = (
    <>
      {logo && (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {logo}
        </Box>
      )}
      <Box component="span" sx={{ flex: 1 }}>
        {label}
      </Box>
      <CaretRight size={20} style={{ opacity: 0.6, flexShrink: 0 }} />
    </>
  );

  if (isInternal) {
    return (
      <Link component={RouterLink} to={href} underline="none" onClick={onClick} sx={sx}>
        {content}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      underline="none"
      onClick={onClick}
      sx={sx}
    >
      {content}
    </Link>
  );
};

export default ExternalLinkCard;
