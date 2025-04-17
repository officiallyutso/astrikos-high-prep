import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-heatmap.js';

// This file ensures the heatmap plugin is properly initialized
// and attached to the Leaflet object

// Check if the heatmap plugin is available
if (!(L as any).heatLayer) {
  console.error('Leaflet heatmap plugin is not properly loaded.');
}

export default L;