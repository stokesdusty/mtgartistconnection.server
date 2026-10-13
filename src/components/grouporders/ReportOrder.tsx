import { FormEvent, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { Flag } from "@phosphor-icons/react";
import { REPORT_GROUP_ORDER } from "../graphql/mutations";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { ErrorMessage, useAction } from "./GroupOrderParts";

/** "Report this order": sends a note to the site's admins, e.g. about a suspected scam. */
const ReportOrder = ({ orderId }: { orderId: string }) => {
  const [reportOrder] = useMutation(REPORT_GROUP_ORDER);
  const { run, error, busy } = useAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState('');

  if (done) return <Box component="p" role="status" sx={styles.fieldHint}>{done}</Box>;
  if (!open) {
    return (
      <Button startIcon={<Flag size={14} />} onClick={() => setOpen(true)} sx={[styles.textButton, { alignSelf: 'flex-start' }]}>
        Report this order
      </Button>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { data } = await reportOrder({ variables: { orderId, reason: reason.trim() } });
      setDone(data.reportGroupOrder.message || 'Thanks. An admin will look at this order.');
    });
  };

  return (
    <Box component="form" onSubmit={submit} aria-label="Report this order" sx={styles.panel}>
      <Box component="h2" sx={[styles.sectionTitle, { mb: 1 }]}>Report this order</Box>
      <Box component="p" sx={styles.sectionIntro}>
        Tell the site's admins what's wrong, e.g. the organizer isn't who they claim to be or asked for payment outside the order.
        Only admins see this.
      </Box>
      <ErrorMessage>{error}</ErrorMessage>
      <TextField multiline minRows={3} fullWidth value={reason} onChange={(e) => setReason(e.target.value)}
        inputProps={{ maxLength: 1000, 'aria-label': "What's wrong?" }} sx={[styles.input, { mb: 2 }]} />
      <Box sx={styles.actions}>
        <Button type="submit" disabled={busy || reason.trim().length < 10} sx={styles.primaryButton}>Send report</Button>
        <Button onClick={() => setOpen(false)} sx={styles.secondaryButton}>Cancel</Button>
      </Box>
    </Box>
  );
};

export default ReportOrder;
