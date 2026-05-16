import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Trash, CheckCircle, PencilSimple, UploadSimple, ArrowSquareOut, Plus } from "@phosphor-icons/react";
import { GET_NEWS_REVIEWS } from '../graphql/queries';
import { UPDATE_NEWS_REVIEW, DELETE_NEWS_REVIEW } from '../graphql/mutations';

interface NewsReview {
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

const NewsReview: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'unreviewed' | 'reviewed' | 'published'>('unreviewed');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsReview | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Determine query variables based on filter
  const getQueryVariables = () => {
    switch (filter) {
      case 'unreviewed':
        return { isReviewed: false, limit: 100 };
      case 'reviewed':
        return { isReviewed: true, isPublished: false, limit: 100 };
      case 'published':
        return { isPublished: true, limit: 100 };
      default:
        return { limit: 100 };
    }
  };

  const { loading, error, data, refetch } = useQuery(GET_NEWS_REVIEWS, {
    variables: getQueryVariables(),
    fetchPolicy: 'network-only',
  });

  const [updateNewsReview] = useMutation(UPDATE_NEWS_REVIEW);
  const [deleteNewsReview] = useMutation(DELETE_NEWS_REVIEW);

  const articles: NewsReview[] = data?.newsReviews || [];

  const handleEdit = (article: NewsReview) => {
    setSelectedArticle(article);
    setEditedTitle(article.title);
    setEditedSummary(article.summary);
    setEditedContent(article.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedArticle) return;

    try {
      const result = await updateNewsReview({
        variables: {
          id: selectedArticle.id,
          title: editedTitle,
          summary: editedSummary,
          content: editedContent,
        },
      });

      if (result.data?.updateNewsReview?.success) {
        setEditDialogOpen(false);
        await refetch();
        alert('Article updated successfully!');
      } else {
        alert('Failed to update article.');
      }
    } catch (err) {
      console.error('Error updating article:', err);
      alert('An error occurred while updating the article.');
    }
  };

  const handleMarkReviewed = async (id: string) => {
    try {
      const result = await updateNewsReview({
        variables: { id, isReviewed: true },
      });

      if (result.data?.updateNewsReview?.success) {
        await refetch();
      } else {
        alert('Failed to mark article as reviewed.');
      }
    } catch (err) {
      console.error('Error marking article as reviewed:', err);
      alert('An error occurred while updating the article.');
    }
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm('Publish this article to the website?')) return;

    try {
      const result = await updateNewsReview({
        variables: { id, isPublished: true, isReviewed: true },
      });

      if (result.data?.updateNewsReview?.success) {
        await refetch();
        alert('Article published successfully!');
      } else {
        alert('Failed to publish article.');
      }
    } catch (err) {
      console.error('Error publishing article:', err);
      alert('An error occurred while publishing the article.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const result = await deleteNewsReview({
        variables: { id },
      });

      if (result.data?.deleteNewsReview?.success) {
        await refetch();
      } else {
        alert('Failed to delete article.');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('An error occurred while deleting the article.');
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
    articleCard: {
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

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#2d4a36' }} size={48} />
                <Typography sx={{ mt: 2, color: '#616161' }}>Loading news articles...</Typography>
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
          <Alert severity="error" sx={{ borderRadius: '12px', border: '1px solid #e74c3c', backgroundColor: '#fef5f5' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Error Loading Articles</Typography>
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
                  News Article Review
                </Typography>
                <Typography sx={styles.subtitle}>
                  Review and publish AI-generated news articles
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={() => navigate('/submitarticle')}
                  sx={styles.button}
                >
                  Submit Article
                </Button>
                <ButtonGroup variant="outlined" size="small">
                <Button
                  variant={filter === 'unreviewed' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('unreviewed')}
                  sx={filter === 'unreviewed' ? styles.button : styles.outlineButton}
                >
                  Unreviewed
                  <Chip label={filter === 'unreviewed' ? articles.length : '...'} size="small" sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
                </Button>
                <Button
                  variant={filter === 'reviewed' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('reviewed')}
                  sx={filter === 'reviewed' ? styles.button : styles.outlineButton}
                >
                  Reviewed
                  <Chip label={filter === 'reviewed' ? articles.length : '...'} size="small" sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
                </Button>
                <Button
                  variant={filter === 'published' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('published')}
                  sx={filter === 'published' ? styles.button : styles.outlineButton}
                >
                  Published
                  <Chip label={filter === 'published' ? articles.length : '...'} size="small" sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
                </Button>
              </ButtonGroup>
              </Box>
            </Box>
          </Box>

          {articles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
                No {filter} articles
              </Typography>
              <Typography sx={{ color: '#9e9e9e', fontSize: '0.875rem' }}>
                Generate articles from social posts to see them here
              </Typography>
            </Box>
          ) : (
            <Box>
              {articles.map((article) => (
                <Box key={article.id} sx={styles.articleCard}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
                        {article.title}
                      </Typography>

                      <Typography sx={{ color: '#616161', fontSize: '0.875rem', mb: 1, fontStyle: 'italic' }}>
                        {article.summary}
                      </Typography>

                      <Typography sx={{ color: '#424242', fontSize: '0.9rem', lineHeight: 1.6, mb: 2, whiteSpace: 'pre-wrap' }}>
                        {article.content}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Chip label={article.artistName} size="small" sx={{ backgroundColor: '#2d4a36', color: '#fff' }} />
                        <Button
                          href={article.sourcePostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<ArrowSquareOut size={16} />}
                          sx={{ textTransform: 'none', color: '#2d4a36', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          View Source Post
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', flexShrink: 0 }}>
                      <Tooltip title="Edit article">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(article)}
                          startIcon={<PencilSimple size={16} />}
                          sx={styles.outlineButton}
                        >
                          Edit
                        </Button>
                      </Tooltip>

                      {!article.isReviewed && (
                        <Tooltip title="Mark as reviewed">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleMarkReviewed(article.id)}
                            startIcon={<CheckCircle size={16} weight="duotone" />}
                            sx={{ ...styles.button, backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#1e8449' } }}
                          >
                            Mark Reviewed
                          </Button>
                        </Tooltip>
                      )}

                      {!article.isPublished && (
                        <Tooltip title="Publish article">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handlePublish(article.id)}
                            startIcon={<UploadSimple size={16} />}
                            sx={{ ...styles.button, backgroundColor: '#3498db', '&:hover': { backgroundColor: '#2980b9' } }}
                          >
                            Publish
                          </Button>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete article">
                        <IconButton onClick={() => handleDelete(article.id)} size="small" sx={{ color: '#e74c3c', '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.08)' } }}>
                          <Trash size={20} />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Article</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Summary"
            fullWidth
            multiline
            rows={2}
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={12}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={styles.button}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsReview;
