import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

  const apiKey = " f019d93e0227429cba0174306252206 ";

function App() {
  
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState("C");
  const [theme, setTheme] = useState("light");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedHistory = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    setTheme(savedTheme || "light");
    setHistory(savedHistory);
    getWeatherByLocation();
  }, []);

  useEffect(() => {
    document.body.className = theme === "dark" ? "bg-dark text-white" : "bg-light text-dark";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchWeatherData = async (query) => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=7&aqi=no&alerts=no`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setWeather(data);
      setForecast(data.forecast.forecastday);
      saveToHistory(data.location.name);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getWeather = () => {
    if (!city) return alert("Please enter a city");
    fetchWeatherData(city);
  };

  const getWeatherByLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherData(`${latitude},${longitude}`);
      },
      () => alert("Location access denied")
    );
  };

  const saveToHistory = (cityName) => {
    let updatedHistory = [cityName, ...history.filter((c) => c !== cityName)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("weatherHistory", JSON.stringify(updatedHistory));
    localStorage.setItem("lastCity", cityName);
  };

  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) fetchWeatherData(lastCity);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🌦️ Weather App</h2>
        <div>
          <button onClick={toggleTheme} className="btn btn-outline-dark me-2">
            🌗 Toggle Theme
          </button>
          <button onClick={toggleUnit} className="btn btn-outline-secondary">
            🌡️ °C/°F
          </button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="btn btn-primary" onClick={getWeather}>
          Search
        </button>
        <button className="btn btn-success" onClick={getWeatherByLocation}>
          📍 Auto Location
        </button>
      </div>

      {history.length > 0 && (
        <div className="mb-3">
          <h5>Recent Searches:</h5>
          {history.map((cityName, i) => (
            <button
              key={i}
              className="btn btn-outline-light btn-sm me-1 mb-1"
              onClick={() => fetchWeatherData(cityName)}
            >
              {cityName}
            </button>
          ))}
        </div>
      )}

      {weather && (
        <div className="mt-4">
          <h3>{weather.location.name}, {weather.location.country}</h3>
          <img src={`https:${weather.current.condition.icon}`} alt="" />
          <p><strong>Temp:</strong> {unit === "F" ? weather.current.temp_f + "°F" : weather.current.temp_c + "°C"}</p>
          <p><strong>Condition:</strong> {weather.current.condition.text}</p>
          <p><strong>Humidity:</strong> {weather.current.humidity}%</p>
          <p><strong>Wind:</strong> {unit === "F" ? weather.current.wind_mph + " mph" : weather.current.wind_kph + " km/h"}</p>

          <h4 className="mt-4">📅 7-Day Forecast</h4>
          <div className="d-flex flex-wrap">
            {forecast.map((day, i) => (
              <div key={i} className="forecast-day p-2 border rounded text-center mx-1">
                <h6>{day.date}</h6>
                <img src={`https:${day.day.condition.icon}`} alt="" />
                <p>{day.day.condition.text}</p>
                <p><strong>{unit === "F" ? day.day.avgtemp_f + "°F" : day.day.avgtemp_c + "°C"}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
 );
};

export default App
