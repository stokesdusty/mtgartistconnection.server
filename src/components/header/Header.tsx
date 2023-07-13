import { AppBar, Box, Tab, Tabs, Toolbar } from "@mui/material";
import { headerStyles } from "../../styles/header-styles";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
    const [value, setValue] = useState(0);
    
    return <AppBar sx={headerStyles.appBar}>
        <Toolbar>
            <Link to="/" >
                <img
                    alt=""
                    src="https://mtgartistconnection.s3.us-west-1.amazonaws.com/logo.png" 
                    width="300px"
                />
            </Link>
            <Box sx={headerStyles.tabContainer}>
                <Tabs 
                    TabIndicatorProps={{ style: {background: "#404040"}}}
                     textColor="inherit" 
                     value={value} 
                     onChange={(e, val) => setValue(val)}
                    
                    >
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} to="/" disableRipple label="All Artists" />
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} to="/signingservices" disableRipple label="Card Signing Services" />
                    {/* @ts-ignore */}
                    <Tab LinkComponent={Link} to="/calendar" disableRipple label="Calendar" />
                </Tabs>
            </Box>
        </Toolbar>
    </AppBar>;
};

export default Header;