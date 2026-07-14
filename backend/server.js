const express = require('express');
const cors = require('cors');

const employeeRoutes =
require('./routes/employeeRoutes');
const pool = require("./config/db");

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {

    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );

    next();
});

app.use(
    '/api/employees',
    employeeRoutes
);

app.get("/stress", (req, res) => {

    let result = 0;

    for (let i = 0; i < 500000000; i++) {
        result += Math.sqrt(i);
    }

    res.json({
        message: "CPU stress completed",
        result
    });

});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP"
    })
})

app.get("/live", (req, res) => {
    res.sendStatus(200);
});

app.get("/ready", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.sendStatus(200);
    } catch {
        res.sendStatus(503);
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
