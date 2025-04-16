import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { CityData, getWorldCities } from '../services/dataService';
import '../styles/customChart.css';

interface CustomizableChartProps {
  type: 'bar' | 'line';
  title: string;
  dataKey: 'population' | 'traffic' | 'growth' | 'gdp' | 'density';
  initialCityCount?: number;
}

const CustomizableChart: React.FC<CustomizableChartProps> = ({ 
  type, 
  title, 
  dataKey, 
  initialCityCount = 10 
}) => {
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [selectedCities, setSelectedCities] = useState<CityData[]>([]);
  const [availableCities, setAvailableCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load all cities on component mount
  useEffect(() => {
    async function fetchCities() {
      setLoading(true);
      try {
        const cities = await getWorldCities();
        setAllCities(cities);
        // Initially select top N cities
        setSelectedCities(cities.slice(0, initialCityCount));
        setAvailableCities(cities.slice(initialCityCount));
      } catch (error) {
        console.error('Error fetching cities for chart:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCities();
  }, [initialCityCount]);

  // Filter available cities based on search term
  const filteredAvailableCities = searchTerm 
    ? availableCities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableCities;

  // Add a city to the chart
  const addCity = (city: CityData) => {
    setSelectedCities([...selectedCities, city]);
    setAvailableCities(availableCities.filter(c => c.id !== city.id));
    setSearchTerm('');
  };

  // Remove a city from the chart
  const removeCity = (city: CityData) => {
    setSelectedCities(selectedCities.filter(c => c.id !== city.id));
    setAvailableCities([...availableCities, city].sort((a, b) => b[dataKey] - a[dataKey]));
  };

  // Get label based on data key
  const getLabel = () => {
    switch(dataKey) {
      case 'population': return 'Population (millions)';
      case 'traffic': return 'Traffic Index';
      case 'growth': return 'Annual Growth Rate (%)';
      case 'gdp': return 'GDP Per Capita ($)';
      case 'density': return 'Population Density (per km²)';
      default: return '';
    }
  };

  // Get value based on data key
  const getValue = (city: CityData) => {
    switch(dataKey) {
      case 'population': return city.population;
      case 'traffic': return city.traffic;
      case 'growth': return city.growth;
      case 'gdp': return city.gdp / 1000; // Scale down for visualization
      case 'density': return city.density / 100; // Scale down for visualization
      default: return 0;
    }
  };

  // Get color based on data key and value
  const getColor = (city: CityData, index: number) => {
    if (dataKey === 'growth') {
      return city.growth > 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';
    }
    
    // Cycle through colors for other data types
    const colors = [
      'rgba(99, 102, 241, 0.7)',  // indigo
      'rgba(59, 130, 246, 0.7)',  // blue
      'rgba(16, 185, 129, 0.7)',  // green
      'rgba(245, 158, 11, 0.7)',  // amber
      'rgba(239, 68, 68, 0.7)',   // red
      'rgba(139, 92, 246, 0.7)',  // purple
    ];
    
    return colors[index % colors.length];
  };

  // Prepare chart data
  const chartData = {
    labels: selectedCities.map(city => city.name),
    datasets: [{
      label: getLabel(),
      data: selectedCities.map(city => getValue(city)),
      backgroundColor: selectedCities.map((city, index) => getColor(city, index)),
      borderColor: type === 'line' ? 'rgba(99, 102, 241, 1)' : undefined,
      borderWidth: type === 'line' ? 2 : undefined,
      tension: type === 'line' ? 0.4 : undefined,
      fill: type === 'line' ? true : undefined,
      borderRadius: type === 'bar' ? 6 : undefined,
    }]
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
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const city = selectedCities[context.dataIndex];
            let value = context.raw;
            
            if (dataKey === 'gdp') {
              return `GDP: $${(value * 1000).toLocaleString()}`;
            } else if (dataKey === 'density') {
              return `Density: ${(value * 100).toLocaleString()} per km²`;
            }
            
            return `${getLabel()}: ${value}`;
          }
        }
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

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="chart-loading-spinner"></div>
        <div>Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="customizable-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-controls">
          <div className="city-selector">
            <div className="city-search-box">
              <input
                type="text"
                placeholder="Add a city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="city-search-input"
              />
            </div>
            {searchTerm && (
              <div className="city-dropdown">
                {filteredAvailableCities.length > 0 ? (
                  filteredAvailableCities.slice(0, 5).map(city => (
                    <div 
                      key={city.id} 
                      className="city-dropdown-item"
                      onClick={() => addCity(city)}
                    >
                      <span>{city.name}</span>
                      <span className="city-country">{city.country}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-cities">No cities found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="chart-body">
        {type === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
      
      <div className="selected-cities">
        {selectedCities.map(city => (
          <div key={city.id} className="selected-city-tag">
            <span>{city.name}</span>
            <button 
              className="remove-city-btn"
              onClick={() => removeCity(city)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomizableChart;