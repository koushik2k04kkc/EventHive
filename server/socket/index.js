const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join_event', (eventId) => {
            socket.join(`event_${eventId}`);
        });

        socket.on('leave_event', (eventId) => {
            socket.leave(`event_${eventId}`);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

const emitToEvent = (eventId, eventName, data) => {
    if (io) {
        io.to(`event_${eventId}`).emit(eventName, data);
    }
};

module.exports = { initSocket, getIO, emitToEvent };
