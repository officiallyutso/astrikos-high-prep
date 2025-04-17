import axios from 'axios';

// Cache mechanism to avoid excessive API calls
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// World Population API (free tier)
const POPULATION_API_URL = 'https://restcountries.com/v3.1/all';

// Traffic data is harder to get for free, so we'll use a formula based on population density
// and economic indicators to simulate traffic index
const calculateTrafficIndex = (population: number, area: number, gdp: number) => {
  const density = population / (area || 1);
  // Traffic index formula: higher density and GDP correlate with higher traffic
  return Math.min(100, Math.max(10, Math.round((density * 0.01 + gdp * 0.0000001) * 50)));
};

// Growth rate is also simulated based on economic and demographic factors
const calculateGrowthRate = (gdp: number, population: number) => {
  // Countries with medium GDP tend to grow faster
  const gdpFactor = gdp > 50000 ? 0.5 : gdp > 10000 ? 1.5 : 1.0;
  // Very large populations tend to grow slower
  const popFactor = population > 100000000 ? 0.7 : 1.2;
  
  // Base growth rate between -0.5 and 3.0
  const baseGrowth = (Math.random() * 3.5) - 0.5;
  
  return parseFloat((baseGrowth * gdpFactor * popFactor).toFixed(1));
};

// CityData interface
export interface CityData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  populationRaw: number;
  population: string;
  density: number;
  growth: number;
  gdp: number;
  traffic: number;
  capital: boolean;
}

