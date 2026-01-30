import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { getAllTechnicians } from '../services/technicianService';

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

    // Real-time tracking state


    // Technician selection state
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);



    // Initialize WebSocket connection
    useEffect(() => {
        const newSocket = io('http://localhost:3000');

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
                    toast.success(`Location updated: ${data.technicianName}`);
                    setPosition([data.latitude, data.longitude]);
                    setLat(data.latitude);
                    setLng(data.longitude);
                    setAddress(data.address || '');
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
                    toast.success(`Loaded ${response.data.length} technicians`);
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
            const response = await fetch('http://localhost:3000/api/tracking/ws/stats');
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
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ color: '#333', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🗺️ Real-Time Location Tracker
                    <span style={{
                        fontSize: '14px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: connected ? 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)' : '#ccc',
                        color: 'white',
                        fontWeight: 'normal'
                    }}>
                        {connected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </h1>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                    Select a technician from the sidebar to track their real-time location
                </p>
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Sidebar - Technicians List */}
                <div style={{
                    width: '320px',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '20px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'sticky',
                    top: '20px'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <h2 style={{
                            color: '#667eea',
                            fontSize: '18px',
                            margin: '0 0 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            👨‍🔧 Technicians
                            <span style={{
                                fontSize: '12px',
                                padding: '2px 8px',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 'normal'
                            }}>
                                {technicians.length}
                            </span>
                        </h2>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                            Click to track a technician
                        </p>
                    </div>

                    {loadingTechnicians ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#667eea'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                            <div>Loading technicians...</div>
                        </div>
                    ) : technicians.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
                            <div>No technicians found</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {technicians.map((tech) => {
                                const isSelected = selectedTechnician && selectedTechnician._id === tech._id;
                                const techLocation = realtimeLocations.find(loc => loc.technicianId === tech._id);

                                return (
                                    <div
                                        key={tech._id}
                                        onClick={() => handleTechnicianSelect(tech._id)}
                                        style={{
                                            padding: '12px',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                                : 'white',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid #11998e' : '1px solid #ddd',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isSelected ? '0 4px 12px rgba(17, 153, 142, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                                            transform: isSelected ? 'translateY(-2px)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                                e.currentTarget.style.transform = 'none';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '6px'
                                        }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: isSelected ? 'white' : '#333',
                                                fontSize: '14px',
                                                flex: 1
                                            }}>
                                                {tech.fullName}
                                            </div>
                                            {isSelected && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    background: 'rgba(255,255,255,0.3)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    TRACKING
                                                </span>
                                            )}
                                            {!isSelected && techLocation && (
                                                <span style={{
                                                    fontSize: '16px',
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    🟢
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: isSelected ? 'rgba(255,255,255,0.9)' : '#666',
                                            marginBottom: '4px'
                                        }}>
                                            📧 {tech.email}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: isSelected ? 'rgba(255,255,255,0.9)' : '#666'
                                        }}>
                                            📱 {tech.contactNumber
                                                || 'N/A'}
                                        </div>
                                        {techLocation && (
                                            <div style={{
                                                marginTop: '8px',
                                                paddingTop: '8px',
                                                borderTop: isSelected
                                                    ? '1px solid rgba(255,255,255,0.3)'
                                                    : '1px solid #eee',
                                                fontSize: '11px',
                                                color: isSelected ? 'rgba(255,255,255,0.8)' : '#999'
                                            }}>
                                                📍 Last seen: {new Date(techLocation.timestamp || Date.now()).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* WebSocket Stats */}
                    {wsStats && (
                        <div style={{
                            padding: '15px',
                            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <strong style={{ color: '#667eea', fontSize: '16px' }}>📊 WebSocket Stats:</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                <div>
                                    <span style={{ color: '#666', fontSize: '14px' }}>Total Connections:</span>
                                    <strong style={{ color: '#333', fontSize: '18px', marginLeft: '8px' }}>{wsStats.totalConnections}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#666', fontSize: '14px' }}>All Subscribers:</span>
                                    <strong style={{ color: '#333', fontSize: '18px', marginLeft: '8px' }}>{wsStats.allSubscribers}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#666', fontSize: '14px' }}>Technician Subscriptions:</span>
                                    <strong style={{ color: '#333', fontSize: '18px', marginLeft: '8px' }}>{wsStats.technicianSubscriptions}</strong>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Input Form */}
                    <form onSubmit={handleTrack} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="number"
                                step="any"
                                placeholder="Latitude (e.g., 28.6139)"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                style={{ padding: '10px', width: '180px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Longitude (e.g., 77.2090)"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                style={{ padding: '10px', width: '180px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                📍 Update Map
                            </button>

                            <button
                                type="button"
                                onClick={fetchLocationFromCoordinates}
                                disabled={fetchingLocation}
                                style={{
                                    padding: '10px 20px',
                                    background: fetchingLocation ? '#ccc' : 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: fetchingLocation ? 'not-allowed' : 'pointer',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                {fetchingLocation ? '⏳ Fetching...' : '🔍 Fetch Address'}
                            </button>


                        </div>
                    </form>

                    {/* Address Display */}
                    {
                        address && (
                            <div style={{
                                maxWidth: '100%',
                                margin: '0 0 20px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                textAlign: 'left'
                            }}>
                                <strong style={{ color: '#667eea', fontSize: '16px' }}>📍 Address:</strong>
                                <p style={{ margin: '8px 0 0 0', color: '#333', fontSize: '14px' }}>{address}</p>
                            </div>
                        )
                    }

                    {/* Real-time Locations */}
                    {
                        realtimeLocations.length > 0 && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #00b4db15 0%, #0083b015 100%)',
                                border: '2px solid #00b4db',
                                borderRadius: '8px'
                            }}>
                                <strong style={{ color: '#00b4db', fontSize: '16px' }}>🔴 Real-time Updates ({realtimeLocations.length}):</strong>
                                <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                                    {realtimeLocations.map((loc, idx) => {
                                        const isSelected = selectedTechnician && loc.technicianId === selectedTechnician._id;
                                        return (
                                            <div key={idx} style={{
                                                padding: '10px',
                                                background: isSelected ? 'linear-gradient(135deg, #11998e15 0%, #38ef7d15 100%)' : 'white',
                                                borderRadius: '6px',
                                                border: isSelected ? '2px solid #11998e' : '1px solid #ddd',
                                                boxShadow: isSelected ? '0 2px 8px rgba(17, 153, 142, 0.2)' : 'none'
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {loc.technicianName}
                                                    {isSelected && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            padding: '2px 8px',
                                                            background: '#11998e',
                                                            color: 'white',
                                                            borderRadius: '10px'
                                                        }}>
                                                            TRACKING
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    📍 {loc.latitude?.toFixed(6) || 'N/A'}, {loc.longitude?.toFixed(6) || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    Status: <span style={{ color: loc.status === 'Active' ? '#00b4db' : '#999' }}>{loc.status}</span>
                                                </div>
                                                {loc.address && (
                                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                        {loc.address}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }

                    {/* Map Container */}
                    <div style={{ height: '500px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                        <MapContainer
                            center={position}
                            zoom={13}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />



                            {/* Show all real-time locations on map */}
                            {realtimeLocations.map((loc, idx) => {
                                if (loc.latitude == null || loc.longitude == null) return null;
                                return (
                                    <Marker key={idx} position={[loc.latitude, loc.longitude]}>
                                        <Popup>
                                            <strong>{loc.technicianName}</strong><br />
                                            Status: {loc.status}<br />
                                            {loc.address && <>{loc.address}<br /></>}
                                            <small style={{ color: '#666' }}>
                                                🕒 {new Date(loc.timestamp).toLocaleString()}
                                            </small>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            <ChangeView center={position} />
                        </MapContainer>
                    </div>

                    {/* Instructions */}
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🧪 How to Use Live Tracking:</h3>
                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                            <li><strong>Step 1 - Select a Technician:</strong>
                                <ul style={{ marginTop: '5px' }}>
                                    <li>Choose a technician from the sidebar on the left</li>
                                    <li>The system will automatically subscribe to their location updates</li>
                                    <li>You'll see "TRACKING" badge on the selected technician card</li>
                                </ul>
                            </li>
                            <li><strong>Step 2 - View Real-time Location:</strong>
                                <ul style={{ marginTop: '5px' }}>
                                    <li>When the selected technician sends location updates, the map will auto-update</li>
                                    <li>The selected technician's card will be highlighted in the "Real-time Updates" section</li>
                                    <li>Location coordinates and address will be displayed</li>
                                </ul>
                            </li>

                            <li>All technician locations appear on the map with markers</li>
                            <li>Open multiple browser tabs to test real-time synchronization</li>
                        </ol>
                        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                            💡 Tip: Make sure WebSocket is connected (green badge) before selecting a technician
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tracking;