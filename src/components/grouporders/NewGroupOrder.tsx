import { Box } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { CREATE_GROUP_ORDER } from "../graphql/mutations";
import { GET_MY_DISCORD_NAME } from "../graphql/queries";
import { usePageTitle } from "../../hooks/usePageTitle";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { emptySettingsForm } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import GroupOrderSettingsForm from "./GroupOrderSettingsForm";
import { GroupOrderPage, PageStatus } from "./GroupOrderParts";

const NewGroupOrder = () => {
  usePageTitle('New group order');
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_MY_DISCORD_NAME, { skip: !isLoggedIn, fetchPolicy: 'network-only' });
  const [createGroupOrder] = useMutation(CREATE_GROUP_ORDER);

  if (!isLoggedIn) return <Navigate to="/auth?redirect=%2Ftracker%2Fgroup%2Fnew" replace />;
  if (loading) return <PageStatus>Loading…</PageStatus>;

  return (
    <GroupOrderPage>
      <Box sx={styles.hero}>
        <Box>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>Group order</MonoLabel>
          <Box component="h1" sx={styles.title}>New group order</Box>
          <Box component="p" sx={styles.subtitle}>
            Carry cards to a signing for other people. It starts as a draft, so nobody can join until you open it.
          </Box>
        </Box>
      </Box>
      <GroupOrderSettingsForm
        initial={emptySettingsForm(data?.me?.discordName ?? '')}
        submitLabel="Create draft"
        onSubmit={async (input) => {
          const { data: created } = await createGroupOrder({ variables: input });
          navigate(`/tracker/group/${created.createGroupOrder.id}`);
        }}
      />
    </GroupOrderPage>
  );
};

export default NewGroupOrder;
