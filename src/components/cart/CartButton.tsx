import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Badge,
  Popover,
  Fab,
} from "@mui/material";
import { ShoppingCart, Close } from "@mui/icons-material";
import { useCart, CartItem } from '../../CartContext';

const formatPrice = (cents: number | null): string => {
  if (cents === null || cents === undefined) return '-';
  return `$${(cents / 100).toFixed(2)}`;
};

interface GroupedItems {
  artist: string;
  items: CartItem[];
}

const CartButton = () => {
  const { clearCart, getTotalCartItems, getCartTotal, getSortedCartItems } = useCart();
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);

  const groupedByArtist = useMemo((): GroupedItems[] => {
    const sortedItems = getSortedCartItems();
    const groups: GroupedItems[] = [];
    let currentArtist = '';
    let currentGroup: CartItem[] = [];

    sortedItems.forEach(item => {
      const artist = item.artist || 'Unknown Artist';
      if (artist !== currentArtist) {
        if (currentGroup.length > 0) {
          groups.push({ artist: currentArtist, items: currentGroup });
        }
        currentArtist = artist;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ artist: currentArtist, items: currentGroup });
    }

    return groups;
  }, [getSortedCartItems]);

  const handleOpenCart = () => {
    const cartContents = getSortedCartItems();
    const formattedContents = cartContents.map(item =>
      `${item.quantity} ${item.name} [${item.set.toUpperCase()}] ${item.collector_number}`
    ).join('\n');
    const base64 = btoa(formattedContents);
    window.open(`https://manapool.com/add-deck?deck=${base64}&ref=mtgartistconnection`, '_blank');
  };

  const totalItems = getTotalCartItems();

  // Don't render if cart is empty
  if (totalItems === 0) {
    return null;
  }

  return (
    <>
      <Fab
        color="primary"
        onClick={(e) => setCartAnchorEl(e.currentTarget)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#2d4a36',
          '&:hover': { bgcolor: '#1e3425' },
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={totalItems} color="error">
          <ShoppingCart />
        </Badge>
      </Fab>

      <Popover
        open={Boolean(cartAnchorEl)}
        anchorEl={cartAnchorEl}
        onClose={() => setCartAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{ mb: 1 }}
      >
        <Box sx={{
          width: 320,
          maxHeight: 400,
          p: 2,
          overflow: 'auto',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">Cart ({totalItems} items)</Typography>
            <IconButton onClick={() => setCartAnchorEl(null)} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {groupedByArtist.map((group) => (
              <Box key={group.artist}>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#2d4a36',
                  mt: 0.5,
                  mb: 0.25,
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  pb: 0.25,
                }}>
                  {group.artist}
                </Typography>
                {group.items.map((item) => (
                  <Box
                    key={`${item.set}-${item.collector_number}`}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      p: 0.5,
                      pl: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      alignItems: 'center',
                      mb: 0.25,
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold', minWidth: '1.5rem', fontSize: '0.75rem' }}>
                      {item.quantity}x
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: '0.75rem' }} noWrap>
                      {item.name}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {item.set.toUpperCase()}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      #{item.collector_number}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '3rem', textAlign: 'right' }}>
                      {item.price_cents ? formatPrice(item.price_cents * item.quantity) : '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'grey.300' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Total:</Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{formatPrice(getCartTotal())}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={clearCart}
              sx={{
                flex: 1,
                fontSize: '0.875rem',
                borderColor: '#2d4a36',
                color: '#2d4a36',
                '&:hover': { borderColor: '#1e3425', bgcolor: 'rgba(45, 74, 54, 0.04)' },
              }}
            >
              Empty Cart
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenCart}
              sx={{
                flex: 1,
                bgcolor: '#2d4a36',
                '&:hover': { bgcolor: '#1e3425' },
                fontSize: '0.875rem',
              }}
            >
              Open Cart
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default CartButton;
