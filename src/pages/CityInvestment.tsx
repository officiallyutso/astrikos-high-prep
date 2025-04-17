import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getWorldCities, CityData } from '../services/dataService';
import { getWeatherData, getTemperatureData } from '../services/weatherService';
import '../styles/cityInvestment.css';

// Investment score types
type InvestmentScore = {
  overall: number;
  realEstate: number;
  infrastructure: number;
  development: number;
  profitProbability: number;
};

const CityInvestment: React.FC = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showSearch, setShowSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [investmentScores, setInvestmentScores] = useState<InvestmentScore | null>(null);
  const [cityData, setCityData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load cities data
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const citiesData = await getWorldCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCities();
    
    // Check if city ID is in URL params
    const params = new URLSearchParams(location.search);
    const cityId = params.get('city');
    if (cityId) {
      loadCityById(cityId);
    }
  }, [location.search]);

  // Load city by ID
  const loadCityById = async (cityId: string) => {
    setLoading(true);
    try {
      const citiesData = await getWorldCities();
      const city = citiesData.find(c => c.id === cityId);
      if (city) {
        setSelectedCity(city);
        setShowSearch(false);
        analyzeCity(city);
      }
    } catch (error) {
      console.error('Error loading city by ID:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm.length > 1) { // Reduced from 3 to 1 character to start searching earlier
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 15)); // Increased from 10 to 15 results
    } else {
      setFilteredCities([]);
    }
  }, [searchTerm, cities]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle city selection from search
  const handleCitySelect = (city: CityData) => {
    setSelectedCity(city);
    setSearchTerm('');
    setFilteredCities([]);
    setShowSearch(false);
    analyzeCity(city);
  };

  // Analyze city for investment potential
  const analyzeCity = async (city: CityData) => {
    setAnalysisLoading(true);
    setCityData(null);
    setInvestmentScores(null);
    
    try {
      // Fetch additional data
      const temperatureData = await getTemperatureData();
      const weatherData = await getWeatherData();
      
      // Find city-specific data
      const cityTemp = temperatureData.find((item: any) => 
        item.lat.toFixed(1) === city.lat.toFixed(1) && 
        item.lng.toFixed(1) === city.lng.toFixed(1)
      ) || { value: 25 }; // Default value if not found
      
      const cityWeather = weatherData.find((item: any) => 
        item.lat.toFixed(1) === city.lat.toFixed(1) && 
        item.lng.toFixed(1) === city.lng.toFixed(1)
      ) || { value: 50 }; // Default value if not found
      
      // Generate real estate data (simulated)
      const realEstatePrice = Math.round(500 + (city.gdp * 0.1) * (city.density / 5000)); // Price per sq meter in USD
      const realEstateGrowth = (city.growth * 1.2) + (Math.random() * 2 - 1); // Annual growth rate -1% to +4%
      
      // Compile city data
      const compiledData = {
        population: city.populationRaw,
        density: city.density,
        growth: city.growth,
        gdp: city.gdp,
        traffic: city.traffic,
        temperature: cityTemp.value,
        weather: cityWeather.value,
        realEstatePrice,
        realEstateGrowth
      };
      
      setCityData(compiledData);
      
      // Calculate investment scores
      const scores = calculateInvestmentScores(compiledData, city);
      setInvestmentScores(scores);
    } catch (error) {
      console.error('Error analyzing city:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Calculate investment scores based on city data
  const calculateInvestmentScores = (data: any, city: CityData): InvestmentScore => {
    // Infrastructure score (based on traffic, GDP, and population density)
    const trafficScore = Math.max(0, 100 - data.traffic) / 100; // Lower traffic is better
    const gdpScore = Math.min(data.gdp / 60000, 1); // Higher GDP per capita is better (max 60k)
    const densityScore = Math.min(data.density / 20000, 1); // Higher density can indicate better infrastructure
    const infrastructureScore = (trafficScore * 0.4 + gdpScore * 0.4 + densityScore * 0.2) * 100;
    
    // Real estate score (based on growth, GDP, and real estate price growth)
    const growthScore = Math.max(0, Math.min(data.growth / 5, 1)); // Population growth
    const realEstateGrowthScore = Math.max(0, Math.min(data.realEstateGrowth / 10, 1));
    const realEstateScore = (growthScore * 0.3 + gdpScore * 0.3 + realEstateGrowthScore * 0.4) * 100;
    
    // Development score (based on GDP, growth, and capital status)
    const capitalBonus = city.capital ? 0.2 : 0;
    const developmentScore = (gdpScore * 0.4 + growthScore * 0.4 + capitalBonus) * 100;
    
    // Profit probability (based on all factors)
    const profitScore = (realEstateScore * 0.4 + infrastructureScore * 0.3 + developmentScore * 0.3);
    
    // Overall score
    const overallScore = (realEstateScore * 0.35 + infrastructureScore * 0.35 + developmentScore * 0.3);
    
    return {
      overall: Math.round(overallScore),
      realEstate: Math.round(realEstateScore),
      infrastructure: Math.round(infrastructureScore),
      development: Math.round(developmentScore),
      profitProbability: Math.round(profitScore)
    };
  };

  // Format population with commas
  const formatPopulation = (pop: number) => {
    return pop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get investment recommendation
  const getInvestmentRecommendation = () => {
    if (!investmentScores) return '';
    
    if (investmentScores.overall >= 80) {
      return 'Excellent investment opportunity with high potential returns.';
    } else if (investmentScores.overall >= 65) {
      return 'Good investment opportunity with moderate to high potential returns.';
    } else if (investmentScores.overall >= 50) {
      return 'Moderate investment opportunity with balanced risk and returns.';
    } else if (investmentScores.overall >= 35) {
      return 'Risky investment with potential for limited returns.';
    } else {
      return 'Not recommended for investment at this time.';
    }
  };

  // Get score color class
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-moderate';
    if (score >= 35) return 'score-fair';
    return 'score-poor';
  };

  return (
    <div className="city-investment-page">
      <div className="investment-header">
        <button className="back-button" onClick={() => navigate('/visualization')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Visualization
        </button>
        <h1 className="investment-title">City Investment Analysis</h1>
        <p className="investment-subtitle">Analyze cities for investment potential in real estate, infrastructure, and development</p>
      </div>
      
      <div className="investment-content">
        <div className="search-section">
          {showSearch || !selectedCity ? (
            <div className="city-search-container">
              <h2>Search for a City</h2>
              <p>Enter a city name to analyze its investment potential</p>

                            <div className="search-box">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                              </svg>
                              <input 
                                type="text" 
                                placeholder="Search for a city..." 
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                              />
                              {searchTerm && (
                                <button 
                                  className="clear-search"
                                  onClick={() => {
                                    setSearchTerm('');
                                    setFilteredCities([]);
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            
                            {loading && (
                              <div className="search-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading cities...</p>
                              </div>
                            )}
                            
                            <div className="search-results-container">
                              {filteredCities.length > 0 && (
                                <div className="search-results">
                                  {filteredCities.map(city => (
                                    <div 
                                      key={city.id} 
                                      className="search-result-item"
                                      onClick={() => handleCitySelect(city)}
                                    >
                                      <div className="result-name">{city.name}</div>
                                      <div className="result-country">{city.country}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
            </div>
          ) : null}
          
          {selectedCity && !showSearch && (
            <div className="city-analysis">
              <div className="city-header">
                <div className="city-info">
                  <h2>{selectedCity.name}</h2>
                  <p>{selectedCity.country} {selectedCity.capital ? '• Capital City' : ''}</p>
                </div>
                <button 
                  className="change-city-btn"
                  onClick={() => setShowSearch(true)}
                >
                  Change City
                </button>
              </div>
              
              {analysisLoading ? (
                <div className="analysis-loading">
                  <div className="loading-spinner"></div>
                  <p>Analyzing investment potential...</p>
                </div>
              ) : cityData && investmentScores ? (
                <div className="analysis-results">
                  <div className="investment-summary">
                    <div className="overall-score">
                      <div className={`score-circle ${getScoreColorClass(investmentScores.overall)}`}>
                        <span className="score-value">{investmentScores.overall}</span>
                      </div>
                      <div className="score-label">Overall Score</div>
                    </div>
                    <div className="investment-recommendation">
                      <h3>Investment Recommendation</h3>
                      <p>{getInvestmentRecommendation()}</p>
                    </div>
                  </div>
                  
                  <div className="score-categories">
                    <div className="score-category">
                      <div className="category-header">
                        <h3>Real Estate</h3>
                        <div className={`category-score ${getScoreColorClass(investmentScores.realEstate)}`}>
                          {investmentScores.realEstate}
                        </div>
                      </div>
                      <p>
                        {investmentScores.realEstate >= 70 ? 
                          'Excellent potential for real estate investment with strong growth prospects.' :
                          investmentScores.realEstate >= 50 ?
                          'Good potential for real estate investment with moderate growth prospects.' :
                          'Limited potential for real estate investment at this time.'}
                      </p>
                      <div className="category-stats">
                        <div className="stat-item">
                          <span className="stat-label">Price per m²:</span>
                          <span className="stat-value">${cityData.realEstatePrice.toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Annual Growth:</span>
                          <span className="stat-value">{cityData.realEstateGrowth.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="score-category">
                      <div className="category-header">
                        <h3>Infrastructure</h3>
                        <div className={`category-score ${getScoreColorClass(investmentScores.infrastructure)}`}>
                          {investmentScores.infrastructure}
                        </div>
                      </div>
                      <p>
                        {investmentScores.infrastructure >= 70 ? 
                          'Well-developed infrastructure with excellent urban planning and transportation systems.' :
                          investmentScores.infrastructure >= 50 ?
                          'Good infrastructure with room for improvement in some areas.' :
                          'Infrastructure needs significant development and investment.'}
                      </p>
                      <div className="category-stats">
                        <div className="stat-item">
                          <span className="stat-label">Traffic Index:</span>
                          <span className="stat-value">{cityData.traffic}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Population Density:</span>
                          <span className="stat-value">{cityData.density.toFixed(1)} per km²</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="score-category">
                      <div className="category-header">
                        <h3>Development Potential</h3>
                        <div className={`category-score ${getScoreColorClass(investmentScores.development)}`}>
                          {investmentScores.development}
                        </div>
                      </div>
                      <p>
                        {investmentScores.development >= 70 ? 
                          'High development potential with strong economic indicators and growth trends.' :
                          investmentScores.development >= 50 ?
                          'Moderate development potential with stable economic indicators.' :
                          'Limited development potential with challenging economic conditions.'}
                      </p>
                      <div className="category-stats">
                        <div className="stat-item">
                          <span className="stat-label">GDP per Capita:</span>
                          <span className="stat-value">${cityData.gdp.toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Population Growth:</span>
                          <span className="stat-value">{cityData.growth.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="score-category">
                      <div className="category-header">
                        <h3>Profit Probability</h3>
                        <div className={`category-score ${getScoreColorClass(investmentScores.profitProbability)}`}>
                          {investmentScores.profitProbability}
                        </div>
                      </div>
                      <p>
                        {investmentScores.profitProbability >= 70 ? 
                          'High probability of profitable returns on investment in the short to medium term.' :
                          investmentScores.profitProbability >= 50 ?
                          'Moderate probability of profitable returns with careful investment strategy.' :
                          'Lower probability of profitable returns, higher risk investment.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="city-data-details">
                    <h3>City Data Details</h3>
                    <div className="data-grid">
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                            <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">Population</div>
                          <div className="data-value">{formatPopulation(cityData.population)}</div>
                        </div>
                      </div>
                      
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm.5 2h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">Traffic Index</div>
                          <div className="data-value">{cityData.traffic} / 100</div>
                        </div>
                      </div>
                      
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                            <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5v7.55a3.5 3.5 0 1 0 5 0V2.5A2.5 2.5 0 0 0 8 0zM6.5 2.5a1.5 1.5 0 1 1 3 0v7.987l.167.15a2.5 2.5 0 1 1-3.333 0l.166-.15V2.5z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">Temperature</div>
                          <div className="data-value">{cityData.temperature.toFixed(1)}°C</div>
                        </div>
                      </div>
                      
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 0 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 1 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm.247-6.998a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">Weather Index</div>
                          <div className="data-value">{cityData.weather} / 100</div>
                        </div>
                      </div>
                      
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">GDP per Capita</div>
                          <div className="data-value">${cityData.gdp.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="data-item">
                        <div className="data-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4 9h1v-1H4v1zm6-1v1h1v-1h-1zm-2 1h1v-1H8v1zM8 7h1V6H8v1zm-2 0h1V6H6v1zm8-2h-1v1h1V5zm-2 0h-1v1h1V5zM8 5H7v1h1V5zm-2 0H5v1h1V5zm0-2H5v1h1V3zm2 0H7v1h1V3zm2 0h-1v1h1V3zm2 0h-1v1h1V3z"/>
                          </svg>
                        </div>
                        <div className="data-content">
                          <div className="data-label">Real Estate Price</div>
                          <div className="data-value">${cityData.realEstatePrice.toLocaleString()} per m²</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Infrastructure Analysis section */}
                  <div className="use-cases">
                    <h3>Infrastructure Analysis</h3>
                    <div className="use-case-grid">
                      <div className="use-case-item">
                        <h4>Urban Density Challenges</h4>
                        <div className="stat-container">
                          <div className="stat-item">
                            <span className="stat-label">Population Density:</span>
                            <span className="stat-value">{cityData.density.toFixed(1)} per km²</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Capacity Strain:</span>
                            <span className="stat-value">
                              {cityData.density > 10000 ? 'High' : cityData.density > 5000 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                        <p>
                          {cityData.density > 10000 ? 
                            'Extremely high density requires vertical infrastructure solutions and advanced capacity planning.' :
                            cityData.density > 5000 ?
                            'High density areas need careful infrastructure capacity management and redundancy planning.' :
                            'Moderate to low density allows for more conventional infrastructure approaches.'}
                        </p>
                      </div>
                      
                      <div className="use-case-item">
                        <h4>Climate Considerations</h4>
                        <div className="stat-container">
                          <div className="stat-item">
                            <span className="stat-label">Temperature:</span>
                            <span className="stat-value">{cityData.temperature.toFixed(1)}°C</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Weather Intensity:</span>
                            <span className="stat-value">{cityData.weather} / 100</span>
                          </div>
                        </div>
                        <p>
                          {cityData.weather > 70 ? 
                            'Extreme weather patterns require robust infrastructure with significant redundancy and resilience measures.' :
                            cityData.weather > 40 ?
                            'Moderate weather conditions require standard weather mitigation in infrastructure design.' :
                            'Mild weather conditions allow for more cost-effective infrastructure solutions.'}
                        </p>
                      </div>
                      
                      <div className="use-case-item">
                        <h4>Traffic Flow Analysis</h4>
                        <div className="stat-container">
                          <div className="stat-item">
                            <span className="stat-label">Congestion Level:</span>
                            <span className="stat-value">{cityData.traffic} / 100</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Intervention Need:</span>
                            <span className="stat-value">
                              {cityData.traffic > 70 ? 'Critical' : cityData.traffic > 50 ? 'Moderate' : 'Low'}
                            </span>
                          </div>
                        </div>
                        <p>
                          {cityData.traffic > 70 ? 
                            'Critical congestion requires major infrastructure overhaul with smart traffic systems and capacity expansion.' :
                            cityData.traffic > 50 ?
                            'Moderate congestion can be addressed with targeted improvements and traffic management systems.' :
                            'Low congestion allows for preventative planning and future-proofing of transportation networks.'}
                        </p>
                      </div>
                      
                      <div className="use-case-item">
                        <h4>Resource Allocation Efficiency</h4>
                        <div className="stat-container">
                          <div className="stat-item">
                            <span className="stat-label">GDP per Capita:</span>
                            <span className="stat-value">${cityData.gdp.toLocaleString()}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Growth Rate:</span>
                            <span className="stat-value">{cityData.growth.toFixed(1)}%</span>
                          </div>
                        </div>
                        <p>
                          {cityData.gdp > 40000 && cityData.growth > 1.5 ? 
                            'High GDP and growth rate suggest strong potential for public-private partnerships and innovative financing models.' :
                            cityData.gdp > 20000 || cityData.growth > 1.0 ?
                            'Moderate economic indicators suggest balanced approach to infrastructure financing with selective private investment.' :
                            'Lower economic indicators may require phased implementation and prioritization of critical infrastructure.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityInvestment;