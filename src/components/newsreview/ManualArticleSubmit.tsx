import React, { useState, useRef } from 'react';
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
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PaperPlaneRight, ArrowLeft, CloudArrowUp, Trash } from "@phosphor-icons/react";
import { GET_ARTIST_NAMES } from '../graphql/queries';
import { GENERATE_MANUAL_NEWS_ARTICLE, UPLOAD_NEWS_IMAGE } from '../graphql/mutations';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { colors } from '../../styles/design-tokens';

interface Artist {
  name: string;
  filename: string;
}

const ManualArticleSubmit: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: artistsData, loading: artistsLoading } = useQuery(GET_ARTIST_NAMES);
  const [generateArticle, { loading: generating }] = useMutation(GENERATE_MANUAL_NEWS_ARTICLE);
  const [uploadNewsImage] = useMutation(UPLOAD_NEWS_IMAGE);

  const artists: Artist[] = artistsData?.artistNames || [];
  const sortedArtists = [...artists].sort((a, b) => a.name.localeCompare(b.name));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(imageFile);

      // Upload via GraphQL mutation (server-side upload to S3)
      const { data } = await uploadNewsImage({
        variables: {
          base64Data,
          filename: imageFile.name,
          contentType: imageFile.type,
        },
      });

      if (!data?.uploadNewsImage?.imageUrl) {
        throw new Error('Failed to upload image');
      }

      return data.uploadNewsImage.imageUrl;
    } catch (err: any) {
      throw new Error(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!content.trim()) {
      setError('Please enter content for the article');
      return;
    }

    try {
      // Upload image first if one is selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage() || '';
      }

      const result = await generateArticle({
        variables: {
          artistNames: selectedArtists.map(a => a.name),
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || null,
          imageUrl: finalImageUrl || null,
        },
      });

      if (result.data?.generateManualNewsArticle) {
        setSuccess(`Article "${result.data.generateManualNewsArticle.title}" created successfully! Redirecting to review...`);
        setSelectedArtists([]);
        setContent('');
        setSourceUrl('');
        setImageUrl('');
        setImageFile(null);
        setImagePreview(null);

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
      backgroundColor: colors.background.dark,
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
      color: colors.primary.main,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    subtitle: {
      color: colors.neutral[700],
      mt: 1,
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
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    submitButton: {
      backgroundColor: colors.primary.main,
      color: colors.neutral.white,
      fontWeight: 600,
      py: 1.5,
      '&:hover': {
        backgroundColor: colors.primary.dark,
      },
      '&:disabled': {
        backgroundColor: colors.neutral[300],
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
          <ArrowLeft size={20} />
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
              multiple
              options={sortedArtists}
              getOptionLabel={(option) => option.name}
              value={selectedArtists}
              onChange={(_, newValue) => setSelectedArtists(newValue)}
              loading={artistsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Artists (Optional)"
                  placeholder={selectedArtists.length === 0 ? "Search artists..." : ""}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {artistsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText="Select one or more artists, or leave empty for general news"
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
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.name}
                    label={option.name}
                    sx={{
                      backgroundColor: colors.primary.main,
                      color: colors.neutral.white,
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          color: colors.neutral.white,
                        },
                      },
                    }}
                  />
                ))
              }
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

            {/* Image Upload Section */}
            <Box>
              <Typography sx={{ mb: 1, fontWeight: 600, color: colors.neutral[800] }}>
                Article Image (Optional)
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="image-upload"
              />
              {!imagePreview ? (
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudArrowUp size={18} weight="duotone" />}
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      '&:hover': {
                        borderColor: colors.primary.dark,
                        backgroundColor: 'rgba(45, 74, 54, 0.04)',
                      },
                    }}
                  >
                    Upload Image
                  </Button>
                </label>
              ) : (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      border: `1px solid ${colors.neutral[200]}`,
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleRemoveImage}
                    startIcon={<Trash size={18} />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: alpha(colors.neutral.black, 0.6),
                      '&:hover': {
                        backgroundColor: alpha(colors.neutral.black, 0.8),
                      },
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.neutral[600] }}>
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={generating || uploading || !content.trim()}
              endIcon={(generating || uploading) ? <CircularProgress size={20} color="inherit" /> : <PaperPlaneRight size={18} />}
              sx={styles.submitButton}
            >
              {uploading ? 'Uploading Image...' : generating ? 'Generating Article...' : 'Generate Article'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ManualArticleSubmit;
