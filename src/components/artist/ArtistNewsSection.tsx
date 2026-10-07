import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ArrowRight } from "@phosphor-icons/react";
import { GET_NEWS_REVIEWS } from '../graphql/queries';
import { artistStyles } from '../../styles/artist-styles';
import MonoLabel from '../shared/MonoLabel';

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
    <Box component="section" aria-labelledby="artist-news-label">
      <MonoLabel component="h2" id="artist-news-label">Recent news</MonoLabel>
      <Box sx={artistStyles.newsList}>
        {artistArticles.map((article) => (
          <Box
            component="button"
            type="button"
            key={article.id}
            sx={artistStyles.newsCard}
            onClick={() => navigate(`/news/${article.id}`)}
          >
            <Box component="span" sx={artistStyles.newsTitle}>
              {article.title}
              <ArrowRight size={16} aria-hidden />
            </Box>

            {(article.publishedAt || article.generatedAt) && (
              <MonoLabel sx={artistStyles.newsDate} tracking="tight">
                {formatDate(article.publishedAt || article.generatedAt)}
              </MonoLabel>
            )}

            <Box component="span" sx={[artistStyles.newsSummary, { display: 'block' }]}>
              {article.summary}
            </Box>
          </Box>
        ))}

        <Box
          component="button"
          type="button"
          onClick={() => navigate(`/news/artist/${encodeURIComponent(artistName)}`)}
          sx={artistStyles.newsAllLink}
        >
          See all news for {artistName} <ArrowRight size={14} aria-hidden />
        </Box>
      </Box>
    </Box>
  );
};

export default ArtistNewsSection;
