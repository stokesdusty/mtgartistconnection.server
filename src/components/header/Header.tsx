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
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      color: "#2d3748",
      boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 4px 16px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: 0,
      borderBottom: "1px solid rgba(80, 122, 96, 0.1)",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
        pointerEvents: "none",
      },
    },
    toolbar: {
      display: "flex",
      justifyContent: "space-between",
      padding: { xs: "0.75rem 1rem", md: "1rem 2.5rem" },
      minHeight: "80px !important",
      position: "relative",
      zIndex: 1,
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "scale(1.02)",
      },
    },
    logoImage: {
      width: { xs: "220px", md: "280px", lg: "320px" },
      height: "auto",
      filter: "drop-shadow(0 4px 12px rgba(80, 122, 96, 0.1))",
      transition: "filter 0.3s ease",
      "&:hover": {
        filter: "drop-shadow(0 6px 16px rgba(80, 122, 96, 0.15))",
      },
    },
    tabContainer: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
    },
    tabs: {
      "& .MuiTabs-indicator": {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        height: 3,
        borderRadius: "2px 2px 0 0",
        boxShadow: "0 2px 8px rgba(80, 122, 96, 0.3)",
      },
    },
    tab: {
      fontWeight: 600,
      fontSize: "0.95rem",
      color: "#4a5568",
      textTransform: "none",
      minWidth: 0,
      padding: "1rem 1.5rem",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.025em",
      borderRadius: "8px 8px 0 0",
      margin: "0 2px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&.Mui-selected": {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 700,
        transform: "translateY(-1px)",
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: "-3px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "3px",
          background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
          borderRadius: "2px",
          boxShadow: "0 2px 8px rgba(80, 122, 96, 0.3)",
        },
      },
      "&:hover": {
        background: "rgba(80, 122, 96, 0.08)",
        color: "#507A60",
        transform: "translateY(-1px)",
      },
    },
    menuButton: {
      color: "#507A60",
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: 2,
      padding: "8px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 4px 12px rgba(80, 122, 96, 0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        background: "rgba(80, 122, 96, 0.1)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 16px rgba(80, 122, 96, 0.15)",
      },
    },
    menu: {
      "& .MuiPaper-root": {
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(30px) saturate(1.2)",
        borderRadius: 3,
        marginTop: "0.5rem",
        minWidth: 200,
        boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 8px 20px rgba(80, 122, 96, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        overflow: "hidden",
        "& .MuiList-root": {
          padding: "8px",
        },
      },
    },
    menuItem: {
      fontSize: "0.95rem",
      fontWeight: 600,
      padding: "12px 16px",
      borderRadius: 2,
      margin: "2px 0",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.025em",
      color: "#4a5568",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        background: "linear-gradient(135deg, rgba(80, 122, 96, 0.12) 0%, rgba(107, 157, 115, 0.08) 100%)",
        color: "#507A60",
        transform: "translateX(4px)",
        boxShadow: "0 4px 12px rgba(80, 122, 96, 0.08)",
      },
      "&.Mui-selected": {
        background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
        color: "white",
        fontWeight: 700,
        "&:hover": {
          background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
          color: "white",
          transform: "translateX(4px)",
        },
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
