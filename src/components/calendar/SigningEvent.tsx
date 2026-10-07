import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { ArrowRight, Heart } from "@phosphor-icons/react";
import { GET_ARTISTSBYEVENTID } from "../graphql/queries";
import GlowPill from "../shared/GlowPill";
import MonoLabel from "../shared/MonoLabel";
import { calendarStyles } from "../../styles/calendar-styles";
import { eventCountdownLabel, formatDateRange, formatWeekdayRange } from "../../utils/eventDates";

interface SigningEventComponentProps {
  props: any;
  wishlistCount?: number;
  /** Artist names from the page's batched query, shown until this row's own query lands. */
  artistNames?: string[];
}

const MAX_AVATARS = 3;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("");

/** One calendar row; the whole row links to the event detail page. */
const SigningEvent = ({ props, wishlistCount = 0, artistNames = [] }: SigningEventComponentProps) => {
  const eventId = props.id;

  const { data: artistData } = useQuery(GET_ARTISTSBYEVENTID, {
    variables: {
      eventId
    },
    fetchPolicy: 'cache-and-network',
  });

  const artists: string[] =
    artistData?.mapArtistToEventByEventId?.map((a: any) => a.artistName) ?? artistNames;

  const start = new Date(props.startDate);
  const dateRange = formatDateRange(props.startDate, props.endDate);
  const countdown = eventCountdownLabel(props.startDate, props.endDate);
  const shown = artists.slice(0, MAX_AVATARS);
  const overflow = artists.length - shown.length;

  return (
    <Box component="li">
      <Box component={RouterLink} to={`/calendar/${eventId}`} sx={calendarStyles.row}>
        <Box sx={calendarStyles.dateCol}>
          <Box component="span" sx={calendarStyles.dateRange}>{dateRange}</Box>
          <MonoLabel tracking="tight">{formatWeekdayRange(props.startDate, props.endDate)}</MonoLabel>
        </Box>

        <Box sx={calendarStyles.dateBlock} aria-hidden>
          <Box sx={calendarStyles.dateBlockMonth}>
            {start.toLocaleDateString('en-US', { month: 'short' })}
          </Box>
          <Box sx={calendarStyles.dateBlockDay}>{start.getDate()}</Box>
        </Box>

        <Box sx={calendarStyles.main}>
          <Box sx={calendarStyles.titleLine}>
            {countdown && <GlowPill sx={calendarStyles.countdownPill}>{countdown}</GlowPill>}
            <Box component="h3" sx={[calendarStyles.name, { margin: 0 }]}>{props.name}</Box>
          </Box>
          <Box component="span" sx={calendarStyles.meta}>
            <Box component="span" sx={calendarStyles.metaDates}>
              {dateRange}{props.city && ' · '}
            </Box>
            {props.city}
          </Box>
        </Box>

        <Box sx={calendarStyles.extras}>
          <Box sx={calendarStyles.people}>
            {shown.length > 0 && (
              <Box sx={calendarStyles.avatars} aria-hidden>
                {shown.map(name => (
                  <Box key={name} component="span" sx={calendarStyles.avatar} title={name}>
                    {initials(name)}
                  </Box>
                ))}
                {overflow > 0 && (
                  <Box component="span" sx={calendarStyles.avatar}>+{overflow}</Box>
                )}
              </Box>
            )}
            <Box component="span" sx={calendarStyles.artistCount}>
              {artists.length > 0
                ? `${artists.length} ${artists.length === 1 ? 'artist' : 'artists'}`
                : 'No artists confirmed yet'}
            </Box>
          </Box>

          <Box sx={calendarStyles.wishCol}>
            {wishlistCount > 0 && (
              <Box component="span" sx={calendarStyles.wishChip} title="Wishlisted cards from artists at this event">
                <Heart size={12} weight="fill" aria-hidden />
                {wishlistCount}
                <Box component="span" sx={calendarStyles.wishLabel}> wishlisted</Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box className="event-arrow" sx={calendarStyles.arrow} aria-hidden>
          <ArrowRight size={16} />
        </Box>
      </Box>
    </Box>
  );
};

export default SigningEvent;
