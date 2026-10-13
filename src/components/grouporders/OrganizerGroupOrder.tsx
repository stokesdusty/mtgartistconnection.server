import { FormEvent, useState } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Copy } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { GET_ORGANIZED_GROUP_ORDER } from "../graphql/queries";
import {
  ADD_GROUP_ORDER_GUEST,
  DELETE_GROUP_ORDER,
  ORGANIZER_ADD_GROUP_ORDER_ROW,
  ORGANIZER_DELETE_GROUP_ORDER_ROW,
  ORGANIZER_UPDATE_GROUP_ORDER_ROW,
  REMOVE_GROUP_ORDER_PARTICIPANT,
  RESET_GROUP_ORDER_INVITE,
  REVIEW_GROUP_ORDER_REQUEST,
  SET_GROUP_ORDER_STATUS,
  UPDATE_GROUP_ORDER,
} from "../graphql/mutations";
import { usePageTitle } from "../../hooks/usePageTitle";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { formatDateRangeWithYear } from "../../utils/eventDates";
import {
  balanceLabel,
  canCancel,
  discordNameError,
  formFromOrder,
  inviteUrl,
  shareUrl,
  NEXT_STATUSES,
  ORDER_STATUS_LABELS,
  OrganizerGroupOrder as Order,
  OrderStatus,
  Participant,
  PAYMENT_TIMING_LABELS,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl from "../shared/SegmentedControl";
import CardsEditor from "./CardsEditor";
import EventDayView from "./EventDayView";
import GroupOrderSettingsForm from "./GroupOrderSettingsForm";
import GroupOrderSummary from "./GroupOrderSummary";
import ParticipantDetail from "./ParticipantDetail";
import { EmailPreference } from "./ParticipantProgress";
import { DisabledNotice, ErrorMessage, formatShortDate, GroupOrderPage, PageStatus, useAction } from "./GroupOrderParts";

type OrganizerView = 'people' | 'artists';

const STATUS_HINTS: Record<OrderStatus, string> = {
  draft: "Only you can see this order. Open it to start taking join requests.",
  open: "Taking join requests. Approved participants can add cards.",
  closed: "Not taking new people or cards. Participants can still ship and pay.",
  'at-event': "You're at the event. Participants can follow along.",
  returning: "Cards are on their way back to participants.",
  complete: "This order is finished.",
  cancelled: "This order was cancelled.",
};

// Polls so new join requests show up without a refresh.
const POLL_MS = 30000;

const OrganizerGroupOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { data, loading, error } = useQuery(GET_ORGANIZED_GROUP_ORDER, {
    variables: { orderId },
    skip: !isLoggedIn || !orderId,
    pollInterval: POLL_MS,
  });
  const order: Order | undefined = data?.organizedGroupOrder;
  usePageTitle(order?.name ?? 'Group order');

  // "?view=artists" opens the event-day list directly; it's also the default during the event.
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('view');
  const view: OrganizerView = requested === 'artists' || requested === 'people'
    ? requested
    : order?.status === 'at-event' ? 'artists' : 'people';
  const setView = (next: OrganizerView) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', next);
    setSearchParams(params, { replace: true });
  };

  if (!isLoggedIn) return <Navigate to={`/auth?redirect=${encodeURIComponent(`/tracker/group/${orderId}`)}`} replace />;
  if (loading && !order) return <PageStatus>Loading…</PageStatus>;
  if (error || !order) return <PageStatus>{error?.message ?? 'Group order not found.'}</PageStatus>;

  const finished = order.status === 'complete' || order.status === 'cancelled';

  return (
    <GroupOrderPage>
      <Box sx={styles.hero}>
        <Box>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
            Group order · {ORDER_STATUS_LABELS[order.status]}
          </MonoLabel>
          <Box component="h1" sx={styles.title}>{order.name}</Box>
          <Box component="p" sx={styles.subtitle}>
            {order.event && (
              <>
                <Box component={RouterLink} to={`/calendar/${order.event.id}`} sx={styles.eventLink}>{order.event.name}</Box>
                {` · ${formatDateRangeWithYear(order.event.startDate, order.event.endDate)} · `}
              </>
            )}
            {PAYMENT_TIMING_LABELS[order.paymentTiming]}
          </Box>
        </Box>
      </Box>

      <Box sx={styles.sections}>
        {order.disabled && <DisabledNotice reason={order.disabledReason} />}
        <StatusPanel order={order} />
        {!finished && <InvitePanel order={order} />}
        <RequestsPanel order={order} />
        <SegmentedControl<OrganizerView>
          options={[
            { value: 'people', label: 'People and cards', shortLabel: 'People' },
            { value: 'artists', label: 'By artist (event day)', shortLabel: 'By artist' },
          ]}
          value={view}
          onChange={setView}
          aria-label="Order view"
          sx={{ alignSelf: 'flex-start' }}
        />
        {view === 'artists' ? (
          <EventDayView order={order} />
        ) : (
          <>
            <ParticipantsPanel order={order} finished={finished} />
            <CardsPanel order={order} finished={finished} />
            <SettingsPanel order={order} finished={finished} />
          </>
        )}
      </Box>
    </GroupOrderPage>
  );
};

