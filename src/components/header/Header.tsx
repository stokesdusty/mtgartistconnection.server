import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Menu,
  MenuItem,
  Tab,
  Tabs,
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
import { Link, LinkProps, useNavigate, useLocation } from "react-router-dom";
import { List as ListIcon, SignOut, GearSix, Heart } from "@phosphor-icons/react";
import { headerStyles } from '../../styles/header-styles';
import { shadows } from '../../styles/design-tokens';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/auth-slice';

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "News", to: "/news" },
  { label: "Services", to: "/signingservices" },
  { label: "Events", to: "/calendar" },
  { label: "Random Flavor Text", to: "/randomflavortext" },
];

const NavLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => (
    <Link to={to} ref={ref} {...props} role={undefined} />
  )
);

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const validPaths = useMemo(() => navItems.map(item => item.to), []);

  const [value, setValue] = useState<string | false>(() =>
    validPaths.includes(location.pathname)
      ? location.pathname
      : false
  );

  const theme = useTheme();
  const isBelowLarge = useMediaQuery(theme.breakpoints.down("lg"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string | false) => {
    setValue(newValue);
  };

  const handleMenuItemClick = (to: string) => {
    navigate(to);
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleClose();
    setDrawerOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth');
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

  const handleSettingsClick = () => {
    setDrawerOpen(false);
    navigate('/settings');
  };

  const handleFollowingClick = () => {
    setDrawerOpen(false);
    navigate('/following');
  };

  useEffect(() => {
    setValue(
      validPaths.includes(location.pathname)
        ? location.pathname
        : false
    );
  }, [location.pathname, validPaths]);

  const handleAddArtistClick = () => {
    setDrawerOpen(false);
    navigate('/add');
  };

  const handleReviewSocialsClick = () => {
    setDrawerOpen(false);
    navigate('/reviewsocial');
  };

  const handleReviewNewsClick = () => {
    setDrawerOpen(false);
    navigate('/reviewnews');
  };

  useEffect(() => {
    setValue(
      validPaths.includes(location.pathname)
        ? location.pathname
        : false
    );
  }, [location.pathname, validPaths]);

  const renderMenuItems = () => {
    return navItems.map((item) => (
      <MenuItem
        key={item.to}
        onClick={() => handleMenuItemClick(item.to)}
        sx={headerStyles.menuItem}
        selected={location.pathname === item.to}
      >
        {item.label}
      </MenuItem>
    ));
  };

  const renderTabs = () => {
    return navItems.map((item) => (
      <Tab
        key={item.to}
        component={NavLink}
        to={item.to}
        disableRipple
        label={item.label}
        value={item.to}
        sx={headerStyles.tab}
      />
    ));
  };

  return (
    <AppBar position="sticky" sx={headerStyles.appBar} elevation={0}>
      <Toolbar sx={headerStyles.toolbar}>
        <Box sx={headerStyles.logoContainer}>
          <Link to="/">
            <Box
              component="img"
              sx={headerStyles.logoImage}
              alt="MtG Artist Connection Logo"
              src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/logo.png"
            />
          </Link>
        </Box>
        <Box sx={headerStyles.tabContainer}>
          {!isBelowLarge ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                sx={headerStyles.tabs}
                textColor="inherit"
              >
                {renderTabs()}
              </Tabs>
              {isLoggedIn ? (
                <Button onClick={toggleDrawer(true)} sx={headerStyles.accountButton}>
                  {user?.email?.split('@')[0]}
                </Button>
              ) : (
                <Button onClick={handleLogin} sx={headerStyles.accountButton}>
                  Login
                </Button>
              )}
            </Box>
          ) : (
            <>
              <IconButton
                id="menu-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                sx={headerStyles.menuButton}
                edge="end"
              >
                <ListIcon size={24} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "menu-button",
                }}
                sx={headerStyles.menu}
              >
                {renderMenuItems()}
                {isLoggedIn ? (
                  <MenuItem
                    onClick={(e) => {
                      handleClose();
                      toggleDrawer(true)(e);
                    }}
                    sx={headerStyles.menuItem}
                  >
                    {user?.email}
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={handleLogin}
                    sx={headerStyles.menuItem}
                  >
                    Login
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { boxShadow: shadows.lg } }}
      >
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={headerStyles.drawerHeader}>
            <Box sx={headerStyles.drawerHeaderLabel}>Account</Box>
            <Box sx={headerStyles.drawerHeaderEmail}>{user?.email}</Box>
          </Box>
          <List sx={{ p: 1 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleFollowingClick} sx={headerStyles.drawerListItem}>
                <ListItemIcon>
                  <Heart size={20} weight="duotone" />
                </ListItemIcon>
                <ListItemText primary="Following" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSettingsClick} sx={headerStyles.drawerListItem}>
                <ListItemIcon>
                  <GearSix size={20} />
                </ListItemIcon>
                <ListItemText primary="Settings" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
              </ListItemButton>
            </ListItem>
            {isLoggedIn && isAdmin && <>
              <ListItem disablePadding>
                <ListItemButton onClick={handleAddArtistClick} sx={headerStyles.drawerListItem}>
                  <ListItemIcon>
                    <GearSix size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Add Artist" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleReviewSocialsClick} sx={headerStyles.drawerListItem}>
                  <ListItemIcon>
                    <GearSix size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Review Socials" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleReviewNewsClick} sx={headerStyles.drawerListItem}>
                  <ListItemIcon>
                    <GearSix size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Review News" primaryTypographyProps={{ sx: headerStyles.drawerItemText }} />
                </ListItemButton>
              </ListItem>
            </>}
            <Divider sx={{ my: 1 }} />
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
