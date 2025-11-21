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
import { getItems, addItem, updateItem, deleteItem } from "../../api/master.js";

const initialFormState = {
  itemCode: "",
  itemName: "",
  category: "",
  unit: "",
};

const ItemMaster = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);

  // Load items from backend
  const loadItems = async () => {
    try {
      const res = await getItems();
      setItems(res.data.data || []); // MUST match backend format
    } catch (err) {
      console.error("Failed to load items:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Handle form inputs
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateItem(editId, formData);
      } else {
        await addItem(formData);
      }

      setFormData(initialFormState);
      setEditId(null);
      loadItems();
    } catch (err) {
      console.error("Failed to save item:", err);
      alert(err.response?.data?.msg || "Save failed");
    }
  };

  // Click on Edit icon → load data into form
  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
    });
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      loadItems();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const formFields = [
    { label: "Item Code", name: "itemCode", required: true, sm: 3 },
    { label: "Item Name", name: "itemName", required: true, sm: 3 },
    { label: "Category", name: "category", sm: 3 },
    { label: "Unit", name: "unit", required: true, sm: 3 },
  ];

  const tableHeaders = ["Code", "Name", "Category", "Unit", "Action"];

  return (
    <Box>
      {/* === FORM SECTION === */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {editId ? "Edit Item" : "Add New Item"}
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

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, px: 4, borderRadius: 2 }}
          >
            {editId ? "Update" : "Save"}
          </Button>

          {editId && (
            <Button
              variant="outlined"
              sx={{ mt: 3, px: 4, ml: 2, borderRadius: 2 }}
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

      {/* === TABLE SECTION === */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Item List
        </Typography>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                {tableHeaders.map((txt) => (
                  <TableCell sx={{ color: "#fff" }} key={txt}>
                    {txt}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.unit}</TableCell>

                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(item)}>
                      <Edit />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <Typography sx={{ p: 2, textAlign: "center", opacity: 0.6 }}>
              No Items Found
            </Typography>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ItemMaster;
