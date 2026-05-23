import React, { useState } from 'react';
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
  alpha,
} from '@mui/material';
import { X, User, CalendarBlank, ArrowSquareOut, ArrowLeft } from "@phosphor-icons/react";
import { GET_NEWS_REVIEW } from '../graphql/queries';
import { colors } from '../../styles/design-tokens';

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

  const { loading, error, data } = useQuery(GET_NEWS_REVIEW, {
    variables: { id: articleId },
    fetchPolicy: 'network-only',
  });

  const article: NewsArticleData | null = data?.newsReview || null;

  const styles = {
    container: {
      backgroundColor: colors.background.dark,
      minHeight: '100vh',
      padding: { xs: 2, md: 4 },
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 3,
      color: colors.primary.main,
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.95rem',
      transition: 'all 200ms',
      '&:hover': {
        color: colors.primary.dark,
      },
    },
    articleCard: {
      backgroundColor: colors.neutral.white,
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.neutral[200]}`,
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
      border: `2px solid ${colors.primary.main}`,
    },
    articleTitle: {
      fontWeight: 700,
      color: colors.neutral[900],
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '1.75rem',
      flex: 1,
    },
    summary: {
      color: colors.neutral[700],
      fontSize: '1.05rem',
      fontStyle: 'italic',
      mb: 2,
      lineHeight: 1.6,
    },
    content: {
      color: colors.neutral[800],
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
      backgroundColor: colors.primary.main,
      color: colors.neutral.white,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: colors.primary.dark,
        transform: 'scale(1.05)',
      },
      '& .MuiChip-label': {
        fontWeight: 600,
      },
    },
    dateText: {
      color: colors.neutral[600],
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    },
    sourceButton: {
      textTransform: 'none',
      color: colors.primary.main,
      fontWeight: 600,
      borderColor: colors.primary.main,
      '&:hover': {
        borderColor: colors.primary.dark,
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
              color: colors.primary.main,
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: `1px solid ${colors.primary.main}`,
              transition: 'all 200ms',
              '&:hover': {
                color: colors.primary.dark,
                borderBottomWidth: '2px',
                backgroundColor: alpha(colors.primary.main, 0.05),
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
              <CircularProgress sx={{ color: colors.primary.main }} size={48} />
              <Typography sx={{ mt: 2, color: colors.neutral[700] }}>Loading article...</Typography>
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
          <Alert
            severity="error"
            sx={{
              borderRadius: '12px',
              border: `1px solid ${colors.accent.red}`,
              backgroundColor: colors.accent.redLight,
            }}
          >
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
            <ArrowLeft size={20} />
            Back to News
          </Box>
          <Alert
            severity="warning"
            sx={{
              borderRadius: '12px',
              border: `1px solid ${colors.accent.orange}`,
              backgroundColor: colors.neutral[50],
            }}
          >
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
          <ArrowLeft size={20} />
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
                    icon={<User size={14} weight="duotone" color={colors.neutral.white} />}
                    label={name}
                    onClick={() => handleArtistClick(name)}
                    sx={styles.artistChip}
                  />
                ))
              ) : (
                <Chip
                  label="General News"
                  sx={{
                    backgroundColor: colors.neutral[600],
                    color: colors.neutral.white,
                    fontWeight: 600,
                  }}
                />
              )}
              <Box sx={styles.dateText}>
                <CalendarBlank size={16} weight="duotone" />
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
                    border: `1px solid ${colors.neutral[300]}`,
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
                    color: colors.neutral[600],
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
                endIcon={<ArrowSquareOut size={18} />}
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
            sx: { backgroundColor: alpha(colors.neutral.black, 0.9) },
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
                color: colors.neutral.white,
                '&:hover': {
                  backgroundColor: alpha(colors.neutral.white, 0.1),
                },
              }}
            >
              <X size={32} />
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
