import { Link, Box } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { artistStyles } from "../../styles/artist-styles";

interface ExternalLinkCardProps {
  href: string;
  label: string;
  logo?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  onClick?: () => void;
}

const ExternalLinkCard = ({
  href,
  label,
  logo,
  variant = 'secondary',
  external = false,
  onClick,
}: ExternalLinkCardProps) => {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      underline="none"
      onClick={onClick}
      sx={variant === 'primary' ? artistStyles.linkCardPrimary : artistStyles.linkCardSecondary}
    >
      {logo && (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {logo}
        </Box>
      )}
      <Box component="span" sx={{ flex: 1 }}>
        {label}
      </Box>
      <ChevronRight sx={{ fontSize: 20, opacity: 0.6, flexShrink: 0 }} />
    </Link>
  );
};

export default ExternalLinkCard;
