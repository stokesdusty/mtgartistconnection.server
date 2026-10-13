import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { GET_MY_GROUP_ORDER } from "../graphql/queries";
import { ADD_GROUP_ORDER_ROW, DELETE_GROUP_ORDER_ROW, LEAVE_GROUP_ORDER, UPDATE_GROUP_ORDER_ROW } from "../graphql/mutations";
import { usePageTitle } from "../../hooks/usePageTitle";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import {
  balanceLabel,
  formatMoney,
  ORDER_STATUS_LABELS,
  ParticipantGroupOrder as Order,
  PAYMENT_TIMING_LABELS,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import CardsEditor from "./CardsEditor";
import GroupOrderSummary, { SummaryRow } from "./GroupOrderSummary";
import ReportOrder from "./ReportOrder";
import { DisabledNotice, ErrorMessage, GroupOrderPage, PageStatus, useAction } from "./GroupOrderParts";
import { EmailPreference, ItemsSection, NotesPanel, PaymentsSection, ShippingPanel } from "./ParticipantProgress";

const POLL_MS = 60000;
const reminderKey = (orderId: string) => `group-order-discord-reminder-${orderId}`;

const readDismissed = (orderId: string) => {
  try { return localStorage.getItem(reminderKey(orderId)) === '1'; } catch { return false; }
};

/** A participant's view of an order they've joined or asked to join. */
const MyGroupOrder = () => {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { data, loading, error } = useQuery(GET_MY_GROUP_ORDER, { variables: { orderId }, skip: !isLoggedIn, pollInterval: POLL_MS });
  const order: Order | undefined = data?.myGroupOrder;
  usePageTitle(order?.name ?? 'Group order');

  if (!isLoggedIn) return <Navigate to={`/auth?redirect=${encodeURIComponent(`/tracker/shared/${orderId}`)}`} replace />;
  if (loading && !order) return <PageStatus>Loading…</PageStatus>;
  if (error || !order) return <PageStatus>{error?.message ?? 'Group order not found.'}</PageStatus>;

  const approved = order.me.status === 'approved';

  return (
    <GroupOrderPage>
      <Box sx={styles.hero}>
        <Box>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
            Group order · {ORDER_STATUS_LABELS[order.status]}
          </MonoLabel>
          <Box component="h1" sx={styles.title}>{order.name}</Box>
          <Box component="p" sx={styles.subtitle}>
            {order.organizerDiscordName ? `Run by ${order.organizerDiscordName} (Discord, unverified)` : 'Group signing run'}
          </Box>
        </Box>
      </Box>

      <Box sx={styles.sections}>
        {order.disabled && <DisabledNotice reason={order.disabledReason} />}
        {!order.me.discordName && <DiscordReminder orderId={order.id} />}

        {approved ? (
          <>
            <Box component="section" aria-labelledby="my-instructions" sx={styles.panel}>
              <Box component="h2" id="my-instructions" sx={[styles.sectionTitle, { mb: 1 }]}>Shipping and payment</Box>
              <Box component="p" sx={styles.sectionIntro}>From the organizer, for approved participants only.</Box>
              <Box component="p" sx={styles.longText}>{order.privateInstructions || "The organizer hasn't added instructions yet."}</Box>
            </Box>
            <CardsPanel order={order} />
            <ShippingPanel order={order} />
            <BalancePanel order={order} />
          </>
        ) : (
          <Box sx={styles.notice}>
            Waiting for the organizer to approve you. You'll see their shipping and payment instructions here once they do.
          </Box>
        )}

        <NotesPanel order={order} />
        <GroupOrderSummary order={order} />
        <EmailPreference orderId={order.id} optedOut={!!order.me.emailOptOut} label="Email me updates about this order" />
        <LeavePanel order={order} />
        <ReportOrder orderId={order.id} />
      </Box>
    </GroupOrderPage>
  );
};

function DiscordReminder({ orderId }: { orderId: string }) {
  const [dismissed, setDismissed] = useState(() => readDismissed(orderId));
  if (dismissed) return null;
  const dismiss = () => {
    try { localStorage.setItem(reminderKey(orderId), '1'); } catch { /* still hide it for now */ }
    setDismissed(true);
  };
  return (
    <Box sx={[styles.notice, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }]}>
      <span>
        Add your Discord name so the organizer can match your cards to you.{' '}
        <Box component={RouterLink} to="/settings" sx={styles.eventLink}>Add it in settings</Box>
      </span>
      <Button onClick={dismiss} sx={styles.textButton}>Dismiss</Button>
    </Box>
  );
}

