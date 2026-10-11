import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Box, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ADD_SIGNINGEVENT } from "../graphql/mutations";
import { GET_SIGNINGEVENTS } from "../graphql/queries";
import { RootState } from "../../store/store";
import { eventFormStyles as styles } from "../../styles/event-form-styles";
import MonoLabel from "../shared/MonoLabel";

interface FieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    wide?: boolean;
}

const Field = ({ id, label, value, onChange, type, placeholder, wide }: FieldProps) => (
    <Box sx={[styles.field, !!wide && styles.fieldWide]}>
        <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
            <MonoLabel tracking="tight">{label}</MonoLabel>
        </Box>
        <TextField
            id={id}
            type={type}
            fullWidth
            size="small"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={styles.input}
        />
    </Box>
);

interface DateFieldProps {
    id: string;
    label: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    minDate?: Dayjs;
}

const DateField = ({ id, label, value, onChange, minDate }: DateFieldProps) => (
    <Box sx={styles.field}>
        <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
            <MonoLabel tracking="tight">{label}</MonoLabel>
        </Box>
        <DatePicker
            value={value}
            onChange={onChange}
            minDate={minDate}
            slotProps={{
                textField: { id, fullWidth: true, size: "small", sx: styles.input },
                popper: { sx: styles.menu },
            }}
        />
    </Box>
);

const AddEvent = () => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const [addSigningEvent] = useMutation(ADD_SIGNINGEVENT, {
        refetchQueries: [{ query: GET_SIGNINGEVENTS }],
    });
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [url, setUrl] = useState("");
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    const canSubmit = !!name.trim() && !!city.trim() && !!startDate && !!endDate && !submitting;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);
        try {
            await addSigningEvent({
                variables: {
                    name,
                    city,
                    url: url || null,
                    startDate: startDate?.toString(),
                    endDate: endDate?.toString(),
                },
            });
            setSuccessMessage(`"${name}" added successfully.`);
            setName("");
            setCity("");
            setUrl("");
            setStartDate(null);
            setEndDate(null);
        } catch (err: any) {
            setError(err.message || "Failed to add event. Please try again.");
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
                    Add signing event
                </Box>
                <Box component="p" sx={styles.intro}>
                    Create a convention or signing event for the calendar. Artists can be attached to it afterwards from
                    the "Add artist to event" page.
                </Box>

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

                    <Box component="section" aria-labelledby="add-event-info" sx={styles.panel}>
                        <Box component="h2" id="add-event-info" sx={styles.sectionTitle}>Event information</Box>
                        <Box component="p" sx={styles.sectionIntro}>What the event is called and where it happens.</Box>
                        <Box sx={styles.fieldGrid}>
                            <Field id="add-event-name" label="Event name" value={name} onChange={setName} />
                            <Field id="add-event-city" label="City" value={city} onChange={setCity} />
                            <Field
                                id="add-event-url"
                                label="Event URL (optional)"
                                type="url"
                                placeholder="https://"
                                value={url}
                                onChange={setUrl}
                                wide
                            />
                        </Box>
                    </Box>

                    <Box component="section" aria-labelledby="add-event-dates" sx={styles.panel}>
                        <Box component="h2" id="add-event-dates" sx={styles.sectionTitle}>Event dates</Box>
                        <Box component="p" sx={styles.sectionIntro}>Use the same day for both if it's a one-day event.</Box>
                        <Box sx={styles.dateRow}>
                            <DateField id="add-event-start" label="Start date" value={startDate} onChange={setStartDate} />
                            <DateField
                                id="add-event-end"
                                label="End date"
                                value={endDate}
                                onChange={setEndDate}
                                minDate={startDate ?? undefined}
                            />
                        </Box>
                    </Box>

                    <Box sx={styles.actions}>
                        <Box component="button" type="submit" disabled={!canSubmit} sx={styles.button}>
                            {submitting ? "Adding…" : "Add event"}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AddEvent;
