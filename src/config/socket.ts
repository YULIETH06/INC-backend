import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "../middlewares/index.js";
import { registerSockets } from "../sockets/index.socket.js";

let ioInstance: Server | null = null;

// Inicializa Socket.IO dentro del servidor HTTP
export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
        },
    });

    io.use(socketAuthMiddleware);

    registerSockets(io);

    ioInstance = io;

    return io;
};

// Retorna la instancia activa de Socket.IO
export const getIo = () => {
    return ioInstance;
};