// Get world cities with accurate data
export const getWorldCities = async (): Promise<CityData[]> => {
  try {
    // Try to fetch from a reliable API first
    const response = await axios.get('https://restcountries.com/v3.1/all');
    
    if (response.data && Array.isArray(response.data)) {
      // Process the countries data to extract capitals and major cities
      const cities: CityData[] = [];
      let idCounter = 1;
      
      // Add capital cities first
      response.data.forEach((country: any) => {
        if (country.capital && country.capital.length > 0 && country.capitalInfo && country.capitalInfo.latlng) {
          const capital = country.capital[0];
          const [lat, lng] = country.capitalInfo.latlng;
          
          // Get population (use country population as estimate if city population not available)
          const population = country.population || 1000000;
          
          // Calculate realistic values for other metrics
          const density = Math.floor(population / (50 + Math.random() * 100));
          const growth = (Math.random() * 3) + 0.5; // 0.5% to 3.5% growth
          const gdp = Math.floor((country.population / 100000) * (5000 + Math.random() * 45000));
          const traffic = Math.floor(30 + (population / 1000000) * 20 + Math.random() * 30);
          
          cities.push({
            id: `city-${idCounter++}`,
            name: capital,
            country: country.name.common,
            lat,
            lng,
            populationRaw: population,
            population: population.toLocaleString(),
            density,
            growth,
            gdp,
            traffic,
            capital: true
          });
        }
      });
      
      // Add major non-capital cities with accurate coordinates
      const majorCities = [
        { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060, population: 8804190, capital: false },
        { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437, population: 3898747, capital: false },
        { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298, population: 2746388, capital: false },
        { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, population: 26317104, capital: false },
        { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, population: 20411274, capital: false },
        { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, population: 12325232, capital: false },
        { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, population: 5367206, capital: false },
        { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, population: 15462452, capital: false },
        { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, population: 14862111, capital: false },
        { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, population: 6747815, capital: false },
        { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, population: 2930000, capital: false },
        { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, population: 16093786, capital: false },
        { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, population: 2691742, capital: false },
        { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, population: 14850066, capital: false },
        { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, population: 8906039, capital: false },
        { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, population: 1620343, capital: false },
        { name: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900, population: 1352000, capital: false },
        { name: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, population: 753056, capital: false },
        { name: "Manchester", country: "United Kingdom", lat: 53.4808, lng: -2.2426, population: 547627, capital: false },
        { name: "Marseille", country: "France", lat: 43.2965, lng: 5.3698, population: 861635, capital: false },
        { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, populationRaw: 12442373, capital: false },
  { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, populationRaw: 11007835, capital: true },
  { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, populationRaw: 8443675, capital: true },
  { name: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867, populationRaw: 6809970, capital: true },
  { name: "Ahmedabad", country: "India", lat: 23.0225, lng: 72.5714, populationRaw: 5570585, capital: false },
  { name: "Chennai", country: "India", lat: 13.0827, lng: 80.2707, populationRaw: 7090000, capital: true },
  { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, populationRaw: 4486679, capital: false },
  { name: "Surat", country: "India", lat: 21.1702, lng: 72.8311, populationRaw: 4467797, capital: false },
  { name: "Pune", country: "India", lat: 18.5204, lng: 73.8567, populationRaw: 3124458, capital: false },
  { name: "Jaipur", country: "India", lat: 26.9124, lng: 75.7873, populationRaw: 3046163, capital: true },
  { name: "Lucknow", country: "India", lat: 26.8467, lng: 80.9462, populationRaw: 2815601, capital: true },
  { name: "Kanpur", country: "India", lat: 26.4499, lng: 80.3319, populationRaw: 2767031, capital: false },
  { name: "Nagpur", country: "India", lat: 21.1458, lng: 79.0882, populationRaw: 2405665, capital: false },
  { name: "Indore", country: "India", lat: 22.7196, lng: 75.8577, populationRaw: 1964086, capital: false },
  { name: "Thane", country: "India", lat: 19.2183, lng: 72.9781, populationRaw: 1818872, capital: false },
  { name: "Bhopal", country: "India", lat: 23.2599, lng: 77.4126, populationRaw: 1798218, capital: true },
  { name: "Visakhapatnam", country: "India", lat: 17.6868, lng: 83.2185, populationRaw: 1730320, capital: false },
  { name: "Pimpri-Chinchwad", country: "India", lat: 18.6298, lng: 73.7997, populationRaw: 1727692, capital: false },
  { name: "Patna", country: "India", lat: 25.5941, lng: 85.1376, populationRaw: 1684222, capital: true },
  { name: "Vadodara", country: "India", lat: 22.3072, lng: 73.1812, populationRaw: 1670806, capital: false },
  { name: "Ghaziabad", country: "India", lat: 28.6692, lng: 77.4538, populationRaw: 1648643, capital: false },
  { name: "Ludhiana", country: "India", lat: 30.9000, lng: 75.8573, populationRaw: 1618879, capital: false },
  { name: "Agra", country: "India", lat: 27.1767, lng: 78.0081, populationRaw: 1585705, capital: false },
  { name: "Nashik", country: "India", lat: 19.9975, lng: 73.7898, populationRaw: 1486053, capital: false },
  { name: "Faridabad", country: "India", lat: 28.4089, lng: 77.3178, populationRaw: 1394000, capital: false },
  { name: "Meerut", country: "India", lat: 28.9845, lng: 77.7064, populationRaw: 1305429, capital: false },
  { name: "Rajkot", country: "India", lat: 22.3039, lng: 70.8022, populationRaw: 1286678, capital: false },
  { name: "Kalyan-Dombivli", country: "India", lat: 19.2403, lng: 73.1305, populationRaw: 1247323, capital: false },
  { name: "Vasai-Virar", country: "India", lat: 19.3919, lng: 72.8397, populationRaw: 1222390, capital: false },
  { name: "Varanasi", country: "India", lat: 25.3176, lng: 82.9739, populationRaw: 1198491, capital: false },
  { name: "Srinagar", country: "India", lat: 34.0837, lng: 74.7973, populationRaw: 1180570, capital: true },
  { name: "Aurangabad", country: "India", lat: 19.8762, lng: 75.3433, populationRaw: 1175116, capital: false },
  { name: "Dhanbad", country: "India", lat: 23.7957, lng: 86.4304, populationRaw: 1162472, capital: false },
  { name: "Amritsar", country: "India", lat: 31.6340, lng: 74.8723, populationRaw: 1132383, capital: false },
  { name: "Navi Mumbai", country: "India", lat: 19.0330, lng: 73.0297, populationRaw: 1125237, capital: false },
  { name: "Allahabad", country: "India", lat: 25.4358, lng: 81.8463, populationRaw: 1112543, capital: false },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, populationRaw: 37339804, capital: true },
    { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, populationRaw: 31181376, capital: true },
    { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, populationRaw: 27058479, capital: false },
    { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, populationRaw: 22043028, capital: false },
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, populationRaw: 21782378, capital: true },
    { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, populationRaw: 20900604, capital: true },
    { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, populationRaw: 20411274, capital: false },
    { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, populationRaw: 20384000, capital: true },
    { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, populationRaw: 20283552, capital: true },
    { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, populationRaw: 19165340, capital: false },
    { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060, populationRaw: 18804000, capital: false },
    { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, populationRaw: 16093786, capital: false },
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, populationRaw: 15057273, capital: true },
    { name: "Chongqing", country: "China", lat: 29.4316, lng: 106.9123, populationRaw: 15354067, capital: false },
    { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, populationRaw: 15462452, capital: false },
    { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, populationRaw: 14850066, capital: false },
    { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, populationRaw: 13923452, capital: true },
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, populationRaw: 14862111, capital: false },
    { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, populationRaw: 13458075, capital: false },
    { name: "Tianjin", country: "China", lat: 39.3434, lng: 117.3616, populationRaw: 13396402, capital: false },
    { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, populationRaw: 9541000, capital: true },
    { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, populationRaw: 11142303, capital: true },
    { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, populationRaw: 3664088, capital: true },
    { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, populationRaw: 6669513, capital: true },
    { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, populationRaw: 4342212, capital: true },
    { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, populationRaw: 12640818, capital: true },
    { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, populationRaw: 5367206, capital: false },
    { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, populationRaw: 6254571, capital: false },
    { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437, populationRaw: 13214799, capital: false },
    { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298, populationRaw: 9618502, capital: false },
    { name: "Washington DC", country: "United States", lat: 38.9072, lng: -77.0369, populationRaw: 6385162, capital: true },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, populationRaw: 5850342, capital: true },
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, populationRaw: 10539415, capital: true },
    { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, populationRaw: 9975709, capital: true },
    { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, populationRaw: 10562088, capital: true },
    
 
      ];
      
      majorCities.forEach(city => {
        // Calculate realistic values for other metrics
        // Use populationRaw if available, otherwise use population
        const populationValue = city.populationRaw || city.population || 0;
        
        const density = Math.floor(Math.min(30000, Math.max(1000, populationValue / (10 + Math.random() * 30))));
        const growth = (Math.random() * 3) - 0.5; // -0.5% to 2.5% growth
        const gdpPerCapita = Math.floor(5000 + Math.random() * 55000);
        const gdp = gdpPerCapita;
        const traffic = Math.floor(20 + (Math.min(1, populationValue / 20000000) * 60) + (Math.random() * 20));

        cities.push({
          id: `city-${idCounter++}`,
          name: city.name,
          country: city.country,
          lat: city.lat,
          lng: city.lng,
          populationRaw: populationValue,
          population: populationValue.toLocaleString(),
          density,
          growth,
          gdp,
          traffic,
          capital: city.capital
        });
      });
      
      return cities;
    }
    
    // Fallback to local data if API fails
    return getLocalCitiesData();
  } catch (error) {
    console.error('Error fetching cities from API:', error);
    // Fallback to local data
    return getLocalCitiesData();
  }
};

