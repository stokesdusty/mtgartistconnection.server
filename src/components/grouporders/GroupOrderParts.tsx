import { ReactNode, useCallback, useState } from "react";
import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";

export const BackLink = ({ to = '/signingtracker', children = 'Signing tracker' }: { to?: string; children?: ReactNode }) => (
  <Box component={RouterLink} to={to} sx={styles.backLink}>
    <ArrowLeft size={14} aria-hidden />
    {children}
  </Box>
);

/** Page chrome for group order screens: background, width and the back link. */
export const GroupOrderPage = ({ children, back = true }: { children: ReactNode; back?: boolean }) => (
  <Box sx={styles.page}>
    <Box sx={styles.inner}>
      {back && <BackLink />}
      {children}
    </Box>
  </Box>
);

export const PageStatus = ({ children }: { children: ReactNode }) => (
  <GroupOrderPage>
    <Box role="status" sx={styles.loading}>{children}</Box>
  </GroupOrderPage>
);

export const ErrorMessage = ({ children }: { children: ReactNode }) =>
  children ? <Box role="alert" sx={[styles.message, styles.messageError]}>{children}</Box> : null;

export const DisabledNotice = ({ reason }: { reason: string | null }) => (
  <Box role="alert" sx={[styles.message, styles.messageError]}>
    An admin disabled this order, so nothing in it can be changed.{reason ? ` Reason: ${reason}` : ''}
  </Box>
);

/** Runs a mutation, keeping its error message and in-flight state for the panel that fired it. */
export function useAction() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);
  return { run, error, busy };
}

export const formatShortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
