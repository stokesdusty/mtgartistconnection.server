import { Box, TextField } from "@mui/material";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { addArtistStyles as styles } from "../../styles/add-artist-styles";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl from "../shared/SegmentedControl";

// Fields shared by the admin Add Artist and Edit Artist pages.

export type YesNo = "true" | "false";

export const YES_NO_OPTIONS = [
    { value: "false" as const, label: "No" },
    { value: "true" as const, label: "Yes" },
];

/** Older data mixes "true"/"yes"/"no"/"unknown"; anything but yes counts as no. */
export const toYesNo = (value?: string | null): YesNo => (value === "true" || value === "yes" ? "true" : "false");

interface FieldProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    register: UseFormRegister<T>;
    idPrefix: string;
    type?: string;
    placeholder?: string;
    multiline?: boolean;
    wide?: boolean;
}

export const Field = <T extends FieldValues>({ name, label, register, idPrefix, type, placeholder, multiline, wide }: FieldProps<T>) => {
    const id = `${idPrefix}-${name}`;
    return (
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
                multiline={multiline}
                minRows={multiline ? 3 : undefined}
                {...register(name)}
                sx={styles.input}
            />
        </Box>
    );
};

interface OptionRowProps {
    label: string;
    value: YesNo;
    onChange: (value: YesNo) => void;
}

export const OptionRow = ({ label, value, onChange }: OptionRowProps) => (
    <Box sx={styles.optionRow}>
        <Box component="span" sx={styles.optionLabel}>{label}</Box>
        <SegmentedControl options={YES_NO_OPTIONS} value={value} onChange={onChange} aria-label={label} />
    </Box>
);
