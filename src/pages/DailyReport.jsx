// src/pages/DailyReport.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import { getDailyReport } from "../api/dashboard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DailyReport = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const res = await getDailyReport();
    setData(res.data.data);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Daily Financial Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Category", "Cash", "Online", "Credit"]],
      body: [
        [
          "Sales",
          `₹ ${data.sales.cash}`,
          `₹ ${data.sales.online}`,
          `₹ ${data.sales.credit}`,
        ],
        [
          "Purchase",
          `₹ ${data.purchase.cash}`,
          `₹ ${data.purchase.online}`,
          "---",
        ],
        [
          "Expense",
          `₹ ${data.expense.cash}`,
          `₹ ${data.expense.online}`,
          "---",
        ],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Summary", "Amount"]],
      body: [
        ["Total Cash In", `₹ ${data.summary.cash_in}`],
        ["Total Cash Out", `₹ ${data.summary.cash_out}`],
        ["Net Cash Flow", `₹ ${data.summary.net_cash}`],
        ["Total Online In", `₹ ${data.summary.online_in}`],
        ["Online Out", `₹ ${data.summary.online_out}`],
        ["Net Online Flow", `₹ ${data.summary.net_online}`],
      ],
    });

    doc.save("Daily_Report.pdf");
  };

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Daily Report
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {/* SALES */}
        <Typography variant="h6">Sales</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container>
          <Grid item xs={4}>Cash: ₹ {data.sales.cash}</Grid>
          <Grid item xs={4}>Online: ₹ {data.sales.online}</Grid>
          <Grid item xs={4}>Credit: ₹ {data.sales.credit}</Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* PURCHASE */}
        <Typography variant="h6">Purchase</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container>
          <Grid item xs={6}>Cash: ₹ {data.purchase.cash}</Grid>
          <Grid item xs={6}>Online: ₹ {data.purchase.online}</Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* EXPENSE */}
        <Typography variant="h6">Expense</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container>
          <Grid item xs={6}>Cash: ₹ {data.expense.cash}</Grid>
          <Grid item xs={6}>Online: ₹ {data.expense.online}</Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* SUMMARY */}
        <Typography variant="h6">Summary</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container>
          <Grid item xs={4}>Net Cash Flow: ₹ {data.summary.net_cash}</Grid>
          <Grid item xs={4}>Net Online Flow: ₹ {data.summary.net_online}</Grid>
          <Grid item xs={4}>Total Movement Today: ₹ {data.summary.total_today}</Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      </Paper>
    </Box>
  );
};

export default DailyReport;
