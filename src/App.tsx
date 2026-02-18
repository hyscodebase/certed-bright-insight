import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddInvestee from "./pages/AddInvestee";
import InvesteeList from "./pages/InvesteeList";
import CompanyDetail from "./pages/CompanyDetail";
import Profile from "./pages/Profile";
import FundList from "./pages/FundList";
import FundDetail from "./pages/FundDetail";
import AcceptInvitation from "./pages/AcceptInvitation";
import SubmitReport from "./pages/SubmitReport";
import ReportSettings from "./pages/ReportSettings";
import CompleteProfile from "./pages/CompleteProfile";
import InvesteeDashboard from "./pages/InvesteeDashboard";
import InvesteeSubmitReport from "./pages/InvesteeSubmitReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Investor routes */}
            <Route path="/" element={<ProtectedRoute allowedRole="investor"><Dashboard /></ProtectedRoute>} />
            <Route path="/add-investee" element={<ProtectedRoute allowedRole="investor"><AddInvestee /></ProtectedRoute>} />
            <Route path="/investees" element={<ProtectedRoute allowedRole="investor"><InvesteeList /></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute allowedRole="investor"><CompanyDetail /></ProtectedRoute>} />
            <Route path="/funds" element={<ProtectedRoute allowedRole="investor"><FundList /></ProtectedRoute>} />
            <Route path="/funds/:id" element={<ProtectedRoute allowedRole="investor"><FundDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/report-settings" element={<ProtectedRoute allowedRole="investor"><ReportSettings /></ProtectedRoute>} />

            {/* Investee routes */}
            <Route path="/investee" element={<ProtectedRoute allowedRole="investee"><InvesteeDashboard /></ProtectedRoute>} />
            <Route path="/investee/submit-report/:requestId" element={<ProtectedRoute allowedRole="investee"><InvesteeSubmitReport /></ProtectedRoute>} />

            {/* Public routes */}
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/submit-report" element={<SubmitReport />} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