// ── Status ──────────────────────────────────────────────────────────────────

function StatusPanel({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [setStatus] = useMutation(SET_GROUP_ORDER_STATUS);
  const [deleteOrder] = useMutation(DELETE_GROUP_ORDER);
  const { run, error, busy } = useAction();
  const change = (status: OrderStatus) => run(() => setStatus({ variables: { orderId: order.id, status } }));
  const cutoffPassed = order.savedStatus === 'open' && order.status === 'closed';

  return (
    <Box component="section" aria-labelledby="order-status" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="order-status" sx={styles.sectionTitle}>Status</Box>
        <Box component="span" sx={styles.pillAccent}>{ORDER_STATUS_LABELS[order.status]}</Box>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        {cutoffPassed
          ? 'The cutoff has passed, so the order is closed. Move the cutoff in settings to reopen it.'
          : STATUS_HINTS[order.status]}
      </Box>
      <ErrorMessage>{error}</ErrorMessage>
      <Box sx={styles.actions}>
        {NEXT_STATUSES[order.status].filter(({ status }) => !(cutoffPassed && status === 'open')).map(({ status, label }) => (
          <Button key={status} disabled={busy} onClick={() => change(status)}
            sx={status === 'open' && order.status === 'closed' ? styles.secondaryButton : styles.primaryButton}>
            {label}
          </Button>
        ))}
        {canCancel(order.status) && (
          <Button disabled={busy} sx={styles.dangerButton} onClick={() => {
            if (window.confirm("Cancel this order? Participants will see it as cancelled, and it can't be reopened.")) change('cancelled');
          }}>
            Cancel order
          </Button>
        )}
        {(order.status === 'draft' || order.status === 'cancelled') && (
          <Button disabled={busy} sx={styles.dangerButton} onClick={() => {
            if (!window.confirm('Delete this order for good? This removes it for everyone and can\'t be undone.')) return;
            run(async () => {
              const { data } = await deleteOrder({ variables: { orderId: order.id } });
              if (!data.deleteGroupOrder.success) throw new Error(data.deleteGroupOrder.message || "Couldn't delete the order.");
              navigate('/signingtracker');
            });
          }}>
            Delete order
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Invite link ─────────────────────────────────────────────────────────────

function InvitePanel({ order }: { order: Order }) {
  const [resetInvite] = useMutation(RESET_GROUP_ORDER_INVITE);
  const { run, error, busy } = useAction();
  const [copied, setCopied] = useState(false);
  const url = order.inviteToken ? shareUrl(order.inviteToken) : '';

  const copy = () => run(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  });

  return (
    <Box component="section" aria-labelledby="order-invite" sx={styles.panel}>
      <Box component="h2" id="order-invite" sx={styles.sectionTitle}>Invite link</Box>
      <Box component="p" sx={styles.sectionIntro}>
        Post this in your Discord group. It shows a preview of the order there, and opens the invite page where people can see
        the prices and terms and ask to join. You approve everyone.
        {order.status === 'draft' && ' It starts working once you open the order.'}
      </Box>
      {!order.organizerDiscordName && (
        <Box sx={styles.notice}>
          Add your Discord name in the settings below so people can tell the order is really yours.
        </Box>
      )}
      <ErrorMessage>{error}</ErrorMessage>
      {order.inviteToken ? (
        <>
          <TextField size="small" fullWidth value={url} InputProps={{ readOnly: true }} inputProps={{ 'aria-label': 'Invite link' }}
            onFocus={(e) => e.target.select()} sx={[styles.input, { mb: 1 }]} />
          <Box component="p" sx={[styles.fieldHint, { mb: 2 }]}>
            Direct link to the invite page, without the preview:{' '}
            <Box component={RouterLink} to={`/tracker/join/${order.inviteToken}`} sx={styles.eventLink}>{inviteUrl(order.inviteToken)}</Box>
          </Box>
          <Box sx={styles.actions}>
            <Button startIcon={<Copy size={16} />} onClick={copy} sx={styles.primaryButton}>
              {copied ? 'Copied' : 'Copy link for Discord'}
            </Button>
            <Button disabled={busy} sx={styles.secondaryButton} onClick={() => {
              if (window.confirm('Make a new link? The current one will stop working.')) run(() => resetInvite({ variables: { orderId: order.id } }));
            }}>
              New link
            </Button>
            <Button disabled={busy} sx={styles.secondaryButton} onClick={() => {
              if (window.confirm('Turn off the link? Nobody new can find the order until you make a new one.')) {
                run(() => resetInvite({ variables: { orderId: order.id, revoke: true } }));
              }
            }}>
              Turn off link
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box component="p" sx={[styles.sectionIntro, { mt: 0 }]}>The link is off.</Box>
          <Button disabled={busy} onClick={() => run(() => resetInvite({ variables: { orderId: order.id } }))} sx={styles.primaryButton}>
            Make a link
          </Button>
        </>
      )}
    </Box>
  );
}

// ── People ──────────────────────────────────────────────────────────────────

const PersonName = ({ person }: { person: Participant }) => (
  <>
    <Box component="p" sx={styles.personName}>
      {person.discordName || person.displayName}{' '}
      {person.isGuest && <Box component="span" sx={styles.pill}>Guest</Box>}
      {!person.discordName && !person.isGuest && <Box component="span" sx={styles.pill}>No Discord name</Box>}
    </Box>
  </>
);

function RequestsPanel({ order }: { order: Order }) {
  const [review] = useMutation(REVIEW_GROUP_ORDER_REQUEST);
  const { run, error, busy } = useAction();
  const requests = order.participants.filter((p) => p.status === 'requested');
  if (requests.length === 0 && order.status !== 'open') return null;

  return (
    <Box component="section" aria-labelledby="order-requests" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="order-requests" sx={styles.sectionTitle}>Join requests</Box>
        <MonoLabel tracking="tight">{requests.length}</MonoLabel>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>Check each name against your Discord group before approving. Discord names aren't verified.</Box>
      <EmailPreference orderId={order.id} optedOut={order.organizerEmailOptOut} label="Email me when someone asks to join" />
      <ErrorMessage>{error}</ErrorMessage>
      {requests.length === 0 ? (
        <Box component="p" sx={styles.emptyText}>No requests waiting.</Box>
      ) : (
        <Box component="ul" sx={styles.personList}>
          {requests.map((p) => (
            <Box component="li" key={p.id} sx={styles.personRow}>
              <Box>
                <PersonName person={p} />
                <Box component="p" sx={styles.personMeta}>
                  {p.discordName ? `${p.displayName} · ` : ''}Asked {formatShortDate(p.createdAt)}
                </Box>
              </Box>
              <Box sx={styles.personActions}>
                <Button disabled={busy} onClick={() => run(() => review({ variables: { participantId: p.id, approve: true } }))}
                  sx={styles.primaryButton} aria-label={`Approve ${p.discordName || p.displayName}`}>
                  Approve
                </Button>
                <Button disabled={busy} onClick={() => run(() => review({ variables: { participantId: p.id, approve: false } }))}
                  sx={styles.secondaryButton} aria-label={`Decline ${p.discordName || p.displayName}`}>
                  Decline
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function ParticipantsPanel({ order, finished }: { order: Order; finished: boolean }) {
  const [remove] = useMutation(REMOVE_GROUP_ORDER_PARTICIPANT);
  const { run, error, busy } = useAction();
  const approved = order.participants.filter((p) => p.status === 'approved');
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Box component="section" aria-labelledby="order-participants" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="order-participants" sx={styles.sectionTitle}>Participants</Box>
        <MonoLabel tracking="tight">{approved.length}</MonoLabel>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>Only you see this list. Participants never see each other.</Box>
      <ErrorMessage>{error}</ErrorMessage>
      {approved.length === 0 ? (
        <Box component="p" sx={styles.emptyText}>Nobody yet.</Box>
      ) : (
        <Box component="ul" sx={styles.personList}>
          {approved.map((p) => {
            const name = p.discordName || p.displayName;
            const open = openId === p.id;
            return (
              <Box component="li" key={p.id} sx={{ borderTop: '1px solid var(--line)' }}>
                <Box sx={[styles.personRow, { borderTop: 'none' }]}>
                  <Box>
                    <PersonName person={p} />
                    <Box component="p" sx={styles.personMeta}>
                      {[
                        p.discordName && p.displayName,
                        `${p.cardCount} ${p.cardCount === 1 ? 'card' : 'cards'}`,
                        balanceLabel(p.balance),
                        p.receivedAt ? 'package received' : p.readyToShipAt ? 'ready to ship' : null,
                        p.mismatchCount > 0 && 'counts off',
                        p.notesToOrganizer && 'has notes',
                      ].filter(Boolean).join(' · ')}
                    </Box>
                  </Box>
                  <Box sx={styles.personActions}>
                    <Button sx={styles.smallButton} aria-expanded={open} aria-label={`${open ? 'Close' : 'Manage'} ${name}`}
                      onClick={() => setOpenId(open ? null : p.id)}>
                      {open ? 'Close' : 'Manage'}
                    </Button>
                    {!finished && !p.receivedAt && (
                      <Button disabled={busy} sx={styles.smallButton} aria-label={`Remove ${name}`} onClick={() => {
                        if (window.confirm(`Remove ${name}? Their cards leave the order with them.`)) {
                          run(() => remove({ variables: { participantId: p.id } }));
                        }
                      }}>
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
                {open && <ParticipantDetail order={order} person={p} />}
              </Box>
            );
          })}
        </Box>
      )}
      {!finished && <AddGuestForm orderId={order.id} />}
    </Box>
  );
}

function AddGuestForm({ orderId }: { orderId: string }) {
  const [addGuest] = useMutation(ADD_GROUP_ORDER_GUEST);
  const { run, error, busy } = useAction();
  const [name, setName] = useState('');
  const [discordName, setDiscordName] = useState('');
  const discordError = discordNameError(discordName);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || discordError) return;
    run(async () => {
      await addGuest({ variables: { orderId, displayName: name.trim(), discordName: discordName.trim() || null } });
      setName('');
      setDiscordName('');
    });
  };

  return (
    <Box component="form" onSubmit={submit} aria-label="Add a guest" sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Add a guest</MonoLabel>
      <Box component="p" sx={[styles.fieldHint, { mb: 1.5 }]}>For someone without an account, like a friend handing you cards in person.</Box>
      <ErrorMessage>{error}</ErrorMessage>
      <Box sx={[styles.addRow, { mt: 0 }]}>
        <TextField size="small" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
          inputProps={{ maxLength: 60, 'aria-label': 'Guest name' }} sx={[styles.input, { flex: '1 1 200px' }]} />
        <TextField size="small" value={discordName} onChange={(e) => setDiscordName(e.target.value)} placeholder="Discord name (optional)"
          error={!!discordError} helperText={discordError ?? undefined}
          inputProps={{ maxLength: 40, 'aria-label': 'Guest Discord name' }} sx={[styles.input, { flex: '1 1 200px' }]} />
        <Button type="submit" disabled={busy || !name.trim() || !!discordError} sx={styles.secondaryButton}>Add guest</Button>
      </Box>
    </Box>
  );
}

// ── Cards ───────────────────────────────────────────────────────────────────

function CardsPanel({ order, finished }: { order: Order; finished: boolean }) {
  const [addRow] = useMutation(ORGANIZER_ADD_GROUP_ORDER_ROW);
  const [updateRow] = useMutation(ORGANIZER_UPDATE_GROUP_ORDER_ROW);
  const [deleteRow] = useMutation(ORGANIZER_DELETE_GROUP_ORDER_ROW);
  const [personFilter, setPersonFilter] = useState('');
  const people = order.participants
    .filter((p) => p.status === 'approved')
    .map((p) => ({ id: p.id, label: p.discordName || p.displayName }));
  const rows = personFilter ? order.rows.filter((r) => r.participantId === personFilter) : order.rows;
  const total = order.rows.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <Box component="section" aria-labelledby="order-cards" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="order-cards" sx={styles.sectionTitle}>Cards</Box>
        <MonoLabel tracking="tight">{total}</MonoLabel>
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        Everyone's cards. Participants add their own while the order is open; you can add or fix cards for anyone, guests included.
      </Box>
      {people.length > 1 && (
        <TextField select size="small" label="Show" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}
          sx={[styles.input, { width: 260, maxWidth: '100%', mb: 2 }]}>
          <MenuItem value="">Everyone</MenuItem>
          {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
        </TextField>
      )}
      <CardsEditor
        order={order}
        rows={rows}
        people={people}
        canEdit={!finished && people.length > 0}
        emptyText={people.length === 0 ? 'Approve someone (or add a guest) to start adding cards.' : 'No cards yet.'}
        onAdd={(row, participantId) => addRow({ variables: { participantId, row } })}
        onUpdate={(rowId, row) => updateRow({ variables: { orderId: order.id, rowId, row } })}
        onRemove={(rowId) => deleteRow({ variables: { orderId: order.id, rowId } })}
      />
    </Box>
  );
}

// ── Settings ────────────────────────────────────────────────────────────────

function SettingsPanel({ order, finished }: { order: Order; finished: boolean }) {
  const [updateOrder] = useMutation(UPDATE_GROUP_ORDER);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <GroupOrderSettingsForm
        initial={formFromOrder(order)}
        submitLabel="Save settings"
        onCancel={() => setEditing(false)}
        onSubmit={async (input) => {
          await updateOrder({ variables: { orderId: order.id, ...input } });
          setEditing(false);
        }}
      />
    );
  }

  return (
    <>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" sx={[styles.sectionTitle, { mt: 2 }]}>What participants see</Box>
        {!finished && <Button onClick={() => setEditing(true)} sx={styles.secondaryButton}>Edit settings</Button>}
      </Box>
      <GroupOrderSummary order={order} />
      <Box component="section" aria-labelledby="order-private" sx={styles.panel}>
        <Box component="h2" id="order-private" sx={[styles.sectionTitle, { mb: 2 }]}>Private instructions</Box>
        <Box component="p" sx={styles.longText}>{order.privateInstructions || 'None yet. Add where to ship and how to pay in settings.'}</Box>
      </Box>
    </>
  );
}

export default OrganizerGroupOrder;
