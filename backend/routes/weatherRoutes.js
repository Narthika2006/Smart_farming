const express = require("express");
const WeatherService = require("../application/services/WeatherService");

const router = express.Router();
const weatherService = new WeatherService(process.env.WEATHER_API_KEY);

router.get("/", async (req, res) => {
  try {
    const data = await weatherService.getWeather("London");
    res.json(data);
  } catch (error) {
    console.error("Weather Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Weather fetch failed" });
  }
});

router.get("/:city", async (req, res) => {
  try {
    const data = await weatherService.getWeather(req.params.city);
    res.json(data);
  } catch (error) {
    console.error("Weather Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Weather fetch failed" });
  }
});

module.exports = router;
