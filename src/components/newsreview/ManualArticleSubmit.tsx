import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GET_ARTISTS_FOR_HOMEPAGE } from '../graphql/queries';
import { GENERATE_MANUAL_NEWS_ARTICLE } from '../graphql/mutations';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface Artist {
  name: string;
  filename: string;
}

const ManualArticleSubmit: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);
  const [generateArticle, { loading: generating }] = useMutation(GENERATE_MANUAL_NEWS_ARTICLE);

  const artists: Artist[] = artistsData?.artists || [];
  const sortedArtists = [...artists].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedArtist) {
      setError('Please select an artist');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content for the article');
      return;
    }

    try {
      const result = await generateArticle({
        variables: {
          artistName: selectedArtist.name,
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || null,
        },
      });

      if (result.data?.generateManualNewsArticle) {
        setSuccess(`Article "${result.data.generateManualNewsArticle.title}" created successfully! Redirecting to review...`);
        setSelectedArtist(null);
        setContent('');
        setSourceUrl('');

        // Redirect to news review page after a short delay
        setTimeout(() => {
          navigate('/reviewnews');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate article');
    }
  };

  const styles = {
    container: {
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      py: 4,
    },
    paper: {
      p: 4,
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    header: {
      mb: 4,
    },
    title: {
      fontWeight: 700,
      color: '#2d4a36',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    subtitle: {
      color: '#616161',
      mt: 1,
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 3,
      color: '#2d4a36',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.95rem',
      transition: 'all 200ms',
      '&:hover': {
        color: '#1a2d21',
      },
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    submitButton: {
      backgroundColor: '#2d4a36',
      color: '#fff',
      fontWeight: 600,
      py: 1.5,
      '&:hover': {
        backgroundColor: '#1a2d21',
      },
      '&:disabled': {
        backgroundColor: '#ccc',
      },
    },
  };

  if (!isAdmin) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Alert severity="error">
            You must be an admin to access this page.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Box
          onClick={() => navigate('/reviewnews')}
          sx={styles.backButton}
        >
          <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
          Back to News Review
        </Box>

        <Paper sx={styles.paper}>
          <Box sx={styles.header}>
            <Typography variant="h4" sx={styles.title}>
              Submit Manual Article
            </Typography>
            <Typography sx={styles.subtitle}>
              Enter content about an artist and let AI generate a news article for review
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
            <Autocomplete
              options={sortedArtists}
              getOptionLabel={(option) => option.name}
              value={selectedArtist}
              onChange={(_, newValue) => setSelectedArtist(newValue)}
              loading={artistsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Artist"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {artistsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                      src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${option.filename}.jpg`}
                      alt={option.name}
                      style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {option.name}
                  </Box>
                </li>
              )}
            />

            <TextField
              label="Content"
              multiline
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter the content you want to turn into a news article. This can be a social media post, announcement, or any information about the artist's activities..."
              helperText="The AI will use this content to generate a professionally written news article"
            />

            <TextField
              label="Source URL (Optional)"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              helperText="Link to the original source if available (social media post, website, etc.)"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={generating || !selectedArtist || !content.trim()}
              endIcon={generating ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={styles.submitButton}
            >
              {generating ? 'Generating Article...' : 'Generate Article'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ManualArticleSubmit;
