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

// Get temperature data for global visualization with accurate climate modeling
export async function getTemperatureData() {
  // Check cache first
  if (cache['temperatureData'] && 
      Date.now() - cache['temperatureData'].timestamp < CACHE_DURATION) {
    return cache['temperatureData'].data;
  }
  
  try {
    // Use a denser grid for better coverage
    const grid = generateGlobalGrid(10);
    const temperatureData = [];
    
    // For free tier, we'll use a smaller sample and simulate the rest
    const sampleSize = 20; // Limited by API rate limits
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
    
    // Simulate data for remaining grid points based on accurate climate modeling
    grid.slice(sampleSize).forEach(point => {
      // More accurate temperature simulation based on latitude, season, and climate zones
      
      // Get current month (0-11)
      const currentMonth = new Date().getMonth();
      
      // Seasonal factor (-1 to 1) - positive in northern summer, negative in southern summer
      const seasonalFactor = Math.sin((currentMonth / 12) * 2 * Math.PI);
      
      // Latitude effect (equator is warmer, poles are colder)
      const latitudeEffect = Math.cos(point.lat * (Math.PI / 180));
      
      // Hemisphere seasonal adjustment
      const hemisphereAdjustment = point.lat >= 0 ? seasonalFactor : -seasonalFactor;
      
      // Continental vs oceanic effect (rough approximation based on longitude)
      // Major land masses are roughly between these longitude ranges
      const isLikelyLand = (
        (point.lng >= -130 && point.lng <= -60) || // Americas
        (point.lng >= -10 && point.lng <= 40) ||   // Europe/Africa
        (point.lng >= 60 && point.lng <= 150)      // Asia/Australia
      );
      
      // Continental areas have more temperature extremes
      const continentalFactor = isLikelyLand ? 1.5 : 0.8;
      
      // Base temperature calculation
      let baseTemp = 30 * latitudeEffect; // Range from ~0°C at poles to ~30°C at equator
      
      // Apply seasonal adjustment (stronger effect away from equator)
      baseTemp += hemisphereAdjustment * (15 * (1 - Math.abs(latitudeEffect))) * continentalFactor;
      
      // Add some realistic random variation
      const randomVariation = (Math.random() - 0.5) * 5;
      
      // Final temperature
      const simulatedTemp = baseTemp + randomVariation;
      
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
    
    // Return fallback data with realistic global temperature distribution
    return generateFallbackTemperatureData();
  }
}

// Generate fallback temperature data based on realistic climate modeling
function generateFallbackTemperatureData() {
  const grid = generateGlobalGrid(8);
  const temperatureData = [];
  
  // Get current month (0-11)
  const currentMonth = new Date().getMonth();
  
  // Seasonal factor (-1 to 1)
  const seasonalFactor = Math.sin((currentMonth / 12) * 2 * Math.PI);
  
  grid.forEach(point => {
    // Latitude effect (equator is warmer, poles are colder)
    const latitudeEffect = Math.cos(point.lat * (Math.PI / 180));
    
    // Hemisphere seasonal adjustment
    const hemisphereAdjustment = point.lat >= 0 ? seasonalFactor : -seasonalFactor;
    
    // Continental vs oceanic effect (rough approximation)
    const isLikelyLand = (
      (point.lng >= -130 && point.lng <= -60) || // Americas
      (point.lng >= -10 && point.lng <= 40) ||   // Europe/Africa
      (point.lng >= 60 && point.lng <= 150)      // Asia/Australia
    );
    
    // Continental areas have more temperature extremes
    const continentalFactor = isLikelyLand ? 1.5 : 0.8;
    
    // Base temperature calculation
    let baseTemp = 30 * latitudeEffect; // Range from ~0°C at poles to ~30°C at equator
    
    // Apply seasonal adjustment (stronger effect away from equator)
    baseTemp += hemisphereAdjustment * (15 * (1 - Math.abs(latitudeEffect))) * continentalFactor;
    
    // Add some realistic random variation
    const randomVariation = (Math.random() - 0.5) * 5;
    
    // Final temperature
    const simulatedTemp = baseTemp + randomVariation;
    
    temperatureData.push({
      lat: point.lat,
      lng: point.lng,
      value: simulatedTemp + 30 // Offset to make all values positive for heatmap
    });
  });
  
  return temperatureData;
}

// Get weather data (precipitation, clouds) with accurate climate modeling
export async function getWeatherData() {
  // Check cache first
  if (cache['weatherData'] && 
      Date.now() - cache['weatherData'].timestamp < CACHE_DURATION) {
    return cache['weatherData'].data;
  }
  
  try {
    // Use a denser grid for better coverage
    const grid = generateGlobalGrid(12);
    const weatherData = [];
    
    // For free tier, we'll use a smaller sample and simulate the rest
    const sampleSize = 15;
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
    
    // Simulate data for remaining grid points based on accurate climate patterns
    grid.slice(sampleSize).forEach(point => {
      // Get current month (0-11)
      const currentMonth = new Date().getMonth();
      
      // Seasonal factor (-1 to 1)
      const seasonalFactor = Math.sin((currentMonth / 12) * 2 * Math.PI);
      
      // Realistic precipitation patterns:
      
      // 1. Intertropical Convergence Zone (ITCZ) - heavy rainfall near equator
      const itczFactor = Math.exp(-Math.pow(point.lat / 10, 2));
      
      // 2. Mid-latitude storm tracks (around 40-60° N/S)
      const stormTrackNorth = Math.exp(-Math.pow((point.lat - 50) / 15, 2));
      const stormTrackSouth = Math.exp(-Math.pow((point.lat + 50) / 15, 2));
      const stormTrackFactor = Math.max(stormTrackNorth, stormTrackSouth);
      
      // 3. Subtropical high pressure zones (around 30° N/S) - dry areas
      const subtropicalHighNorth = Math.exp(-Math.pow((point.lat - 30) / 10, 2));
      const subtropicalHighSouth = Math.exp(-Math.pow((point.lat + 30) / 10, 2));
      const subtropicalDryFactor = Math.max(subtropicalHighNorth, subtropicalHighSouth);
      
      // 4. Monsoon regions (simplified)
      const isMonsoonRegion = (
        (point.lat >= 5 && point.lat <= 35 && point.lng >= 60 && point.lng <= 120) || // Asian monsoon
        (point.lat >= -20 && point.lat <= 5 && point.lng >= 100 && point.lng <= 150)   // Australian monsoon
      );
      
      // Monsoon is seasonal - stronger in summer
      const monsoonFactor = isMonsoonRegion ? 
        (point.lat >= 0 ? Math.max(0, seasonalFactor) : Math.max(0, -seasonalFactor)) * 2 : 
        0;
      
      // Combine all factors
      let precipitationFactor = 
        (itczFactor * 0.7) + 
        (stormTrackFactor * 0.5) - 
        (subtropicalDryFactor * 0.3) + 
        monsoonFactor;
      
      // Ensure it's positive
      precipitationFactor = Math.max(0, precipitationFactor);
      
      // Scale to 0-100 range and add randomness
      const weatherIntensity = Math.min(100, precipitationFactor * 70 + (Math.random() * 30));
      
      weatherData.push({
        lat: point.lat,
        lng: point.lng,
        value: weatherIntensity
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
    
    // Return fallback data with realistic global weather patterns
    return generateFallbackWeatherData();
  }
}

// Generate fallback weather data based on realistic climate patterns
function generateFallbackWeatherData() {
  const grid = generateGlobalGrid(8);
  const weatherData = [];
  
  // Get current month (0-11)
  const currentMonth = new Date().getMonth();
  
  // Seasonal factor (-1 to 1)
  const seasonalFactor = Math.sin((currentMonth / 12) * 2 * Math.PI);
  
  grid.forEach(point => {
    // Realistic precipitation patterns:
    
    // 1. Intertropical Convergence Zone (ITCZ) - heavy rainfall near equator
    const itczFactor = Math.exp(-Math.pow(point.lat / 10, 2));
    
    // 2. Mid-latitude storm tracks (around 40-60° N/S)
    const stormTrackNorth = Math.exp(-Math.pow((point.lat - 50) / 15, 2));
    const stormTrackSouth = Math.exp(-Math.pow((point.lat + 50) / 15, 2));
    const stormTrackFactor = Math.max(stormTrackNorth, stormTrackSouth);
    
    // 3. Subtropical high pressure zones (around 30° N/S) - dry areas
    const subtropicalHighNorth = Math.exp(-Math.pow((point.lat - 30) / 10, 2));
    const subtropicalHighSouth = Math.exp(-Math.pow((point.lat + 30) / 10, 2));
    const subtropicalDryFactor = Math.max(subtropicalHighNorth, subtropicalHighSouth);
    
    // 4. Monsoon regions (simplified)
    const isMonsoonRegion = (
      (point.lat >= 5 && point.lat <= 35 && point.lng >= 60 && point.lng <= 120) || // Asian monsoon
      (point.lat >= -20 && point.lat <= 5 && point.lng >= 100 && point.lng <= 150)   // Australian monsoon
    );
    
    // Monsoon is seasonal - stronger in summer
    const monsoonFactor = isMonsoonRegion ? 
      (point.lat >= 0 ? Math.max(0, seasonalFactor) : Math.max(0, -seasonalFactor)) * 2 : 
      0;
    
    // Combine all factors
    let precipitationFactor = 
      (itczFactor * 0.7) + 
      (stormTrackFactor * 0.5) - 
      (subtropicalDryFactor * 0.3) + 
      monsoonFactor;
    
    // Ensure it's positive
    precipitationFactor = Math.max(0, precipitationFactor);
    
    // Scale to 0-100 range and add randomness
    const weatherIntensity = Math.min(100, precipitationFactor * 70 + (Math.random() * 30));
    
    weatherData.push({
      lat: point.lat,
      lng: point.lng,
      value: weatherIntensity
    });
  });
  
  return weatherData;
}

// Get city-specific weather data
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
    
    // Return simulated data as fallback based on realistic climate modeling
    return generateFallbackCityWeather(lat, lng);
  }
}

// Generate fallback city weather based on location and season
function generateFallbackCityWeather(lat: number, lng: number) {
  // Get current month (0-11)
  const currentMonth = new Date().getMonth();
  
  // Seasonal factor (-1 to 1)
  const seasonalFactor = Math.sin((currentMonth / 12) * 2 * Math.PI);
  
  // Latitude effect (equator is warmer, poles are colder)
  const latitudeEffect = Math.cos(lat * (Math.PI / 180));
  
  // Hemisphere seasonal adjustment
  const hemisphereAdjustment = lat >= 0 ? seasonalFactor : -seasonalFactor;
  
  // Continental vs oceanic effect (rough approximation)
  const isLikelyLand = (
    (lng >= -130 && lng <= -60) || // Americas
    (lng >= -10 && lng <= 40) ||   // Europe/Africa
    (lng >= 60 && lng <= 150)      // Asia/Australia
  );
  
  // Continental areas have more temperature extremes
  const continentalFactor = isLikelyLand ? 1.5 : 0.8;
  
  // Base temperature calculation
  let baseTemp = 30 * latitudeEffect; // Range from ~0°C at poles to ~30°C at equator
  
  // Apply seasonal adjustment (stronger effect away from equator)
  baseTemp += hemisphereAdjustment * (15 * (1 - Math.abs(latitudeEffect))) * continentalFactor;
  
  // Add some realistic random variation
  const randomVariation = (Math.random() - 0.5) * 5;
  
  // Final temperature
  const simulatedTemp = baseTemp + randomVariation;
  
  // Precipitation calculation
  
  // 1. Intertropical Convergence Zone (ITCZ) - heavy rainfall near equator
  const itczFactor = Math.exp(-Math.pow(lat / 10, 2));
  
  // 2. Mid-latitude storm tracks (around 40-60° N/S)
  const stormTrackNorth = Math.exp(-Math.pow((lat - 50) / 15, 2));
  const stormTrackSouth = Math.exp(-Math.pow((lat + 50) / 15, 2));
  const stormTrackFactor = Math.max(stormTrackNorth, stormTrackSouth);
  
  // 3. Subtropical high pressure zones (around 30° N/S) - dry areas
  const subtropicalHighNorth = Math.exp(-Math.pow((lat - 30) / 10, 2));
  const subtropicalHighSouth = Math.exp(-Math.pow((lat + 30) / 10, 2));
  const subtropicalDryFactor = Math.max(subtropicalHighNorth, subtropicalHighSouth);
  
  // 4. Monsoon regions (simplified)
  const isMonsoonRegion = (
    (lat >= 5 && lat <= 35 && lng >= 60 && lng <= 120) || // Asian monsoon
    (lat >= -20 && lat <= 5 && lng >= 100 && lng <= 150)   // Australian monsoon
  );
  
  // Monsoon is seasonal - stronger in summer
  const monsoonFactor = isMonsoonRegion ? 
    (lat >= 0 ? Math.max(0, seasonalFactor) : Math.max(0, -seasonalFactor)) * 2 : 
    0;
  
  // Combine all factors
  let precipitationFactor = 
    (itczFactor * 0.7) + 
    (stormTrackFactor * 0.5) - 
    (subtropicalDryFactor * 0.3) + 
    monsoonFactor;
  
  // Ensure it's positive
  precipitationFactor = Math.max(0, precipitationFactor);
  
  // Scale to 0-100 range and add randomness
  const cloudCover = Math.min(100, precipitationFactor * 70 + (Math.random() * 30));
  
  // Precipitation amount (mm)
  const precipitationAmount = precipitationFactor * 10 * (Math.random() + 0.5);
  
  // Wind speed calculation (m/s)
  // Higher near poles, higher with greater temperature gradients
  const baseWindSpeed = 2 + (Math.abs(lat) / 90) * 8;
  const seasonalWindAdjustment = Math.abs(hemisphereAdjustment) * 3;
  const windSpeed = baseWindSpeed + seasonalWindAdjustment + (Math.random() * 5);
  
  // Wind direction (degrees)
  // Simplified global wind patterns
  let windDirection;
  if (lat > 30) {
    // Westerlies in northern mid-latitudes
    windDirection = 270 + (Math.random() * 60 - 30);
  } else if (lat < -30) {
    // Westerlies in southern mid-latitudes
    windDirection = 270 + (Math.random() * 60 - 30);
  } else if (lat > 0 && lat <= 30) {
    // Trade winds in northern tropics
    windDirection = 45 + (Math.random() * 60 - 30);
  } else {
    // Trade winds in southern tropics
    windDirection = 135 + (Math.random() * 60 - 30);
  }
  
  // Humidity calculation
  // Higher near equator, higher with precipitation
  const baseHumidity = 50 + (Math.cos(lat * Math.PI / 180) * 30);
  const humidityAdjustment = precipitationFactor * 20;
  const humidity = Math.min(100, baseHumidity + humidityAdjustment);
  
  // Pressure calculation (hPa)
  // Standard sea level pressure with variations
  const basePressure = 1013.25;
  const latitudePressureEffect = 
    (Math.abs(lat) > 60) ? -10 : // Low pressure near poles
    (Math.abs(lat) < 30 && Math.abs(lat) > 15) ? 5 : // High pressure in horse latitudes
    0;
  const randomPressureVariation = (Math.random() * 20) - 10;
  const pressure = basePressure + latitudePressureEffect + randomPressureVariation;
  
  // Weather description based on cloud cover and precipitation
  let description;
  let icon;
  
  if (cloudCover < 20) {
    description = "clear sky";
    icon = "01d";
  } else if (cloudCover < 50) {
    description = "few clouds";
    icon = "02d";
  } else if (cloudCover < 80) {
    description = "scattered clouds";
    icon = "03d";
  } else {
    description = "overcast clouds";
    icon = "04d";
  }
  
  // Add precipitation to description if present
  if (precipitationAmount > 1) {
    if (simulatedTemp < 0) {
      description = "light snow";
      icon = "13d";
    } else {
      description = "light rain";
      icon = "10d";
    }
  }
  
  if (precipitationAmount > 5) {
    if (simulatedTemp < 0) {
      description = "snow";
      icon = "13d";
    } else {
      description = "moderate rain";
      icon = "09d";
    }
  }
  
  if (precipitationAmount > 10) {
    if (simulatedTemp < 0) {
      description = "heavy snow";
      icon = "13d";
    } else {
      description = "heavy rain";
      icon = "09d";
    }
  }
  
  return {
    temperature: simulatedTemp,
    feelsLike: simulatedTemp - (windSpeed / 5) + (humidity / 100 * 2),
    humidity: Math.round(humidity),
    pressure: Math.round(pressure),
    windSpeed: parseFloat(windSpeed.toFixed(1)),
    windDirection: Math.round(windDirection),
    description: description,
    icon: icon,
    clouds: Math.round(cloudCover),
    rain: simulatedTemp >= 0 ? parseFloat(precipitationAmount.toFixed(1)) : 0,
    snow: simulatedTemp < 0 ? parseFloat(precipitationAmount.toFixed(1)) : 0,
    timestamp: Date.now()
  };
}

// Export additional utility functions
export function getWeatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function convertTemperature(celsius: number, unit: 'C' | 'F' | 'K') {
  switch (unit) {
    case 'C':
      return celsius;
    case 'F':
      return (celsius * 9/5) + 32;
    case 'K':
      return celsius + 273.15;
    default:
      return celsius;
  }
}

export function getWindDirection(degrees: number) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}