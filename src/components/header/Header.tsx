import {
    AppBar,
    Box,
    Button,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    Toolbar,
    useMediaQuery,
    useTheme,
  } from "@mui/material";
  import { headerStyles } from "../../styles/header-styles";
  import { useState, forwardRef } from "react";
  import { Link, LinkProps, useNavigate } from "react-router-dom";
  
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
  
  // Custom Link component to handle the relationship between Tab and react-router-dom Link
  const NavLink = forwardRef<HTMLAnchorElement, LinkProps>(
    ({ to, ...props }, ref) => (
      <Link to={to} ref={ref} {...props} role={undefined} />
    )
  );
  
  const Header = () => {
    const [value, setValue] = useState<string>(navItems[0].to);
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
  
    const renderMenuItems = () => {
      return navItems.map((item, index) => (
        <MenuItem key={index} onClick={() => handleMenuItemClick(item.to)}>
          {item.label}
        </MenuItem>
      ));
    };
  
    const renderTabs = () => {
      return navItems.map((item) => (
        <Tab
          key={item.to}
          component={NavLink} // Use the custom component here
          sx={headerStyles.tabText}
          to={item.to} // Pass the 'to' prop as normal
          disableRipple
          label={item.label}
          value={item.to}
        />
      ));
    };
  
    return (
      <AppBar sx={headerStyles.appBar}>
        <Toolbar>
          <Link to="/">
            <img
              alt="MtG Artist Connection Logo"
              src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/logo.png"
              width="300px"
            />
          </Link>
          <Box sx={headerStyles.tabContainer}>
            {!isBelowMedium ? (
              <Tabs
                TabIndicatorProps={{ style: { background: "#404040" } }}
                textColor="inherit"
                value={value}
                onChange={handleTabChange}
              >
                {renderTabs()}
              </Tabs>
            ) : (
              <>
                <Button
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  sx={headerStyles.button}
                >
                  Menu
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
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
  