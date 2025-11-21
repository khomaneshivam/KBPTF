import React, { useEffect, useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  MenuItem // ✅ Added for dropdown
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
// ✅ Import path corrected
import { getParties, addParty, updateParty, deleteParty } from "../../api/master.js"; 

// ✅ FIX: Updated initial state to include all fields from the database
const initialFormState = {
  name: "",
  address: "",
  zipcode: "",
  contact: "",
  contact_person: "",
  party_type: "Customer", // ✅ FIX: Renamed 'type' to 'party_type'
  email: "",
  gstin: "",
};

const PartyMaster = () => {
  const [form, setForm] = useState(initialFormState);
  const [parties, setParties] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      // ✅ FIX: The API returns an object { msg: "...", data: [...] }
      const res = await getParties();
      setParties(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch parties:", err);
      setParties([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ FIX: Send all fields to the backend.
    // The controller already maps these to snake_case.
    const dataToSubmit = {
      name: form.name,
      address: form.address,
      zipcode: form.zipcode,
      contact: form.contact,
      contact_person: form.contact_person,
      party_type: form.party_type,
      email: form.email,
      gstin: form.gstin,
    };

    try {
      if (editId) {
        await updateParty(editId, dataToSubmit);
      } else {
        await addParty(dataToSubmit);
      }
      
      setEditId(null);
      setForm(initialFormState);
      fetchData(); // Reload all data from DB for consistency
    } catch (err) {
      console.error("Failed to save party:", err);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id); // ✅ FIX: Use id, not _id
    
    // ✅ FIX: Map all fields back to the form
    setForm({
      name: p.name,
      address: p.address || "",
      zipcode: p.zipcode || "",
      contact: p.contact || "",
      contact_person: p.contact_person || "",
      party_type: p.party_type || "Customer",
      email: p.email || "",
      gstin: p.gstin || "",
    });
  };

  const handleDelete = async (id) => {
    // ✅ FIX: Removed window.confirm as per instructions
    try {
      await deleteParty(id); // ✅ FIX: Use id, not _id
      fetchData(); // Reload list
    } catch (err) {
      console.error("Failed to delete party:", err);
      alert("Failed to delete party."); // Use modal in real app
    }
  };

  // ✅ FIX: Added all 8 fields to the form
  const formFields = [
    { label: "Party Name", name: "name", required: true, sm: 4 },
    { label: "Party Type", name: "party_type", required: true, sm: 4, select: true, options: ["Customer", "Supplier", "Expenses"] },
    { label: "Contact Person", name: "contact_person", sm: 4 },
    { label: "Contact No.", name: "contact", required: true, sm: 4 },
    { label: "GSTIN", name: "gstin", sm: 4 },
    { label: "Email", name: "email", type: "email", sm: 4 },
    { label: "Address", name: "address", required: true, sm: 8 },
    { label: "Zip Code", name: "zipcode", sm: 4 },
  ];
  
  // ✅ FIX: Added new columns to table
  const tableHeaders = [
    "#", "Name", "Type", "Contact Person", "Contact", "GSTIN", "Actions"
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>Party Master</Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* ✅ FIX: Dynamically render all 8 fields */}
            {formFields.map((field) => (
              <Grid item xs={12} sm={field.sm} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  select={field.select}
                >
                  {field.select && field.options.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} type="submit">
            {editId ? "Update" : "Add"}
          </Button>
          {editId && (
            <Button sx={{ mt: 2, ml: 1 }} onClick={() => { setEditId(null); setForm(initialFormState); }}>Cancel</Button>
          )}
        </form>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                {tableHeaders.map((h) => (
                  <TableCell key={h} sx={{ color: "white" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {parties.map((p, i) => (
                <TableRow key={p.id}> {/* ✅ FIX: Use id, not _id */}
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.party_type}</TableCell> {/* ✅ FIX: Use party_type */}
                  <TableCell>{p.contact_person}</TableCell> {/* ✅ Added */}
                  <TableCell>{p.contact}</TableCell>
                  <TableCell>{p.gstin}</TableCell> {/* ✅ Added */}
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(p)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(p.id)}><Delete /></IconButton> {/* ✅ FIX: Use id */}
                  </TableCell>
                </TableRow>
              ))}
              {!parties.length && <TableRow><TableCell colSpan={tableHeaders.length}>No Records</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PartyMaster;