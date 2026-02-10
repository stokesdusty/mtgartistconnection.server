import { forwardRef, useEffect, useState } from "react";
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
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { headerStyles } from '../../styles/header-styles';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/auth-slice';

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: "All Artists", to: "/" },
  { label: "Card Signing Services", to: "/signingservices" },
  { label: "Signing Events", to: "/calendar" },
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

  const validPaths = navItems.map(item => item.to);

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
                <Button
                  onClick={toggleDrawer(true)}
                  sx={{
                    color: '#2d4a36',
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 600,
                    padding: { xs: '6px 12px', md: '8px 16px' },
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1a2d21'
                    }
                  }}
                >
                  Account
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  sx={{
                    color: '#2d4a36',
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 600,
                    padding: { xs: '6px 12px', md: '8px 16px' },
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#1a2d21'
                    }
                  }}
                >
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
                <MenuIcon />
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
        PaperProps={{
          sx: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }
        }}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
        >
          <Box sx={{
            p: 3,
            backgroundColor: '#2d4a36',
            color: '#ffffff',
            borderBottom: '1px solid #1a2d21',
          }}>
            <Box sx={{
              fontWeight: 600,
              mb: 0.5,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}>
              Account
            </Box>
            <Box sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              {user?.email}
            </Box>
          </Box>
          <List sx={{ p: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleFollowingClick}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    '& .MuiListItemIcon-root': {
                      color: '#2d4a36',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#2d4a36',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <FavoriteIcon sx={{
                    color: '#757575',
                    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary="Following"
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#212121',
                      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleSettingsClick}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    '& .MuiListItemIcon-root': {
                      color: '#2d4a36',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#2d4a36',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <SettingsIcon sx={{
                    color: '#757575',
                    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#212121',
                      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: '8px',
                  transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    '& .MuiListItemIcon-root': {
                      color: '#e74c3c',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#e74c3c',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{
                    color: '#757575',
                    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#212121',
                      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
