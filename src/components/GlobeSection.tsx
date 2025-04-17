import React, { useRef, useEffect } from 'react';
import Globe from 'globe.gl';

const GlobeSection: React.FC = () => {
  const globeEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!globeEl.current) return;

    // Clean up previous globe if any
    globeEl.current.innerHTML = '';

    const globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .backgroundColor('rgba(0,0,0,0)')
      .width(400)
      .height(400);

    globe(globeEl.current);

    // Example: Add some sample markers for infrastructure/real estate
    globe
      .pointsData([
        { lat: 40.7128, lng: -74.006, size: 0.01, color: 'orange', name: 'New York' },
  { lat: 51.5074, lng: -0.1278, size: 0.01, color: 'cyan', name: 'London' },
  { lat: 35.6895, lng: 139.6917, size: 0.01, color: 'lime', name: 'Tokyo' },
  { lat: -33.8688, lng: 151.2093, size: 0.01, color: 'magenta', name: 'Sydney' },
  { lat: 48.8566, lng: 2.3522, size: 0.01, color: 'red', name: 'Paris' },
  { lat: 55.7558, lng: 37.6173, size: 0.01, color: 'blue', name: 'Moscow' },
  { lat: 39.9042, lng: 116.4074, size: 0.01, color: 'yellow', name: 'Beijing' },
  { lat: 19.4326, lng: -99.1332, size: 0.01, color: 'green', name: 'Mexico City' },
  { lat: -22.9068, lng: -43.1729, size: 0.01, color: 'purple', name: 'Rio de Janeiro' },
  { lat: 34.0522, lng: -118.2437, size: 0.01, color: 'pink', name: 'Los Angeles' },
  { lat: 41.8781, lng: -87.6298, size: 0.01, color: 'teal', name: 'Chicago' },
  { lat: 29.7604, lng: -95.3698, size: 0.01, color: 'indigo', name: 'Houston' },
  { lat: 39.7392, lng: -104.9903, size: 0.01, color: 'orange', name: 'Denver' },
  { lat: 25.7617, lng: -80.1918, size: 0.01, color: 'cyan', name: 'Miami' },
  { lat: 37.7749, lng: -122.4194, size: 0.01, color: 'lime', name: 'San Francisco' },
  { lat: 47.6062, lng: -122.3321, size: 0.01, color: 'magenta', name: 'Seattle' },
  { lat: 42.3601, lng: -71.0589, size: 0.01, color: 'red', name: 'Boston' },
  { lat: 38.9072, lng: -77.0369, size: 0.01, color: 'blue', name: 'Washington DC' },
  { lat: 33.4484, lng: -112.074, size: 0.01, color: 'yellow', name: 'Phoenix' },
  { lat: 39.9526, lng: -75.1652, size: 0.01, color: 'green', name: 'Philadelphia' },
  { lat: 32.7767, lng: -96.797, size: 0.01, color: 'purple', name: 'Dallas' },
  { lat: 35.2271, lng: -80.8431, size: 0.01, color: 'pink', name: 'Charlotte' },
  { lat: 36.1627, lng: -86.7816, size: 0.01, color: 'teal', name: 'Nashville' },
  { lat: 39.7684, lng: -86.1581, size: 0.01, color: 'indigo', name: 'Indianapolis' },
  { lat: 39.1031, lng: -84.512, size: 0.01, color: 'orange', name: 'Cincinnati' },
  { lat: 38.2527, lng: -85.7585, size: 0.01, color: 'cyan', name: 'Louisville' },
  { lat: 35.1495, lng: -90.049, size: 0.01, color: 'lime', name: 'Memphis' },
  { lat: 30.2672, lng: -97.7431, size: 0.01, color: 'magenta', name: 'Austin' },
  { lat: 29.4241, lng: -98.4936, size: 0.01, color: 'red', name: 'San Antonio' },
  { lat: 32.7157, lng: -117.1611, size: 0.01, color: 'blue', name: 'San Diego' },
  { lat: 36.1146, lng: -115.1728, size: 0.01, color: 'yellow', name: 'Las Vegas' },
  { lat: 39.2904, lng: -76.6122, size: 0.01, color: 'green', name: 'Baltimore' },
  { lat: 42.3314, lng: -83.0458, size: 0.01, color: 'purple', name: 'Detroit' },
  { lat: 43.6532, lng: -79.3832, size: 0.01, color: 'pink', name: 'Toronto' },
  { lat: 45.5017, lng: -73.5673, size: 0.01, color: 'teal', name: 'Montreal' },
  { lat: 49.2827, lng: -123.1207, size: 0.01, color: 'indigo', name: 'Vancouver' },
  { lat: 51.0447, lng: -114.0719, size: 0.01, color: 'orange', name: 'Calgary' },
  { lat: 53.5461, lng: -113.4938, size: 0.01, color: 'cyan', name: 'Edmonton' },
  { lat: 50.4501, lng: -104.6178, size: 0.01, color: 'lime', name: 'Regina' },
  { lat: 52.1307, lng: -106.6551, size: 0.01, color: 'magenta', name: 'Saskatoon' },
  { lat: 49.8951, lng: -97.1384, size: 0.01, color: 'red', name: 'Winnipeg' },
  { lat: 44.6488, lng: -63.5752, size: 0.01, color: 'blue', name: 'Halifax' },
  { lat: 46.5653, lng: -66.4619, size: 0.01, color: 'yellow', name: 'Fredericton' },
  { lat: 52.9399, lng: -73.5491, size: 0.01, color: 'green', name: 'Chibougamau' },
  { lat: 64.8255, lng: -147.8765, size: 0.01, color: 'purple', name: 'Fairbanks' },
  { lat: 21.3069, lng: -157.8583, size: 0.01, color: 'pink', name: 'Honolulu' },
  { lat: 61.2181, lng: -149.9003, size: 0.01, color: 'teal', name: 'Anchorage' },
  { lat: 19.8968, lng: -155.5828, size: 0.01, color: 'indigo', name: 'Hilo' },
  { lat: 20.7984, lng: -156.3319, size: 0.01, color: 'orange', name: 'Lahaina' },
  { lat: 21.967, lng: -159.3556, size: 0.01, color: 'cyan', name: 'Lihue' },
  { lat: 41.823, lng: -71.4187, size: 0.01, color: 'lime', name: 'Providence' },
  { lat: 43.161, lng: -77.6109, size: 0.01, color: 'magenta', name: 'Rochester' },
  { lat: 42.8864, lng: -78.8784, size: 0.01, color: 'red', name: 'Buffalo' },
  { lat: 43.1566, lng: -77.6088, size: 0.01, color: 'blue', name: 'Syracuse' },
  { lat: 42.6526, lng: -73.7562, size: 0.01, color: 'yellow', name: 'Albany' },
  { lat: 41.7637, lng: -72.6851, size: 0.01, color: 'green', name: 'Hartford' },
  { lat: 41.8252, lng: -71.4189, size: 0.01, color: 'purple', name: 'Pawtucket' },
  { lat: 41.7001, lng: -71.4162, size: 0.01, color: 'pink', name: 'East Providence' },
  { lat: 41.4901, lng: -71.3128, size: 0.01, color: 'teal', name: 'Middletown' },
  { lat: 41.5573, lng: -70.6184, size: 0.01, color: 'indigo', name: 'Falmouth' },
  { lat: 41.6255, lng: -70.6184, size: 0.01, color: 'orange', name: 'New Bedford' },
  { lat: 42.1015, lng: -72.5898, size: 0.01, color: 'cyan', name: 'Springfield' },
  { lat: 42.2626, lng: -71.8023, size: 0.01, color: 'lime', name: 'Worcester' },
  { lat: 42.3601, lng: -71.0589, size: 0.01, color: 'magenta', name: 'Cambridge' },
  { lat: 42.3751, lng: -71.1056, size: 0.01, color: 'red', name: 'Somerville' },
  { lat: 42.4084, lng: -71.0112, size: 0.01, color: 'blue', name: 'Everett' },
  { lat: 42.4668, lng: -70.9495, size: 0.01, color: 'yellow', name: 'Lynn' },
  { lat: 42.5195, lng: -70.8967, size: 0.01, color: 'green', name: 'Salem' },
  { lat: 42.7782, lng: -71.0773, size: 0.01, color: 'purple', name: 'Lowell' },
  { lat: 42.9926, lng: -70.8718, size: 0.01, color: 'pink', name: 'Portsmouth' },
  { lat: 43.1939, lng: -70.8736, size: 0.01, color: 'teal', name: 'Dover' },
  { lat: 43.1979, lng: -71.5377, size: 0.01, color: 'indigo', name: 'Concord' },
  { lat: 44.3106, lng: -69.7795, size: 0.01, color: 'orange', name: 'Augusta' },
  { lat: 44.8012, lng: -68.7778, size: 0.01, color: 'cyan', name: 'Bangor' },
  { lat: 45.2538, lng: -69.4455, size: 0.01, color: 'lime', name: 'Skowhegan' },
  { lat: 46.8721, lng: -68.0039, size: 0.01, color: 'magenta', name: 'Presque Isle' },
  { lat: 47.2376, lng: -68.587, size: 0.01, color: 'red', name: 'Fort Kent' },
  { lat: 44.4664, lng: -73.1704, size: 0.01, color: 'blue', name: 'Burlington' },
  { lat: 43.6106, lng: -72.9726, size: 0.01, color: 'yellow', name: 'White River Junction' },
  { lat: 43.2984, lng: -72.1585, size: 0.01, color: 'green', name: 'Springfield' },
  { lat: 42.8509, lng: -73.758, size: 0.01, color: 'purple', name: 'Schenectady' },
  { lat: 42.0987, lng: -75.918, size: 0.01, color: 'pink', name: 'Binghamton' },
  { lat: 41.4309, lng: -74.4228, size: 0.01, color: 'teal', name: 'Middletown' },
  { lat: 40.7357, lng: -74.1724, size: 0.01, color: 'indigo', name: 'Morristown' },
  { lat: 40.2206, lng: -74.7597, size: 0.01, color: 'orange', name: 'Trenton' },
  { lat: 39.9526, lng: -75.1652, size: 0.01, color: 'cyan', name: 'Camden' },
  { lat: 39.3643, lng: -74.4229, size: 0.01, color: 'lime', name: 'Atlantic City' },
  { lat: 38.9784, lng: -74.8337, size: 0.01, color: 'magenta', name: 'Wildwood' },
  { lat: 38.3498, lng: -75.0849, size: 0.01, color: 'red', name: 'Ocean City' },
  { lat: 39.1582, lng: -75.5244, size: 0.01, color: 'blue', name: 'Dover' },
  { lat: 38.9108, lng: -75.5277, size: 0.01, color: 'yellow', name: 'Milford' },
  { lat: 38.7073, lng: -75.0854, size: 0.01, color: 'green', name: 'Georgetown' },
  { lat: 38.5488, lng: -75.1235, size: 0.01, color: 'purple', name: 'Lewes' },
  { lat: 38.3365, lng: -75.0849, size: 0.01, color: 'pink', name: 'Berlin' },
  { lat: 38.3226, lng: -75.2177, size: 0.01, color: 'teal', name: 'Snow Hill' },
  { lat: 37.9799, lng: -75.8315, size: 0.01, color: 'indigo', name: 'Princess Anne' },
  { lat: 37.2692, lng: -76.7075, size: 0.01, color: 'orange', name: 'Williamsburg' },
  { lat: 36.8508, lng: -76.2859, size: 0.01, color: 'cyan', name: 'Norfolk' },
  { lat: 36.8535, lng: -75.978, size: 0.01, color: 'lime', name: 'Virginia Beach' },
  { lat: 37.5407, lng: -77.436, size: 0.01, color: 'magenta', name: 'Richmond' },
  { lat: 38.0293, lng: -78.4767, size: 0.01, color: 'red', name: 'Charlottesville' },
  { lat: 38.3498, lng: -81.6326, size: 0.01, color: 'blue', name: 'Charleston' },
  { lat: 39.2904, lng: -76.6122, size: 0.01, color: 'yellow', name: 'Baltimore' },
  { lat: 39.1582, lng: -75.5244, size: 0.01, color: 'green', name: 'Dover' },
  { lat: 40.2732, lng: -76.8867, size: 0.01, color: 'purple', name: 'Harrisburg' },
  { lat: 40.4406, lng: -79.9959, size: 0.01, color: 'pink', name: 'Pittsburgh' },
  { lat: 41.0814, lng: -81.519, size: 0.01, color: 'teal', name: 'Akron' },
  { lat: 41.4993, lng: -81.6944, size: 0.01, color: 'indigo', name: 'Cleveland' },
  { lat: 39.9612, lng: -82.9988, size: 0.01, color: 'orange', name: 'Columbus' },
  { lat: 39.1031, lng: -84.512, size: 0.01, color: 'cyan', name: 'Cincinnati' },
  { lat: 39.7684, lng: -86.1581, size: 0.01, color: 'lime', name: 'Indianapolis' },
  { lat: 41.8781, lng: -87.6298, size: 0.01, color: 'magenta', name: 'Chicago' },
  { lat: 42.3314, lng: -83.0458, size: 0.01, color: 'red', name: 'Detroit' },
  { lat: 43.0389, lng: -87.9065, size: 0.01, color: 'blue', name: 'Milwaukee' }
      ])
      .pointAltitude('size')
      .pointColor('color')
      .pointLabel('name');

    // Animate globe
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 1;

    return () => {
      globeEl.current && (globeEl.current.innerHTML = '');
    };
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div ref={globeEl} />
    </div>
  );
};

export default GlobeSection;