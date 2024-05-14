import { AppBar, Box, Button, Menu, MenuItem, Tab, Tabs, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { headerStyles } from "../../styles/header-styles";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
    const [value, setValue] = useState(0);
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
    
    return <AppBar sx={headerStyles.appBar}>
        <Toolbar>
            <Link to="/" >
                <img
                    alt=""
                    src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/logo.png" 
                    width="300px"
                />
            </Link>
            {!isBelowMedium && <Box sx={headerStyles.tabContainer}>
                <Tabs 
                    TabIndicatorProps={{ style: {background: "#404040"}}}
                     textColor="inherit" 
                     value={value} 
                     onChange={(e, val) => setValue(val)}
                    >
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} sx={headerStyles.tabText} to="/" disableRipple label="All Artists" />
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} sx={headerStyles.tabText} to="/signingservices" disableRipple label="Card Signing Services" />
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} sx={headerStyles.tabText} to="/calendar" disableRipple label="Calendar" />
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} sx={headerStyles.tabText} to="/randomflavortext" disableRipple label="Random Flavor Text" />
                </Tabs>
            </Box>}
            {isBelowMedium &&  <Box sx={headerStyles.tabContainer}>
                <Button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
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
                    'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={() => navigate("/")}>All Artists</MenuItem>
                    <MenuItem onClick={() => navigate("/signingservices")}>Card Signing Services</MenuItem>
                    <MenuItem onClick={() => navigate("/calendar")}>Calendar</MenuItem>
                    <MenuItem onClick={() => navigate("/randomflavortext")}>Random Flavor Text</MenuItem>
                </Menu>
                </Box>
            }
        </Toolbar>
    </AppBar>;
};

export default Header;