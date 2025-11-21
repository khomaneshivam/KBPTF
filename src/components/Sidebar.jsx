import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";   // ✅ Correct Icon
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useNavigate } from "react-router-dom";

const drawerWidth = 210;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const [openMaster, setOpenMaster] = useState(false);

  const menuItems = [
    { label: "Purchase", icon: <ShoppingCartIcon />, path: "/purchase" },
    { label: "Sales", icon: <AttachMoneyIcon />, path: "/sales" },
    { label: "Credits", icon: <CreditScoreIcon />, path: "/credits" },
    { label: "Machine", icon: <PrecisionManufacturingIcon />, path: "/machine" },
    { label: "Bank", icon: <CreditScoreIcon />, path: "/bank" },
    { label: "Director", icon: <CreditScoreIcon />, path: "/director" },
    { label: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { label: "Settings", icon: <SettingsIcon />, path: "/settings" },

    // ✅ Expense Module with right icon
    { label: "Expense Master", icon: <MoneyOffIcon />, path: "/master/expense" },
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <List dense>
        <ListItemButton onClick={() => navigate("/dashboard")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* Master Dropdown */}
        <ListItemButton onClick={() => setOpenMaster(!openMaster)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <AccountTreeIcon />
          </ListItemIcon>
          <ListItemText primary="Master" />
          {openMaster ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openMaster} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {[
              { text: "Item Master", path: "/master/item" },
              { text: "Company Master", path: "/master/company" },
              { text: "Party Master", path: "/master/party" },
              { text: "Bank Master", path: "/master/bank" },
              { text: "Machine Master", path: "/master/machine" },
            ].map((m) => (
              <ListItemButton
                key={m.text}
                sx={{ pl: 5 }}
                onClick={() => navigate(m.path)}
              >
                <ListItemText primary={m.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Main Menus */}
        {menuItems.map((item) => (
          <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ mt: "auto", p: 1 }}>
        <ListItemButton
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            borderRadius: 1,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "#0f1c2e",
            color: "#fff",
            borderRight: "none",
            mt: 8,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "#0f1c2e",
            color: "#fff",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
