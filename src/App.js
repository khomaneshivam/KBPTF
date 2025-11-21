import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import Billing from "./pages/Billing";
import BillPrint from "./pages/BillPrint";
import Reports from "./pages/Reports";
import Credits from "./pages/Credits";
import Layout from "./components/Layout";
import Item from "./pages/master/ItemMaster";
import Party from "./pages/master/PartyMaster";
import Expense from "./pages/master/ExpenseMaster";
import Company from "./pages/master/CompanyMaster";
import Bank from "./pages/master/BankMaster";
import MachineryMaster from "./pages/master/Machinemaster";
import MachineryRecord from "./pages/MachineRecord";
import BankDashboard from "./pages/BankDashboard";
import DirectorLoan from "./pages/DirectorLoan";
const App = () => {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* 🔥 BILL PRINT PAGE — Updated Route */}
        <Route
          path="/bill/:id"
          element={
            <Layout>
              <BillPrint />
            </Layout>
          }
        />

        <Route
          path="/purchase"
          element={
            <Layout>
              <Purchase />
            </Layout>
          }
        /> 
        <Route
          path="/director"
          element={
            <Layout>
              <DirectorLoan />
            </Layout>
          }
        />
         <Route
          path="/bank"
          element={
            <Layout>
              <BankDashboard />
            </Layout>
          }
        />

        <Route
          path="/sales"
          element={
            <Layout>
              <Sales />
            </Layout>
          }
        />

        {/* Billing List Page */}
        <Route
          path="/billing"
          element={
            <Layout>
              <Billing />
            </Layout>
          }
        />

        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />

        <Route
          path="/credits"
          element={
            <Layout>
              <Credits />
            </Layout>
          }
        />

        {/* Master Modules */}
        <Route
          path="/master/item"
          element={
            <Layout>
              <Item />
            </Layout>
          }
        />
          <Route
          path="/master/machine"
          element={
            <Layout>
              <MachineryMaster />
            </Layout>
          }
        />
        <Route
          path="/machine"
          element={
            <Layout>
              <MachineryRecord />
            </Layout>
          }
        />

        <Route
          path="/master/party"
          element={
            <Layout>
              <Party />
            </Layout>
          }
        />

        <Route
          path="/master/company"
          element={
            <Layout>
              <Company />
            </Layout>
          }
        />

        <Route
          path="/master/bank"
          element={
            <Layout>
              <Bank />
            </Layout>
          }
        />

        <Route
          path="/master/expense"
          element={
            <Layout>
              <Expense />
            </Layout>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;
