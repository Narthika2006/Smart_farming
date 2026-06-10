const axios = require("axios");

class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getWeather(city) {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
    );
    return response.data;
  }
}

module.exports = WeatherService;
