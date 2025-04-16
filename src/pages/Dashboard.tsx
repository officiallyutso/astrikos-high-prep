import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomizableChart from '../components/CustomizableChart';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import * as d3 from 'd3';
import '../styles/dashboard.css';
import L from 'leaflet';
import { getWorldCities, CityData } from '../services/dataService';
import CityDetailModal from '../components/CityDetailModal';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Component to handle map center changes
function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 5);
  return null;
}

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState('population');
  const [timeRange, setTimeRange] = useState('month');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedModalCity, setSelectedModalCity] = useState<CityData | null>(null);
  
  // Fetch city data on component mount
  useEffect(() => {
    async function fetchCityData() {
      setLoading(true);
      try {
        const data = await getWorldCities();
        setCityData(data);
        if (data.length > 0) {
          setSelectedCity(data[0]);
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCityData();
  }, []);

  // Filter cities based on search term
  const filteredCities = cityData.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to search for cities using OpenStreetMap Nominatim API
  const searchCities = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      // Transform the results to match our city data format
      const results = data.map((item: any, index: number) => ({
        id: `search-${index}`,
        name: item.name || item.display_name.split(',')[0],
        country: item.address?.country || 'Unknown',
        population: Math.random() * 10 + 1, // Placeholder data
        populationRaw: Math.floor((Math.random() * 10 + 1) * 1000000),
        growth: (Math.random() * 3 - 1).toFixed(1),
        traffic: Math.floor(Math.random() * 30) + 60,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        area: Math.floor(Math.random() * 1000) + 100,
        gdp: Math.floor(Math.random() * 50000) + 5000,
        density: Math.floor(Math.random() * 5000) + 1000,
        capital: false,
        region: item.address?.country || 'Unknown',
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for cities:', error);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchCities(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Combine predefined cities with search results
  const allCities = searchTerm.length < 2 
    ? filteredCities 
    : [...filteredCities, ...searchResults];

  // Chart data for time series
  const timeSeriesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: chartType === 'population' ? 'Population Growth' : 
               chartType === 'traffic' ? 'Traffic Index' : 'Economic Growth',
        data: Array.from({ length: 12 }, () => Math.random() * 10 + 5),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

  // Population data for bar chart
  const populationData = {
    labels: cityData.slice(0, 10).map(city => city.name),
    datasets: [
      {
        label: 'Population (millions)',
        data: cityData.slice(0, 10).map(city => city.population),
        backgroundColor: '#6366f1',
        borderRadius: 6
      }
    ]
  };

  // Traffic data for line chart
  const trafficData = {
    labels: cityData.slice(0, 10).map(city => city.name),
    datasets: [
      {
        label: 'Traffic Index',
        data: cityData.slice(0, 10).map(city => city.traffic),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Growth data for bar chart
  const growthData = {
    labels: cityData.slice(0, 10).map(city => city.name),
    datasets: [
      {
        label: 'Annual Growth Rate (%)',
        data: cityData.slice(0, 10).map(city => city.growth),
        backgroundColor: city => city.growth < 0 ? '#ef4444' : '#10b981',
        borderRadius: 6
      }
    ]
  };

  // D3 visualization
  useEffect(() => {
    if (cityData.length === 0) return;
    
    // Clear previous chart
    d3.select('#d3-chart').selectAll('*').remove();

    // Set up dimensions
    const width = document.getElementById('d3-chart')?.clientWidth || 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select('#d3-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create group for chart
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleBand()
      .domain(cityData.slice(0, 15).map(d => d.name))
      .range([0, innerWidth])
      .padding(0.2);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(cityData.slice(0, 15), d => d.population) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#94a3b8');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)');

    // Add bars
    g.selectAll('.bar')
      .data(cityData.slice(0, 15))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name) || 0)
      .attr('y', d => y(d.population))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.population))
      .attr('fill', '#6366f1')
      .attr('rx', 4)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#818cf8');
        
        // Show tooltip
        const tooltip = d3.select('#d3-chart')
          .append('div')
          .attr('class', 'd3-tooltip')
          .style('position', 'absolute')
          .style('background', '#1e293b')
          .style('color', '#fff')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '10')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 25}px`);
          
        tooltip.html(`
          <div><strong>${d.name}, ${d.country}</strong></div>
          <div>Population: ${d.population}M</div>
          <div>Growth: ${d.growth}%</div>
        `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#6366f1');
        d3.select('.d3-tooltip').remove();
      })
      .on('click', function(event, d) {
        setSelectedModalCity(d);
        setModalIsOpen(true);
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Population Distribution by City');
  }, [cityData]);

  // Handle logout
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    return currentUser.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  // Open modal with city details
  const openCityModal = (city: CityData) => {
    setSelectedModalCity(city);
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">A</div>
            <div className={`logo-text ${sidebarCollapsed ? 'logo-text-collapsed' : ''}`}>
              Astrikos
            </div>
          </div>
          <button 
            className={`sidebar-toggle ${sidebarCollapsed ? 'sidebar-toggle-rotated' : ''}`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
          </button>
        </div>

        <div className="nav-section">
          <div className={`nav-section-title ${sidebarCollapsed ? 'nav-section-title-collapsed' : ''}`}>
            Main
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link active">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
                  <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Dashboard
              </span>
            </a>
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                  <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Visualization
              </span>
            </a>
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Notifications
              </span>
              <div className={`nav-link-badge ${sidebarCollapsed ? 'nav-link-badge-collapsed' : ''}`}>
                3
              </div>
            </a>
          </div>
        </div>

        <div className="nav-section">
          <div className={`nav-section-title ${sidebarCollapsed ? 'nav-section-title-collapsed' : ''}`}>
            Management
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Users
              </span>
            </a>
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Editor Mode
              </span>
            </a>
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                View Mode
              </span>
            </a>
          </div>
        </div>

        <div className="nav-section">
          <div className={`nav-section-title ${sidebarCollapsed ? 'nav-section-title-collapsed' : ''}`}>
            Settings
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link">
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.692l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.291.159a1.873 1.873 0 0 0 2.693-1.115l.094-.319z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Settings
              </span>
            </a>
            <a href="#" className="nav-link" onClick={handleLogout}>
              <div className={`nav-link-icon ${sidebarCollapsed ? 'nav-link-icon-collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
              </div>
              <span className={`nav-link-text ${sidebarCollapsed ? 'nav-link-text-collapsed' : ''}`}>
                Logout
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'main-content-expanded' : ''}`}>
        {/* Dashboard Header */}
        <div className="dashboard-header">
          
          <div className="header-actions">
            <button className="header-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              <span className="notification-badge">3</span>
            </button>
            <button className="header-btn user-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => openCityModal(cityData[0])}>
            <div className="stat-header">
              <div className="stat-title">Total Population</div>
              <div className="stat-icon stat-icon-purple">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              </div>
            </div>
            <div className="stat-value">
              {cityData.reduce((sum, city) => sum + city.populationRaw, 0).toLocaleString()}
            </div>
            <div className="stat-description">
              <div className="trend-up">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                </svg>
                {(cityData.reduce((sum, city) => sum + city.growth, 0) / cityData.length).toFixed(1)}%
              </div>
              Average growth rate
            </div>
          </div>

          <div className="stat-card" onClick={() => openCityModal(cityData.find(city => city.traffic === Math.max(...cityData.map(c => c.traffic))))}>
            <div className="stat-header">
              <div className="stat-title">Traffic Index</div>
              <div className="stat-icon stat-icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.5 4a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5zm-3 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V5.5a.5.5 0 0 1 .5-.5zm-3 1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V6.5a.5.5 0 0 1 .5-.5zm-3 1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                  <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                </svg>
              </div>
            </div>
            <div className="stat-value">
              {Math.round(cityData.reduce((sum, city) => sum + city.traffic, 0) / cityData.length)}
            </div>
            <div className="stat-description">
              <div className="trend-up">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                </svg>
                5.2%
              </div>
              vs previous month
            </div>
          </div>

          <div className="stat-card" onClick={() => openCityModal(cityData.find(city => city.gdp === Math.max(...cityData.map(c => c.gdp))))}>
            <div className="stat-header">
              <div className="stat-title">Average GDP</div>
              <div className="stat-icon stat-icon-green">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                </svg>
              </div>
            </div>
            <div className="stat-value">
              ${Math.round(cityData.reduce((sum, city) => sum + city.gdp, 0) / cityData.length).toLocaleString()}
            </div>
            <div className="stat-description">
              <div className="trend-up">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                </svg>
                3.1%
              </div>
              vs previous month
            </div>
          </div>

          <div className="stat-card" onClick={() => openCityModal(cityData.find(city => city.growth === Math.max(...cityData.map(c => c.growth))))}>
            <div className="stat-header">
              <div className="stat-title">Highest Growth Rate</div>
              <div className="stat-icon stat-icon-amber">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                  <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
                </svg>
              </div>
            </div>
            <div className="stat-value">
              {Math.max(...cityData.map(city => city.growth)).toFixed(1)}%
            </div>
            <div className="stat-description">
              <div className="trend-up">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                </svg>
                {cityData.find(city => city.growth === Math.max(...cityData.map(c => c.growth)))?.name || 'N/A'}
              </div>
              Fastest growing city
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="charts-section">
          <div className="section-header">
            <h2 className="section-title">Performance Overview</h2>
            <div className="section-actions">
              <button 
                className={`section-btn ${chartType === 'population' ? 'active' : ''}`}
                onClick={() => setChartType('population')}
              >
                Population
              </button>
              <button 
                className={`section-btn ${chartType === 'traffic' ? 'active' : ''}`}
                onClick={() => setChartType('traffic')}
              >
                Traffic
              </button>
              <button 
                className={`section-btn ${chartType === 'growth' ? 'active' : ''}`}
                onClick={() => setChartType('growth')}
              >
                Growth
              </button>
              <button 
                className={`section-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`section-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`section-btn ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={timeSeriesData} options={chartOptions} />
          </div>
        </div>

        {/* Map and City List */}
        <div className="map-section">
          <div className="map-container">
            {selectedCity && (
              <MapContainer 
                center={[selectedCity.lat, selectedCity.lng]} 
                zoom={5} 
                style={{ height: '100%', width: '100%', minHeight: '400px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {allCities.map(city => (
                  <Marker 
                    key={city.id} 
                    position={[city.lat, city.lng]}
                    eventHandlers={{
                      click: () => {
                        setSelectedCity(city);
                      },
                    }}
                  >
                    <Popup>
                      <div>
                        <h3>{city.name}</h3>
                        <p>{city.country}</p>
                        <p>Population: {city.population}M</p>
                        <p>Growth Rate: {city.growth}%</p>
                        <button 
                          onClick={() => openCityModal(city)}
                          style={{
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <ChangeMapView center={[selectedCity.lat, selectedCity.lng]} />
              </MapContainer>
            )}
          </div>
          <div className="city-list">
            <div className="city-list-header">
              <h3 className="city-list-title">Cities</h3>
              <div className="city-search">
                <div className="city-search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search cities..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="city-list-content">
              {allCities.map(city => (
                <div 
                  key={city.id} 
                  className={`city-item ${city.id === selectedCity?.id ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  <div className="city-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    </svg>
                  </div>
                  <div className="city-info">
                    <div className="city-name">{city.name}</div>
                    <div className="city-data">{city.country} • Pop: {city.population}M</div>
                  </div>
                  <div className="city-action" onClick={(e) => {
                    e.stopPropagation();
                    openCityModal(city);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="charts-grid">
          <CustomizableChart 
            type="bar" 
            title="Population by City" 
            dataKey="population" 
            initialCityCount={10}
          />
          <CustomizableChart 
            type="line" 
            title="Traffic Index" 
            dataKey="traffic" 
            initialCityCount={10}
          />
          <CustomizableChart 
            type="bar" 
            title="Annual Growth Rate" 
            dataKey="growth" 
            initialCityCount={10}
          />
        </div>

        {/* D3 Visualization */}
        <div className="d3-container">
          <div className="section-header">
            <h2 className="section-title">Population Distribution</h2>
          </div>
          <CustomizableChart 
            type="bar" 
            title="Population Distribution" 
            dataKey="population" 
            initialCityCount={15}
          />
        </div>
      </div>

      {/* City Detail Modal */}
      <CityDetailModal 
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        city={selectedModalCity}
      />
    </div>
  );
}