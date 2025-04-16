import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { CityData, getWorldCities } from '../services/dataService';
import { Bar, Line } from 'react-chartjs-2';
import '../styles/modal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

interface CityDetailModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  city: CityData | null;
}

const CityDetailModal: React.FC<CityDetailModalProps> = ({ isOpen, onRequestClose, city }) => {
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  // Load all cities when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getWorldCities().then(cities => {
        setAllCities(cities);
        setLoading(false);
      });
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Don't automatically set the city, force user to search first
      setSelectedCity(null);
      setShowSearch(true);
      setSearchTerm('');
    }
  }, [isOpen, city]);

  // Filter cities based on search term
  const filteredCities = searchTerm 
    ? allCities.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Format population with commas
  const formatPopulation = (pop: number) => {
    return pop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Historical data simulation (past 10 years)
  const generateHistoricalData = (baseValue: number, volatility: number, trend: number) => {
    return Array.from({ length: 10 }, (_, i) => {
      // Start from 10 years ago
      const yearFactor = (i - 9) * trend;
      // Add some randomness
      const randomFactor = (Math.random() - 0.5) * volatility;
      // Calculate value
      return Math.max(0, baseValue * (1 + yearFactor + randomFactor));
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="city-modal"
      overlayClassName="city-modal-overlay"
    >
      <div className="city-modal-header">
        <h2>{selectedCity ? 'City Details' : 'Search for a City'}</h2>
        <button className="city-modal-close" onClick={onRequestClose}>×</button>
      </div>

      <div className="city-search-container">
        <div className="city-search-box">
          <div className="city-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for a city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="city-search-input"
            autoFocus
          />
        </div>

        {searchTerm && (
          <div className="city-search-results">
            {loading ? (
              <div className="search-loading">Loading cities...</div>
            ) : filteredCities.length > 0 ? (
              filteredCities.slice(0, 10).map(city => (
                <div 
                  key={city.id} 
                  className="city-search-item"
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchTerm('');
                    setShowSearch(false);
                  }}
                >
                  <div className="city-search-name">{city.name}</div>
                  <div className="city-search-country">{city.country}</div>
                </div>
              ))
            ) : (
              <div className="no-results">No cities found</div>
            )}
          </div>
        )}
      </div>

      {selectedCity ? (
        <div className="city-modal-content">
          <div className="city-modal-hero">
            <div className="city-flag">
              {selectedCity.flag && <img src={selectedCity.flag} alt={`${selectedCity.country} flag`} />}
            </div>
            <div className="city-title">
              <h3>{selectedCity.name}</h3>
              <p>{selectedCity.country} • {selectedCity.capital ? 'Capital City' : 'Major City'}</p>
            </div>
            <button 
              className="change-city-btn" 
              onClick={() => {
                setShowSearch(true);
                setSelectedCity(null);
              }}
            >
              Change City
            </button>
          </div>

          <div className="city-modal-stats">
            <div className="city-stat-card">
              <div className="city-stat-title">Population</div>
              <div className="city-stat-value">{formatPopulation(selectedCity.populationRaw)}</div>
              <div className="city-stat-description">
                {selectedCity.growth > 0 ? 'Growing' : 'Declining'} at {selectedCity.growth}% annually
              </div>
            </div>

            <div className="city-stat-card">
              <div className="city-stat-title">Population Density</div>
              <div className="city-stat-value">{selectedCity.density.toFixed(1)}</div>
              <div className="city-stat-description">people per km²</div>
            </div>

            <div className="city-stat-card">
              <div className="city-stat-title">GDP Per Capita</div>
              <div className="city-stat-value">${selectedCity.gdp.toLocaleString()}</div>
              <div className="city-stat-description">USD</div>
            </div>

            <div className="city-stat-card">
              <div className="city-stat-title">Traffic Index</div>
              <div className="city-stat-value">{selectedCity.traffic}</div>
              <div className="city-stat-description">out of 100</div>
            </div>
          </div>

          <div className="city-modal-details">
            <div className="city-detail-card">
              <h4>Geographic Information</h4>
              <div className="city-detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">{selectedCity.region}</span>
              </div>
              {selectedCity.subregion && (
                <div className="city-detail-item">
                  <span className="detail-label">Subregion:</span>
                  <span className="detail-value">{selectedCity.subregion}</span>
                </div>
              )}
              <div className="city-detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">{selectedCity.lat.toFixed(2)}° N, {selectedCity.lng.toFixed(2)}° E</span>
              </div>
              <div className="city-detail-item">
                <span className="detail-label">Area:</span>
                <span className="detail-value">{selectedCity.area.toLocaleString()} km²</span>
              </div>
            </div>

            <div className="city-detail-card">
              <h4>Cultural Information</h4>
              {selectedCity.languages && selectedCity.languages.length > 0 && (
                <div className="city-detail-item">
                  <span className="detail-label">Languages:</span>
                  <span className="detail-value">{selectedCity.languages.join(', ')}</span>
                </div>
              )}
              {selectedCity.currencies && selectedCity.currencies.length > 0 && (
                <div className="city-detail-item">
                  <span className="detail-label">Currencies:</span>
                  <span className="detail-value">{selectedCity.currencies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="city-modal-charts">
            <div className="city-chart-container">
              <h4>Population Growth (10 Year Trend)</h4>
              <Line 
                data={{
                  labels: Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 9 + i).toString()),
                  datasets: [{
                    label: 'Population (millions)',
                    data: generateHistoricalData(
                      selectedCity.population, 
                      0.05, // volatility
                      selectedCity.growth / 100 // trend based on growth rate
                    ),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                      },
                      ticks: {
                        color: '#94a3b8'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#94a3b8'
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="city-chart-container">
              <h4>Economic Indicators</h4>
              <Bar 
                data={{
                  labels: ['GDP', 'Traffic', 'Growth'],
                  datasets: [{
                    label: 'Metrics',
                    data: [
                      selectedCity.gdp / 1000, // Scale down GDP for visualization
                      selectedCity.traffic,
                      selectedCity.growth * 10 // Scale up growth for visualization
                    ],
                    backgroundColor: [
                      'rgba(16, 185, 129, 0.7)', // green
                      'rgba(59, 130, 246, 0.7)', // blue
                      selectedCity.growth > 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)' // green or red
                    ],
                    borderRadius: 6
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y;
                          const index = context.dataIndex;
                          
                          if (index === 0) {
                            return `GDP: $${(value * 1000).toLocaleString()}`;
                          } else if (index === 1) {
                            return `Traffic Index: ${value}`;
                          } else {
                            return `Growth Rate: ${value / 10}%`;
                          }
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                      },
                      ticks: {
                        color: '#94a3b8'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#94a3b8'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="city-modal-placeholder">
          <div className="placeholder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
          </div>
          <p>Search for a city to view detailed information</p>
        </div>
      )}
    </Modal>
  );
};

export default CityDetailModal;