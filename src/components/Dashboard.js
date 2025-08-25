import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, firestore } from "../firebase/config";
import { updateDoc, doc } from "firebase/firestore";
import ProgressTracker from './ProgressTracker';
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  CircularProgress,
  Drawer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import Navbar from './Navbar';
import Footer from './Footer';

export function updateProgress(type, id, progress) {
  return updateDoc(doc(firestore, type, id), { progress });
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [progress, setProgress] = useState(complaints.progress || 'Pending');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  // Fetch complaints for the user
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!currentUser) return;
      setLoadingComplaints(true);
      const complaintsQuery = query(
        collection(db, "complaints"),
        where("email", "==", currentUser.email)
      );
      const complaintsSnap = await getDocs(complaintsQuery);
      setComplaints(
        complaintsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoadingComplaints(false);
    };
    fetchComplaints();
  }, [currentUser]);

  // Fetch services for the user
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentUser) return;
      setLoadingServices(true);
      const servicesQuery = query(
        collection(db, "services"),
        where("email", "==", currentUser.email)
      );
      const servicesSnap = await getDocs(servicesQuery);
      setServices(
        servicesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoadingServices(false);
    };
    fetchServices();
  }, [currentUser]);

  const handleRowClick = (row) => {
    setDrawerData(row);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerData(null);
  };


        const handleProgress = async (next) => {
        try {
          await updateProgress('complaints', complaints.id, next);
          setProgress(next);
        } catch (error) {
          console.error("Failed to update progress:", error);
        }
      };

  if (!currentUser) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">Please log in to view your dashboard.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        alignItems: "left",
        flexDirection: "column",
        p: 4
      }}
    >

      <Navbar />

      {/* Profile Header */}
      <Stack spacing={3} sx={{ mb: 2, mt: 12 }}>
        <Box onClick={() => {'/profile'}} sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: 4, p: 1, "&:hover": { cursor: "pointer", backgroundColor: "#e3e3e330" } }}>
          <Avatar
            src={currentUser.photoURL || undefined}
            sx={{
              width: 80,
              height: 80,
              border: "3px solid #222",
              fontSize: 36,
              bgcolor: "#fff",
              color: "#222",
            }}
          >
            {currentUser.displayName
              ? currentUser.displayName[0]
              : currentUser.email[0]}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#222",
              }}
            >
              {currentUser.displayName || "Name"}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#222",
              }}
            >
              {currentUser.email}
            </Typography>
          </Box>
        </Box>
      </Stack>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{
            style: { background: "#222", height: 3, borderRadius: 2 },
          }}
          sx={{
            "& .MuiTab-root": {
              color: "#222",
              borderRadius: 3,
              mx: 0.5,
            },
          }}
        >
          <Tab label="Complaints" />
          <Tab label="Services" />
        </Tabs>
      </Box>
      <Divider sx={{ mb: 2, borderColor: "#bbb" }} />

      {/* Complaints Table */}
      {tab === 0 && (
        <>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#222",
              mb: 1,
            }}
          >
            Your Complaints
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>S.no.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email add.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingComplaints ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No complaints found.
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(row)}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{currentUser.displayName || "Name"}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.address}</TableCell>
                      <TableCell>{row.complaintType || "-"}</TableCell>
                      <TableCell>{row.description || "-"}</TableCell>
                      <TableCell>{row.progress || "Pending"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Services Table */}
      {tab === 1 && (
        <>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#222",
              mb: 1,
            }}
          >
            Your Services
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>S.no.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email add.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingServices ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(row)}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{currentUser.displayName || "Name"}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.serviceName || "-"}</TableCell>
                      <TableCell>{row.details || "-"}</TableCell>
                      <TableCell>{row.status || "Pending"}</TableCell>
                      <TableCell>
                        {row.createdAt
                          ? new Date(
                              row.createdAt.seconds
                                ? row.createdAt.seconds * 1000
                                : row.createdAt
                            ).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Bottom Drawer for Details */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            minHeight: 280,
            p: 3,
            maxWidth: 700,
            mx: "auto",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {drawerData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              {tab === 0 ? "Complaint Details" : "Service Details"}
            </Typography>
            <Stack spacing={1}>
              {Object.entries(drawerData).map(([key, value]) => (
                <Box key={key} sx={{ display: "flex", gap: 2 }}>
                  <Typography sx={{ fontWeight: "bold", minWidth: 120, textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, " $1")}:
                  </Typography>
                  <Typography>
                    {typeof value === "object" && value?.seconds
                      ? new Date(value.seconds * 1000).toLocaleString()
                      : String(value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
              
            <ProgressTracker progress={progress} onUpdate={handleProgress} />
          </motion.div>
        )}
      </Drawer>


      <Footer />
    </Box>
  );
};

export default Dashboard;