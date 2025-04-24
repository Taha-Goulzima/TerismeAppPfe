import React from "react";
import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Association from "./pages/Association";
import AssociationDetails from "./pages/AssociationDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import MyTours from "./pages/MyTours";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AssociationDashboard from "./pages/AssociationDashboard";
import AddAssociation from "./pages/AddAssociation";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssociationReviews from './pages/AssociationReviews';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NavBar />
        <div className="pt-20">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/add-association"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AddAssociation />
                </PrivateRoute>
              }
            />

            {/* Association Routes */}
            <Route
              path="/association/dashboard"
              element={
                <PrivateRoute allowedRoles={['association']}>
                  <AssociationDashboard />
                </PrivateRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/mytours"
              element={
                <PrivateRoute>
                  <MyTours />
                </PrivateRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/associations" element={<Association />} />
            <Route path="/association/:id" element={<AssociationDetails />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tour/:id" element={<TourDetails />} />
            <Route path="/association/reviews" element={
              <PrivateRoute allowedRoles={['association']}>
                <AssociationReviews />
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
