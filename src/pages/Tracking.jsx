import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import {
    MapPin,
    Navigation,
    Activity,
    Users,
    Search as SearchIcon,
    Wifi,
    WifiOff,
    Smartphone,
    Mail,
    Clock
} from 'lucide-react';
import { getAllTechnicians } from '../services/technicianService';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../context/ThemeContext';
import { SOCKET_URL, API_URL } from '../utils';

// Fix for Broken Marker Icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper Component to Re-center Map
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

function Tracking() {
    const { isDark } = useTheme();
    // Map state
    const [lat, setLat] = useState(26.9124);
    const [lng, setLng] = useState(75.7873);
    const [position, setPosition] = useState([26.9124, 75.7873]);

    // Location fetch state
    const [address, setAddress] = useState('');
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // WebSocket state
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [realtimeLocations, setRealtimeLocations] = useState([]);
    const [wsStats, setWsStats] = useState(null);
    const { searchQuery } = useSearch();

    // Technician selection state
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);

    // Initialize WebSocket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            console.log('🔌 WebSocket connected');
            setConnected(true);
            toast.success('WebSocket connected!');
        });

        newSocket.on('tracking:connected', (data) => {
            console.log('✅ Tracking connected:', data);
            // Subscribe to all updates for testing
            newSocket.emit('tracking:subscribe:all');
            toast.success('Subscribed to all tracking updates');
        });

        newSocket.on('tracking:location:updated', (data) => {
            console.log('📍 Location update received:', data);

            // Add to realtime locations
            setRealtimeLocations(prev => {
                const filtered = prev.filter(loc => loc.technicianId !== data.technicianId);
                return [...filtered, data];
            });

            // Only update map position and show toast if this is the selected technician
            setSelectedTechnician(current => {
                if (current && current._id === data.technicianId) {
                    toast.success(`Location updated: ${data.technicianName}`, { id: 'loc-update' }); // Prevent toast spam
                    setPosition([data.latitude, data.longitude]);
                    setLat(data.latitude);
                    setLng(data.longitude);
                    setAddress(data.address || ''); // Ensure address is updated
                }
                return current;
            });
        });

        newSocket.on('tracking:error', (error) => {
            console.error('❌ Tracking error:', error);
            toast.error(`Error: ${error.message}`);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
            setConnected(false);
            toast.error('WebSocket disconnected');
        });

        setSocket(newSocket);

        // Fetch WebSocket stats every 5 seconds
        const statsInterval = setInterval(fetchWsStats, 5000);

        return () => {
            newSocket.close();
            clearInterval(statsInterval);
        };
    }, []);

    // Fetch all technicians on component mount
    useEffect(() => {
        const fetchTechnicians = async () => {
            setLoadingTechnicians(true);
            try {
                const response = await getAllTechnicians();
                if (response.success && response.data) {
                    setTechnicians(response.data);
                    // toast.success(`Loaded ${response.data.length} technicians`);
                }
            } catch (error) {
                console.error('Error fetching technicians:', error);
                toast.error('Failed to load technicians');
            } finally {
                setLoadingTechnicians(false);
            }
        };

        fetchTechnicians();
    }, []);

    // Handle technician selection
    const handleTechnicianSelect = (technicianId) => {
        if (!technicianId) {
            if (selectedTechnician && socket && connected) {
                socket.emit('tracking:unsubscribe:technician', { technicianId: selectedTechnician._id });
            }
            setSelectedTechnician(null);
            setRealtimeLocations([]);
            setAddress('');
            return;
        }

        // Don't re-subscribe if selecting the same technician
        if (selectedTechnician && selectedTechnician._id === technicianId) {
            return;
        }

        // Unsubscribe from previous technician
        if (selectedTechnician && socket && connected) {
            socket.emit('tracking:unsubscribe:technician', { technicianId: selectedTechnician._id });
        }

        // Clear existing data
        setRealtimeLocations([]);
        setAddress('');

        const technician = technicians.find(t => t._id === technicianId);
        setSelectedTechnician(technician);

        if (socket && connected) {
            // Subscribe to this specific technician's location updates
            socket.emit('tracking:subscribe:technician', { technicianId });
            toast.success(`Tracking ${technician.fullName || technician.username}`);
        }
    };

    // Fetch WebSocket statistics
    const fetchWsStats = async () => {
        try {
            const response = await fetch(`${API_URL}/tracking/ws/stats`);
            const data = await response.json();
            setWsStats(data.data);
        } catch (error) {
            console.error('Error fetching WS stats:', error);
        }
    };

    // Fetch location from coordinates using reverse geocoding
    const fetchLocationFromCoordinates = async () => {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            toast.error('Please enter a valid latitude (-90 to 90)');
            return;
        }

        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            toast.error('Please enter a valid longitude (-180 to 180)');
            return;
        }

        setFetchingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch location');
            }

            const data = await response.json();

            if (data.display_name) {
                setAddress(data.display_name);
                toast.success('Location fetched successfully!');
            } else {
                toast.error('No address found for these coordinates');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            toast.error('Failed to fetch location. Please try again.');
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleTrack = (e) => {
        e.preventDefault();
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            setPosition([latitude, longitude]);
            toast.success('Map updated to new coordinates');
        } else {
            toast.error('Please enter valid numbers');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 md:p-6 pb-24 md:pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-text flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-primary-500" />
                        Live Tracking
                    </h1>
                    <p className="text-dark-text-secondary mt-1">
                        Monitor technician locations in real-time
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${connected
                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span className="text-sm font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-120px)]">

                {/* Sidebar - Technicians List */}
                <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1 flex flex-col gap-4">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex flex-col h-[500px] lg:h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-dark-text flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                Technicians
                            </h2>
                            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                {technicians.length}
                            </span>
                        </div>

                        {loadingTechnicians ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-primary-400 gap-2">
                                <Activity className="w-8 h-8 animate-spin" />
                                <span className="text-sm">Loading technicians...</span>
                            </div>
                        ) : technicians.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-dark-text-tertiary gap-2">
                                <Users className="w-10 h-10 opacity-50" />
                                <span className="text-sm">No technicians found</span>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                {technicians.filter(t =>
                                    t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((tech) => {
                                    const isSelected = selectedTechnician && selectedTechnician._id === tech._id;
                                    const techLocation = realtimeLocations.find(loc => loc.technicianId === tech._id);

                                    // Use tech.contactNumber or tech.mobileNo depending on data structure. 
                                    // Based on previous file, it used tech.contactNumber || 'N/A'
                                    const contact = tech.contactNumber || tech.mobileNo || 'N/A';

                                    return (
                                        <div
                                            key={tech._id}
                                            onClick={() => handleTechnicianSelect(tech._id)}
                                            className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                                ? 'bg-gradient-to-br from-primary-500 to-accent-500 border-transparent shadow-lg shadow-primary-500/20 text-white'
                                                : 'bg-dark-bg border-dark-border hover:border-primary-500/50 text-dark-text hover:bg-dark-surface-hover'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-dark-text'}`}>
                                                    {tech.fullName}
                                                </span>
                                                {isSelected && (
                                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold text-white uppercase tracking-wider">
                                                        Tracking
                                                    </span>
                                                )}
                                                {!isSelected && techLocation && (
                                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className={`flex items-center gap-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-dark-text-secondary'}`}>
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{tech.email}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-dark-text-secondary'}`}>
                                                    <Smartphone className="w-3 h-3" />
                                                    <span>{contact}</span>
                                                </div>
                                            </div>

                                            {techLocation && (
                                                <div className={`mt-2 pt-2 border-t text-[10px] flex items-center gap-1.5 ${isSelected ? 'border-white/20 text-white/90' : 'border-dark-border text-dark-text-tertiary'
                                                    }`}>
                                                    <Clock className="w-3 h-3" />
                                                    Last seen: {new Date(techLocation.timestamp || Date.now()).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area - Map & Stats */}
                <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-6">

                    {/* Map Container */}
                    <div className="bg-dark-surface border border-dark-border rounded-2xl p-1 overflow-hidden h-[400px] lg:h-[600px] shadow-lg relative z-0">
                        <MapContainer
                            center={position}
                            zoom={13}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url={isDark
                                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                }
                            />

                            {/* Show all real-time locations on map */}
                            {realtimeLocations.map((loc, idx) => {
                                if (loc.latitude == null || loc.longitude == null) return null;
                                return (
                                    <Marker key={idx} position={[loc.latitude, loc.longitude]}>
                                        <Popup className="custom-popup">
                                            <div className="p-1">
                                                <strong className="block text-sm font-bold text-gray-800 mb-1">{loc.technicianName}</strong>
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    <p>Status: <span className="text-primary-600 font-medium">{loc.status}</span></p>
                                                    {loc.address && <p className="truncate max-w-[200px]">{loc.address}</p>}
                                                    <p className="text-gray-400">{new Date(loc.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                            <ChangeView center={position} />
                        </MapContainer>
                    </div>

                    {/* Stats & Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* WebSocket Stats */}
                        {wsStats && (
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-dark-text mb-4 uppercase tracking-wider text-primary-400">System Status</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-dark-border/50">
                                        <span className="text-sm text-dark-text-secondary">Active Connections</span>
                                        <span className="text-lg font-bold text-dark-text">{wsStats.totalConnections}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-dark-border/50">
                                        <span className="text-sm text-dark-text-secondary">Subscribers</span>
                                        <span className="text-lg font-bold text-dark-text">{wsStats.allSubscribers}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-dark-text-secondary">Technician Tracks</span>
                                        <span className="text-lg font-bold text-dark-text">{wsStats.technicianSubscriptions}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Controls */}
                    </div>

                    {/* Active Sessions List (if any) */}
                    {realtimeLocations.length > 0 && (
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-dark-text mb-4 uppercase tracking-wider text-primary-400">Live Updates</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {realtimeLocations.map((loc, idx) => (
                                    <div key={idx} className="bg-dark-bg border border-dark-border rounded-xl p-3 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                            <Navigation className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-dark-text truncate">{loc.technicianName}</p>
                                            <p className="text-xs text-dark-text-secondary truncate">
                                                {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Tracking;