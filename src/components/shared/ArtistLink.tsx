import { useMemo } from 'react';
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ARTIST_FILTER_FLAGS } from '../graphql/queries';
import { colors, transitions } from '../../styles/design-tokens';

interface ArtistLinkProps {
  name: string;
}

/**
 * Resolves an artist name against the directory and renders a profile link, or
 * plain text if the name is not found. Never produces a broken link.
 */
const ArtistLink = ({ name }: ArtistLinkProps) => {
  const { data } = useQuery(GET_ARTIST_FILTER_FLAGS);

  const canonicalName = useMemo(() => {
    if (!data?.artistFilterFlags || !name) return null;
    const trimmed = name.toLowerCase().trim();
    return (
      data.artistFilterFlags.find(
        (a: { name: string }) => a.name.toLowerCase().trim() === trimmed
      )?.name ?? null
    );
  }, [data, name]);

  if (!canonicalName) return <>{name}</>;

  return (
    <MuiLink
      component={RouterLink}
      to={`/artist/${encodeURIComponent(canonicalName)}`}
      sx={{
        color: colors.primary.main,
        textDecoration: 'none',
        fontStyle: 'inherit',
        transition: transitions.fast,
        '&:hover': {
          color: colors.primary.dark,
          textDecoration: 'underline',
        },
      }}
    >
      {name}
    </MuiLink>
  );
};

export default ArtistLink;
