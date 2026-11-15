import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminHistoryLog from "./pages/AdminHistoryLog.jsx";
import AdminClassLog from "./pages/AdminClassLog.jsx";
import AdminInventory from "./pages/AdminInventory.jsx";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { SocketProvider } from "./utils/socket.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import BorrowPage from "./pages/components/BorrowPage.jsx";
import ClassLogDetail from "./pages/ClassLogDetail.jsx";
import { TranslationProvider } from "./pages/components/TranslationContext.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return token && isLoggedIn ? children : <Navigate to="/login" />;
};

const InventoryApp = () => {
  return (
    <SocketProvider>
      <TranslationProvider>
      <Router>
        <div className="font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-log"
              element={
                <ProtectedRoute>
                  <AdminHistoryLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/class-log"
              element={
                <ProtectedRoute>
                  <AdminClassLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/class-log/:id"
              element={
                <ProtectedRoute>
                  <ClassLogDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <AdminInventory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
      </TranslationProvider>
    </SocketProvider>
  );
};

export default InventoryApp;