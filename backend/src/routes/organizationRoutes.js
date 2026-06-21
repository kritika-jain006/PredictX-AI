const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const Device = require("../models/Device");
const Prediction = require("../models/Prediction");

// GET all organizations
router.get("/", async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ createdAt: -1 });
        res.json(orgs);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching organizations" });
    }
});

// POST register a new organization
router.post("/", async (req, res) => {
    try {
        const { orgId, companyName, contactEmail, passcode, privacyPolicy } = req.body;
        
        // Basic validation
        if (!orgId || !companyName || !contactEmail || !passcode) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if orgId already exists
        const existing = await Organization.findOne({ orgId });
        if (existing) {
            return res.status(400).json({ error: "Organization ID already exists" });
        }

        const org = await Organization.create({
            orgId,
            companyName,
            contactEmail,
            passcode,
            privacyPolicy: privacyPolicy || {}
        });

        res.status(201).json(org);
    } catch (err) {
        console.error("Error creating organization:", err);
        res.status(500).json({ error: "Server error creating organization" });
    }
});

// POST verify passcode
router.post("/verify", async (req, res) => {
    try {
        const { orgId, passcode } = req.body;
        if (!orgId || !passcode) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let org = await Organization.findOne({ orgId });
        
        // Auto-create the demo org if it doesn't exist
        if (!org && orgId === 'dell-hackathon-2026' && passcode === 'admin123') {
            org = await Organization.create({
                orgId: 'dell-hackathon-2026',
                companyName: 'Dell Hackathon Demo',
                contactEmail: 'admin@dell-hackathon.com',
                passcode: 'admin123',
                privacyPolicy: {
                    anonymizeDeviceIds: false,
                    collectProcessCount: true,
                    dataRetentionDays: 30
                }
            });

            // Seed 3 mock devices for the demo matching the user's local dataset
            const mockDevices = [
                { id: "DELL-DEV-001", type: "Laptop", os: "Windows 11", risk: "Low", msg: "System operating normally", root: "None", comp: "None", ttf: "Stable", score: 98, rec: ["Standard regular maintenance."] },
                { id: "DELL-DEV-002", type: "Server", os: "Ubuntu 22.04", risk: "Warning", msg: "High memory utilization detected", root: "Memory Paging / Thrashing", comp: "RAM", ttf: "7 - 30 Days", score: 65, rec: ["Investigate memory leak", "Upgrade RAM capacity"] },
                { id: "DELL-DEV-003", type: "Workstation", os: "Windows 10", risk: "Critical", msg: "Impending thermal failure on GPU", root: "Critical Thermal Throttling", comp: "GPU", ttf: "1 - 7 Days", score: 12, rec: ["IMMEDIATE ACTION: Device is dangerously overheating."] }
            ];

            for (const d of mockDevices) {
                await Device.create({
                    deviceId: d.id,
                    orgId: 'dell-hackathon-2026',
                    deviceType: d.type,
                    osVersion: d.os,
                    manufacturer: 'Dell',
                    model: d.id,
                    cpu: 'Intel Core i7-12700H',
                    ram: '16 GB',
                    storage: '512 GB NVMe SSD'
                });

                await Prediction.create({
                    deviceId: d.id,
                    healthScore: d.score,
                    riskLevel: d.risk,
                    failureProbability: (100 - d.score) / 100,
                    rootCause: d.root,
                    predictedComponent: d.comp,
                    estimatedFailureWindow: d.ttf,
                    recommendation: d.rec
                });
            }
        }

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        if (org.passcode !== passcode) {
            return res.status(401).json({ error: "Invalid passcode" });
        }

        res.json({ success: true, message: "Verification successful", org });
    } catch (err) {
        res.status(500).json({ error: "Server error verifying passcode" });
    }
});

// PUT update privacy policy
router.put("/:orgId/privacy", async (req, res) => {
    try {
        const { orgId } = req.params;
        const { anonymizeDeviceIds, collectProcessCount } = req.body;
        
        const org = await Organization.findOne({ orgId });
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Update nested policy
        org.privacyPolicy = {
            ...org.privacyPolicy,
            anonymizeDeviceIds: anonymizeDeviceIds !== undefined ? anonymizeDeviceIds : org.privacyPolicy.anonymizeDeviceIds,
            collectProcessCount: collectProcessCount !== undefined ? collectProcessCount : org.privacyPolicy.collectProcessCount
        };
        
        await org.save();
        res.json({ success: true, organization: org });
    } catch (err) {
        console.error("Error updating privacy policy:", err);
        res.status(500).json({ error: "Server error updating privacy policy" });
    }
});

module.exports = router;
