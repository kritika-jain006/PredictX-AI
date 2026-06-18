const express = require("express");
const cors = require("cors");

const telemetryRoutes = require("./routes/telemetryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hardware Failure Prediction API Running");
});

app.use("/api/telemetry", telemetryRoutes);

module.exports = app;