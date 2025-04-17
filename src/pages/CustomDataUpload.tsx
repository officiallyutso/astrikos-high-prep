import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/customDataUpload.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const CustomDataUpload: React.FC = () => {
  const [customData, setCustomData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data format
        if (!Array.isArray(data)) {
          throw new Error('Data must be an array of objects');
        }
        
        // Check if each item has required properties
        const isValid = data.every(item => 
          typeof item.lat === 'number' && 
          typeof item.lng === 'number' && 
          typeof item.value === 'number'
        );
        
        if (!isValid) {
          throw new Error('Each data point must have lat, lng, and value properties');
        }
        
        setCustomData(data);
        setSuccess('Data loaded successfully!');
        
        // Calculate map center based on data
        if (data.length > 0) {
          const sumLat = data.reduce((sum, item) => sum + item.lat, 0);
          const sumLng = data.reduce((sum, item) => sum + item.lng, 0);
          setMapCenter([sumLat / data.length, sumLng / data.length]);
          setMapZoom(4);
        }
        
        setShowInstructions(false);
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        setError(`Invalid data format: ${(error as Error).message}`);
        setCustomData([]);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="custom-data-page">
      <div className="custom-data-header">
        <h1 className="custom-data-title">Custom Data Visualization</h1>
        <p className="custom-data-subtitle">Upload your own data to visualize on the map</p>
      </div>
      
      <div className="custom-data-content">
        <div className="upload-section">
          <div className="upload-container">
            <h2>Upload Your Data</h2>
            
            <div className="file-upload-area">
              <label className="file-upload-label">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  className="file-input"
                />
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                  </svg>
                </div>
                <span className="upload-text">
                  {fileName ? fileName : 'Choose JSON file or drop it here'}
                </span>
              </label>
            </div>
            
            {loading && (
              <div className="upload-status loading">
                <div className="spinner"></div>
                <span>Processing data...</span>
              </div>
            )}
            
            {error && (
              <div className="upload-status error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="upload-status success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <span>{success}</span>
              </div>
            )}
            
            <div className="data-format-info">
              <h3>Required Data Format</h3>
              <p>Your JSON file must contain an array of objects with the following structure:</p>
              <pre className="code-example">
{`[
  {
    "lat": 40.7128,    // Latitude (number)
    "lng": -74.0060,   // Longitude (number)
    "value": 75        // Intensity value 0-100 (number)
  },
  {
    "lat": 34.0522,
    "lng": -118.2437,
    "value": 85
  }
  // ... more data points
]`}
              </pre>
              <div className="format-notes">
                <p><strong>Notes:</strong></p>
                <ul>
                  <li>All properties must be numbers</li>
                  <li>Value should be between 0-100 for best visualization</li>
                  <li>You can include additional properties, but they won't be used</li>
                  <li>Maximum recommended file size: 5MB (approximately 10,000 data points)</li>
                </ul>
              </div>
            </div>
            
            
          </div>
        </div>
        
        <div className="map-section">
          <div className="map-container">
            {showInstructions && !customData.length ? (
              <div className="map-instructions">
                <div className="instructions-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                  <h3>Upload Data to Visualize</h3>
                  <p>Select a JSON file with your data points to see them visualized on this map.</p>
                  <p>The visualization will automatically center on your data.</p>
                </div>
              </div>
            ) : null}
            
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
              {customData.length > 0 && (
                <HeatLayer 
                  data={customData} 
                  intensity={0.8}
                  radius={40}
                  visible={true}
                />
              )}
            </MapContainer>
            
            {/* Legend */}
            {customData.length > 0 && (
              <div className="visualization-legend">
                <div className="legend-title">Custom Data Intensity</div>
                <div className="legend-gradient">
                  <span className="legend-low">Low</span>
                  <div className="legend-bar"></div>
                  <span className="legend-high">High</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDataUpload;