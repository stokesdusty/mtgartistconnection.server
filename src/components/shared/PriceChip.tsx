import { Box } from '@mui/material';
import { priceChipStyles as styles } from '../../styles/price-chip-styles';

interface PriceChipProps {
  label: string;
  value: string;
  href: string;
  title: string;
  onClick: () => void;
  /** Stack the label above the value (narrow columns). */
  stacked?: boolean;
  height?: number;
}

/** Outbound vendor price link: "TCG $1.23". */
const PriceChip = ({ label, value, href, title, onClick, stacked = false, height = 30 }: PriceChipProps) => (
  <Box
    component="a"
    href={href}
    target="_blank"
    rel="noopener noreferrer sponsored"
    title={title}
    aria-label={`${title}: ${value}`}
    onClick={onClick}
    sx={[styles.chip, stacked && styles.stacked, { height }]}
  >
    <span className="price-label">{label}</span>
    <span className="price-value">{value}</span>
  </Box>
);

export const formatCents = (cents: number | null | undefined): string =>
  cents === null || cents === undefined ? '-' : `$${(cents / 100).toFixed(2)}`;

export default PriceChip;
