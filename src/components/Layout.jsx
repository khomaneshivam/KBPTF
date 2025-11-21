import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";

const drawerWidth = 210;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          overflowY: "auto",
          bgcolor: "#f4f6f8",
          minHeight: "100vh",
          ml: { md: `${drawerWidth}px` },   // ⭐ Fix overlapping
          transition: "all 0.3s ease",
        }}
      >
        <Header onMenuClick={handleDrawerToggle} />

        <Toolbar /> {/* spacing below header */}
        <Box sx={{ p: { xs: 1.5, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
