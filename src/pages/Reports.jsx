import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Divider,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getReportMeta,
  getMonthlyReport,
  getDailyReport,
} from "../api/reports";

const fmt = (v) => `₹ ${Number(v || 0).toLocaleString()}`;

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);

  const [month, setMonth] = useState("");
  const [type, setType] = useState("all");
  const [expenseType, setExpenseType] = useState("");
  const [customer, setCustomer] = useState("");
  const [supplier, setSupplier] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalGST: 0,
    netProfit: 0,
  });

  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOAD META
  useEffect(() => {
    loadMeta();
    loadDaily();
  }, []);

  // LOAD REPORTS WHEN FILTERS CHANGE
  useEffect(() => {
    loadReport();
  }, [month, type, expenseType, customer, supplier, page, rowsPerPage]);

  const loadMeta = async () => {
    try {
      const res = await getReportMeta();
      const meta = res.data?.data || res.data;

      setCustomers(meta.customers || []);
      setSuppliers(meta.suppliers || []);
      setExpenseTypes(meta.expenseTypes || []);

    } catch (err) {
      console.error("META LOAD ERR", err);
    }
  };

  const loadDaily = async () => {
    try {
      const res = await getDailyReport();
      setDaily(res.data.data || null);
    } catch {}
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const payload = {
        month: month || null,
        type,
        expenseType: expenseType || null,
        customer: customer || null,
        supplier: supplier || null,
        page,
        limit: rowsPerPage,
      };

      const res = await getMonthlyReport(payload);
      const data = res.data.data;

      setTransactions(data.transactions || []);
      setCategoryTotals(data.categoryTotals || []);
      setSummary(data.summary);
      setTotalRows(data.pagination.totalRows || 0);

    } catch (err) {
      console.error("REPORT ERROR", err);
    }
    setLoading(false);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setPage(0);
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Monthly Report", 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Sales", summary.totalSales],
        ["Total Purchases", summary.totalPurchases],
        ["Total Expenses", summary.totalExpenses],
        ["Total GST", summary.totalGST],
        ["Net Profit", summary.netProfit],
      ],
      headStyles: { fillColor: [25, 118, 210] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Date", "Type", "Party", "Amount", "GST", "Total", "Mode"]],
      body: transactions.map((t) => [
        t.date?.split("T")[0],
        t.type,
        t.party,
        t.amount,
        t.gst,
        t.total,
        t.paymentMode,
      ]),
      theme: "striped",
      headStyles: { fillColor: [25, 118, 210] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Category", "Total"]],
      body: categoryTotals.map((c) => [c.category, c.total]),
    });

    doc.save(`Report_${month || "ALL"}.pdf`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Advanced Reports
      </Typography>

      {/* FILTERS */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <TextField
            type="month"
            fullWidth
            label="Month"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(0); }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="Transaction Type"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="purchases">Purchases</MenuItem>
            <MenuItem value="expenses">Expenses</MenuItem>
          </TextField>
        </Grid>

        {type === "sales" && (
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Customer"
              value={customer}
              onChange={(e) => { setCustomer(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {type === "purchases" && (
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Supplier"
              value={supplier}
              onChange={(e) => { setSupplier(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Suppliers</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.name}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {type === "expenses" && (
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Expense Category"
              value={expenseType}
              onChange={(e) => { setExpenseType(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {expenseTypes.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        <Grid item xs={12} md={3} display="flex" alignItems="center" gap={1}>
          <Button variant="contained" onClick={() => { setPage(0); loadReport(); }}>
            Apply
          </Button>
          <Button variant="outlined" onClick={() => {
            setMonth("");
            setType("all");
            setCustomer("");
            setSupplier("");
            setExpenseType("");
            setPage(0);
          }}>
            Reset
          </Button>
          <Button variant="contained" color="secondary" onClick={downloadPDF}>
            Download PDF
          </Button>
        </Grid>
      </Grid>

      {/* SUMMARY */}
      <Grid container spacing={2} mb={2}>
        {[
          ["Total Sales", summary.totalSales],
          ["Total Purchases", summary.totalPurchases],
          ["Total Expenses", summary.totalExpenses],
          ["Total GST", summary.totalGST],
        ].map(([label, value]) => (
          <Grid item xs={12} md={3} key={label}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption">{label}</Typography>
              <Typography fontWeight={700}>{fmt(value)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* MAIN CONTENT */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" mb={1}>Transaction Ledger</Typography>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#1976d2" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Type</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Party</TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>Amount</TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>GST</TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>Total</TableCell>
                    <TableCell align="center" sx={{ color: "#fff" }}>Mode</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No data found</TableCell>
                    </TableRow>
                  )}

                  {transactions.map((t) => (
                    <TableRow key={`${t.type}-${t.id}`}>
                      <TableCell>{t.date?.split("T")[0]}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.party}</TableCell>
                      <TableCell align="right">{fmt(t.amount)}</TableCell>
                      <TableCell align="right">{fmt(t.gst)}</TableCell>
                      <TableCell align="right">{fmt(t.total)}</TableCell>
                      <TableCell align="center">{t.paymentMode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Expense Category Totals</Typography>
            <Divider sx={{ my: 1 }} />
            {categoryTotals.map((c) => (
              <Box key={c.category} display="flex" justifyContent="space-between" py={0.5}>
                <Typography>{c.category}</Typography>
                <Typography fontWeight={700}>{fmt(c.total)}</Typography>
              </Box>
            ))}
            {!categoryTotals.length && (
              <Typography color="text.secondary">No category data</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Today's Summary</Typography>
            <Divider sx={{ my: 1 }} />

            {!daily ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Sales (Cash)</Typography>
                  <Typography>{fmt(daily.sales.cash)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Sales (Online)</Typography>
                  <Typography>{fmt(daily.sales.online)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Purchases (Cash)</Typography>
                  <Typography>{fmt(daily.purchase.cash)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography>Expenses (Cash)</Typography>
                  <Typography>{fmt(daily.expense.cash)}</Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
