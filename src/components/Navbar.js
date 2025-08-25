import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 so we know if we're on home
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuEl, setUserMenuEl] = React.useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleUserMenuOpen = (event) => setUserMenuEl(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuEl(null);

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate("/login");
  };

  const scrollToContact = () => {
    if (location.pathname === "/") {
      // already on Home → scroll
      document.getElementById("contact-section")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      // go to Home then scroll after render
      navigate("/", { state: { scrollToContact: true } });
    }
  };

  const pages = [
    { label: "Home", path: "/" },
    { label: "Report Issue", path: "/report-issue" },
    { label: "Request Service", path: "/request-service" },
    { label: "Status", path: "/status" },
    { label: "Contact", path: "#contact" }, // 👈 will be handled separately
    { label: "Services", path: "/services" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderRadius: 8,
        boxShadow: "none",
        top: 12,
        mx: { xs: 2, md: 10, lg: 15 },
        width: { xs: "90%", md: "80%" },
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              color: "#111",
              userSelect: "none",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            JantaVoice
          </Typography>
        </Box>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() =>
                  page.label === "Contact"
                    ? scrollToContact()
                    : navigate(page.path)
                }
                sx={{
                  color: "#111",
                  textTransform: "none",
                  fontWeight: 500,
                  mx: 1,
                  borderRadius: 2,
                  px: 2.5,
                  fontSize: "0.95rem",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>
        )}

        {/* User + Mobile Menu stays same, but add Contact handler */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* User Section */}
        {currentUser ? (
          <>
            <Button
              onClick={handleUserMenuOpen}
              sx={{
                ml: isMobile ? 0 : 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: isMobile ? "transparent" : "rgba(0,0,0,0.06)",
                color: "#111",
                borderRadius: 6,
                px: isMobile ? 0 : 2.5,
                py: 0.7,
                fontSize: "0.9rem",
                boxShadow: isMobile ? "none" : "0 2px 6px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.12)",
                  transform: "scale(1.03)",
                },
              }}
              startIcon={
                <Avatar
                  src={currentUser.photoURL || undefined}
                  alt={currentUser.displayName || currentUser.email}
                  sx={{
                    width: 28,
                    height: 28,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                />
              }
            >
              {!isMobile && 
              <Typography>{currentUser.displayName || currentUser.email}</Typography> }
            </Button>
            <Menu
              anchorEl={userMenuEl}
              open={Boolean(userMenuEl)}
              onClose={handleUserMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 3,
                  mt: 1.5,
                  minWidth: 200,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="black">
                  {currentUser.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleUserMenuClose();
                }}
              >
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              ml: 2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#111",
              color: "#fff",
              px: 3,
              py: 0.8,
              fontSize: "0.9rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              "&:hover": {
                bgcolor: "#333",
                transform: "translateY(-2px)",
              },
            }}
          >
            Login
          </Button>
        )}

      </Box>

          {isMobile && (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleMenuOpen}
                sx={{
                  ml: 2,
                  bgcolor: "rgba(0,0,0,0.06)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                }}
              >
                <MenuIcon sx={{ color: "#111" }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.label}
                    onClick={() => {
                      if (page.label === "Contact") {
                        scrollToContact();
                      } else {
                        navigate(page.path);
                      }
                      handleMenuClose();
                    }}
                  >
                    {page.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
