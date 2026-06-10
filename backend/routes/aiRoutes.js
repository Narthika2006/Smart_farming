const express = require("express");
const AiRecommendationService = require("../application/services/AiRecommendationService");

const router = express.Router();
const aiService = new AiRecommendationService();

router.post("/recommend", (req, res) => {
  const result = aiService.recommend(req.body || {});
  res.json(result);
});

module.exports = router;
