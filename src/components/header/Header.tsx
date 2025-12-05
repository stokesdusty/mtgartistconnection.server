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
} from "@mui/material";
import { Link, LinkProps, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import { headerStyles } from '../../styles/header-styles';

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: "All Artists", to: "/" },
  { label: "Card Signing Services", to: "/signingservices" },
  { label: "Signing Events", to: "/calendar" },
  { label: "Random Flavor Text", to: "/randomflavortext" },
  { label: "Contact", to: "/contact" },
];

const NavLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => (
    <Link to={to} ref={ref} {...props} role={undefined} />
  )
);

const Header = () => {
  const location = useLocation();
  const [value, setValue] = useState<string>(location.pathname);
  const navigate = useNavigate();
  const theme = useTheme();
  const isBelowLarge = useMediaQuery(theme.breakpoints.down("lg"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleMenuItemClick = (to: string) => {
    navigate(to);
    handleClose();
  };

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

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
            <Tabs
              value={value}
              onChange={handleTabChange}
              sx={headerStyles.tabs}
              textColor="inherit"
            >
              {renderTabs()}
            </Tabs>
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
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
