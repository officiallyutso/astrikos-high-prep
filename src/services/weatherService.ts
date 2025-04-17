import axios from 'axios';

// OpenWeatherMap API (free tier)
const WEATHER_API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Free API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Cache mechanism to avoid excessive API calls
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

// Grid points for global coverage (reduced for free API limits)
const generateGlobalGrid = (density: number = 10) => {
  const grid = [];
  for (let lat = -80; lat <= 80; lat += density) {
    for (let lng = -180; lng <= 180; lng += density) {
      grid.push({ lat, lng });
    }
  }
  return grid;
};

// Get temperature data for global visualization
export async function getTemperatureData() {
  // Check cache first
  if (cache['temperatureData'] && 
      Date.now() - cache['temperatureData'].timestamp < CACHE_DURATION) {
    return cache['temperatureData'].data;
  }
  
  try {
    // Use a sparse grid to stay within API limits
    const grid = generateGlobalGrid(20);
    const temperatureData = [];
    
    // For free tier, we'll use a smaller sample and simulate the rest
    const sampleSize = 20; // Reduced for free API limits
    const samplePoints = grid.slice(0, sampleSize);
    
    // Fetch real data for sample points
    const promises = samplePoints.map(point => 
      axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat: point.lat,
          lon: point.lng,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      })
    );
    
    const responses = await Promise.all(promises);
    
    // Process real data
    responses.forEach(response => {
      const { coord, main } = response.data;
      temperatureData.push({
        lat: coord.lat,
        lng: coord.lon,
        value: main.temp + 30 // Offset to make all values positive for heatmap
      });
    });
    
    // Simulate data for remaining grid points based on patterns from real data
    // This approach gives a realistic global temperature distribution while staying within API limits
    grid.slice(sampleSize).forEach(point => {
      // Temperature simulation based on latitude (colder at poles, warmer at equator)
      const latFactor = 1 - Math.abs(point.lat) / 90;
      const baseTempC = latFactor * 40 - 10; // Range from -10°C to 30°C
      
      // Add some randomness
      const randomVariation = (Math.random() - 0.5) * 10;
      const simulatedTemp = baseTempC + randomVariation;
      
      temperatureData.push({
        lat: point.lat,
        lng: point.lng,
        value: simulatedTemp + 30 // Offset to make all values positive for heatmap
      });
    });
    
    // Save to cache
    cache['temperatureData'] = {
      data: temperatureData,
      timestamp: Date.now()
    };
    
    return temperatureData;
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    
    // Return simulated data as fallback
    const grid = generateGlobalGrid(15);
    return grid.map(point => {
      const latFactor = 1 - Math.abs(point.lat) / 90;
      const baseTempC = latFactor * 40 - 10;
      const randomVariation = (Math.random() - 0.5) * 10;
      return {
        lat: point.lat,
        lng: point.lng,
        value: baseTempC + randomVariation + 30
      };
    });
  }
}

