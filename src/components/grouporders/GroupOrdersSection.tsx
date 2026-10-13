import { Box, Button } from "@mui/material";
import { useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";
import { GET_GROUP_ORDER_LISTS } from "../graphql/queries";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { formatDateRange } from "../../utils/eventDates";
import { ORDER_STATUS_LABELS, OrderStatus } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";

interface ListEvent { id: string; name: string; startDate: string; endDate: string }
interface OrganizedItem { id: string; name: string; status: OrderStatus; event: ListEvent | null; participants: { id: string; status: string }[] }
interface JoinedItem { id: string; name: string; status: OrderStatus; organizerDiscordName: string | null; event: ListEvent | null; me: { id: string; status: string } }

const eventLine = (event: ListEvent | null) => (event ? `${event.name} · ${formatDateRange(event.startDate, event.endDate)}` : 'No event');

/** The Signing Tracker's group orders: ones you run and ones you've joined. Logged-in users only. */
const GroupOrdersSection = () => {
  const { data } = useQuery(GET_GROUP_ORDER_LISTS, { fetchPolicy: 'cache-and-network' });
  const organized: OrganizedItem[] = data?.organizedGroupOrders ?? [];
  const joined: JoinedItem[] = data?.myGroupOrders ?? [];

  return (
    <Box component="section" aria-labelledby="group-orders-title" sx={styles.trackerSection}>
      <Box sx={styles.trackerSectionHeader}>
        <Box component="h2" id="group-orders-title" sx={styles.trackerSectionTitle}>Group orders</Box>
        <Button component={RouterLink} to="/tracker/group/new" startIcon={<Plus size={16} weight="bold" />} sx={styles.secondaryButton}>
          New group order
        </Button>
      </Box>

      {organized.length === 0 && joined.length === 0 ? (
        <Box sx={styles.notice}>
          Going to a signing? Run a group order to carry cards for other people. Share one link in your Discord group,
          approve who joins, and track everyone's cards and payments in one place.
        </Box>
      ) : (
        <Box sx={styles.orderCards}>
          {organized.map((o) => {
            const requests = o.participants.filter((p) => p.status === 'requested').length;
            const people = o.participants.filter((p) => p.status === 'approved').length;
            return (
              <Box key={o.id} component={RouterLink} to={`/tracker/group/${o.id}`} sx={styles.orderCard}>
                <MonoLabel tone="accent" tracking="tight">You're organizing · {ORDER_STATUS_LABELS[o.status]}</MonoLabel>
                <Box component="p" sx={styles.orderCardName}>{o.name}</Box>
                <Box component="p" sx={styles.orderCardMeta}>
                  {eventLine(o.event)} · {people} {people === 1 ? 'person' : 'people'}
                  {requests > 0 && <> · <strong>{requests} to review</strong></>}
                </Box>
              </Box>
            );
          })}
          {joined.map((o) => (
            <Box key={o.id} component={RouterLink} to={`/tracker/shared/${o.id}`} sx={styles.orderCard}>
              <MonoLabel tracking="tight">
                Shared with you · {o.me.status === 'requested' ? 'Waiting for approval' : ORDER_STATUS_LABELS[o.status]}
              </MonoLabel>
              <Box component="p" sx={styles.orderCardName}>{o.name}</Box>
              <Box component="p" sx={styles.orderCardMeta}>
                {eventLine(o.event)}{o.organizerDiscordName && ` · ${o.organizerDiscordName}`}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default GroupOrdersSection;
