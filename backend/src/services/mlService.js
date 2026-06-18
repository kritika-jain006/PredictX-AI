const axios = require("axios");

const getPrediction = async (telemetryData) => {
    try {
        const response = await axios.post(process.env.ML_API, telemetryData);

        return response.data;
    } catch (error) {
        console.error("ML Service Error:", error.message);

        throw new Error("Unable to get prediction from ML API");
    }
};

module.exports = {
    getPrediction
};