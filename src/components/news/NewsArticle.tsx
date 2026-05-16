import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Link,
  IconButton,
  Modal,
  Backdrop,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GET_NEWS_REVIEW } from '../graphql/queries';

interface NewsArticleData {
  id: string;
  artistPostId: string;
  artistId: string;
  artistName: string;
  artistIds?: string[];
  artistNames?: string[];
  title: string;
  content: string;
  summary: string;
  sourcePostUrl: string;
  imageUrl?: string;
  generatedAt: string;
  isReviewed: boolean;
  isPublished: boolean;
  publishedAt?: string;
}

const NewsArticle: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  const { loading, error, data } = useQuery(GET_NEWS_REVIEW, {
    variables: { id: articleId },
    fetchPolicy: 'network-only',
  });

  const article: NewsArticleData | null = data?.newsReview || null;

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
    articleCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #eeeeee',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 2,
    },
    artistAvatar: {
      width: 60,
      height: 60,
      borderRadius: '8px',
      border: '2px solid #2d4a36',
    },
    articleTitle: {
      fontWeight: 700,
      color: '#212121',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '1.75rem',
      flex: 1,
    },
    summary: {
      color: '#616161',
      fontSize: '1.05rem',
      fontStyle: 'italic',
      mb: 2,
      lineHeight: 1.6,
    },
    content: {
      color: '#424242',
      fontSize: '1rem',
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap',
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
    sourceButton: {
      textTransform: 'none',
      color: '#2d4a36',
      fontWeight: 600,
      borderColor: '#2d4a36',
      '&:hover': {
        borderColor: '#1a2d21',
        backgroundColor: 'rgba(45, 74, 54, 0.04)',
      },
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

  const handleArtistClick = (artistName: string) => {
    const formattedName = encodeURIComponent(artistName);
    navigate(`/artist/${formattedName}`);
  };

  const getArtistImageFilename = (artistName: string) => {
    return artistName.toLowerCase().replace(/\s+/g, '');
  };

  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Link
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#2d4a36',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '1px solid #2d4a36',
              transition: 'all 200ms',
              '&:hover': {
                color: '#1a2d21',
                borderBottomWidth: '2px',
                backgroundColor: 'rgba(45, 74, 54, 0.05)',
              },
            }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#2d4a36' }} size={48} />
              <Typography sx={{ mt: 2, color: '#616161' }}>Loading article...</Typography>
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Error Loading Article</Typography>
            <Typography>{error.message}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Box
            onClick={() => navigate('/news')}
            sx={styles.backButton}
          >
            <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
            Back to News
          </Box>
          <Alert severity="warning" sx={{ borderRadius: '12px', border: '1px solid #f39c12', backgroundColor: '#fffbf0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Article Not Found</Typography>
            <Typography>The article you're looking for doesn't exist or has been removed.</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  // Get all artist names (handles both legacy and new format)
  const artistNames = article.artistNames && article.artistNames.length > 0
    ? article.artistNames
    : article.artistName
      ? [article.artistName]
      : [];
  const primaryArtist = artistNames[0] || '';

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Box
          onClick={() => navigate('/news')}
          sx={styles.backButton}
        >
          <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
          Back to News
        </Box>

        <Card sx={styles.articleCard}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={styles.titleContainer}>
              {primaryArtist && (
                <Avatar
                  src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${getArtistImageFilename(primaryArtist)}.jpg`}
                  alt={primaryArtist}
                  variant="rounded"
                  sx={styles.artistAvatar}
                />
              )}
              <Typography variant="h4" sx={styles.articleTitle}>
                {article.title}
              </Typography>
            </Box>

            <Box sx={styles.metaInfo}>
              {artistNames.length > 0 ? (
                artistNames.map((name) => (
                  <Chip
                    key={name}
                    icon={<PersonIcon sx={{ color: '#ffffff !important' }} />}
                    label={name}
                    onClick={() => handleArtistClick(name)}
                    sx={styles.artistChip}
                  />
                ))
              ) : (
                <Chip
                  label="General News"
                  sx={{
                    backgroundColor: '#757575',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                />
              )}
              <Box sx={styles.dateText}>
                <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                <Typography component="span" sx={{ fontSize: '0.9rem' }}>
                  {formatDate(article.publishedAt || article.generatedAt) || 'Recently published'}
                </Typography>
              </Box>
            </Box>

            <Typography sx={styles.summary}>
              {article.summary}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography sx={styles.content}>
              {renderContentWithLinks(article.content)}
            </Typography>

            {article.imageUrl && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box
                  onClick={() => setImageModalOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    transition: 'all 200ms',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={article.imageUrl}
                    alt={article.title}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 1,
                    color: '#757575',
                  }}
                >
                  Click image to view full size
                </Typography>
              </>
            )}
          </CardContent>

          { article.sourcePostUrl !== '' &&
            <>
            <CardActions sx={{ px: 4, pb: 3 }}>
              <Button
                variant="outlined"
                size="small"
                href={article.sourcePostUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={styles.sourceButton}
              >
                View Original Post
              </Button>
          </CardActions>
          </>
          }
        </Card>

        {/* Full-size image modal */}
        <Modal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 300,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '95vw',
              maxHeight: '95vh',
              outline: 'none',
            }}
          >
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: 'absolute',
                top: -48,
                right: 0,
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            <Box
              component="img"
              src={article.imageUrl}
              alt={article.title}
              onClick={() => setImageModalOpen(false)}
              sx={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                objectFit: 'contain',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default NewsArticle;
