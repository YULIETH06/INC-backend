import { io } from "socket.io-client";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ5dWxpZEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc4MDAwNzA3NSwiZXhwIjoxNzgwMDkzNDc1fQ.8o_a5YF6eOf4YDAPuL0AseE-ilGqS-H_yeHnZ7X6Aeg";
const PQR_ID = 1;

const socket = io("http://localhost:4000", {
    auth: {
        token: TOKEN,
    },
});

socket.on("connect", () => {
    console.log("Conectado al socket:", socket.id);

    socket.emit("join_pqr", {
        pqrId: PQR_ID,
    });
});

socket.on("joined_pqr", (data) => {
    console.log("Unido al chat:", data);

    socket.emit("send_pqr_message", {
        pqrId: PQR_ID,
        content: "Hola, este es un mensaje de prueba desde Socket.IO.",
    });
});

socket.on("new_pqr_message", (message) => {
    console.log("Nuevo mensaje recibido:");
    console.log(message);
});

socket.on("socket_error", (error) => {
    console.log("Error del socket:");
    console.log(error);
});

socket.on("connect_error", (error) => {
    console.log("Error de conexión:");
    console.log(error.message);
});

socket.on("disconnect", () => {
    console.log("Socket desconectado");
});