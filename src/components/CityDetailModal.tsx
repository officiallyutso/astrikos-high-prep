import React from 'react';
import Modal from 'react-modal';
import { CityData } from '../services/dataService';
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
  if (!city) return null;

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
      return baseValue * (1 + yearFactor + randomFactor);
    });
  };

  // Generate historical population data
  const populationHistory = generateHistoricalData(
    city.population * 0.9, // Start with 90% of current population
    0.02, // Low volatility
    0.01  // Upward trend
  );

  // Generate historical traffic data
  const trafficHistory = generateHistoricalData(
    city.traffic * 0.8, // Start with 80% of current traffic
    0.1,  // Medium volatility
    0.02  // Stronger upward trend
  );

  // Generate historical growth rate data
  const growthHistory = generateHistoricalData(
    city.growth,
    0.5,  // High volatility
    -0.01 // Slight downward trend (growth rates tend to decrease)
  );

  // Chart data
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 9 + i).toString());

  const populationChartData = {
    labels: years,
    datasets: [
      {
        label: 'Population (millions)',
        data: populationHistory,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const trafficChartData = {
    labels: years,
    datasets: [
      {
        label: 'Traffic Index',
        data: trafficHistory,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const growthChartData = {
    labels: years,
    datasets: [
      {
        label: 'Annual Growth Rate (%)',
        data: growthHistory,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="city-modal"
      overlayClassName="city-modal-overlay"
    >
      <div className="city-modal-header">
        <div className="city-modal-title">
          <h2>{city.name}</h2>
          <div className="city-modal-subtitle">{city.country} {city.flag && <img src={city.flag} alt={`${city.country} flag`} className="country-flag" />}</div>
        </div>
        <button className="city-modal-close" onClick={onRequestClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      <div className="city-modal-content">
        <div className="city-modal-stats">
          <div className="city-stat-card">
            <div className="city-stat-title">Population</div>
            <div className="city-stat-value">{formatPopulation(city.populationRaw)}</div>
            <div className="city-stat-description">
              {city.growth > 0 ? (
                <div className="trend-up">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                  </svg>
                  {city.growth}% annual growth
                </div>
              ) : (
                <div className="trend-down">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
                  </svg>
                  {Math.abs(city.growth)}% annual decline
                </div>
              )}
            </div>
          </div>

          <div className="city-stat-card">
            <div className="city-stat-title">Population Density</div>
            <div className="city-stat-value">{city.density}</div>
            <div className="city-stat-description">people per km²</div>
          </div>

          <div className="city-stat-card">
            <div className="city-stat-title">Traffic Index</div>
            <div className="city-stat-value">{city.traffic}</div>
            <div className="city-stat-description">
              {city.traffic > 75 ? 'Heavy traffic' : 
               city.traffic > 50 ? 'Moderate traffic' : 'Light traffic'}
            </div>
          </div>

          <div className="city-stat-card">
            <div className="city-stat-title">GDP per Capita</div>
            <div className="city-stat-value">${city.gdp.toLocaleString()}</div>
            <div className="city-stat-description">
              {city.gdp > 40000 ? 'High income' : 
               city.gdp > 12000 ? 'Upper middle income' : 
               city.gdp > 4000 ? 'Lower middle income' : 'Low income'}
            </div>
          </div>
        </div>

        <div className="city-modal-details">
          <div className="city-detail-item">
            <div className="city-detail-label">Region:</div>
            <div className="city-detail-value">{city.region}</div>
          </div>
          {city.subregion && (
            <div className="city-detail-item">
              <div className="city-detail-label">Subregion:</div>
              <div className="city-detail-value">{city.subregion}</div>
            </div>
          )}
          {city.languages && city.languages.length > 0 && (
            <div className="city-detail-item">
              <div className="city-detail-label">Languages:</div>
              <div className="city-detail-value">{city.languages.join(', ')}</div>
            </div>
          )}
          {city.currencies && city.currencies.length > 0 && (
            <div className="city-detail-item">
              <div className="city-detail-label">Currencies:</div>
              <div className="city-detail-value">{city.currencies.join(', ')}</div>
            </div>
          )}
          <div className="city-detail-item">
            <div className="city-detail-label">Area:</div>
            <div className="city-detail-value">{city.area.toLocaleString()} km²</div>
          </div>
          <div className="city-detail-item">
            <div className="city-detail-label">Coordinates:</div>
            <div className="city-detail-value">{city.lat.toFixed(4)}, {city.lng.toFixed(4)}</div>
          </div>
        </div>

        <div className="city-modal-charts">
          <div className="city-chart-container">
            <h3>Population Trend (10 Years)</h3>
            <div className="city-chart">
              <Line data={populationChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="city-chart-container">
            <h3>Traffic Index Trend (10 Years)</h3>
            <div className="city-chart">
              <Line data={trafficChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="city-chart-container">
            <h3>Growth Rate Trend (10 Years)</h3>
            <div className="city-chart">
              <Line data={growthChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CityDetailModal;