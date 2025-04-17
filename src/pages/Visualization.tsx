import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getWorldCities, CityData } from '../services/dataService';
import { getWeatherData, getTemperatureData } from '../services/weatherService';
import '../styles/visualization.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const cityIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Data layer types
type DataLayer = 'population' | 'traffic' | 'temperature' | 'weather' | 'none';

// Define the HeatmapLayer class if it doesn't exist
if (!(L as any).HeatmapOverlay) {
  (L as any).HeatmapOverlay = function(cfg: any) {
    this._cfg = cfg;
    this._data = [];
    this._max = 1;
    this._min = 0;
    this._opacity = 0.8;
    this._radius = 25;
  };

  (L as any).HeatmapOverlay.prototype = {
    onAdd: function(map: any) {
      this._map = map;
      this._container = L.DomUtil.create('div', 'leaflet-heatmap-container');
      this._container.style.position = 'absolute';
      this._container.style.width = '100%';
      this._container.style.height = '100%';
      this._container.style.zIndex = 1;
      map.getPanes().overlayPane.appendChild(this._container);
      return this;
    },
    onRemove: function(map: any) {
      map.getPanes().overlayPane.removeChild(this._container);
      return this;
    },
    setData: function(data: any) {
      this._data = data;
      return this;
    }
  };
}

// HeatLayer component for rendering heatmaps
const HeatLayer: React.FC<{ data: any[], intensity: number, radius: number, visible: boolean }> = ({ 
  data, intensity, radius, visible 
}) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!visible) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    if (!data || data.length === 0) {
      console.log("No data available for heatmap");
      return;
    }

    try {
      // Remove existing layer if it exists
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // Create a simple heatmap using circles
      const heatGroup = L.layerGroup();
      
      data.forEach(point => {
        const value = point.value || 0;
        const normalizedValue = Math.min(1, value / 100); // Normalize to 0-1
        
        const circleRadius = radius * normalizedValue;
        const opacity = intensity * normalizedValue;
        
        const circle = L.circle([point.lat, point.lng], {
          radius: circleRadius * 2000, // Scale up for visibility
          fillColor: getColorForValue(normalizedValue),
          fillOpacity: opacity,
          stroke: false
        });
        
        heatGroup.addLayer(circle);
      });
      
      heatLayerRef.current = heatGroup;
      map.addLayer(heatGroup);
    } catch (error) {
      console.error('Error creating heatmap layer:', error);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, data, intensity, radius, visible]);

  return null;
};

// Helper function to get color based on value
function getColorForValue(value: number): string {
  // Color gradient from blue (cold) to red (hot)
  const r = Math.floor(255 * Math.min(1, value * 2));
  const b = Math.floor(255 * Math.min(1, 2 - value * 2));
  return `rgb(${r}, 0, ${b})`;
}

// MapControls component for controlling the map view
const MapControls: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const Visualization: React.FC = () => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [activeLayer, setActiveLayer] = useState<DataLayer>('none');
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [showSearch, setShowSearch] = useState(false);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [populationData, setPopulationData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);

  // Load cities data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const citiesData = await getWorldCities();
        setCities(citiesData);
        
        // Prepare population data for heatmap
        const popData = citiesData.map(city => ({
          lat: city.lat,
          lng: city.lng,
          value: city.populationRaw / 1000000 // Scale down for better visualization
        }));
        setPopulationData(popData);
        
        // Prepare traffic data for heatmap
        const trafData = citiesData.map(city => ({
          lat: city.lat,
          lng: city.lng,
          value: city.traffic
        }));
        setTrafficData(trafData);
        
        // Fetch temperature data
        const tempData = await getTemperatureData();
        setTemperatureData(tempData);
        
        // Fetch weather data
        const weatherData = await getWeatherData();
        setWeatherData(weatherData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 10)); // Limit to 10 results
      setShowSearch(true);
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
    setMapCenter([city.lat, city.lng]);
    setMapZoom(10);
    setSearchTerm('');
    setFilteredCities([]);
    setShowSearch(false);
  };

  // Get active data based on selected layer
  const getActiveData = () => {
    switch (activeLayer) {
      case 'population':
        return populationData;
      case 'traffic':
        return trafficData;
      case 'temperature':
        return temperatureData;
      case 'weather':
        return weatherData;
      default:
        return [];
    }
  };

  // Get layer settings
  const getLayerSettings = () => {
    switch (activeLayer) {
      case 'population':
        return { intensity: 0.9, radius: 95 };
      case 'traffic':
        return { intensity: 0.7, radius: 25 };
      case 'temperature':
        return { intensity: 0.6, radius: 30 };
      case 'weather':
        return { intensity: 0.5, radius: 35 };
      default:
        return { intensity: 0, radius: 0 };
    }
  };

  // Format population with commas
  const formatPopulation = (pop: number) => {
    return pop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get legend title based on active layer
  const getLegendTitle = () => {
    switch (activeLayer) {
      case 'population':
        return 'Population Density';
      case 'traffic':
        return 'Traffic Congestion';
      case 'temperature':
        return 'Temperature (°C)';
      case 'weather':
        return 'Weather Intensity';
      default:
        return '';
    }
  };

  return (
    <div className="visualization-page">
      <div className="visualization-header">
        <h1 className="visualization-title">Global Data Visualization</h1>
        <p className="visualization-subtitle">Explore global patterns in population, traffic, temperature, and weather</p>
      </div>
      
      <div className="visualization-controls">
        <div className="layer-selector">
          <h3>Data Layers</h3>
          <div className="layer-buttons">
            <button 
              className={`layer-btn ${activeLayer === 'population' ? 'active' : ''}`}
              onClick={() => setActiveLayer(activeLayer === 'population' ? 'none' : 'population')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
              </svg>
              Population
            </button>
            <button 
              className={`layer-btn ${activeLayer === 'traffic' ? 'active' : ''}`}
              onClick={() => setActiveLayer(activeLayer === 'traffic' ? 'none' : 'traffic')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm.5 2h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z"/>
              </svg>
              Traffic
            </button>
            <button 
              className={`layer-btn ${activeLayer === 'temperature' ? 'active' : ''}`}
              onClick={() => setActiveLayer(activeLayer === 'temperature' ? 'none' : 'temperature')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5v7.55a3.5 3.5 0 1 0 5 0V2.5A2.5 2.5 0 0 0 8 0zM6.5 2.5a1.5 1.5 0 1 1 3 0v7.987l.167.15a2.5 2.5 0 1 1-3.333 0l.166-.15V2.5z"/>
              </svg>
              Temperature
            </button>
            <button 
              className={`layer-btn ${activeLayer === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveLayer(activeLayer === 'weather' ? 'none' : 'weather')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 0 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 1 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm.247-6.998a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973z"/>
              </svg>
              Weather
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <div className={`search-box ${showSearch ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for a city..." 
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSearch(true)}
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
          
          <Link to="/city-investment" className="city-analysis-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
            </svg>
            City Investment Analysis
          </Link>
          
          {showSearch && filteredCities.length > 0 && (
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
      
      <div className="map-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div>Loading global data...</div>
          </div>
        )}
        
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomleft" />
          
          <MapControls center={mapCenter} zoom={mapZoom} />
          
          {/* Heat layer */}
          {activeLayer !== 'none' && (
            <HeatLayer 
              data={getActiveData()} 
              intensity={getLayerSettings().intensity}
              radius={getLayerSettings().radius}
              visible={activeLayer !== 'none'}
            />
          )}
          
          {/* Selected city marker */}
          {selectedCity && (
            <Marker 
              position={[selectedCity.lat, selectedCity.lng]} 
              icon={cityIcon}
            >
              <Popup>
                <div className="city-popup">
                  <h3>{selectedCity.name}</h3>
                  <div className="city-country">{selectedCity.country}</div>
                  <div className="city-stats">
                    <div className="city-stat">
                      <span className="stat-label">Population:</span>
                      <span className="stat-value">{formatPopulation(selectedCity.populationRaw)}</span>
                    </div>
                    <div className="city-stat">
                      <span className="stat-label">Traffic Index:</span>
                      <span className="stat-value">{selectedCity.traffic}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Legend */}
        {activeLayer !== 'none' && (
          <div className="visualization-legend">
            <div className="legend-title">{getLegendTitle()}</div>
            <div className="legend-gradient">
              <span className="legend-low">Low</span>
              <div className="legend-bar"></div>
              <span className="legend-high">High</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="data-insights">
        <div className="insight-card">
          <div className="insight-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
              <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
            </svg>
          </div>
          <div className="insight-content">
            <h3>Population Density</h3>
            <p>Visualize global population distribution, with hotspots in urban centers and densely populated regions.</p>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm.5 2h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </div>
          <div className="insight-content">
            <h3>Traffic Congestion</h3>
            <p>Explore traffic patterns in major cities, with higher values indicating more congested areas.</p>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
              <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5v7.55a3.5 3.5 0 1 0 5 0V2.5A2.5 2.5 0 0 0 8 0zM6.5 2.5a1.5 1.5 0 1 1 3 0v7.987l.167.15a2.5 2.5 0 1 1-3.333 0l.166-.15V2.5z"/>
            </svg>
          </div>
          <div className="insight-content">
            <h3>Temperature Distribution</h3>
            <p>See global temperature patterns, with warmer regions near the equator and cooler temperatures at higher latitudes.</p>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 0 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 1 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm.247-6.998a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973z"/>
            </svg>
          </div>
          <div className="insight-content">
            <h3>Weather Patterns</h3>
            <p>Discover global weather patterns, including precipitation, storms, and clear skies across different regions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
