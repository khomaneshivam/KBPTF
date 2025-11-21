// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  TrendingUp,
  CreditCard,
  Wallet,
  PlusCircle,
  FileText,
  Users,
  BarChart2,
  RefreshCw,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getMonthlyReport, getDailyReport } from "../api/reports";
import { getSalesOutstanding } from "../api/payments";
import { getTotalBalances } from "../api/balance";

// -----------------------------------------------
// Format Currency
const fmt = (amount) => {
  const v = Number(amount || 0);
  return "₹ " + v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// -----------------------------------------------
const QuickAction = ({ icon: Icon, label, onClick }) => (
  <Button
    onClick={onClick}
    variant="contained"
    startIcon={<Icon />}
    sx={{ textTransform: "none", borderRadius: 2 }}
  >
    {label}
  </Button>
);

const StatCard = ({ title, value, icon, accentColor = "#1976d2" }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: accentColor, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// ================================================
// MAIN DASHBOARD
// ================================================
const Dashboard = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [daily, setDaily] = useState(null);

  const [stats, setStats] = useState({
    todaySales: 0,
    totalBills: 0,
    totalOutstanding: 0,
    monthlySales: 0,
    monthlyPurchases: 0,
  });

  const [sparkData, setSparkData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // bank totals
  const [bankBalances, setBankBalances] = useState({
    cash_balance: 0,
    online_balance: 0,
    liquidity: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uName = localStorage.getItem("userName");
    if (!token) return navigate("/login");
    setUserName(uName || "User");

    loadDashboardData();
    const timer = setInterval(loadDashboardData, 1000 * 60 * 5);
    return () => clearInterval(timer);
  }, []);

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================
  const loadDashboardData = async () => {
    try {
      const [reportRes, outstandingRes, dailyRes, bankRes] =
        await Promise.allSettled([
          getMonthlyReport(),
          getSalesOutstanding(),
          getDailyReport(),
          getTotalBalances(),
        ]);

      // monthly report
      let tx = [];
      let summary = {};
      if (reportRes.status === "fulfilled") {
        const payload = reportRes.value.data.data || reportRes.value.data;
        tx = payload?.transactions || [];
        summary = payload?.summary || {};
      }

      // outstanding
      let outRows = [];
      if (outstandingRes.status === "fulfilled") {
        outRows = outstandingRes.value.data.data || outstandingRes.value.data || [];
      }

      // daily
      let dailyData = null;
      if (dailyRes.status === "fulfilled") {
        dailyData = dailyRes.value.data.data || dailyRes.value.data || null;
      }

      // bank balances (PATCH APPLIED)
      let bankData = {
        cash_balance: 0,
        online_balance: 0,
        liquidity: 0,
      };

      if (bankRes.status === "fulfilled" && bankRes.value?.data?.data) {
        const payload = bankRes.value.data.data;
        bankData = {
          cash_balance: Number(payload.cash_balance || 0),
          online_balance: Number(payload.online_balance || 0),
          liquidity: Number(payload.liquidity || 0),
        };
      }

      // sparkline
      const grouped = (tx || [])
        .slice()
        .reverse()
        .slice(0, 14)
        .map((t) => ({
          date: t.date ? t.date.split("T")[0] : "-",
          value: Number(t.total || t.amount || 0),
        }));

      const customers = (outRows || [])
        .slice()
        .sort((a, b) => Number(b.outstanding) - Number(a.outstanding))
        .slice(0, 6);

      const totalOutstanding = customers.reduce(
        (s, c) => s + Number(c.outstanding || 0),
        0
      );

      // today sales
      const todaySales =
        (dailyData &&
          (Number(dailyData.sales?.cash || 0) +
            Number(dailyData.sales?.online || 0))) ||
        0;

      setSparkData(grouped.length ? grouped : [{ date: "-", value: 0 }]);
      setTransactions(tx.slice(0, 8));
      setTopCustomers(customers);

      setStats({
        todaySales,
        totalBills: tx.length,
        totalOutstanding,
        monthlySales: Number(summary.totalSales || 0),
        monthlyPurchases: Number(summary.totalPurchases || 0),
      });

      setDaily(dailyData);
      setBankBalances(bankData);
    } catch (err) {
      console.error("Dashboard failed:", err);
    }
  };

  const quickActions = [
    { icon: PlusCircle, label: "New Sale", onClick: () => navigate("/sales") },
    { icon: CreditCard, label: "New Purchase", onClick: () => navigate("/purchases") },
    { icon: FileText, label: "New Expense", onClick: () => navigate("/master/expense") },
    { icon: Users, label: "Customers", onClick: () => navigate("/customers") },
    { icon: BarChart2, label: "Reports", onClick: () => navigate("/reports") },
  ];

  // ================================================
  // UI STARTS HERE
  // ================================================
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" elevation={0} sx={{ background: "transparent", mb: 2 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.secondary">
                Insights Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hello, {userName} — here's the pulse of your business.
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Refresh">
                <IconButton onClick={loadDashboardData}>
                  <RefreshCw />
                </IconButton>
              </Tooltip>

              <Button variant="contained" onClick={() => navigate("/sales/new")}>
                <PlusCircle /> New Sale
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          {quickActions.map((q) => (
            <QuickAction key={q.label} {...q} />
          ))}
        </Stack>

        {/* MAIN STATS */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <StatCard title="Today's Sales" value={fmt(stats.todaySales)} icon={<TrendingUp />} />
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard title="Total Bills" value={stats.totalBills} icon={<CreditCard />} accentColor="#2e7d32" />
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard title="Outstanding" value={fmt(stats.totalOutstanding)} icon={<Wallet />} accentColor="#f9a825" />
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard title="Monthly Net" value={fmt(stats.monthlySales - stats.monthlyPurchases)} icon={<BarChart2 />} accentColor="#8e24aa" />
          </Grid>
        </Grid>

        {/* NEW BANK BALANCE SECTION */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2">Total Cash Balance</Typography>
              <Typography variant="h6" fontWeight={700}>
                {fmt(bankBalances.cash_balance)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All cash received today + previous balance
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2">Total Online / Bank Balance</Typography>
              <Typography variant="h6" fontWeight={700}>
                {fmt(bankBalances.online_balance)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sum of all bank accounts
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2">Total Liquidity</Typography>
              <Typography variant="h6" fontWeight={700}>
                {fmt(bankBalances.liquidity)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cash + Bank
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* SALES CHART */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Sales (last 14 days)
              </Typography>

              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <ReTooltip />
                    <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Monthly Sales</Typography>
                  <Typography variant="h6">{fmt(stats.monthlySales)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Monthly Purchases</Typography>
                  <Typography variant="h6">{fmt(stats.monthlyPurchases)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* RIGHT PANELS */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>

              {/* OUTSTANDING */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Top Outstanding Customers
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell align="right">Outstanding</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {topCustomers.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.customer_name}</TableCell>
                            <TableCell>{c.customer_contact}</TableCell>
                            <TableCell align="right">{fmt(c.outstanding)}</TableCell>
                          </TableRow>
                        ))}

                        {topCustomers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">No outstanding customers</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* RECENT TRANSACTIONS */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Recent Transactions</Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Party</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {transactions.map((t) => (
                          <TableRow key={`${t.type}-${t.id}`}>
                            <TableCell>{t.date ? t.date.split("T")[0] : "-"}</TableCell>
                            <TableCell>{t.type}</TableCell>
                            <TableCell>{t.party}</TableCell>
                            <TableCell align="right">{fmt(t.total)}</TableCell>
                          </TableRow>
                        ))}

                        {transactions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">No transactions</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* DAILY REPORT */}
          <Grid item xs={12} md={6} lg={4} sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" fontWeight={700}>Today’s Summary</Typography>

              {!daily ? (
                <Typography sx={{ mt: 2, color: "gray" }}>Loading...</Typography>
              ) : (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Sales</Typography>
                    <Typography>Cash: {fmt(daily.sales.cash)}</Typography>
                    <Typography>Online: {fmt(daily.sales.online)}</Typography>
                    <Typography color="error">Credit: {fmt(daily.sales.credit)}</Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Purchases</Typography>
                    <Typography>Cash: {fmt(daily.purchase.cash)}</Typography>
                    <Typography>Online: {fmt(daily.purchase.online)}</Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Expenses</Typography>
                    <Typography>Cash: {fmt(daily.expense.cash)}</Typography>
                    <Typography>Online: {fmt(daily.expense.online)}</Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Net Cash Flow</Typography>
                    <Typography variant="h6" color="#1976d2">
                      {fmt(daily.summary?.net_cash)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/daily-report")}
                  >
                    View Full Report
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
