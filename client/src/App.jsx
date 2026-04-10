import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import Dashboard from './pages/Dashboard';
import AdminMenu from './pages/AdminMenu';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <ToastProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={
                <ProtectedRoute><Cart /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><MyOrders /></ProtectedRoute>
              } />
              <Route path="/orders/:id/track" element={
                <ProtectedRoute><OrderTracking /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute roles={['staff', 'admin']}><Dashboard /></ProtectedRoute>
              } />
              <Route path="/admin/menu" element={
                <ProtectedRoute roles={['admin']}><AdminMenu /></ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>
              } />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
