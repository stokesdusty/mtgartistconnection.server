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
  const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
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

  const styles = {
    appBar: {
      backgroundColor: "#fff",
      color: "#333",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    },
    toolbar: {
      display: "flex",
      justifyContent: "space-between",
      padding: { xs: "0.5rem", md: "0.5rem 2rem" },
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
    },
    logoImage: {
      width: { xs: "200px", md: "260px", lg: "300px" },
      height: "auto",
    },
    tabContainer: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
    },
    tabs: {
      "& .MuiTabs-indicator": {
        backgroundColor: "#507A60",
        height: 3,
      },
    },
    tab: {
      fontWeight: 500,
      fontSize: "0.95rem",
      color: "#444",
      textTransform: "none",
      minWidth: 0,
      padding: "0.8rem 1.2rem",
      "&.Mui-selected": {
        color: "#507A60",
        fontWeight: 600,
      },
    },
    menuButton: {
      color: "#507A60",
    },
    menu: {
      "& .MuiPaper-root": {
        borderRadius: 2,
        marginTop: "0.5rem",
        minWidth: 180,
        boxShadow: "0px 5px 15px rgba(0,0,0,0.15)",
      },
    },
    menuItem: {
      fontSize: "0.95rem",
      fontWeight: 500,
      padding: "0.6rem 1.2rem",
      "&:hover": {
        backgroundColor: "rgba(80, 122, 96, 0.08)",
      },
    },
  };

  const renderMenuItems = () => {
    return navItems.map((item) => (
      <MenuItem 
        key={item.to} 
        onClick={() => handleMenuItemClick(item.to)}
        sx={styles.menuItem}
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
        sx={styles.tab}
      />
    ));
  };

  return (
    <AppBar position="sticky" sx={styles.appBar} elevation={0}>
      <Toolbar sx={styles.toolbar}>
        <Box sx={styles.logoContainer}>
          <Link to="/">
            <Box 
              component="img"
              sx={styles.logoImage}
              alt="MtG Artist Connection Logo"
              src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/logo.png"
            />
          </Link>
        </Box>
        <Box sx={styles.tabContainer}>
          {!isBelowMedium ? (
            <Tabs
              value={value}
              onChange={handleTabChange}
              sx={styles.tabs}
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
                sx={styles.menuButton}
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
                sx={styles.menu}
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