function CardsPanel({ order }: { order: Order }) {
  const [addRow] = useMutation(ADD_GROUP_ORDER_ROW);
  const [updateRow] = useMutation(UPDATE_GROUP_ORDER_ROW);
  const [deleteRow] = useMutation(DELETE_GROUP_ORDER_ROW);
  const open = order.status === 'open';

  return (
    <Box component="section" aria-labelledby="my-cards" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="my-cards" sx={styles.sectionTitle}>Your cards</Box>
        <MonoLabel tracking="tight">
          {order.me.cardCount}{order.maxCardsPerParticipant !== null && ` of ${order.maxCardsPerParticipant}`}
        </MonoLabel>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        {open
          ? "Pick the artist and signature type for each card. The price comes from the organizer's price list."
          : 'Card changes closed with the order. Message the organizer if something needs fixing.'}
      </Box>
      <CardsEditor
        order={order}
        rows={order.rows}
        canEdit={open}
        emptyText="No cards yet."
        onAdd={(row) => addRow({ variables: { orderId: order.id, row } })}
        onUpdate={(rowId, row) => updateRow({ variables: { orderId: order.id, rowId, row } })}
        onRemove={(rowId) => deleteRow({ variables: { orderId: order.id, rowId } })}
      />
    </Box>
  );
}

function BalancePanel({ order }: { order: Order }) {
  const { balance } = order.me;
  return (
    <Box component="section" aria-labelledby="my-balance" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="my-balance" sx={styles.sectionTitle}>Your balance</Box>
        <Box component="span" sx={styles.pillAccent}>{balanceLabel(balance)}</Box>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        {PAYMENT_TIMING_LABELS[order.paymentTiming]}.{' '}
        {order.paymentDue ? 'Payment is due now.' : order.paymentTiming === 'after-signing' ? 'Nothing is due until your cards are signed.' : 'Nothing is due yet.'}
      </Box>
      <Box component="dl" sx={styles.summaryList}>
        <SummaryRow label="Cards">{formatMoney(balance.cardsTotal)}{balance.pendingCount > 0 && ` + ${balance.pendingCount} price pending`}</SummaryRow>
        {balance.customItemsTotal > 0 && <SummaryRow label="Other items">{formatMoney(balance.customItemsTotal)}</SummaryRow>}
        {balance.fee > 0 && <SummaryRow label="Fee">{formatMoney(balance.fee)}</SummaryRow>}
        {balance.returnShipping > 0 && <SummaryRow label="Return shipping">{formatMoney(balance.returnShipping)}</SummaryRow>}
        <SummaryRow label="Paid">
          {formatMoney(balance.confirmedPaid)}
          {balance.reportedPaid > 0 && ` (+ ${formatMoney(balance.reportedPaid)} waiting for the organizer to confirm)`}
        </SummaryRow>
      </Box>
      <ItemsSection order={order} />
      <PaymentsSection order={order} />
    </Box>
  );
}

function LeavePanel({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [leaveGroupOrder] = useMutation(LEAVE_GROUP_ORDER);
  const { run, error, busy } = useAction();

  const leave = () => {
    if (!window.confirm('Leave this order? Your cards are removed from it, and you would need to ask to join again.')) return;
    run(async () => {
      const { data } = await leaveGroupOrder({ variables: { orderId: order.id } });
      if (!data.leaveGroupOrder.success) throw new Error(data.leaveGroupOrder.message);
      navigate('/signingtracker');
    });
  };

  if (order.me.receivedAt) {
    return <Box component="p" sx={styles.fieldHint}>The organizer has your cards, so you can't leave this order. Message them if something's wrong.</Box>;
  }

  return (
    <Box>
      <ErrorMessage>{error}</ErrorMessage>
      <Button disabled={busy} onClick={leave} sx={styles.dangerButton}>
        {order.me.status === 'requested' ? 'Withdraw request' : 'Leave order'}
      </Button>
    </Box>
  );
}

export default MyGroupOrder;
