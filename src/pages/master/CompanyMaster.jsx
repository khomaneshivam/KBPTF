import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableContainer,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import {
  getCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
} from "../../api/master.js";

const CompanyMaster = () => {
  // Frontend state uses camelCase
  const initialFormState = {
    name: "",
    address: "",
    zipcode: "",
    contact: "",
    contactPerson: "",
    gstin: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [companies, setCompanies] = useState([]); // To store the list (usually just one)
  const [editId, setEditId] = useState(null);

  const loadCompanies = async () => {
    try {
      const res = await getCompanies();
      // The backend sends an array, so we set it
      setCompanies(res.data.data || []); 
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map frontend camelCase to backend snake_case
    // (Your DB table uses 'contact_person', not 'contactPerson')
    const dataToSubmit = {
      name: formData.name,
      address: formData.address,
      zipcode: formData.zipcode,
      contact: formData.contact,
      contact_person: formData.contactPerson, // Mapping
      gstin: formData.gstin,
    };

    try {
      if (editId) {
        // We are updating an existing company
        await updateCompany(editId, dataToSubmit);
      } else {
        // We are adding a new company
        await addCompany(dataToSubmit);
      }
      setFormData(initialFormState); // Reset form
      setEditId(null);
      loadCompanies(); // Reload the table
    } catch (err) {
      console.error("Failed to save company:", err);
    }
  };

  const handleEdit = (company) => {
    // Set the ID for update
    setEditId(company.id);

    // Map backend snake_case to frontend camelCase for the form
    setFormData({
      name: company.name,
      address: company.address,
      zipcode: company.zipcode,
      contact: company.contact,
      contactPerson: company.contact_person, // Mapping
      gstin: company.gstin,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (err) {
      console.error("Failed to delete company:", err);
    }
  };

  // Define form fields
  const formFields = [
    { label: "Company Name", name: "name", required: true, sm: 6 },
    { label: "Contact Person", name: "contactPerson", sm: 6 },
    { label: "Contact No.", name: "contact", sm: 4 },
    { label: "GSTIN", name: "gstin", sm: 4 },
    { label: "Zip Code", name: "zipcode", sm: 4 },
    { label: "Address", name: "address", sm: 12 },
  ];

  // Define table headers
  const tableHeaders = [
    "Company Name",
    "Contact Person",
    "Contact",
    "GSTIN",
    "Address",
    "Action",
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {editId ? "Edit Company Details" : "Add Company Details"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {formFields.map((field) => (
              <Grid item xs={12} sm={field.sm} key={field.name}>
                <TextField
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  fullWidth
                  required={field.required}
                />
              </Grid>
            ))}
          </Grid>

          <Button type="submit" variant="contained" sx={{ mt: 3, px: 4 }}>
            {editId ? "Update Details" : "Save Details"}
          </Button>
          {editId && (
            <Button
              variant="outlined"
              sx={{ mt: 3, px: 4, ml: 2 }}
              onClick={() => {
                setEditId(null);
                setFormData(initialFormState);
              }}
            >
              Cancel
            </Button>
          )}
        </form>
      </Paper>

      {/* Table to display the company (usually just one row) */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Saved Company Details
        </Typography>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.contact_person}</TableCell>
                  <TableCell>{company.contact}</TableCell>
                  <TableCell>{company.gstin}</TableCell>
                  <TableCell>{company.address}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(company.id)}
                    >
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

export default CompanyMaster;