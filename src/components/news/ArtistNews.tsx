import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { User, CalendarBlank, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { GET_NEWS_REVIEWS_BY_ARTIST } from '../graphql/queries';

interface NewsArticle {
  id: string;
  artistPostId: string;
  artistId: string;
  artistName: string;
  title: string;
  content: string;
  summary: string;
  sourcePostUrl: string;
  generatedAt: string;
  isReviewed: boolean;
  isPublished: boolean;
  publishedAt?: string;
}

const ArtistNews: React.FC = () => {
  const navigate = useNavigate();
  const { artistName } = useParams<{ artistName: string }>();
  const decodedArtistName = artistName ? decodeURIComponent(artistName) : '';

  const { loading, error, data } = useQuery(GET_NEWS_REVIEWS_BY_ARTIST, {
    variables: { artistName: decodedArtistName, limit: 100 },
    fetchPolicy: 'network-only',
    skip: !decodedArtistName,
  });

  const articles: NewsArticle[] = data?.newsReviewsByArtist || [];

  const styles = {
    container: {
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: { xs: 2, md: 4 },
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
    header: {
      textAlign: 'center',
      mb: 4,
    },
    title: {
      fontWeight: 700,
      color: '#2d4a36',
      mb: 1,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    subtitle: {
      color: '#616161',
      fontSize: '1.1rem',
    },
    articleCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #eeeeee',
      mb: 3,
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-2px)',
        borderColor: '#2d4a36',
      },
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 2,
    },
    artistAvatar: {
      width: 50,
      height: 50,
      borderRadius: '8px',
      border: '2px solid #2d4a36',
    },
    articleTitle: {
      fontWeight: 700,
      color: '#212121',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '1.25rem',
      flex: 1,
    },
    summary: {
      color: '#616161',
      fontSize: '1rem',
      lineHeight: 1.6,
      mb: 2,
    },
    metaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap',
      mb: 2,
    },
    artistChip: {
      backgroundColor: '#2d4a36',
      color: '#ffffff',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: '#1a2d21',
        transform: 'scale(1.05)',
      },
      '& .MuiChip-label': {
        fontWeight: 600,
      },
    },
    dateText: {
      color: '#757575',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    },
    readMore: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      color: '#2d4a36',
      fontWeight: 600,
      fontSize: '0.9rem',
      mt: 1,
    },
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleArticleClick = (articleId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.MuiChip-root')) {
      return;
    }
    navigate(`/news/${articleId}`);
  };

  const handleArtistClick = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedName = encodeURIComponent(name);
    navigate(`/artist/${formattedName}`);
  };

  const getArtistImageFilename = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '');
  };

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#2d4a36' }} size={48} />
              <Typography sx={{ mt: 2, color: '#616161' }}>Loading news articles...</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ borderRadius: '12px', border: '1px solid #e74c3c', backgroundColor: '#fef5f5' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Error Loading News</Typography>
            <Typography>{error.message}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Box
          onClick={() => navigate(`/artist/${encodeURIComponent(decodedArtistName)}`)}
          sx={styles.backButton}
        >
          <ArrowLeft size={20} />
          Back to {decodedArtistName}
        </Box>

        <Box sx={styles.header}>
          <Typography variant="h4" sx={styles.title}>
            News for {decodedArtistName}
          </Typography>
          <Typography sx={styles.subtitle}>
            All news articles featuring this artist
          </Typography>
        </Box>

        {articles.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
              No news articles yet
            </Typography>
            <Typography sx={{ color: '#9e9e9e' }}>
              Check back soon for updates about {decodedArtistName}!
            </Typography>
          </Paper>
        ) : (
          <Box>
            {articles.map((article) => (
              <Card
                key={article.id}
                sx={styles.articleCard}
                onClick={(e) => handleArticleClick(article.id, e)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={styles.titleContainer}>
                    <Avatar
                      src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${getArtistImageFilename(article.artistName)}.jpg`}
                      alt={article.artistName}
                      variant="rounded"
                      sx={styles.artistAvatar}
                    />
                    <Typography variant="h5" sx={styles.articleTitle}>
                      {article.title}
                    </Typography>
                  </Box>

                  <Box sx={styles.metaInfo}>
                    <Chip
                      icon={<User size={14} weight="duotone" color="#ffffff" />}
                      label={article.artistName}
                      onClick={(e) => handleArtistClick(article.artistName, e)}
                      sx={styles.artistChip}
                      size="small"
                    />
                    <Box sx={styles.dateText}>
                      <CalendarBlank size={15} weight="duotone" />
                      <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                        {formatDate(article.publishedAt || article.generatedAt) || 'Recently published'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={styles.summary}>
                    {article.summary}
                  </Typography>

                  <Box sx={styles.readMore}>
                    Read more <ArrowRight size={16} style={{ marginLeft: 4 }} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ArtistNews;
