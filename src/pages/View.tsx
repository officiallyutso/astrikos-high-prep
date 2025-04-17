import React, { useEffect, useRef } from 'react';
import '../styles/view.css';

// We need to import Cesium this way for React
declare const Cesium: any;

const View: React.FC = () => {
  // Create refs for elements we need to access from React
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const baseLayerPickerRef = useRef<HTMLSelectElement>(null);
  const viewModeRef = useRef<HTMLSelectElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentLocationRef = useRef<HTMLButtonElement>(null);
  
  // Locations data for search
  const locations = {
    'new york': [-74.006, 40.7128, 1000],
    'paris': [2.3522, 48.8566, 1000],
    'tokyo': [139.6917, 35.6895, 1000],
    'london': [-0.1278, 51.5074, 1000],
    'sydney': [151.2093, -33.8688, 1000],
    'grand canyon': [-112.1121, 36.0544, 10000],
    'mount everest': [86.9250, 27.9881, 10000],
    'eiffel tower': [2.2945, 48.8584, 500],
    'great wall of china': [116.5704, 40.4319, 5000]
  };

  // Popular locations
  const popularLocations = [
    { name: 'New York City', lon: -74.006, lat: 40.7128, height: 1000 },
    { name: 'Paris', lon: 2.3522, lat: 48.8566, height: 1000 },
    { name: 'Tokyo', lon: 139.6917, lat: 35.6895, height: 1000 },
    { name: 'Grand Canyon', lon: -115.1398, lat: 36.1699, height: 2000 }
  ];

  useEffect(() => {
    // Check if Cesium is available
    if (typeof Cesium === 'undefined') {
      console.error('Cesium is not loaded');
      return;
    }

    // Initialize Cesium Access Token (use your own token in a real application)
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0Zjg1YTliNi04MzBjLTRmNTMtYmVmMy1iNTc0MGYxMzQ5ZTciLCJpZCI6MjkxOTk3LCJpYXQiOjE3NDQxMDY2ODF9.j9h3Zkpdu3nEvMQPJTzvje5Au7ri2Irlp5U7DfQOrIg';

    // Initialize the Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      scene3DOnly: false,
      shouldAnimate: true,
      contextOptions: {
        webgl: {
          alpha: true,
        }
      }
    });

    // Add the Cesium OSM Buildings
    const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

    // Start with an interesting location
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-74.019, 40.7052, 4000),
      orientation: {
        heading: Cesium.Math.toRadians(20),
        pitch: Cesium.Math.toRadians(-20),
        roll: 0.0
      }
    });

    // Enable lighting based on the sun position
    viewer.scene.globe.enableLighting = true;

    // Enable depth testing so things behind the terrain disappear
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // Set up atmosphere
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.globe.showGroundAtmosphere = true;

    // Base layer switcher functionality
    baseLayerPickerRef.current?.addEventListener('change', function(e) {
      const layers = viewer.imageryLayers;
      layers.removeAll();
      
      const target = e.target as HTMLSelectElement;
      switch(target.value) {
        case 'earth':
          layers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3 }));
          break;
        case 'osm':
          layers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
          }));
          break;
        case 'bing':
          layers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 2 }));
          break;
        case 'dark':
          layers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3 }));
          // Apply a dark filter to the imagery
          const baseLayer = layers.get(0);
          baseLayer.brightness = 0.5;
          baseLayer.contrast = 0.8;
          baseLayer.saturation = 0.7;
          baseLayer.gamma = 1.2;
          break;
      }
    });

    // View mode switcher
    viewModeRef.current?.addEventListener('change', function(e) {
      const target = e.target as HTMLSelectElement;
      switch(target.value) {
        case '3d':
          viewer.scene.morphTo3D();
          break;
        case '2d':
          viewer.scene.morphTo2D();
          break;
        case 'columbus':
          viewer.scene.morphToColumbusView();
          break;
      }
    });

    // Handle flying to a location
    const flyToLocation = (lon: number, lat: number, height: number) => {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-30),
          roll: 0.0
        }
      });
    };

    // Add click handlers for location items
    document.querySelectorAll('.location-item').forEach(item => {
      item.addEventListener('click', function(e) {
        const target = e.currentTarget as HTMLElement;
        const lon = parseFloat(target.getAttribute('data-lon') || '0');
        const lat = parseFloat(target.getAttribute('data-lat') || '0');
        const height = parseFloat(target.getAttribute('data-height') || '0');
        
        flyToLocation(lon, lat, height);
      });
    });

    // Current location button
    currentLocationRef.current?.addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          flyToLocation(
            position.coords.longitude,
            position.coords.latitude,
            1000
          );
        }, function(error) {
          console.error("Error getting current location: ", error);
          alert("Could not get your current location. Please check your browser permissions.");
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    });

    // Basic search functionality
    searchInputRef.current?.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const target = e.target as HTMLInputElement;
        const searchQuery = target.value;
        
        const query = searchQuery.toLowerCase();
        for (const [name, coords] of Object.entries(locations)) {
          if (name.includes(query)) {
            flyToLocation(coords[0], coords[1], coords[2]);
            break;
          }
        }
      }
    });

    // Add some visual enhancement to the globe
    viewer.scene.globe.maximumScreenSpaceError = 2.0; // Higher quality terrain
    viewer.shadows = true; // Enable shadows
    
    // Adjust the lighting based on current time
    const gregorianDate = new Cesium.GregorianDate();
    Cesium.JulianDate.toGregorianDate(Cesium.JulianDate.now(), gregorianDate);
    viewer.clock.currentTime = Cesium.JulianDate.fromGregorianDate(gregorianDate);
    viewer.scene.globe.enableLighting = true;

    // Cleanup function to destroy the viewer when component unmounts
    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <div className="view-container">
      <div id="cesiumContainer" ref={cesiumContainerRef}></div>
      
      <div className="map-title">
        <h1>Earth 3D Viewer</h1>
      </div>
      
      <div className="control-panel">
        <h2>Map Controls</h2>
        
        <div className="search-bar">
          <input 
            type="text" 
            id="searchInput" 
            ref={searchInputRef}
            placeholder="Search for a location..." 
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="baseLayerPicker">Base Map</label>
          <select id="baseLayerPicker" ref={baseLayerPickerRef}>
            <option value="earth">Earth</option>
            <option value="osm">OpenStreetMap</option>
            <option value="bing">Bing Maps Aerial</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="viewMode">View Mode</label>
          <select id="viewMode" ref={viewModeRef}>
            <option value="3d">3D View</option>
            <option value="2d">2D View</option>
            <option value="columbus">Columbus View</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Popular Locations</label>
          {popularLocations.map((location, index) => (
            <div 
              key={index}
              className="location-item" 
              data-lon={location.lon} 
              data-lat={location.lat} 
              data-height={location.height}
            >
              {location.name}
            </div>
          ))}
        </div>
        
        <div className="control-group">
          <button id="currentLocation" ref={currentLocationRef}>Go to My Location</button>
        </div>
      </div>
    </div>
  );
};

export default View;