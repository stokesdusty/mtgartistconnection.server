import { Box, Skeleton, Card, CardContent, Container, Paper } from '@mui/material';
import { colors, themeColors, spacing, borderRadius, shadows } from '../../styles/design-tokens';

// Artist grid skeleton for homepage
export const ArtistGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: spacing.md,
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: borderRadius.lg,
              backgroundColor: themeColors.neutral[200],
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              width: '70%',
              height: 20,
              margin: '0 auto',
              backgroundColor: themeColors.neutral[200],
            }}
          />
        </Box>
      ))}
    </>
  );
};

// Calendar event skeleton
export const EventCardSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: themeColors.neutral[50],
            borderRadius: borderRadius.lg,
            padding: { xs: spacing.md, md: spacing.lg },
            border: `1px solid ${themeColors.neutral[200]}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                sx={{
                  width: '60%',
                  height: 32,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Skeleton
                  variant="text"
                  sx={{
                    width: 120,
                    height: 20,
                    backgroundColor: themeColors.neutral[200],
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    width: 100,
                    height: 20,
                    backgroundColor: themeColors.neutral[200],
                  }}
                />
              </Box>
            </Box>
            <Skeleton
              variant="rounded"
              sx={{
                width: 80,
                height: 32,
                borderRadius: borderRadius.md,
                backgroundColor: themeColors.neutral[200],
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 28,
                  borderRadius: borderRadius.md,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

// News article card skeleton
export const NewsCardSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${themeColors.neutral[200]}`,
            boxShadow: 'none',
            mb: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton
                variant="rounded"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: themeColors.neutral[200],
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  sx={{
                    width: '80%',
                    height: 28,
                    backgroundColor: themeColors.neutral[200],
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    width: '40%',
                    height: 20,
                    backgroundColor: themeColors.neutral[200],
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton
                variant="rounded"
                sx={{
                  width: 100,
                  height: 24,
                  borderRadius: borderRadius.full,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
              <Skeleton
                variant="rounded"
                sx={{
                  width: 120,
                  height: 24,
                  borderRadius: borderRadius.full,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
            </Box>
            <Skeleton
              variant="text"
              sx={{
                width: '100%',
                height: 20,
                backgroundColor: themeColors.neutral[200],
              }}
            />
            <Skeleton
              variant="text"
              sx={{
                width: '90%',
                height: 20,
                backgroundColor: themeColors.neutral[200],
              }}
            />
            <Skeleton
              variant="text"
              sx={{
                width: '70%',
                height: 20,
                backgroundColor: themeColors.neutral[200],
              }}
            />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

// AllCards card grid skeleton — matches the auto-fill grid with MTG card aspect ratio
export const AllCardsGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(auto-fill, minmax(200px, 1fr))',
          sm: 'repeat(auto-fill, minmax(220px, 1fr))',
          md: 'repeat(auto-fill, minmax(240px, 1fr))',
        },
        gap: spacing.lg,
        mt: spacing.xl,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* MTG border_crop is ~0.72 aspect ratio */}
          <Skeleton
            variant="rounded"
            sx={{
              width: '100%',
              aspectRatio: '0.72',
              borderRadius: borderRadius.md,
              backgroundColor: themeColors.neutral[200],
            }}
          />
          {/* Price + icon row */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
            <Skeleton
              variant="rounded"
              sx={{ width: 56, height: 20, borderRadius: borderRadius.sm, backgroundColor: themeColors.neutral[200] }}
            />
            <Skeleton
              variant="rounded"
              sx={{ width: 56, height: 20, borderRadius: borderRadius.sm, backgroundColor: themeColors.neutral[200] }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// AllCards full-page skeleton — hero banner + sticky rail + controls + card grid
export const AllCardsSkeleton = () => {
  return (
    <Box sx={{ backgroundColor: colors.neutral[800], minHeight: '100vh' }}>
      {/* Hero banner */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: '100%',
          height: { xs: '280px', sm: '360px', md: '440px' },
          backgroundColor: colors.neutral[700],
        }}
      />

      {/* Sticky rail */}
      <Box
        sx={{
          height: '68px',
          backgroundColor: themeColors.neutral.white,
          borderBottom: `1px solid ${themeColors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 4 },
          gap: 2,
        }}
      >
        <Skeleton
          variant="text"
          sx={{ width: 260, height: 32, backgroundColor: themeColors.neutral[200] }}
        />
        <Box sx={{ flex: 1 }} />
        <Skeleton
          variant="rounded"
          sx={{ width: 130, height: 28, borderRadius: borderRadius.sm, backgroundColor: themeColors.neutral[200] }}
        />
      </Box>

      {/* Content area */}
      <Container maxWidth="lg" sx={{ pt: spacing.xl }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: { xs: spacing.lg, md: spacing.xxl },
            backgroundColor: themeColors.neutral.white,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.sm,
          }}
        >
          {/* Controls bar */}
          <Box
            sx={{
              backgroundColor: themeColors.neutral[50],
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginBottom: spacing.xl,
              border: `1px solid ${themeColors.neutral[200]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <Skeleton
              variant="text"
              sx={{ width: 140, height: 28, backgroundColor: themeColors.neutral[200] }}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Skeleton
                variant="rounded"
                sx={{ width: 180, height: 32, borderRadius: borderRadius.md, backgroundColor: themeColors.neutral[200] }}
              />
              <Skeleton
                variant="rounded"
                sx={{ width: 120, height: 32, borderRadius: borderRadius.md, backgroundColor: themeColors.neutral[200] }}
              />
              <Skeleton
                variant="rounded"
                sx={{ width: 130, height: 36, borderRadius: borderRadius.lg, backgroundColor: themeColors.neutral[200] }}
              />
            </Box>
          </Box>

          <AllCardsGridSkeleton />
        </Paper>
      </Container>
    </Box>
  );
};

// Artist page skeleton
export const ArtistPageSkeleton = () => {
  return (
    <>
      {/* Banner skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: '100%',
          height: { xs: 150, md: 200 },
          borderRadius: borderRadius.lg,
          backgroundColor: themeColors.neutral[200],
          mb: 3,
        }}
      />

      {/* Name and follow button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Skeleton
          variant="text"
          sx={{
            width: 250,
            height: 48,
            backgroundColor: themeColors.neutral[200],
          }}
        />
        <Skeleton
          variant="rounded"
          sx={{
            width: 100,
            height: 36,
            borderRadius: borderRadius.md,
            backgroundColor: themeColors.neutral[200],
          }}
        />
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            sx={{
              width: { xs: '100%', sm: 200 },
              height: 48,
              borderRadius: borderRadius.lg,
              backgroundColor: themeColors.neutral[200],
            }}
          />
        ))}
      </Box>

      {/* Info section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Box>
          <Skeleton
            variant="text"
            sx={{
              width: 120,
              height: 32,
              backgroundColor: themeColors.neutral[200],
              mb: 2,
            }}
          />
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton
                variant="text"
                sx={{
                  width: 100,
                  height: 24,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  width: 180,
                  height: 20,
                  backgroundColor: themeColors.neutral[200],
                }}
              />
            </Box>
          ))}
        </Box>
        <Box>
          <Skeleton
            variant="text"
            sx={{
              width: 160,
              height: 32,
              backgroundColor: themeColors.neutral[200],
              mb: 2,
            }}
          />
          <Skeleton
            variant="rounded"
            sx={{
              width: '100%',
              height: 300,
              borderRadius: borderRadius.lg,
              backgroundColor: themeColors.neutral[200],
            }}
          />
        </Box>
      </Box>
    </>
  );
};
