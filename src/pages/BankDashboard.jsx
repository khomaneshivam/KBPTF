import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { getBankOnlineSummary } from "../api/bank";

const BankDashboard = () => {
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getBankOnlineSummary();
    setBanks(res.data.data || []);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>
        Bank Collection Summary
      </Typography>

      <Grid container spacing={3}>
        {banks.map((b) => (
          <Grid item xs={12} md={4} key={b.bank_id}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                borderLeft: "6px solid #1976d2",
              }}
            >
              <Typography variant="h6">{b.bank_name}</Typography>
              <Typography color="text.secondary">{b.account_no}</Typography>

              <Typography
                variant="body2"
                sx={{ mt: 1, color: "gray" }}
              >
                 Online Received ₹ {Number(b.online_received).toLocaleString()}
              </Typography>
<Typography color="text.secondary">
                Balance:
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}
              >
                ₹ {Number(b.account_balance).toLocaleString()}
              </Typography>

              
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BankDashboard;
