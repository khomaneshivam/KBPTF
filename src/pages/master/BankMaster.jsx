import React, { useEffect, useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Grid,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton
} from "@mui/material";
// ✅ 1. Removed Edit icon
import { Delete } from "@mui/icons-material"; 
// ✅ 2. Removed updateBank from import
import { getBanks, addBank, deleteBank } from "../../api/master.js";

// ✅ 3. Updated initial state to be clean
const initialFormState = {
  bankName: "",
  accountNo: "",
  ifsc: "",
  branch: "",
};

const BankMaster = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [banks, setBanks] = useState([]);
  // ✅ 4. Removed editId state

  const fetchData = async () => {
    try {
      const res = await getBanks(); // This returns { msg: "...", data: [...] }
      
     
      setBanks(res.data.data || []); 
    } catch (err) {
      console.error("Failed to fetch banks:", err);
      setBanks([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Create a new object with the correct snake_case keys
    const dataToSubmit = {
      bank_name: formData.bankName,
      account_no: formData.accountNo,
      ifsc: formData.ifsc,
      branch: formData.branch,
    };

    try {
      // ✅ 6. Simplified logic to only addBank
      await addBank(dataToSubmit);
      
      // 3. Reset the form
      setFormData(initialFormState);
      fetchData(); // Reload data
    } catch (err) {
      console.error("Failed to save bank:", err);
    }
  };

  // ✅ 7. Removed handleEdit function

  const handleDelete = async (id) => {
    try {
      await deleteBank(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete bank:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Bank Master 🏦</Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Bank Name"
                name="bankName"
                fullWidth
                required
                value={formData.bankName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Account Number"
                name="accountNo"
                fullWidth
                value={formData.accountNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="IFSC Code"
                name="ifsc"
                fullWidth
                value={formData.ifsc}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Branch"
                name="branch"
                fullWidth
                value={formData.branch}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* ✅ 8. Simplified Button */}
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Save Bank
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>IFSC</TableCell>
                <TableCell>Branch</TableCell> 
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banks.map((row, i) => (
                // ✅ 9. FIX: Use row.id (from MySQL)
                <TableRow key={row.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{row.bank_name}</TableCell>
                  <TableCell>{row.account_no}</TableCell>
                  <TableCell>{row.ifsc}</TableCell>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell align="center">
                    {/* ✅ 10. Removed Edit Button */}
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BankMaster;