const Telemetry = require("../models/Telemetry");
const Prediction = require("../models/Prediction");

const { getPrediction } = require("../services/mlService");
const { generateRecommendation } = require("../services/recommendationService");

const receiveTelemetry = async (req, res) => {
    try {
        // Save incoming telemetry
        const telemetry = await Telemetry.create(req.body);

        // Send telemetry to ML model
        const predictionResult = await getPrediction({
            cpuUsage: req.body.cpuUsage,
            cpuTemp: req.body.cpuTemp,
            ramUsage: req.body.ramUsage,
            diskUsage: req.body.diskUsage,
            batteryHealth: req.body.batteryHealth,
            cpuPower: req.body.cpuPower,
            batteryPower: req.body.batteryPower,
            fanRpm: req.body.fanRpm,
            smartHealth: req.body.smartHealth,
            gpuUsage: req.body.gpuUsage,
            gpuTemp: req.body.gpuTemp
        });

        // Generate recommendations
        const recommendations = generateRecommendation(predictionResult);

        // Save prediction
        const prediction = await Prediction.create({
            deviceId: req.body.deviceId,
            healthScore: predictionResult.healthScore,
            failureProbability: predictionResult.failureProbability,
            riskLevel: predictionResult.riskLevel,
            predictedComponent: predictionResult.predictedComponent,
            rootCause: predictionResult.rootCause,
            recommendation: recommendations
        });

        res.status(201).json({
            message: "Telemetry processed successfully",
            telemetry,
            prediction
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    receiveTelemetry
};