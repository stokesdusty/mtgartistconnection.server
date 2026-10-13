import { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import { GET_ADMIN_GROUP_ORDERS } from "../graphql/queries";
import { RESOLVE_GROUP_ORDER_REPORTS, SET_GROUP_ORDER_DISABLED } from "../graphql/mutations";
import { usePageTitle } from "../../hooks/usePageTitle";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { ORDER_STATUS_LABELS, OrderStatus } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import { ErrorMessage, formatShortDate, GroupOrderPage, useAction } from "./GroupOrderParts";

interface AdminReport { id: string; reason: string; reporterName: string | null; reporterEmail: string | null; createdAt: string | null; resolvedAt: string | null }

interface AdminOrder {
  id: string;
  name: string;
  status: OrderStatus;
  createdAt: string | null;
  organizerName: string | null;
  organizerEmail: string | null;
  organizerDiscordName: string | null;
  inviteToken: string | null;
  participantCount: number;
  cardCount: number;
  openReportCount: number;
  disabled: boolean;
  disabledReason: string | null;
  reports: AdminReport[];
}

/** Admin: review reported group orders and disable them (read-only, invite link off). */
const AdminGroupOrders = () => {
  usePageTitle('Group orders · Admin');
  const [reportedOnly, setReportedOnly] = useState(true);
  const { data, loading, error } = useQuery(GET_ADMIN_GROUP_ORDERS, { variables: { reportedOnly }, fetchPolicy: 'cache-and-network' });
  const orders: AdminOrder[] = data?.adminGroupOrders ?? [];

  return (
    <GroupOrderPage back={false}>
      <Box sx={styles.hero}>
        <Box>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>Admin</MonoLabel>
          <Box component="h1" sx={styles.title}>Group orders</Box>
          <Box component="p" sx={styles.subtitle}>Reported orders come first. Disabling an order makes it read-only and turns its invite link off.</Box>
        </Box>
      </Box>
      <FormControlLabel control={<Checkbox checked={reportedOnly} onChange={(e) => setReportedOnly(e.target.checked)} />}
        label="Only orders with reports" sx={styles.checkboxRow} />
      <ErrorMessage>{error?.message}</ErrorMessage>
      {loading && !data ? (
        <Box role="status" sx={styles.loading}>Loading…</Box>
      ) : orders.length === 0 ? (
        <Box sx={styles.notice}>{reportedOnly ? 'No reported orders.' : 'No group orders yet.'}</Box>
      ) : (
        <Box sx={styles.sections}>
          {orders.map((order) => <AdminOrderCard key={order.id} order={order} />)}
        </Box>
      )}
    </GroupOrderPage>
  );
};

function AdminOrderCard({ order }: { order: AdminOrder }) {
  const [setDisabled] = useMutation(SET_GROUP_ORDER_DISABLED);
  const [resolve] = useMutation(RESOLVE_GROUP_ORDER_REPORTS);
  const { run, error, busy } = useAction();
  const [reason, setReason] = useState('');

  return (
    <Box component="section" aria-label={order.name} sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" sx={styles.sectionTitle}>{order.name}</Box>
        <Box sx={styles.personActions}>
          {order.openReportCount > 0 && <Box component="span" sx={styles.slotsFull}>{order.openReportCount} open {order.openReportCount === 1 ? 'report' : 'reports'}</Box>}
          <Box component="span" sx={order.disabled ? styles.pill : styles.pillAccent}>{order.disabled ? 'Disabled' : ORDER_STATUS_LABELS[order.status]}</Box>
        </Box>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        {order.organizerName ?? 'Unknown'} · {order.organizerEmail ?? 'no email'}
        {order.organizerDiscordName && ` · Discord ${order.organizerDiscordName}`}
        {` · ${order.participantCount} ${order.participantCount === 1 ? 'person' : 'people'} · ${order.cardCount} cards`}
        {order.inviteToken && <> · <Box component={RouterLink} to={`/tracker/join/${order.inviteToken}`} sx={styles.eventLink}>Invite page</Box></>}
      </Box>
      {order.disabled && order.disabledReason && <Box sx={styles.notice}>Disabled: {order.disabledReason}</Box>}
      <ErrorMessage>{error}</ErrorMessage>

      {order.reports.length > 0 && (
        <Box component="ul" sx={[styles.personList, { mb: 2 }]} aria-label={`Reports about ${order.name}`}>
          {order.reports.map((r) => (
            <Box component="li" key={r.id} sx={[styles.personRow, { display: 'block' }]}>
              <Box component="p" sx={styles.longText}>{r.reason}</Box>
              <Box component="p" sx={styles.personMeta}>
                {r.reporterName ?? 'Unknown'} ({r.reporterEmail ?? 'no email'}) · {formatShortDate(r.createdAt)}
                {r.resolvedAt ? ` · reviewed ${formatShortDate(r.resolvedAt)}` : ''}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={styles.actions}>
        {order.disabled ? (
          <Button disabled={busy} sx={styles.secondaryButton} onClick={() => run(() => setDisabled({ variables: { orderId: order.id, disabled: false } }))}>
            Re-enable
          </Button>
        ) : (
          <>
            <TextField size="small" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (shown to the organizer and participants)"
              inputProps={{ maxLength: 200, 'aria-label': `Reason for disabling ${order.name}` }} sx={[styles.input, { flex: '1 1 260px' }]} />
            <Button disabled={busy} sx={styles.dangerButton} onClick={() => {
              if (window.confirm(`Disable ${order.name}? It becomes read-only for everyone.`)) {
                run(() => setDisabled({ variables: { orderId: order.id, disabled: true, reason: reason.trim() || null } }));
              }
            }}>
              Disable
            </Button>
          </>
        )}
        {order.openReportCount > 0 && (
          <Button disabled={busy} sx={styles.secondaryButton} onClick={() => run(() => resolve({ variables: { orderId: order.id } }))}>
            Mark reports reviewed
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default AdminGroupOrders;
