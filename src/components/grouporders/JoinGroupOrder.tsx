import { FormEvent, useEffect, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { RootState } from "../../store/store";
import { GET_GROUP_ORDER_INVITE, GET_MY_DISCORD_NAME } from "../graphql/queries";
import { JOIN_GROUP_ORDER } from "../graphql/mutations";
import { usePageTitle } from "../../hooks/usePageTitle";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { formatDateRangeWithYear } from "../../utils/eventDates";
import { discordNameError, GroupOrder, ORDER_STATUS_LABELS } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import GroupOrderSummary from "./GroupOrderSummary";
import ReportOrder from "./ReportOrder";
import { ErrorMessage, GroupOrderPage, PageStatus, useAction } from "./GroupOrderParts";

type InviteOrder = GroupOrder & { viewerStatus: string | null };

const JoinGroupOrder = () => {
  const { token = '' } = useParams<{ token: string }>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { data, loading, error } = useQuery(GET_GROUP_ORDER_INVITE, { variables: { token }, fetchPolicy: 'cache-and-network' });
  const order: InviteOrder | null | undefined = data?.groupOrderByInvite;
  usePageTitle(order?.name ?? 'Group order');

  if (loading && !data) return <PageStatus>Loading…</PageStatus>;

  return (
    <GroupOrderPage back={false}>
      {/* Invite links are private to whoever they're shared with. */}
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {error || !order ? (
        <Box sx={styles.panel}>
          <Box component="h1" sx={[styles.sectionTitle, { mb: 1 }]}>This invite link isn't active</Box>
          <Box component="p" sx={[styles.sectionIntro, { mb: 0 }]}>
            The organizer may have turned it off or made a new one. Ask them in your Discord group for the current link.
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={styles.hero}>
            <Box>
              <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                Group order · {ORDER_STATUS_LABELS[order.status]}
              </MonoLabel>
              <Box component="h1" sx={styles.title}>{order.name}</Box>
              <Box component="p" sx={styles.subtitle}>
                {order.organizerDiscordName ? `Run by ${order.organizerDiscordName}` : 'Group signing run'}
                {order.event && ` · ${order.event.name}, ${formatDateRangeWithYear(order.event.startDate, order.event.endDate)}`}
              </Box>
            </Box>
          </Box>
          <Box sx={styles.sections}>
            <JoinPanel order={order} token={token} isLoggedIn={isLoggedIn} />
            <GroupOrderSummary order={order} />
            {isLoggedIn && order.viewerStatus !== 'organizer' && <ReportOrder orderId={order.id} />}
          </Box>
        </>
      )}
    </GroupOrderPage>
  );
};

function JoinPanel({ order, token, isLoggedIn }: { order: InviteOrder; token: string; isLoggedIn: boolean }) {
  const memberLink = `/tracker/shared/${order.id}`;
  const panel = (title: string, body: React.ReactNode) => (
    <Box component="section" aria-labelledby="join-title" sx={styles.panel}>
      <Box component="h2" id="join-title" sx={[styles.sectionTitle, { mb: 1 }]}>{title}</Box>
      {body}
    </Box>
  );

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(`/tracker/join/${token}`);
    return panel('Join this order', (
      <>
        <Box component="p" sx={styles.sectionIntro}>You need a free account to join, so you can track your cards and payment.</Box>
        <Button component={RouterLink} to={`/auth?redirect=${redirect}`} sx={styles.primaryButton}>Log in or sign up to join</Button>
      </>
    ));
  }

  switch (order.viewerStatus) {
    case 'organizer':
      return panel("You're the organizer", (
        <Button component={RouterLink} to={`/tracker/group/${order.id}`} sx={styles.primaryButton}>Manage this order</Button>
      ));
    case 'requested':
      return panel('Request sent', (
        <>
          <Box component="p" sx={styles.sectionIntro}>The organizer will review it. You'll see their shipping and payment instructions once you're approved.</Box>
          <Button component={RouterLink} to={memberLink} sx={styles.secondaryButton}>View your request</Button>
        </>
      ));
    case 'approved':
      return panel("You're in", (
        <Button component={RouterLink} to={memberLink} sx={styles.primaryButton}>Go to your order</Button>
      ));
    case 'declined':
    case 'removed':
      return panel("You're not in this order", (
        <Box component="p" sx={[styles.sectionIntro, { mb: 0 }]}>The organizer didn't approve you. Reach out to them on Discord if you think that's a mistake.</Box>
      ));
  }

  if (order.status !== 'open') {
    return panel("Not taking new people", (
      <Box component="p" sx={[styles.sectionIntro, { mb: 0 }]}>
        {order.status === 'cancelled' ? 'The organizer cancelled this order.' : 'This order is closed to new participants.'}
      </Box>
    ));
  }

  return <JoinForm order={order} token={token} />;
}

function JoinForm({ order, token }: { order: InviteOrder; token: string }) {
  const navigate = useNavigate();
  const { data: meData } = useQuery(GET_MY_DISCORD_NAME, { fetchPolicy: 'network-only' });
  const [joinGroupOrder] = useMutation(JOIN_GROUP_ORDER);
  const { run, error, busy } = useAction();
  const [discordName, setDiscordName] = useState('');
  const [touched, setTouched] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const discordError = discordNameError(discordName);

  // Pre-fill from their profile, unless they've started typing.
  const savedName = meData?.me?.discordName;
  useEffect(() => {
    if (savedName && !touched) setDiscordName(savedName);
  }, [savedName, touched]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!accepted || discordError) return;
    run(async () => {
      const { data } = await joinGroupOrder({ variables: { token, discordName: discordName.trim() || null, acceptTerms: true } });
      navigate(`/tracker/shared/${data.joinGroupOrder.id}`);
    });
  };

  return (
    <Box component="form" onSubmit={submit} aria-labelledby="join-title" sx={styles.panel}>
      <Box component="h2" id="join-title" sx={[styles.sectionTitle, { mb: 1 }]}>Ask to join</Box>
      <Box component="p" sx={styles.sectionIntro}>
        The organizer approves everyone. Discord names aren't verified, so confirm the organizer is who you expect in the Discord group
        where you found this link.
      </Box>
      <Box sx={styles.fields}>
        <Box sx={styles.field}>
          <Box component="label" htmlFor="join-discord"><MonoLabel tracking="tight">Your Discord name</MonoLabel></Box>
          <TextField id="join-discord" size="small" fullWidth value={discordName} placeholder="e.g. card.collector"
            onChange={(e) => { setTouched(true); setDiscordName(e.target.value); }}
            error={!!discordError} helperText={discordError ?? undefined}
            inputProps={{ maxLength: 40, autoComplete: 'off' }} sx={styles.input} />
          <Box component="p" sx={styles.fieldHint}>
            Optional, but most runs are coordinated on Discord. Adding your name helps the organizer match your cards to you.
          </Box>
        </Box>
      </Box>
      <FormControlLabel
        control={<Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />}
        label={
          <>
            {order.publicTerms ? "I've read the organizer's terms below and agree to them" : 'I agree to the terms of this order'}, and to the site's{' '}
            <Box component={RouterLink} to="/termsofservice" target="_blank" sx={styles.eventLink}>Terms of Service</Box> for group orders.
          </>
        }
        sx={styles.checkboxRow}
      />
      <ErrorMessage>{error}</ErrorMessage>
      <Button type="submit" disabled={busy || !accepted || !!discordError} sx={styles.primaryButton}>
        {busy ? 'Sending…' : 'Ask to join'}
      </Button>
    </Box>
  );
}

export default JoinGroupOrder;