// Get weather data (precipitation, clouds) for global visualization
export async function getWeatherData() {
  // Check cache first
  if (cache['weatherData'] && 
      Date.now() - cache['weatherData'].timestamp < CACHE_DURATION) {
    return cache['weatherData'].data;
  }
  
  try {
    // Use a sparse grid to stay within API limits
    const grid = generateGlobalGrid(25);
    const weatherData = [];
    
    // For free tier, we'll use a smaller sample and simulate the rest
    const sampleSize = 15; // Reduced for free API limits
    const samplePoints = grid.slice(0, sampleSize);
    
    // Fetch real data for sample points
    const promises = samplePoints.map(point => 
      axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat: point.lat,
          lon: point.lng,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      })
    );
    
    const responses = await Promise.all(promises);
    
    // Process real data
    responses.forEach(response => {
      const { coord, clouds, rain, snow } = response.data;
      
      // Calculate weather intensity based on clouds and precipitation
      let intensity = clouds?.all || 0; // Cloud coverage (0-100)
      
      // Add precipitation if available
      if (rain?.['1h'] || rain?.['3h']) {
        intensity += (rain['1h'] || rain['3h'] / 3) * 10; // Scale rain to similar range
      }
      
      if (snow?.['1h'] || snow?.['3h']) {
        intensity += (snow['1h'] || snow['3h'] / 3) * 10; // Scale snow to similar range
      }
      
      weatherData.push({
        lat: coord.lat,
        lng: coord.lon,
        value: intensity
      });
    });
    
    // Simulate data for remaining grid points
    grid.slice(sampleSize).forEach(point => {
      // Weather simulation - more precipitation near equator and at specific latitudes (storm belts)
      const equatorFactor = Math.exp(-Math.pow(point.lat / 15, 2)); // More rain near equator
      const stormBeltFactor = Math.exp(-Math.pow((Math.abs(point.lat) - 45) / 15, 2)); // Storm belts around 45° N/S
      
      // Combine factors with randomness
      const randomFactor = Math.random();
      const weatherIntensity = (equatorFactor * 50 + stormBeltFactor * 30) * randomFactor;
      
      weatherData.push({
        lat: point.lat,
        lng: point.lng,
        value: Math.min(100, weatherIntensity) // Cap at 100 for consistency
      });
    });
    
    // Save to cache
    cache['weatherData'] = {
      data: weatherData,
      timestamp: Date.now()
    };
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return simulated data as fallback
    const grid = generateGlobalGrid(20);
    return grid.map(point => {
        const equatorFactor = Math.exp(-Math.pow(point.lat / 15, 2));
        const stormBeltFactor = Math.exp(-Math.pow((Math.abs(point.lat) - 45) / 15, 2));
        const randomFactor = Math.random();
        return {
          lat: point.lat,
          lng: point.lng,
          value: Math.min(100, (equatorFactor * 50 + stormBeltFactor * 30) * randomFactor)
        };
      });
    }
  }
  
  // Get specific weather for a city
  export async function getCityWeather(lat: number, lng: number) {
    const cacheKey = `weather_${lat}_${lng}`;
    
    // Check cache first
    if (cache[cacheKey] && 
        Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }
    
    try {
      const response = await axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      const weatherData = {
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind.speed,
        windDirection: response.data.wind.deg,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        clouds: response.data.clouds?.all || 0,
        rain: response.data.rain?.['1h'] || response.data.rain?.['3h'] || 0,
        snow: response.data.snow?.['1h'] || response.data.snow?.['3h'] || 0,
        timestamp: response.data.dt * 1000
      };
      
      // Save to cache
      cache[cacheKey] = {
        data: weatherData,
        timestamp: Date.now()
      };
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching city weather:', error);
      
      // Return simulated data as fallback
      const latFactor = 1 - Math.abs(lat) / 90;
      const baseTempC = latFactor * 40 - 10;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      return {
        temperature: baseTempC + randomVariation,
        feelsLike: baseTempC + randomVariation - 2,
        humidity: Math.round(50 + Math.random() * 40),
        pressure: Math.round(1000 + Math.random() * 30),
        windSpeed: Math.round(Math.random() * 10 * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        description: "Simulated weather data",
        icon: "01d",
        clouds: Math.round(Math.random() * 100),
        rain: 0,
        snow: 0,
        timestamp: Date.now()
      };
    }
  }
  
  // Get 5-day forecast for a city
  export async function getCityForecast(lat: number, lng: number) {
    const cacheKey = `forecast_${lat}_${lng}`;
    
    // Check cache first
    if (cache[cacheKey] && 
        Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }
    
    try {
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      // Process forecast data (every 3 hours for 5 days)
      const forecastData = response.data.list.map((item: any) => ({
        timestamp: item.dt * 1000,
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed,
        clouds: item.clouds.all,
        rain: item.rain?.['3h'] || 0,
        snow: item.snow?.['3h'] || 0
      }));
      
      // Save to cache
      cache[cacheKey] = {
        data: forecastData,
        timestamp: Date.now()
      };
      
      return forecastData;
    } catch (error) {
      console.error('Error fetching city forecast:', error);
      
      // Return simulated forecast data as fallback
      const latFactor = 1 - Math.abs(lat) / 90;
      const baseTempC = latFactor * 40 - 10;
      
      // Generate 5 days of data, 8 points per day (3-hour intervals)
      return Array.from({ length: 40 }, (_, i) => {
        const dayOffset = Math.floor(i / 8); // Which day (0-4)
        const hourOffset = (i % 8) * 3; // Hour of day (0, 3, 6, 9, 12, 15, 18, 21)
        const timeOffset = dayOffset * 24 * 60 * 60 * 1000 + hourOffset * 60 * 60 * 1000;
        
        // Temperature varies by time of day
        const hourFactor = Math.sin((hourOffset - 6) * Math.PI / 12); // Peak at noon
        const tempVariation = hourFactor * 8; // ±8°C variation
        
        // Add some day-to-day variation
        const dayVariation = (Math.random() - 0.5) * 4; // ±2°C variation between days
        
        return {
          timestamp: Date.now() + timeOffset,
          temperature: baseTempC + tempVariation + dayVariation,
          feelsLike: baseTempC + tempVariation + dayVariation - 2,
          humidity: Math.round(50 + Math.random() * 40),
          pressure: Math.round(1000 + Math.random() * 30),
          description: "Simulated forecast",
          icon: hourOffset >= 6 && hourOffset <= 18 ? "01d" : "01n", // Day/night icons
          windSpeed: Math.round(Math.random() * 10 * 10) / 10,
          clouds: Math.round(Math.random() * 100),
          rain: Math.random() > 0.8 ? Math.random() * 5 : 0, // 20% chance of rain
          snow: Math.random() > 0.9 ? Math.random() * 3 : 0  // 10% chance of snow
        };
      });
    }
  }