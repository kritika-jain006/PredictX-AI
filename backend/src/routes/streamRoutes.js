const express = require("express");
const router = express.Router();
const streamService = require("../services/streamService");

// GET /api/stream - SSE endpoint for real-time frontend updates
router.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    streamService.addClient(res);

    req.on("close", () => {
        streamService.removeClient(res);
    });
});

module.exports = router;
