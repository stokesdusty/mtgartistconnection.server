import { useState } from "react";
import {
  AppBar,
  Box,
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
  useTheme,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { List as ListIcon, SignOut, GearSix, Heart, Cards, Envelope, Sun, Moon, Shuffle, ClipboardText, UserPlus, MagnifyingGlass, ChartBar } from "@phosphor-icons/react";
import { headerStyles } from '../../styles/header-styles';
import { useColorMode } from '../../ColorModeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useApolloClient } from '@apollo/client';
import { RootState } from '../../store/store';
import { logout } from '../../store/auth-slice';

interface NavItem {
  label: string;
  to: string;
  /** Extra path prefixes that mark this item active (e.g. artist pages under Artists). */
  matches?: string[];
}

const navItems: NavItem[] = [
  { label: "Artists", to: "/", matches: ["/artist/", "/allcards/", "/artistcardbreakdown/"] },
  { label: "Events", to: "/calendar", matches: ["/calendar/"] },
  { label: "Services", to: "/signingservices" },
];

const dashboardItem: NavItem = { label: "Dashboard", to: "/dashboard" };

const isActive = (item: NavItem, pathname: string) =>
  pathname === item.to || (item.matches ?? []).some(prefix => pathname.startsWith(prefix));

interface DrawerLink {
  label: string;
  to: string;
  icon: JSX.Element;
}

const accountTools: DrawerLink[] = [
  { label: "Your Signed Cards", to: "/yourcards", icon: <Cards size={20} weight="duotone" /> },
  { label: "Following", to: "/following", icon: <Heart size={20} weight="duotone" /> },
  { label: "Signing Status Tracker", to: "/signingtracker", icon: <Envelope size={20} weight="duotone" /> },
  { label: "Artist Sheet Generator", to: "/artistsheet", icon: <ClipboardText size={20} weight="duotone" /> },
  { label: "Random Flavor Text", to: "/randomflavortext", icon: <Shuffle size={20} weight="duotone" /> },
  { label: "Settings", to: "/settings", icon: <GearSix size={20} /> },
];

const adminTools: DrawerLink[] = [
  { label: "Add Artist", to: "/add", icon: <UserPlus size={20} /> },
  // Hidden while the Bluesky post sync is off (webservice commit 7284679)
  // { label: "Review Socials", to: "/reviewsocial", icon: <ShareNetwork size={20} /> },
  { label: "Analytics", to: "/analytics", icon: <ChartBar size={20} /> },
  { label: "Scan Event for Artists", to: "/scaneventartists", icon: <MagnifyingGlass size={20} /> },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const client = useApolloClient();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const theme = useTheme();
  const isBelowLarge = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();

  const visibleNav = isLoggedIn ? [...navItems, dashboardItem] : navItems;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (to: string) => {
    navigate(to);
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    // Drop the previous user's cached data (e.g. `me`) so the next login can't see or save it
    client.clearStore();
    // clearStore() isn't picked up by apollo3-cache-persist, so drop the persisted copy too (key from index.tsx)
    localStorage.removeItem('apollo-cache');
    navigate('/');
    handleClose();
    setDrawerOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth');
    handleClose();
  };

  const handleSignUp = () => {
    navigate('/auth?tab=signup');
    handleClose();
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleDrawerNavigate = (to: string) => {
    setDrawerOpen(false);
    navigate(to);
  };

  const renderDrawerLink = ({ label, to, icon }: DrawerLink) => (
    <ListItem key={to} disablePadding>
      <ListItemButton onClick={() => handleDrawerNavigate(to)} sx={headerStyles.drawerListItem}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
      </ListItemButton>
    </ListItem>
  );

  return (
    <AppBar position="sticky" sx={headerStyles.appBar} elevation={0}>
      <Toolbar sx={headerStyles.toolbar} disableGutters>
        <Box component={Link} to="/" sx={headerStyles.logoLink}>
          <Box component="span" role="img" aria-label="MtG Artist Connection Logo" sx={headerStyles.logo} />
        </Box>

        {!isBelowLarge && (
          <Box component="nav" aria-label="Main" sx={headerStyles.nav}>
            {visibleNav.map(item => (
              <Box
                key={item.to}
                component={Link}
                to={item.to}
                aria-current={isActive(item, location.pathname) ? 'page' : undefined}
                sx={headerStyles.navItem}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={headerStyles.actions}>
          <IconButton
            onClick={toggleColorMode}
            sx={headerStyles.iconButton}
            aria-label={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          {!isBelowLarge ? (
            isLoggedIn ? (
              <Button
                onClick={toggleDrawer(true)}
                sx={headerStyles.solidButton}
                aria-label="open account menu"
                startIcon={<ListIcon size={16} weight="bold" />}
              >
                Account
              </Button>
            ) : (
              <>
                <Button onClick={handleSignUp} sx={headerStyles.textButton}>
                  Sign up
                </Button>
                <Button onClick={handleLogin} sx={headerStyles.solidButton}>
                  Sign in
                </Button>
              </>
            )
          ) : (
            <>
              <IconButton
                id="menu-button"
                aria-label={isLoggedIn ? "open account menu" : "open menu"}
                aria-controls={(!isLoggedIn && open) ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={(!isLoggedIn && open) ? "true" : undefined}
                onClick={isLoggedIn ? toggleDrawer(true) : handleClick}
                sx={headerStyles.menuButton}
              >
                <ListIcon size={20} />
              </IconButton>
              {!isLoggedIn && (
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  MenuListProps={{
                    "aria-labelledby": "menu-button",
                  }}
                  sx={headerStyles.menu}
                >
                  {navItems.map(item => (
                    <MenuItem
                      key={item.to}
                      onClick={() => handleMenuItemClick(item.to)}
                      sx={headerStyles.menuItem}
                      selected={isActive(item, location.pathname)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <Divider sx={headerStyles.drawerDivider} />
                  <MenuItem onClick={handleLogin} sx={headerStyles.menuItem}>
                    Sign in
                  </MenuItem>
                  <MenuItem onClick={handleSignUp} sx={headerStyles.menuItem}>
                    Sign up
                  </MenuItem>
                </Menu>
              )}
            </>
          )}
        </Box>
      </Toolbar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: headerStyles.drawerPaper }}
      >
        <Box sx={{ color: 'text.primary' }} role="presentation">
          <Box sx={headerStyles.drawerHeader}>
            <Box sx={headerStyles.drawerHeaderLabel}>Account</Box>
            <Box sx={headerStyles.drawerHeaderEmail}>{user?.email}</Box>
          </Box>
          {isBelowLarge && (
            <>
              <List sx={{ p: 1 }}>
                {visibleNav.map((item) => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton
                      onClick={() => handleDrawerNavigate(item.to)}
                      selected={isActive(item, location.pathname)}
                      sx={headerStyles.drawerListItem}
                    >
                      <ListItemText primary={item.label} primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={headerStyles.drawerDivider} />
            </>
          )}
          <List sx={{ p: 1 }} subheader={<Box sx={headerStyles.drawerSubheader}>Account Tools</Box>}>
            {accountTools.map(renderDrawerLink)}
            {isLoggedIn && isAdmin && adminTools.map(renderDrawerLink)}
            <Divider sx={headerStyles.drawerDividerSpaced} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={headerStyles.drawerListItemLogout}>
                <ListItemIcon>
                  <SignOut size={20} />
                </ListItemIcon>
                <ListItemText primary="Sign Out" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
