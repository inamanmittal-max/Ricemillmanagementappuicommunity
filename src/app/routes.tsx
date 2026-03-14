import { Routes, Route } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { TransactionLog } from "./components/TransactionLog";
import { ExpenseTracker } from "./components/ExpenseTracker";
import { ApprovalWorkflow } from "./components/ApprovalWorkflow";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { Notes } from "./components/Notes";
import { NotesEnhanced } from "./components/NotesEnhanced";
import { RedirectToDashboard } from "./components/RedirectToDashboard";
import { Analytics } from "./components/Analytics";
import { ProfitLoss } from "./components/ProfitLoss";
import { Inventory } from "./components/Inventory";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { AuditLog } from "./components/AuditLog";
import { NotFound } from "./components/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<RedirectToDashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<TransactionLog />} />
        <Route path="expenses" element={<ExpenseTracker />} />
        <Route path="approvals" element={<ApprovalWorkflow />} />
        <Route path="timeline" element={<ActivityTimeline />} />
        <Route path="notes" element={<NotesEnhanced />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profit" element={<ProfitLoss />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="financial" element={<FinancialDashboard />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}