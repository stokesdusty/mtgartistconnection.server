import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { formatDateRangeWithYear } from "../../utils/eventDates";
import { cellLabel, formatMoney, GroupOrder, PAYMENT_TIMING_PARTICIPANT_HINTS, PAYMENT_TIMING_LABELS } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";

const formatCutoff = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const SummaryRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={styles.summaryRow}>
    <MonoLabel component="dt" tracking="tight">{label}</MonoLabel>
    <Box component="dd" sx={styles.summaryValue}>{children}</Box>
  </Box>
);

/** Who's running it, the event, pricing and terms. Everything here is public to anyone with the link. */
const GroupOrderSummary = ({ order }: { order: GroupOrder }) => (
  <>
    <Box component="section" aria-labelledby="order-details" sx={styles.panel}>
      <Box component="h2" id="order-details" sx={[styles.sectionTitle, { mb: 1 }]}>Details</Box>
      <Box component="dl" sx={styles.summaryList}>
        <SummaryRow label="Organizer">
          {order.organizerDiscordName ? <>{order.organizerDiscordName} <Box component="span" sx={styles.pill}>Discord</Box></> : 'No Discord name given'}
        </SummaryRow>
        {order.event && (
          <SummaryRow label="Event">
            <Box component={RouterLink} to={`/calendar/${order.event.id}`} sx={styles.eventLink}>{order.event.name}</Box>
            {` · ${formatDateRangeWithYear(order.event.startDate, order.event.endDate)} · ${order.event.city}`}
          </SummaryRow>
        )}
        <SummaryRow label="Cutoff">{order.cutoff ? `Join by ${formatCutoff(order.cutoff)}` : 'No cutoff set'}</SummaryRow>
        <SummaryRow label="Payment">
          {PAYMENT_TIMING_LABELS[order.paymentTiming]}. {PAYMENT_TIMING_PARTICIPANT_HINTS[order.paymentTiming]}
        </SummaryRow>
        {order.participantFee > 0 && <SummaryRow label="Per-person fee">{formatMoney(order.participantFee)}</SummaryRow>}
        {order.maxCardsPerParticipant !== null && <SummaryRow label="Card limit">{order.maxCardsPerParticipant} per person</SummaryRow>}
        {order.returnOptions.length > 0 && (
          <SummaryRow label="Return shipping">
            {order.returnOptions.map((o) => `${o.label} ${formatMoney(o.price)}`).join(' · ')}
          </SummaryRow>
        )}
      </Box>
    </Box>

    <Box component="section" aria-labelledby="order-prices" sx={styles.panel}>
      <Box component="h2" id="order-prices" sx={styles.sectionTitle}>Prices</Box>
      <Box component="p" sx={styles.sectionIntro}>
        Per card, set by the organizer and including their handling. TBD prices get filled in before you pay.
      </Box>
      <Box sx={styles.gridScroll}>
        <Box component="table" sx={styles.gridTable}>
          <thead>
            <tr>
              <th scope="col">Artist</th>
              {order.signatureTypes.map((t) => <th key={t.id} scope="col">{t.label}</th>)}
              <th scope="col">Slots</th>
            </tr>
          </thead>
          <tbody>
            {order.artists.map((artist) => (
              <tr key={artist.name}>
                <th scope="row">{artist.name}</th>
                {order.signatureTypes.map((t) => {
                  const label = cellLabel(artist, t.id);
                  return (
                    <Box component="td" key={t.id} sx={label === 'TBD' ? styles.cellTbd : label === '—' ? styles.cellOff : undefined}>
                      {label === '—' ? <span aria-label="Not offered">—</span> : label}
                    </Box>
                  );
                })}
                <td>
                  {artist.remaining === null
                    ? <Box component="span" sx={styles.slots}>Open</Box>
                    : <Box component="span" sx={artist.remaining === 0 ? styles.slotsFull : styles.slots}>
                        {artist.remaining === 0 ? 'Full' : `${artist.remaining} of ${artist.cap} left`}
                      </Box>}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>

    {order.publicTerms && (
      <Box component="section" aria-labelledby="order-terms" sx={styles.panel}>
        <Box component="h2" id="order-terms" sx={[styles.sectionTitle, { mb: 2 }]}>Terms</Box>
        <Box component="p" sx={styles.longText}>{order.publicTerms}</Box>
      </Box>
    )}
  </>
);

export default GroupOrderSummary;
