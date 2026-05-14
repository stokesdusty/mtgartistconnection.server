import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  ButtonGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArticleIcon from '@mui/icons-material/Article';
import { GET_ARTIST_POSTS } from '../graphql/queries';
import { UPDATE_ARTIST_POST, DELETE_ARTIST_POST, DELETE_REVIEWED_ARTIST_POSTS, GENERATE_NEWS_ARTICLE } from '../graphql/mutations';

interface ArtistPost {
  id: string;
  externalPostId: string;
  platform: string;
  artistId: string;
  artistName: string;
  content: string;
  fetchedAt: string;
  isReviewed: boolean;
  postDate: string;
  postUrl: string;
}

const AdminPostReview: React.FC = () => {
  const [showReviewed, setShowReviewed] = useState<boolean>(false);

  // GraphQL query to fetch posts
  const { loading, error, data, refetch } = useQuery(GET_ARTIST_POSTS, {
    variables: { isReviewed: showReviewed ? true : false, limit: 100 },
    fetchPolicy: 'network-only',
  });

  // GraphQL mutations
  const [updateArtistPost] = useMutation(UPDATE_ARTIST_POST);
  const [deleteArtistPost] = useMutation(DELETE_ARTIST_POST);
  const [deleteReviewedPosts] = useMutation(DELETE_REVIEWED_ARTIST_POSTS);
  const [generateNewsArticle] = useMutation(GENERATE_NEWS_ARTICLE);

  const posts: ArtistPost[] = data?.artistPosts || [];
  const [generatingArticle, setGeneratingArticle] = useState<string | null>(null);

  const handleReview = async (id: string) => {
    try {
      const result = await updateArtistPost({
        variables: { id, isReviewed: true },
      });

      if (result.data?.updateArtistPost?.success) {
        await refetch();
      } else {
        alert('Failed to update post status.');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      alert('An error occurred while updating the post.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this artist post?')) return;

    try {
      const result = await deleteArtistPost({
        variables: { id },
      });

      if (result.data?.deleteArtistPost?.success) {
        await refetch();
      } else {
        alert('Failed to delete post.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('An error occurred while deleting the post.');
    }
  };

  const handleDeleteAllReviewed = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reviewed posts? This action cannot be undone.')) return;

    try {
      const result = await deleteReviewedPosts();

      if (result.data?.deleteReviewedArtistPosts?.success) {
        alert(result.data.deleteReviewedArtistPosts.message);
        await refetch();
      } else {
        alert('Failed to delete reviewed posts.');
      }
    } catch (err) {
      console.error('Error deleting reviewed posts:', err);
      alert('An error occurred while deleting reviewed posts.');
    }
  };

  const handleGenerateArticle = async (id: string) => {
    if (!window.confirm('Generate a news article from this post using AI?')) return;

    try {
      setGeneratingArticle(id);
      const result = await generateNewsArticle({
        variables: { artistPostId: id },
      });

      if (result.data?.generateNewsArticle) {
        alert('News article generated successfully! You can review it in the News Review section.');
      } else {
        alert('Failed to generate news article.');
      }
    } catch (err: any) {
      console.error('Error generating article:', err);
      alert(err.message || 'An error occurred while generating the article.');
    } finally {
      setGeneratingArticle(null);
    }
  };

  const styles = {
    container: {
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: { xs: 2, md: 4 },
    },
    paper: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      border: '1px solid #eeeeee',
      overflow: 'hidden',
    },
    header: {
      padding: { xs: 2, md: 3 },
      borderBottom: '1px solid #e0e0e0',
    },
    title: {
      fontWeight: 700,
      color: '#2d4a36',
      mb: 0.5,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    subtitle: {
      color: '#616161',
      fontSize: '0.875rem',
      mb: 2,
    },
    button: {
      backgroundColor: '#2d4a36',
      color: '#ffffff',
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: '#1a2d21',
      },
    },
    outlineButton: {
      color: '#2d4a36',
      borderColor: '#2d4a36',
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: '#1a2d21',
        backgroundColor: 'rgba(45, 74, 54, 0.04)',
      },
    },
    postCard: {
      padding: 3,
      borderBottom: '1px solid #e0e0e0',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: '#fafafa',
      },
    },
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      bluesky: '#0085FF',
      facebook: '#1877F2',
      patreon: '#FF424D',
      other: '#757575'
    };
    return colors[platform.toLowerCase()] || '#757575';
  };


  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#2d4a36' }} size={48} />
                <Typography sx={{ mt: 2, color: '#616161' }}>Loading artist posts...</Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{
              borderRadius: '12px',
              border: '1px solid #e74c3c',
              backgroundColor: '#fef5f5',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Error Loading Posts</Typography>
            <Typography>{error.message}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={styles.paper}>
          <Box sx={styles.header}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={styles.title}>
                  Social Post Review Queue
                </Typography>
                <Typography sx={styles.subtitle}>
                  Manage imported posts from social platforms
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    variant={!showReviewed ? 'contained' : 'outlined'}
                    onClick={() => setShowReviewed(false)}
                    sx={!showReviewed ? styles.button : styles.outlineButton}
                  >
                    Unreviewed
                    <Chip
                      label={!showReviewed ? posts.length : '...'}
                      size="small"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  </Button>
                  <Button
                    variant={showReviewed ? 'contained' : 'outlined'}
                    onClick={() => setShowReviewed(true)}
                    sx={showReviewed ? styles.button : styles.outlineButton}
                  >
                    Reviewed
                    <Chip
                      label={showReviewed ? posts.length : '...'}
                      size="small"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  </Button>
                </ButtonGroup>
                {showReviewed && posts.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleDeleteAllReviewed}
                    startIcon={<DeleteIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Delete All Reviewed
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box
                component="svg"
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                fill="#bdbdbd"
                viewBox="0 0 16 16"
                sx={{ mb: 2 }}
              >
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
              </Box>
              <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
                No {showReviewed ? 'reviewed' : 'unreviewed'} posts
              </Typography>
              <Typography sx={{ color: '#9e9e9e', fontSize: '0.875rem' }}>
                Check back later for new posts from social platforms
              </Typography>
            </Box>
          ) : (
            <Box>
              {posts.map((post, index) => (
                <Box
                  key={post.id}
                  sx={{
                    ...styles.postCard,
                    borderLeft: !post.isReviewed ? '4px solid #27ae60' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                          {post.artistName}
                        </Typography>
                        <Chip
                          label={post.platform}
                          size="small"
                          sx={{
                            backgroundColor: getPlatformColor(post.platform),
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          mb: 1.5,
                          color: '#424242',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.content || <em style={{ color: '#9e9e9e' }}>No text content</em>}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          sx={{
                            textTransform: 'none',
                            color: '#2d4a36',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          View Original
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
                      <Tooltip title="Generate news article with AI">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleGenerateArticle(post.id)}
                          startIcon={generatingArticle === post.id ? <CircularProgress size={16} /> : <ArticleIcon />}
                          disabled={generatingArticle === post.id}
                          sx={{
                            ...styles.outlineButton,
                            minWidth: '140px',
                          }}
                        >
                          {generatingArticle === post.id ? 'Generating...' : 'Generate Article'}
                        </Button>
                      </Tooltip>
                      {!post.isReviewed && (
                        <Tooltip title="Mark as reviewed">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleReview(post.id)}
                            startIcon={<CheckCircleIcon />}
                            sx={{
                              ...styles.button,
                              backgroundColor: '#27ae60',
                              '&:hover': {
                                backgroundColor: '#1e8449',
                              },
                            }}
                          >
                            Mark Reviewed
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete post">
                        <IconButton
                          onClick={() => handleDelete(post.id)}
                          size="small"
                          sx={{
                            color: '#e74c3c',
                            '&:hover': {
                              backgroundColor: 'rgba(231, 76, 60, 0.08)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPostReview;
