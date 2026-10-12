import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { Autocomplete, Box, FormControl, MenuItem, Select, TextField } from "@mui/material";
import { GET_ARTISTSBYEVENTID, GET_SIGNINGEVENTS } from "../graphql/queries";
import { REMOVE_ARTISTFROMEVENT } from "../graphql/mutations";
import { RootState } from "../../store/store";
import { eventFormStyles as styles } from "../../styles/event-form-styles";
import MonoLabel from "../shared/MonoLabel";

interface SigningEvent {
    id: string;
    name: string;
    city: string;
    startDate: string;
    endDate: string;
}

const formatRange = (event: SigningEvent) => {
    const start = new Date(event.startDate).toLocaleDateString();
    const end = new Date(event.endDate).toLocaleDateString();
    return start === end ? start : `${start} – ${end}`;
};

const RemoveArtistFromEvent = () => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const [eventId, setEventId] = useState("");
    const [artist, setArtist] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { data: eventData, error: eventDataError, loading: eventDataLoading } = useQuery(GET_SIGNINGEVENTS, { fetchPolicy: 'network-only' });
    const { data: attendeeData, loading: attendeesLoading } = useQuery(GET_ARTISTSBYEVENTID, {
        variables: { eventId },
        skip: !eventId,
        fetchPolicy: 'network-only',
    });
    const [removeArtistFromEvent] = useMutation(REMOVE_ARTISTFROMEVENT, {
        refetchQueries: [{ query: GET_ARTISTSBYEVENTID, variables: { eventId } }],
        // Drop cached artist-by-event lists so the calendar refetches them on next visit
        update: (cache) => {
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'mapArtistToEventByEventId' });
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'artistsByEventIds' });
            cache.gc();
        },
    });

    // Upcoming and in-progress events, soonest-ending first
    const upcomingEvents = useMemo<SigningEvent[]>(() => {
        const today = new Date();
        return (eventData?.signingEvent ?? [])
            .filter((event: SigningEvent) => new Date(event.endDate) >= today)
            .sort((a: SigningEvent, b: SigningEvent) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    }, [eventData]);

    const attendeeNames = useMemo<string[]>(
        () => (attendeeData?.mapArtistToEventByEventId ?? []).map((a: { artistName: string }) => a.artistName),
        [attendeeData]
    );

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    const canSubmit = !!eventId && !!artist && !submitting;

    const onEventChange = (id: string) => {
        setEventId(id);
        setArtist(null);
        setError(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);
        try {
            await removeArtistFromEvent({
                variables: {
                    artistName: artist,
                    eventId,
                },
            });
            const eventName = upcomingEvents.find((ev) => ev.id === eventId)?.name;
            setSuccessMessage(`${artist} removed from ${eventName ?? "the event"}.`);
            // Keep the event selected so several artists can be removed in a row
            setArtist(null);
        } catch (err: any) {
            setError(err.message || "Failed to remove artist from event. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={styles.page}>
            <Box sx={styles.inner}>
                <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                    Admin
                </MonoLabel>
                <Box component="h1" sx={styles.title}>
                    Remove artist from event
                </Box>
                <Box component="p" sx={styles.intro}>
                    Detach an artist from an upcoming signing event so they no longer show on its calendar page. Any
                    digest notifications for the pairing that haven't gone out yet are dropped too.
                </Box>

                {eventDataLoading ? (
                    <Box role="status" sx={styles.status}>Loading events…</Box>
                ) : eventDataError ? (
                    <Box role="alert" sx={[styles.message, styles.messageError]}>
                        Error loading data: {eventDataError.message}
                    </Box>
                ) : (
                    <>
                        {successMessage && (
                            <Box role="status" sx={[styles.message, styles.messageSuccess, styles.successSpacing]}>
                                <Box
                                    component="button"
                                    type="button"
                                    aria-label="Dismiss"
                                    onClick={() => setSuccessMessage(null)}
                                    sx={styles.messageDismiss}
                                >
                                    ×
                                </Box>
                                {successMessage}
                            </Box>
                        )}

                        <Box component="form" noValidate onSubmit={onSubmit} sx={styles.form}>
                            {error && (
                                <Box role="alert" sx={[styles.message, styles.messageError]}>{error}</Box>
                            )}

                            <Box component="section" aria-labelledby="remove-from-event-select" sx={styles.panel}>
                                <Box component="h2" id="remove-from-event-select" sx={styles.sectionTitle}>Pairing</Box>
                                <Box component="p" sx={styles.sectionIntro}>
                                    Only events that haven't ended yet are listed.
                                </Box>
                                <Box sx={styles.stack}>
                                    <Box sx={styles.field}>
                                        <MonoLabel component="div" id="remove-from-event-event-label" tracking="tight">
                                            Signing event
                                        </MonoLabel>
                                        <FormControl fullWidth size="small" sx={styles.input}>
                                            <Select
                                                labelId="remove-from-event-event-label"
                                                id="remove-from-event-event"
                                                value={eventId}
                                                displayEmpty
                                                onChange={(e) => onEventChange(e.target.value)}
                                                renderValue={(id) => {
                                                    const ev = upcomingEvents.find((x) => x.id === id);
                                                    return ev
                                                        ? `${ev.name} · ${ev.city}`
                                                        : <Box component="span" sx={styles.placeholder}>Select an event</Box>;
                                                }}
                                                MenuProps={{ sx: styles.menu }}
                                            >
                                                {upcomingEvents.length === 0 && (
                                                    <MenuItem disabled sx={styles.menuItem}>No upcoming events</MenuItem>
                                                )}
                                                {upcomingEvents.map((ev) => (
                                                    <MenuItem value={ev.id} key={ev.id} sx={styles.menuItem}>
                                                        <Box component="span">{ev.name}</Box>
                                                        <MonoLabel tracking="tight" uppercase={false}>
                                                            {ev.city} · {formatRange(ev)}
                                                        </MonoLabel>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Box component="p" sx={styles.fieldHelp}>
                                            The event the artist is no longer attending.
                                        </Box>
                                    </Box>

                                    <Box sx={styles.field}>
                                        <Box component="label" htmlFor="remove-from-event-artist" sx={styles.fieldLabel}>
                                            <MonoLabel tracking="tight">Artist</MonoLabel>
                                        </Box>
                                        <Autocomplete
                                            id="remove-from-event-artist"
                                            options={attendeeNames}
                                            value={artist}
                                            onChange={(_, value) => setArtist(value)}
                                            disabled={!eventId}
                                            loading={attendeesLoading}
                                            noOptionsText="No artists attached to this event"
                                            size="small"
                                            fullWidth
                                            autoHighlight
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props} key={option} sx={styles.menuItem}>
                                                    {option}
                                                </Box>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder={eventId ? "Search this event's artists" : "Select an event first"}
                                                    sx={styles.input}
                                                />
                                            )}
                                            slotProps={{ popper: { sx: styles.menu } }}
                                        />
                                        <Box component="p" sx={styles.fieldHelp}>
                                            {!eventId
                                                ? "Pick an event to see who's attached to it."
                                                : attendeesLoading
                                                    ? "Loading this event's artists…"
                                                    : `${attendeeNames.length.toLocaleString()} artist${attendeeNames.length === 1 ? "" : "s"} attached to this event.`}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={styles.actions}>
                                <Box component="button" type="submit" disabled={!canSubmit} sx={styles.button}>
                                    {submitting ? "Removing…" : "Remove artist from event"}
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default RemoveArtistFromEvent;
