import React, { useState, useEffect } from "react";
import {
  Box, Paper, Grid, TextField, Button, Typography,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { getItems } from "../api/master";
import { createBill, getBills } from "../api/bill";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const navigate = useNavigate();

  const [showView, setShowView] = useState(false);
  const [billList, setBillList] = useState([]);

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    bill_number: "",
    bill_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_contact: "",
    customer_address: "",
    vehicle_no: "",
    payment_type: "Credit",
    remarks: "",
  });

  const [billItems, setBillItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    item_id: "",
    itemName: "",
    unit: "",
    quantity: 1,
    sale_price: 0
  });

  const [totals, setTotals] = useState({
    sub_total: 0,
    discount_amount: 0,
    gst_amount: 0,
    final_amount: 0,
  });

  useEffect(() => {
    getItems().then(res => setItems(res.data.data || []));
  }, []);

  useEffect(() => {
    const sub = billItems.reduce(
      (acc, it) => acc + it.quantity * it.sale_price,
      0
    );
    const final = sub - totals.discount_amount + totals.gst_amount;

    setTotals(prev => ({
      ...prev,
      sub_total: sub,
      final_amount: final,
    }));
  }, [billItems, totals.discount_amount, totals.gst_amount]);

  const handleAddItem = () => {
    if (!currentItem.item_id) return alert("Select item");

    setBillItems([...billItems, { ...currentItem, id: Date.now() }]);

    setCurrentItem({
      item_id: "",
      itemName: "",
      unit: "",
      quantity: 1,
      sale_price: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      ...formData,
      ...totals,
      items: billItems
    };

    await createBill(body);

    alert("Bill Saved!");
    setBillItems([]);
    setFormData({
      bill_number: "",
      bill_date: new Date().toISOString().split("T")[0],
      customer_name: "",
      customer_contact: "",
      customer_address: "",
      vehicle_no: "",
      payment_type: "Credit",
      remarks: "",
    });
  };

  const loadBills = async () => {
    const res = await getBills();
    setBillList(res.data.data || []);
  };

  return (
    <Box>

      {/* Buttons */}
      <Box mb={3} display="flex" gap={2}>
        <Button variant={!showView ? "contained" : "outlined"} onClick={() => setShowView(false)}>New Bill</Button>
        <Button variant={showView ? "contained" : "outlined"} onClick={() => { setShowView(true); loadBills(); }}>View Bills</Button>
      </Box>

      {/* ---------------- VIEW BILLS ---------------- */}
      {showView && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Bills</Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {billList.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.bill_number}</TableCell>
                    <TableCell>{b.customer_name}</TableCell>
                    <TableCell>{b.bill_date}</TableCell>
                    <TableCell>₹{b.final_amount}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => navigate(`/billing/${b.id}`)}>Print</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ---------------- NEW BILL FORM ---------------- */}
      {!showView && (
        <form onSubmit={handleSubmit}>
          {/* Customer & Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}><TextField name="bill_number" label="Bill No" fullWidth required value={formData.bill_number} onChange={e => setFormData({...formData, bill_number: e.target.value})} /></Grid>
              <Grid item xs={3}><TextField name="bill_date" label="Date" type="date" fullWidth required value={formData.bill_date} onChange={e => setFormData({...formData, bill_date: e.target.value})} /></Grid>
              <Grid item xs={3}><TextField name="customer_name" label="Customer Name" fullWidth required value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} /></Grid>
              <Grid item xs={3}><TextField name="customer_contact" label="Customer Contact" fullWidth required value={formData.customer_contact} onChange={e => setFormData({...formData, customer_contact: e.target.value})} /></Grid>

              <Grid item xs={12}><TextField name="customer_address" label="Customer Address" fullWidth multiline rows={2} value={formData.customer_address} onChange={e => setFormData({...formData, customer_address: e.target.value})} /></Grid>
            </Grid>
          </Paper>

          {/* Add Items */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Add Items</Typography>

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField select label="Item" fullWidth value={currentItem.item_id}
                  onChange={e => {
                    const it = items.find(i => i.id === e.target.value);
                    setCurrentItem({
                      item_id: it.id,
                      itemName: it.itemName,
                      unit: it.unit,
                      quantity: 1,
                      sale_price: it.price || 0
                    });
                  }}>
                  {items.map(i => (
                    <MenuItem key={i.id} value={i.id}>{i.itemName}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={2}><TextField label="Unit" value={currentItem.unit} fullWidth disabled /></Grid>
              <Grid item xs={2}><TextField label="Qty" type="number" value={currentItem.quantity} fullWidth onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} /></Grid>
              <Grid item xs={2}><TextField label="Rate" type="number" value={currentItem.sale_price} fullWidth onChange={e => setCurrentItem({...currentItem, sale_price: Number(e.target.value)})} /></Grid>
              <Grid item xs={3}><Button variant="contained" fullWidth onClick={handleAddItem}>Add Item</Button></Grid>
            </Grid>
          </Paper>

          {/* Items Table */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {billItems.map(it => (
                    <TableRow key={it.id}>
                      <TableCell>{it.itemName}</TableCell>
                      <TableCell>{it.unit}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>{it.sale_price}</TableCell>
                      <TableCell>{(it.quantity * it.sale_price).toFixed(2)}</TableCell>
                      <TableCell><IconButton color="error" onClick={() => setBillItems(billItems.filter(x => x.id !== it.id))}><Delete /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Totals */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField select name="payment_type" label="Payment Type" fullWidth value={formData.payment_type} onChange={e => setFormData({...formData, payment_type: e.target.value})}>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </TextField>
                <TextField multiline rows={3} label="Remarks" fullWidth sx={{ mt:2 }} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})}/>
              </Grid>

              <Grid item xs={6}>
                <Typography>Sub Total: ₹{totals.sub_total.toFixed(2)}</Typography>
                <TextField label="Discount (₹)" type="number" fullWidth sx={{ mt:1 }} value={totals.discount_amount} onChange={e => setTotals({...totals, discount_amount: Number(e.target.value)})}/>
                <TextField label="GST (₹)" type="number" fullWidth sx={{ mt:1 }} value={totals.gst_amount} onChange={e => setTotals({...totals, gst_amount: Number(e.target.value)})}/>
                <Typography sx={{ mt:2, fontSize: '20px', fontWeight: 'bold' }}>Final: ₹{totals.final_amount.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large">Save Bill</Button>
        </form>
      )}
    </Box>
  );
};

export default Billing;
