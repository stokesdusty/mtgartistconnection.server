import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ClearIcon from '@mui/icons-material/Clear';
import { GET_NEWS_REVIEWS } from '../graphql/queries';
import { newsStyles, getDateChipStyles } from '../../styles/news-styles';
import { colors } from '../../styles/design-tokens';

interface NewsArticle {
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

type DateFilter = 'all' | 'this-week' | 'this-month' | 'last-3-months';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL
  const artistFilter = searchParams.get('artist') || '';
  const dateFilter = (searchParams.get('date') as DateFilter) || 'all';

  const { loading, error, data } = useQuery(GET_NEWS_REVIEWS, {
    variables: { isPublished: true, limit: 100 },
    fetchPolicy: 'network-only',
  });

  const articles: NewsArticle[] = data?.newsReviews || [];

  // Helper to get all artist names from an article (handles both legacy and new format)
  const getArticleArtistNames = (article: NewsArticle): string[] => {
    if (article.artistNames && article.artistNames.length > 0) {
      return article.artistNames;
    }
    if (article.artistName) {
      return [article.artistName];
    }
    return [];
  };

  // Get unique artist names for the dropdown
  const uniqueArtists = useMemo(() => {
    const allArtists: string[] = [];
    articles.forEach(a => {
      const names = getArticleArtistNames(a);
      allArtists.push(...names);
    });
    return Array.from(new Set(allArtists)).filter(Boolean).sort();
  }, [articles]);

  // Filter articles based on selected filters
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Artist filter - check if the filtered artist is in the article's artists
      if (artistFilter) {
        const articleArtists = getArticleArtistNames(article);
        if (!articleArtists.includes(artistFilter)) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'all') {
        const articleDate = new Date(article.publishedAt || article.generatedAt);
        const now = new Date();

        if (dateFilter === 'this-week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (articleDate < weekAgo) return false;
        } else if (dateFilter === 'this-month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (articleDate < monthAgo) return false;
        } else if (dateFilter === 'last-3-months') {
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (articleDate < threeMonthsAgo) return false;
        }
      }

      return true;
    });
  }, [articles, artistFilter, dateFilter]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = artistFilter || dateFilter !== 'all';

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
    // Prevent navigation if clicking on the artist chip
    if ((e.target as HTMLElement).closest('.MuiChip-root')) {
      return;
    }
    navigate(`/news/${articleId}`);
  };

  const handleArtistClick = (artistName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedName = encodeURIComponent(artistName);
    navigate(`/artist/${formattedName}`);
  };

  const getArtistImageFilename = (artistName: string) => {
    return artistName.toLowerCase().replace(/\s+/g, '');
  };

  if (loading) {
    return (
      <Box sx={newsStyles.container}>
        <Container maxWidth="md">
          <Box sx={newsStyles.loadingContainer}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={newsStyles.loadingSpinner} size={48} />
              <Typography sx={newsStyles.loadingText}>Loading news articles...</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={newsStyles.container}>
        <Container maxWidth="md">
          <Alert severity="error" sx={newsStyles.errorAlert}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Error Loading News</Typography>
            <Typography>{error.message}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={newsStyles.container}>
      <Container maxWidth="md">
        <Box sx={newsStyles.header}>
          <Typography variant="h3" sx={newsStyles.title}>
            MTG Artist News
          </Typography>
          <Typography sx={newsStyles.subtitle}>
            Stay updated with the latest from your favorite Magic: The Gathering artists
          </Typography>
        </Box>

        {/* Filter Row */}
        {articles.length > 0 && (
          <Box sx={newsStyles.filterRow}>
            <FormControl size="small" sx={newsStyles.artistSelect}>
              <InputLabel id="artist-filter-label">Artist</InputLabel>
              <Select
                labelId="artist-filter-label"
                value={artistFilter}
                label="Artist"
                onChange={(e) => updateFilter('artist', e.target.value)}
              >
                <MenuItem value="">All Artists</MenuItem>
                {uniqueArtists.map((artist) => (
                  <MenuItem key={artist} value={artist}>
                    {artist}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={newsStyles.filterLabel}>Date:</Typography>
              {[
                { value: 'all', label: 'All time' },
                { value: 'this-week', label: 'This week' },
                { value: 'this-month', label: 'This month' },
                { value: 'last-3-months', label: 'Last 3 months' },
              ].map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => updateFilter('date', option.value)}
                  variant={dateFilter === option.value ? 'filled' : 'outlined'}
                  size="small"
                  sx={getDateChipStyles(dateFilter === option.value)}
                />
              ))}
            </Box>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={newsStyles.clearButton}
              >
                Clear filters
              </Button>
            )}

            <Typography sx={newsStyles.resultsCount}>
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            </Typography>
          </Box>
        )}

        {articles.length === 0 ? (
          <Paper sx={newsStyles.emptyState}>
            <Typography variant="h6" sx={newsStyles.emptyStateTitle}>
              No news articles yet
            </Typography>
            <Typography sx={newsStyles.emptyStateText}>
              Check back soon for updates from MTG artists!
            </Typography>
          </Paper>
        ) : filteredArticles.length === 0 ? (
          <Paper sx={newsStyles.emptyState}>
            <Typography variant="h6" sx={newsStyles.emptyStateTitle}>
              No articles match your filters
            </Typography>
            <Typography sx={{ ...newsStyles.emptyStateText, mb: 2 }}>
              Try adjusting your filters or clear them to see all articles.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={newsStyles.clearButton}
            >
              Clear filters
            </Button>
          </Paper>
        ) : (
          <Box>
            {filteredArticles.map((article) => {
              const artistNames = getArticleArtistNames(article);
              const primaryArtist = artistNames[0] || '';

              return (
                <Card
                  key={article.id}
                  sx={newsStyles.articleCard}
                  onClick={(e) => handleArticleClick(article.id, e)}
                >
                  {article.imageUrl && (
                    <Box
                      component="img"
                      src={article.imageUrl}
                      alt={article.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={newsStyles.titleContainer}>
                      {primaryArtist && (
                        <Avatar
                          src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${getArtistImageFilename(primaryArtist)}.jpg`}
                          alt={primaryArtist}
                          variant="rounded"
                          sx={newsStyles.artistAvatar}
                        />
                      )}
                      <Typography variant="h5" sx={newsStyles.articleTitle}>
                        {article.title}
                      </Typography>
                    </Box>

                    <Box sx={newsStyles.metaInfo}>
                      {artistNames.length > 0 ? (
                        artistNames.map((name) => (
                          <Chip
                            key={name}
                            icon={<PersonIcon sx={{ color: `${colors.primary.contrast} !important` }} />}
                            label={name}
                            onClick={(e) => handleArtistClick(name, e)}
                            sx={newsStyles.artistChip}
                            size="small"
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
                          size="small"
                        />
                      )}
                      <Box sx={newsStyles.dateText}>
                        <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                          {formatDate(article.publishedAt || article.generatedAt) || 'Recently published'}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={newsStyles.summary}>
                      {article.summary}
                    </Typography>

                    <Box sx={newsStyles.readMore}>
                      Read more <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default News;