// Local fallback data with accurate coordinates and population
const getLocalCitiesData = (): CityData[] => {
  const cities = [
    { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, populationRaw: 37339804, capital: true },
    { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, populationRaw: 31181376, capital: true },
    { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, populationRaw: 27058479, capital: false },
    { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, populationRaw: 22043028, capital: false },
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, populationRaw: 21782378, capital: true },
    { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, populationRaw: 20900604, capital: true },
    { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, populationRaw: 20411274, capital: false },
    { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, populationRaw: 20384000, capital: true },
    { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, populationRaw: 20283552, capital: true },
    { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, populationRaw: 19165340, capital: false },
    { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060, populationRaw: 18804000, capital: false },
    { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, populationRaw: 16093786, capital: false },
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, populationRaw: 15057273, capital: true },
    { name: "Chongqing", country: "China", lat: 29.4316, lng: 106.9123, populationRaw: 15354067, capital: false },
    { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, populationRaw: 15462452, capital: false },
    { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, populationRaw: 14850066, capital: false },
    { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, populationRaw: 13923452, capital: true },
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, populationRaw: 14862111, capital: false },
    { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, populationRaw: 13458075, capital: false },
    { name: "Tianjin", country: "China", lat: 39.3434, lng: 117.3616, populationRaw: 13396402, capital: false },
    { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, populationRaw: 9541000, capital: true },
    { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, populationRaw: 11142303, capital: true },
    { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, populationRaw: 3664088, capital: true },
    { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, populationRaw: 6669513, capital: true },
    { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, populationRaw: 4342212, capital: true },
    { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, populationRaw: 12640818, capital: true },
    { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, populationRaw: 5367206, capital: false },
    { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, populationRaw: 6254571, capital: false },
    { name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437, populationRaw: 13214799, capital: false },
    { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298, populationRaw: 9618502, capital: false },
    { name: "Washington DC", country: "United States", lat: 38.9072, lng: -77.0369, populationRaw: 6385162, capital: true },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, populationRaw: 5850342, capital: true },
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, populationRaw: 10539415, capital: true },
    { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, populationRaw: 9975709, capital: true },
    { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, populationRaw: 10562088, capital: true },
    { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, populationRaw: 12442373, capital: false },
    { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, populationRaw: 11007835, capital: true },
    { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, populationRaw: 8443675, capital: true },
    { name: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867, populationRaw: 6809970, capital: true },
    { name: "Ahmedabad", country: "India", lat: 23.0225, lng: 72.5714, populationRaw: 5570585, capital: false },
    { name: "Chennai", country: "India", lat: 13.0827, lng: 80.2707, populationRaw: 7090000, capital: true },
    { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, populationRaw: 4486679, capital: false },
    { name: "Surat", country: "India", lat: 21.1702, lng: 72.8311, populationRaw: 4467797, capital: false },
    { name: "Pune", country: "India", lat: 18.5204, lng: 73.8567, populationRaw: 3124458, capital: false },
    { name: "Jaipur", country: "India", lat: 26.9124, lng: 75.7873, populationRaw: 3046163, capital: true },
    { name: "Lucknow", country: "India", lat: 26.8467, lng: 80.9462, populationRaw: 2815601, capital: true },
    { name: "Kanpur", country: "India", lat: 26.4499, lng: 80.3319, populationRaw: 2767031, capital: false },
    { name: "Nagpur", country: "India", lat: 21.1458, lng: 79.0882, populationRaw: 2405665, capital: false },
    { name: "Indore", country: "India", lat: 22.7196, lng: 75.8577, populationRaw: 1964086, capital: false },
    { name: "Thane", country: "India", lat: 19.2183, lng: 72.9781, populationRaw: 1818872, capital: false },
    { name: "Bhopal", country: "India", lat: 23.2599, lng: 77.4126, populationRaw: 1798218, capital: true },
    { name: "Visakhapatnam", country: "India", lat: 17.6868, lng: 83.2185, populationRaw: 1730320, capital: false },
    { name: "Pimpri-Chinchwad", country: "India", lat: 18.6298, lng: 73.7997, populationRaw: 1727692, capital: false },
    { name: "Patna", country: "India", lat: 25.5941, lng: 85.1376, populationRaw: 1684222, capital: true },
    { name: "Vadodara", country: "India", lat: 22.3072, lng: 73.1812, populationRaw: 1670806, capital: false },
    { name: "Ghaziabad", country: "India", lat: 28.6692, lng: 77.4538, populationRaw: 1648643, capital: false },
    { name: "Ludhiana", country: "India", lat: 30.9000, lng: 75.8573, populationRaw: 1618879, capital: false },
    { name: "Agra", country: "India", lat: 27.1767, lng: 78.0081, populationRaw: 1585705, capital: false },
    { name: "Nashik", country: "India", lat: 19.9975, lng: 73.7898, populationRaw: 1486053, capital: false },
    { name: "Faridabad", country: "India", lat: 28.4089, lng: 77.3178, populationRaw: 1394000, capital: false },
    { name: "Meerut", country: "India", lat: 28.9845, lng: 77.7064, populationRaw: 1305429, capital: false },
    { name: "Rajkot", country: "India", lat: 22.3039, lng: 70.8022, populationRaw: 1286678, capital: false },
    { name: "Kalyan-Dombivli", country: "India", lat: 19.2403, lng: 73.1305, populationRaw: 1247323, capital: false },
    { name: "Vasai-Virar", country: "India", lat: 19.3919, lng: 72.8397, populationRaw: 1222390, capital: false },
    { name: "Varanasi", country: "India", lat: 25.3176, lng: 82.9739, populationRaw: 1198491, capital: false },
    { name: "Srinagar", country: "India", lat: 34.0837, lng: 74.7973, populationRaw: 1180570, capital: true },
    { name: "Aurangabad", country: "India", lat: 19.8762, lng: 75.3433, populationRaw: 1175116, capital: false },
    { name: "Dhanbad", country: "India", lat: 23.7957, lng: 86.4304, populationRaw: 1162472, capital: false },
    { name: "Amritsar", country: "India", lat: 31.6340, lng: 74.8723, populationRaw: 1132383, capital: false },
    { name: "Navi Mumbai", country: "India", lat: 19.0330, lng: 73.0297, populationRaw: 1125237, capital: false },
    { name: "Allahabad", country: "India", lat: 25.4358, lng: 81.8463, populationRaw: 1112543, capital: false },
  
  
  ];
  
  // Add derived data
  return cities.map((city, index) => {
    // Generate realistic values for missing fields
    const density = Math.floor(city.populationRaw / (50 + Math.random() * 100));
    const growth = (Math.random() * 3) + 0.5; // 0.5% to 3.5% growth
    const gdp = Math.floor((city.populationRaw / 100000) * (5000 + Math.random() * 45000));
    const traffic = Math.floor(30 + (city.populationRaw / 1000000) * 20 + Math.random() * 30);
    
    return {
      id: `city-${index}`,
      ...city,
      population: city.populationRaw.toLocaleString(),
      density,
      growth,
      gdp,
      traffic
    };
  });
};

// Get detailed data for a specific city
export async function getCityDetails(cityId: string): Promise<CityData | null> {
  try {
    const cities = await getWorldCities();
    return cities.find(city => city.id === cityId) || null;
  } catch (error) {
    console.error('Error fetching city details:', error);
    return null;
  }
}