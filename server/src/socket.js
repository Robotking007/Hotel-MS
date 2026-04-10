/**
 * Socket.io event handlers for real-time order updates
 */
export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Customer joins their order room for targeted updates
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`📦 Socket ${socket.id} joined order room: ${orderId}`);
    });

    // Staff joins the dashboard room
    socket.on('join:dashboard', () => {
      socket.join('dashboard');
      console.log(`📊 Socket ${socket.id} joined dashboard room`);
    });

    // Leave order room
    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Emit order status update to all relevant listeners
 */
export const emitOrderUpdate = (io, orderId, data) => {
  // Notify the specific order room (customer tracking)
  io.to(`order:${orderId}`).emit('order:status-update', data);
  // Notify the dashboard room (staff)
  io.to('dashboard').emit('order:status-update', data);
  // Also broadcast globally for any other listeners
  io.emit('order:status-update', data);
};

/**
 * Emit new order event to dashboard
 */
export const emitNewOrder = (io, orderData) => {
  io.to('dashboard').emit('order:new', orderData);
  io.emit('order:new', orderData);
};
