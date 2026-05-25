class AiRecommendationService {
  recommend({ temperature, humidity, soilMoisture, cropType }) {
    let irrigationAdvice = "";
    let fertilizerAdvice = "";

    if (soilMoisture < 40) {
      irrigationAdvice = "High irrigation required";
    } else if (soilMoisture < 60) {
      irrigationAdvice = "Moderate irrigation recommended";
    } else {
      irrigationAdvice = "No irrigation needed";
    }

    if (cropType === "rice") {
      fertilizerAdvice = "Apply Nitrogen-rich fertilizer";
    } else if (cropType === "wheat") {
      fertilizerAdvice = "Use balanced NPK fertilizer";
    } else {
      fertilizerAdvice = "Standard organic fertilizer recommended";
    }

    return { irrigationAdvice, fertilizerAdvice };
  }
}

module.exports = AiRecommendationService;
