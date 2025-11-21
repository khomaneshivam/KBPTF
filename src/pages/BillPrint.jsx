import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getBillById } from "../api/bill";
import { Box, Button } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BillPrint = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const loadBill = async () => {
      try {
        const res = await getBillById(id);
        setBill(res.data.data);
      } catch (err) {
        console.error("Invoice Load Error:", err);
      }
    };

    loadBill();
  }, [id]);

  if (!bill) return <h3 style={{ textAlign: "center" }}>Loading Invoice...</h3>;

  const items = Array.isArray(bill.items) ? bill.items : [];

  const amountReceived = Number(bill.amount_received || 0);
  const remaining = Number(bill.final_amount) - amountReceived;

  const fmt = (v) => Number(v || 0).toFixed(2);

  const downloadPdf = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const pdf = new jsPDF("p", "mm", "a4");

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.width;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${bill.bill_number}.pdf`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "900px", margin: "auto" }}>
      {/* ACTION BUTTONS */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, "@media print": { display: "none" } }}>
        <Button variant="contained" onClick={() => window.print()}>
          Print
        </Button>
        <Button variant="outlined" onClick={downloadPdf}>
          Download PDF
        </Button>
      </Box>

      {/* INVOICE CONTAINER */}
      <Box
        ref={printRef}
        sx={{
          background: "#fff",
          padding: 4,
          borderRadius: 2,
          border: "1px solid #ccc",
          boxShadow: "0 0 5px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <h1 style={{ margin: 0 }}>{bill.company_name}</h1>
          <p style={{ margin: 0 }}>{bill.company_address}</p>
          <p style={{ margin: 0 }}>Mobile: {bill.company_contact}</p>
          {bill.company_gstin && <p style={{ margin: 0 }}>GSTIN: {bill.company_gstin}</p>}
        </Box>

        <hr />

        {/* CUSTOMER INFO */}
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "14px", mb: 1 }}>
          <Box>
            <p><strong>Customer:</strong> {bill.customer_name}</p>
            <p><strong>Contact:</strong> {bill.customer_contact}</p>
            <p><strong>Vehicle No:</strong> {bill.vehicle_no}</p>
          </Box>

          <Box>
            <p><strong>Bill No:</strong> {bill.bill_number}</p>
            <p><strong>Date:</strong> {bill.bill_date?.split("T")[0]}</p>
            <p><strong>Payment Type:</strong> {bill.payment_type}</p>
          </Box>
        </Box>

        <hr />

        {/* ITEMS TABLE */}
        <table width="100%" border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f1f1" }}>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{it.item_name}</td>
                <td>{it.unit}</td>
                <td>{fmt(it.quantity)}</td>
                <td>{fmt(it.rate)}</td>
                <td>{fmt(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* TOTALS */}
        <Box sx={{ textAlign: "right", fontSize: "16px", mt: 2 }}>
          <p><strong>Subtotal:</strong> ₹{fmt(bill.sub_total)}</p>
          <p><strong>Discount:</strong> ₹{fmt(bill.discount_amount)}</p>
          <p><strong>GST:</strong> ₹{fmt(bill.gst_amount)}</p>
          <p><strong>Amount Received:</strong> ₹{fmt(amountReceived)}</p>

          <h2 style={{ marginTop: "10px" }}>
            <strong>Remaining Amount:</strong> ₹{fmt(remaining)}
          </h2>
        </Box>

        <hr />
        <p style={{ textAlign: "center", marginTop: 10, fontWeight: "bold" }}>
          Thank You for Your Business!
        </p>
      </Box>
    </Box>
  );
};

export default BillPrint;
