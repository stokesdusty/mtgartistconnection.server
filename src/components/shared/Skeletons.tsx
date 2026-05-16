import { Box, Skeleton, Card, CardContent } from '@mui/material';
import { colors, spacing, borderRadius } from '../../styles/design-tokens';

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
              backgroundColor: colors.neutral[200],
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              width: '70%',
              height: 20,
              margin: '0 auto',
              backgroundColor: colors.neutral[200],
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
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.lg,
            padding: { xs: spacing.md, md: spacing.lg },
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                sx={{
                  width: '60%',
                  height: 32,
                  backgroundColor: colors.neutral[200],
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Skeleton
                  variant="text"
                  sx={{
                    width: 120,
                    height: 20,
                    backgroundColor: colors.neutral[200],
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    width: 100,
                    height: 20,
                    backgroundColor: colors.neutral[200],
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
                backgroundColor: colors.neutral[200],
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
                  backgroundColor: colors.neutral[200],
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
            border: `1px solid ${colors.neutral[200]}`,
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
                  backgroundColor: colors.neutral[200],
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  sx={{
                    width: '80%',
                    height: 28,
                    backgroundColor: colors.neutral[200],
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    width: '40%',
                    height: 20,
                    backgroundColor: colors.neutral[200],
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
                  backgroundColor: colors.neutral[200],
                }}
              />
              <Skeleton
                variant="rounded"
                sx={{
                  width: 120,
                  height: 24,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.neutral[200],
                }}
              />
            </Box>
            <Skeleton
              variant="text"
              sx={{
                width: '100%',
                height: 20,
                backgroundColor: colors.neutral[200],
              }}
            />
            <Skeleton
              variant="text"
              sx={{
                width: '90%',
                height: 20,
                backgroundColor: colors.neutral[200],
              }}
            />
            <Skeleton
              variant="text"
              sx={{
                width: '70%',
                height: 20,
                backgroundColor: colors.neutral[200],
              }}
            />
          </CardContent>
        </Card>
      ))}
    </>
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
          backgroundColor: colors.neutral[200],
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
            backgroundColor: colors.neutral[200],
          }}
        />
        <Skeleton
          variant="rounded"
          sx={{
            width: 100,
            height: 36,
            borderRadius: borderRadius.md,
            backgroundColor: colors.neutral[200],
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
              backgroundColor: colors.neutral[200],
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
              backgroundColor: colors.neutral[200],
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
                  backgroundColor: colors.neutral[200],
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  width: 180,
                  height: 20,
                  backgroundColor: colors.neutral[200],
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
              backgroundColor: colors.neutral[200],
              mb: 2,
            }}
          />
          <Skeleton
            variant="rounded"
            sx={{
              width: '100%',
              height: 300,
              borderRadius: borderRadius.lg,
              backgroundColor: colors.neutral[200],
            }}
          />
        </Box>
      </Box>
    </>
  );
};
