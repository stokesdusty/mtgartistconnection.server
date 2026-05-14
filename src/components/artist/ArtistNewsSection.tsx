import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Link,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GET_NEWS_REVIEWS } from '../graphql/queries';
import { artistStyles } from '../../styles/artist-styles';

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

interface ArtistNewsSectionProps {
  artistName: string;
}

const ArtistNewsSection: React.FC<ArtistNewsSectionProps> = ({ artistName }) => {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_NEWS_REVIEWS, {
    variables: { isPublished: true, limit: 100 },
    fetchPolicy: 'network-only',
  });

  // Filter articles for this specific artist
  const allArticles: NewsArticle[] = data?.newsReviews || [];
  const artistArticles = allArticles.filter(
    (article) => article.artistName === artistName
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Don't render anything if there are no articles
  if (loading || error || artistArticles.length === 0) {
    return null;
  }

  return (
    <Box sx={artistStyles.artistPage}>
        <Typography sx={artistStyles.sectionHeader} variant="h4" >Recent News</Typography>
        <Box sx={artistStyles.infoRow}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {artistArticles.map((article) => (
              <Box
                key={article.id}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                  '&:hover': {
                    borderColor: '#2d4a36',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                }}
                onClick={() => navigate(`/news/${article.id}`)}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#212121',
                    fontSize: '1rem',
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {article.title}
                  <ArrowForwardIcon sx={{ fontSize: '1rem', color: '#2d4a36', ml: 1 }} />
                </Typography>

                {(article.publishedAt || article.generatedAt) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1,
                      color: '#757575',
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: '0.8rem' }} />
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      {formatDate(article.publishedAt || article.generatedAt)}
                    </Typography>
                  </Box>
                )}

                <Typography
                  sx={{
                    color: '#616161',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {article.summary}
                </Typography>
              </Box>
            ))}

            <Link
              component="button"
              onClick={() => navigate(`/news/artist/${encodeURIComponent(artistName)}`)}
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                color: '#2d4a36',
                fontWeight: 600,
                fontSize: '0.9rem',
                mt: 1,
                cursor: 'pointer',
                transition: 'all 200ms',
                '&:hover': {
                  color: '#1a2d21',
                },
              }}
            >
              See all news for {artistName} <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
            </Link>
          </Box>
        </Box>
    </Box>
  );
};

export default ArtistNewsSection;
