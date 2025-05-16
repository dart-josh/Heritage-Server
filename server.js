import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import { app, server } from "./socket/socket.js";
import clinicRoutes from "./routes/clinic.route.js";
import salesRoutes from "./routes/sales.route.js";
import universalRoutes from "./routes/universal.route.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

app.use(cors({
  origin: 'http://localhost:3303', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
  credentials: true
}));



const PORT = process.env.PORT || 3001;

app.use(express.json());

// ROUTES
app.use("/api/clinic", clinicRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/universal", universalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use("*", (req, res) => {
  res.status(404).send("Not Allowed");
});

// LISTENER
server.listen(PORT, () => {
  console.log("Server started on port", PORT);

  connectDB();
});
