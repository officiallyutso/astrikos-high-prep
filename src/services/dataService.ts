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

export interface CityData {
  id: string;
  name: string;
  country: string;
  population: number; // in millions
  populationRaw: number; // actual number
  growth: number; // annual growth rate in percentage
  traffic: number; // traffic index (0-100)
  lat: number;
  lng: number;
  area: number; // in sq km
  gdp: number; // GDP per capita
  density: number; // people per sq km
  capital: boolean;
  region: string;
  subregion?: string;
  languages?: string[];
  currencies?: string[];
  flag?: string;
}

export async function getWorldCities(): Promise<CityData[]> {
  // Check cache first
  if (cache['worldCities'] && 
      Date.now() - cache['worldCities'].timestamp < CACHE_DURATION) {
    return cache['worldCities'].data;
  }
  
  try {
    const response = await axios.get(POPULATION_API_URL);
    
    // Process the data to get major cities (using capitals as proxy)
    const cities = response.data
      .filter((country: any) => 
        country.capital && 
        country.capital.length > 0 && 
        country.latlng && 
        country.population > 1000000
      )
      .map((country: any) => {
        const population = country.population / 1000000; // Convert to millions
        const area = country.area || 1;
        const gdp = country.gdp?.per_capita || 
                   (country.region === 'Europe' ? 30000 : 
                    country.region === 'Americas' ? 20000 : 
                    country.region === 'Asia' ? 15000 : 
                    country.region === 'Oceania' ? 25000 : 5000);
        
        const languages = country.languages ? 
          Object.values(country.languages).map((lang: any) => lang) : [];
        
        const currencies = country.currencies ? 
          Object.values(country.currencies).map((curr: any) => curr.name) : [];
        
        return {
          id: country.cca3,
          name: country.capital[0],
          country: country.name.common,
          population: parseFloat(population.toFixed(1)),
          populationRaw: country.population,
          growth: calculateGrowthRate(gdp, country.population),
          traffic: calculateTrafficIndex(country.population, area, gdp),
          lat: country.capitalInfo?.latlng?.[0] || country.latlng[0],
          lng: country.capitalInfo?.latlng?.[1] || country.latlng[1],
          area: area,
          gdp: gdp,
          density: Math.round(country.population / area),
          capital: true,
          region: country.region,
          subregion: country.subregion,
          languages: languages,
          currencies: currencies,
          flag: country.flags?.svg || country.flags?.png
        };
      })
      .sort((a: CityData, b: CityData) => b.population - a.population)
      .slice(0, 50); // Get top 50 cities by population
    
    // Save to cache
    cache['worldCities'] = {
      data: cities,
      timestamp: Date.now()
    };
    
    return cities;
  } catch (error) {
    console.error('Error fetching world cities:', error);
    // Return empty array or fallback data
    return [];
  }
}

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