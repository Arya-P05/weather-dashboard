"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  city: string;
  temperature: number;
  windSpeed: number;
  time: string;
  latitude: number;
  longitude: number;
  lastFetched: number;
  humidity: number;
  weatherCode: number;
  snowfall: number;
  rain: number;
  precipitation: number;
}

const cities = [
  { name: "Toronto", latitude: 43.65, longitude: -79.38 },
  { name: "New York", latitude: 40.71, longitude: -74.01 },
  { name: "Los Angeles", latitude: 34.05, longitude: -118.24 },
  { name: "Chicago", latitude: 41.88, longitude: -87.63 },
  { name: "Phoenix", latitude: 33.45, longitude: -112.07 },
];

// Weather icon component based on temperature and conditions
const WeatherIcon = ({ temp, code }: { temp: number; code: number }) => {
  // Simplified weather code interpretation
  if (code >= 80) return "🌧️"; // Rain
  if (code >= 71) return "🌨️"; // Snow
  if (code >= 61) return "🌦️"; // Light rain
  if (code >= 51) return "🌫️"; // Drizzle/Fog
  if (code >= 3) return "☁️"; // Cloudy
  if (temp > 25) return "☀️"; // Sunny hot
  return "🌤️"; // Clear
};

// Get weather image based on conditions
const getWeatherImage = (
  code: number,
  temp: number,
  rain: number,
  snow: number,
) => {
  // Snowy conditions
  if (snow > 0 || code >= 71) {
    return "/snow.jpg";
  }
  // Rainy conditions
  if (rain > 0 || code >= 61) {
    return "/rain.jpg";
  }
  // Cloudy/Foggy - use rain image for moody weather
  if (code >= 3) {
    return "/rain.jpg";
  }
  // All other conditions (sunny, clear, mild)
  return "/sunny.jpg";
};

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("Toronto");

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        console.log(
          "🔄 Fetching weather data...",
          new Date().toLocaleTimeString(),
        );

        const weatherPromises = cities.map(async (city) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,snowfall,rain,precipitation`,
          );
          const data = await response.json();

          console.log(`📍 ${city.name} - Full API Response:`, data);
          console.log(`  API Time: ${data.current.time} (from API)`);
          console.log(
            `  Parsed as Date: ${new Date(data.current.time).toString()}`,
          );

          return {
            city: city.name,
            temperature: data.current.temperature_2m,
            windSpeed: data.current.wind_speed_10m,
            humidity: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
            snowfall: data.current.snowfall,
            rain: data.current.rain,
            precipitation: data.current.precipitation,
            time: data.current.time,
            latitude: city.latitude,
            longitude: city.longitude,
            lastFetched: Date.now(),
          };
        });

        const results = await Promise.all(weatherPromises);

        console.log("✅ Weather data updated successfully:", results);
        console.log("📊 Summary:");
        results.forEach((weather) => {
          console.log(
            `  ${weather.city}: ${weather.temperature}°C, Wind: ${weather.windSpeed} km/h, Humidity: ${weather.humidity}%, Rain: ${weather.rain}mm, Snow: ${weather.snowfall}mm, Precip: ${weather.precipitation}mm`,
          );
        });

        setWeatherData(results);
      } catch (err) {
        console.error("❌ Error fetching weather data:", err);
        // Only show error if we have no data to display
        if (weatherData.length === 0) {
          setError("Failed to fetch weather data");
        }
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  // If no data yet, show empty UI that will populate
  if (weatherData.length === 0) {
    return (
      <main className="h-screen bg-[#1a1a1a] text-white overflow-hidden p-6">
        <div className="h-full max-w-[1600px] mx-auto flex items-center justify-center">
          <div className="text-gray-500 text-lg">Loading weather data...</div>
        </div>
      </main>
    );
  }

  const mainWeather =
    weatherData.find((w) => w.city === selectedCity) || weatherData[0];

  return (
    <main className="h-screen bg-[#1a1a1a] text-white overflow-hidden p-6">
      <div className="h-full max-w-[1600px] mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
              </div>
            </div>
            <div className="text-white-100 text-sm">Live Weather</div>
          </div>
          <div className="flex items-center gap-4 pr-6">
            <div className="text-white text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left + Middle Column - Featured City Display */}
          <div className="col-span-9">
            <div className="rounded-3xl overflow-hidden h-full relative">
              {/* Background Weather Image */}
              <div className="absolute inset-0">
                <img
                  src={getWeatherImage(
                    mainWeather.weatherCode,
                    mainWeather.temperature,
                    mainWeather.rain,
                    mainWeather.snowfall,
                  )}
                  alt={`${mainWeather.city} weather`}
                  className="w-full h-full object-cover"
                />
                {/* Subtle dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Header */}
                <div className="mb-8">
                  <div className="text-lg opacity-90 mb-2 text-white drop-shadow-lg">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="text-6xl font-bold mb-2 text-white drop-shadow-2xl">
                    {mainWeather.city}
                  </h2>
                  <div className="text-white/90 text-sm drop-shadow">
                    Last updated:{" "}
                    {new Date(mainWeather.lastFetched).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Main Temperature Display */}
                <div className="flex items-center gap-12 mb-auto">
                  <div>
                    <div className="text-9xl font-bold leading-none mb-2 text-white drop-shadow-2xl">
                      {Math.round(mainWeather.temperature)}°
                    </div>
                    <div className="text-2xl opacity-90 text-white drop-shadow-lg">
                      Feels like {Math.round(mainWeather.temperature - 2)}°
                    </div>
                  </div>
                  <div className="text-8xl drop-shadow-2xl">
                    <WeatherIcon
                      temp={mainWeather.temperature}
                      code={mainWeather.weatherCode}
                    />
                  </div>
                </div>

                {/* Stats Grid - Only show if values exist */}
                <div className="grid grid-cols-4 gap-4 mt-8 content-end">
                  {/* Always show wind speed */}
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                    <div className="text-sm opacity-90 mb-2 text-white">
                      💨 Wind
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {mainWeather.windSpeed}{" "}
                      <span className="text-base font-normal opacity-90">
                        km/h
                      </span>
                    </div>
                  </div>

                  {/* Always show humidity */}
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                    <div className="text-sm opacity-90 mb-2 text-white">
                      💧 Humidity
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {mainWeather.humidity}{" "}
                      <span className="text-base font-normal opacity-90">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Only show precipitation if > 0 */}
                  {mainWeather.precipitation > 0 && (
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                      <div className="text-sm opacity-90 mb-2 text-white">
                        🌧️ Precipitation
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {mainWeather.precipitation}{" "}
                        <span className="text-base font-normal opacity-90">
                          mm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Only show rain if > 0 */}
                  {mainWeather.rain > 0 && (
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                      <div className="text-sm opacity-90 mb-2 text-white">
                        ☔ Rain
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {mainWeather.rain}{" "}
                        <span className="text-base font-normal opacity-90">
                          mm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Only show snowfall if > 0 */}
                  {mainWeather.snowfall > 0 && (
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/30">
                      <div className="text-sm opacity-90 mb-2 text-white">
                        ❄️ Snowfall
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {mainWeather.snowfall}{" "}
                        <span className="text-base font-normal opacity-90">
                          mm
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - All Cities Detail */}
          <div className="col-span-3">
            <div className="bg-gray-900/50 rounded-3xl px-6 pb-6 h-full">
              <div className="space-y-4">
                {weatherData.map((weather) => (
                  <div
                    key={weather.city}
                    onClick={() => setSelectedCity(weather.city)}
                    className={`bg-gray-800/40 rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedCity === weather.city
                        ? "ring-2 ring-blue-500 bg-gray-800/80"
                        : "hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-gray-500">USA</div>
                        <div
                          className={`font-medium ${
                            selectedCity === weather.city ? "text-blue-400" : ""
                          }`}
                        >
                          {weather.city}
                        </div>
                      </div>
                      <div className="text-3xl">
                        <WeatherIcon
                          temp={weather.temperature}
                          code={weather.weatherCode}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {weather.humidity}% humidity
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.round(weather.temperature)}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
