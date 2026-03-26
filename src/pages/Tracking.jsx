import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import {
    MapPin, Navigation, Activity, Users, Wifi, WifiOff,
    Smartphone, Mail, Clock, ExternalLink, Radio, Signal,
    ChevronRight, Layers, Bug,
} from 'lucide-react';
import { getAllTechnicians } from '../services/technicianService';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../context/ThemeContext';
import { SOCKET_URL, API_URL } from '../utils';

/* ── Fix Leaflet default marker icons ───────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ── Custom green marker icon ────────────────────────────────────────────── */
const greenIcon = new L.DivIcon({
    className: '',
    html: `
        <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:linear-gradient(135deg,#4caf50,#8bc34a);
            transform:rotate(-45deg);
            box-shadow:0 4px 14px rgba(76,175,80,0.5);
            border:3px solid #fff;
        ">
            <div style="
                width:10px;height:10px;background:#fff;border-radius:50%;
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
            "></div>
        </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -40],
});

/* ── Re-center helper ────────────────────────────────────────────────────── */
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
    return null;
}

/* ── Open last known location in Google Maps ─────────────────────────────── */
const openInGoogleMaps = (lat, lng) => {
    if (lat == null || lng == null) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=16`, '_blank', 'noopener,noreferrer');
};

/* ── Relative time ───────────────────────────────────────────────────────── */
const relTime = (ts) => {
    if (!ts) return '—';
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60)   return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ── Theme tokens ────────────────────────────────────────────────────────── */
const T = {
    primary:     '#4caf50',
    accent:      '#8bc34a',
    primaryDark: '#388e3c',
    bg:          '#f9fafb',
    surface:     '#ffffff',
    surfaceAlt:  '#f0fdf4',
    border:      '#d1fae5',
    borderMid:   '#a7f3d0',
    text:        '#111827',
    textSub:     '#374151',
    textMuted:   '#6b7280',
    gradMain:    'linear-gradient(135deg,#4caf50 0%,#8bc34a 100%)',
    gradDark:    'linear-gradient(135deg,#388e3c 0%,#558b2f 100%)',
    gradLight:   'linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%)',
    shadow:      '0 4px 20px rgba(76,175,80,0.12)',
    shadowMd:    '0 6px 28px rgba(76,175,80,0.20)',
    shadowLg:    '0 10px 40px rgba(76,175,80,0.28)',
};

/* ── Stat pill ───────────────────────────────────────────────────────────── */
const StatPill = ({ label, value }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:1, minWidth:70 }}>
        <span style={{ fontSize:22, fontWeight:900, color:T.primary, lineHeight:1 }}>{value ?? '—'}</span>
        <span style={{ fontSize:10, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>{label}</span>
    </div>
);

/* ── Google Maps Button ──────────────────────────────────────────────────── */
const MapsBtn = ({ lat, lng, name = '', size = 'sm', extraStyle = {} }) => {
    const lg = size === 'lg';
    return (
        <button
            onClick={(e) => { e.stopPropagation(); openInGoogleMaps(lat, lng); }}
            title={`Open ${name} in Google Maps`}
            style={{
                display:'flex', alignItems:'center', gap: lg ? 6 : 4,
                padding: lg ? '8px 16px' : '4px 9px',
                borderRadius: lg ? 12 : 8, border:'none', cursor:'pointer',
                background: lg ? T.surface : 'rgba(76,175,80,0.12)',
                color: lg ? T.primaryDark : T.primaryDark,
                fontSize: lg ? 13 : 10, fontWeight:800,
                boxShadow: lg ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                transition:'all .15s ease',
                ...extraStyle
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = lg ? T.surfaceAlt : 'rgba(76,175,80,0.22)';
                e.currentTarget.style.transform  = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = lg ? T.surface : 'rgba(76,175,80,0.12)';
                e.currentTarget.style.transform  = 'translateY(0)';
            }}
        >
            <MapPin style={{ width: lg ? 14 : 10, height: lg ? 14 : 10 }} />
            {lg ? 'Open in Google Maps' : 'Maps'}
            <ExternalLink style={{ width: lg ? 12 : 9, height: lg ? 12 : 9, opacity:.7 }} />
        </button>
    );
};

/* ── Technician card ─────────────────────────────────────────────────────── */
const TechCard = ({ tech, isSelected, techLocation, onClick }) => {
    const contact = tech.contactNumber || tech.mobileNo || 'N/A';
    const hasLive  = !!techLocation;
    const initial  = (tech.fullName || tech.username || '?')[0].toUpperCase();

    return (
        <div
            onClick={onClick}
            style={{
                padding:'12px 14px', borderRadius:14, cursor:'pointer',
                border:`1.5px solid ${isSelected ? 'transparent' : hasLive ? T.borderMid : T.border}`,
                background: isSelected ? T.gradMain : hasLive ? T.surfaceAlt : T.surface,
                boxShadow: isSelected ? T.shadowMd : '0 1px 4px rgba(0,0,0,0.04)',
                transition:'all .2s ease', position:'relative', overflow:'hidden',
            }}
        >
            {isSelected && (
                <div style={{
                    position:'absolute', top:0, left:0, right:0, height:2,
                    background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)',
                    animation:'shimmer 2s infinite'
                }} />
            )}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                        width:32, height:32, borderRadius:'50%',
                        background: isSelected ? 'rgba(255,255,255,0.25)' : T.gradMain,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:13, fontWeight:900, color:'#fff', flexShrink:0,
                    }}>{initial}</div>
                    <span style={{
                        fontWeight:700, fontSize:13,
                        color: isSelected ? '#fff' : T.text,
                        maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>{tech.fullName || tech.username}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {hasLive && !isSelected && (
                        <span style={{
                            width:8, height:8, borderRadius:'50%', background:T.primary,
                            boxShadow:`0 0 0 3px rgba(76,175,80,0.2)`, display:'inline-block',
                            animation:'pulseDot 1.5s ease-in-out infinite'
                        }} />
                    )}
                    {isSelected && (
                        <span style={{
                            fontSize:9, fontWeight:900, background:'rgba(255,255,255,0.25)',
                            color:'#fff', padding:'2px 8px', borderRadius:20,
                            letterSpacing:'0.1em', textTransform:'uppercase'
                        }}>LIVE</span>
                    )}
                    <ChevronRight style={{ width:13, height:13, color: isSelected ? 'rgba(255,255,255,0.5)' : T.borderMid }} />
                </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {[{ Icon:Mail, val:tech.email }, { Icon:Smartphone, val:contact }].map((item) => (
                    <div key={item.val} style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <item.Icon style={{ width:11, height:11, color: isSelected ? 'rgba(255,255,255,0.6)' : T.textMuted, flexShrink:0 }} />
                        <span style={{ fontSize:11, color: isSelected ? 'rgba(255,255,255,0.75)' : T.textSub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {item.val}
                        </span>
                    </div>
                ))}
            </div>

            {techLocation && (
                <div style={{
                    marginTop:10, paddingTop:8,
                    borderTop:`1px solid ${isSelected ? 'rgba(255,255,255,0.2)' : T.border}`,
                    display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Clock style={{ width:10, height:10, color: isSelected ? 'rgba(255,255,255,0.5)' : T.textMuted }} />
                        <span style={{ fontSize:10, color: isSelected ? 'rgba(255,255,255,0.65)' : T.textMuted }}>
                            {relTime(techLocation.timestamp)}
                        </span>
                    </div>
                    <MapsBtn
                        lat={techLocation.latitude}
                        lng={techLocation.longitude}
                        name={tech.fullName || tech.username}
                        extraStyle={isSelected ? { background:'rgba(255,255,255,0.2)', color:'#fff' } : {}}
                    />
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════ */
function Tracking() {
    const { isDark }      = useTheme();
    const { searchQuery } = useSearch();

    const [position,            setPosition]            = useState([26.9124, 75.7873]);
    const [socket,              setSocket]              = useState(null);
    const [connected,           setConnected]           = useState(false);
    const [realtimeLocations,   setRealtimeLocations]   = useState([]);
    const [wsStats,             setWsStats]             = useState(null);
    const [technicians,         setTechnicians]         = useState([]);
    const [selectedTechnician,  setSelectedTechnician]  = useState(null);
    const [loadingTechnicians,  setLoadingTechnicians]  = useState(false);

    useEffect(() => {
        const s = io(SOCKET_URL);
        s.on('connect',              ()    => { setConnected(true);  toast.success('WebSocket connected!'); });
        s.on('tracking:connected',   ()    => { s.emit('tracking:subscribe:all'); });
        s.on('tracking:location:updated', (data) => {
            setRealtimeLocations(prev => [...prev.filter(l => l.technicianId !== data.technicianId), data]);
            setSelectedTechnician(cur => {
                if (cur && cur._id === data.technicianId) {
                    toast.success(`📍 ${data.technicianName} updated`, { id:'loc-upd' });
                    setPosition([data.latitude, data.longitude]);
                }
                return cur;
            });
        });
        s.on('tracking:error',  e  => toast.error(e.message));
        s.on('disconnect',      ()    => { setConnected(false); toast.error('WebSocket disconnected'); });
        
        setSocket(s);
        
        const iv = setInterval(async () => {
            try { 
                const r = await fetch(`${API_URL}/tracking/ws/stats`); 
                const d = await r.json(); 
                setWsStats(d.data); 
            } catch {
                /* Ignore */
            }
        }, 5000);
        return () => { s.close(); clearInterval(iv); };
    }, []);

    useEffect(() => {
        setLoadingTechnicians(true);
        getAllTechnicians()
            .then(r => { if (r.success && r.data) setTechnicians(r.data); })
            .catch(() => toast.error('Failed to load technicians'))
            .finally(() => setLoadingTechnicians(false));
    }, []);

    const handleSelect = (id) => {
        if (!id) {
            if (selectedTechnician && socket && connected)
                socket.emit('tracking:unsubscribe:technician', { technicianId: selectedTechnician._id });
            setSelectedTechnician(null); setRealtimeLocations([]); return;
        }
        if (selectedTechnician?._id === id) return;
        if (selectedTechnician && socket && connected)
            socket.emit('tracking:unsubscribe:technician', { technicianId: selectedTechnician._id });
        setRealtimeLocations([]);
        const t = technicians.find(x => x._id === id);
        setSelectedTechnician(t);
        if (socket && connected) {
            socket.emit('tracking:subscribe:technician', { technicianId: id });
            toast.success(`Tracking ${t.fullName || t.username}`);
        }
    };

    const filtered    = technicians.filter(t =>
        t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedLoc = selectedTechnician
        ? realtimeLocations.find(l => l.technicianId === selectedTechnician._id)
        : null;

    return (
        <>
        <style>{`
            @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
            @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
            @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            @keyframes spin     { to{transform:rotate(360deg)} }
            @keyframes breathe  { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.4)} 50%{box-shadow:0 0 0 8px rgba(255,255,255,0)} }

            .track-page       { animation:fadeUp .35s ease; }
            .tc-enter         { animation:fadeUp .25s ease both; }
            .track-scroll::-webkit-scrollbar       { width:4px; }
            .track-scroll::-webkit-scrollbar-track { background:transparent; }
            .track-scroll::-webkit-scrollbar-thumb { background:#a7f3d0; border-radius:4px; }

            .leaflet-popup-content-wrapper {
                border-radius:16px !important;
                box-shadow:0 8px 30px rgba(76,175,80,0.2) !important;
                border:1.5px solid #d1fae5 !important;
                padding:0 !important;
                overflow:hidden;
            }
            .leaflet-popup-content { margin:0 !important; width:auto !important; }
            .leaflet-popup-tip     { background:#fff !important; }
        `}</style>

        <div className="track-page" style={{ padding:'24px 20px 96px', maxWidth:1440, margin:'0 auto' }}>

            {/* ── HEADER ─────────────────────────────────────────────── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{
                        width:48, height:48, borderRadius:14,
                        background:T.gradMain,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow:T.shadowMd, flexShrink:0
                    }}>
                        <Bug style={{ width:22, height:22, color:'#fff' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize:24, fontWeight:900, color:T.text, margin:0, letterSpacing:'-0.02em' }}>
                            Live Tracking
                        </h1>
                        <p style={{ fontSize:13, color:T.textMuted, margin:0, marginTop:2 }}>
                            Monitor technician locations in real-time
                        </p>
                    </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    {wsStats && (
                        <div style={{
                            display:'flex', gap:20, alignItems:'center',
                            background:T.surfaceAlt, border:`1.5px solid ${T.border}`,
                            borderRadius:14, padding:'8px 20px'
                        }}>
                            <StatPill label="Connections" value={wsStats.totalConnections} />
                            <div style={{ width:1, height:32, background:T.border }} />
                            <StatPill label="Subscribers"  value={wsStats.allSubscribers} />
                            <div style={{ width:1, height:32, background:T.border }} />
                            <StatPill label="Tracked"      value={wsStats.technicianSubscriptions} />
                        </div>
                    )}

                    <div style={{
                        display:'flex', alignItems:'center', gap:7,
                        padding:'8px 16px', borderRadius:24,
                        background: connected ? 'rgba(76,175,80,0.1)' : 'rgba(239,68,68,0.08)',
                        border:`1.5px solid ${connected ? 'rgba(76,175,80,0.3)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                        {connected
                            ? <Signal  style={{ width:14, height:14, color:T.primary }} />
                            : <WifiOff style={{ width:14, height:14, color:'#ef4444' }} />
                        }
                        <span style={{ fontSize:12, fontWeight:800, color: connected ? T.primaryDark : '#dc2626' }}>
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                        {connected && <span style={{ width:7, height:7, borderRadius:'50%', background:T.primary, display:'inline-block', animation:'pulseDot 1.5s infinite' }} />}
                    </div>
                </div>
            </div>

            {/* ── BODY ───────────────────────────────────────────────── */}
            <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>

                {/* ── SIDEBAR ─────────────────────────────────────────── */}
                <div style={{
                    width:290, flexShrink:0, background:T.surface, borderRadius:20,
                    border:`1.5px solid ${T.border}`, overflow:'hidden',
                    boxShadow:T.shadow, display:'flex', flexDirection:'column',
                    minHeight:560, maxHeight:740,
                }}>
                    <div style={{
                        padding:'14px 16px 12px', borderBottom:`1px solid ${T.border}`,
                        background:T.surfaceAlt,
                        display:'flex', justifyContent:'space-between', alignItems:'center'
                    }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <Users style={{ width:15, height:15, color:T.primary }} />
                            <span style={{ fontSize:13, fontWeight:800, color:T.text }}>Technicians</span>
                        </div>
                        <div style={{
                            background:T.gradMain, color:'#fff',
                            fontSize:11, fontWeight:900, padding:'2px 10px',
                            borderRadius:20, minWidth:24, textAlign:'center'
                        }}>{technicians.length}</div>
                    </div>

                    <div className="track-scroll" style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
                        {loadingTechnicians ? (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, gap:10 }}>
                                <Activity style={{ width:26, height:26, color:T.primary, animation:'spin 1s linear infinite' }} />
                                <span style={{ fontSize:13, color:T.textMuted }}>Loading technicians…</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, gap:8 }}>
                                <Users style={{ width:36, height:36, color:T.border }} />
                                <span style={{ fontSize:13, color:T.textMuted }}>No technicians found</span>
                            </div>
                        ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                {filtered.map((tech, i) => (
                                    <div key={tech._id} className="tc-enter" style={{ animationDelay:`${i*35}ms` }}>
                                        <TechCard
                                            tech={tech}
                                            isSelected={selectedTechnician?._id === tech._id}
                                            techLocation={realtimeLocations.find(l => l.technicianId === tech._id)}
                                            onClick={() => handleSelect(tech._id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────── */}
                <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>

                    {/* Selected banner */}
                    {selectedTechnician && (
                        <div style={{
                            background:T.gradMain, borderRadius:18, padding:'14px 20px',
                            display:'flex', justifyContent:'space-between', alignItems:'center',
                            boxShadow:T.shadowLg, flexWrap:'wrap', gap:12,
                            animation:'fadeUp .25s ease', position:'relative', overflow:'hidden'
                        }}>
                            <div style={{
                                position:'absolute', top:0, left:0, right:0, bottom:0,
                                background:'linear-gradient(90deg,transparent 25%,rgba(255,255,255,0.07) 50%,transparent 75%)',
                                animation:'shimmer 3s infinite'
                            }} />

                            <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative' }}>
                                <div style={{
                                    width:42, height:42, borderRadius:'50%',
                                    background:'rgba(255,255,255,0.22)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    fontSize:17, fontWeight:900, color:'#fff',
                                    animation:'breathe 3s ease-in-out infinite'
                                }}>
                                    {(selectedTechnician.fullName||selectedTechnician.username||'?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ margin:0, fontWeight:900, fontSize:15, color:'#fff' }}>
                                        {selectedTechnician.fullName || selectedTechnician.username}
                                    </p>
                                    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:2, fontFamily:'monospace' }}>
                                        {selectedLoc
                                            ? `${selectedLoc.latitude?.toFixed(5)},  ${selectedLoc.longitude?.toFixed(5)}`
                                            : 'Awaiting location update…'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', position:'relative' }}>
                                {selectedLoc && (
                                    <>
                                        <div style={{
                                            background:'rgba(255,255,255,0.15)', borderRadius:10,
                                            padding:'6px 12px', display:'flex', alignItems:'center', gap:5
                                        }}>
                                            <Clock style={{ width:12, height:12, color:'rgba(255,255,255,0.8)' }} />
                                            <span style={{ fontSize:12, color:'rgba(255,255,255,0.9)', fontWeight:700 }}>
                                                Updated {relTime(selectedLoc.timestamp)}
                                            </span>
                                        </div>
                                        <MapsBtn
                                            lat={selectedLoc.latitude}
                                            lng={selectedLoc.longitude}
                                            name={selectedTechnician.fullName || selectedTechnician.username}
                                            size="lg"
                                        />
                                    </>
                                )}
                                <button
                                    onClick={() => handleSelect(null)}
                                    style={{
                                        padding:'7px 14px', borderRadius:10,
                                        border:'1.5px solid rgba(255,255,255,0.3)',
                                        background:'transparent', cursor:'pointer',
                                        fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.85)',
                                        transition:'all .15s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                >
                                    Stop Tracking
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── MAP ─────────────────────────────────────────── */}
                    <div style={{
                        borderRadius:20, overflow:'hidden', height:480,
                        position:'relative', zIndex:0,
                        border:`1.5px solid ${T.border}`,
                        boxShadow:T.shadow,
                    }}>
                        {/* Floating badge */}
                        <div style={{
                            position:'absolute', top:14, left:14, zIndex:999,
                            background:'rgba(255,255,255,0.93)', backdropFilter:'blur(8px)',
                            borderRadius:10, padding:'6px 12px',
                            display:'flex', alignItems:'center', gap:6,
                            border:`1px solid ${T.border}`,
                            boxShadow:'0 2px 12px rgba(76,175,80,0.12)'
                        }}>
                            <Layers style={{ width:13, height:13, color:T.primary }} />
                            <span style={{ fontSize:11, fontWeight:700, color:T.text }}>
                                {realtimeLocations.length > 0
                                    ? `${realtimeLocations.length} live marker${realtimeLocations.length > 1 ? 's' : ''}`
                                    : 'No live markers'}
                            </span>
                            {realtimeLocations.length > 0 && (
                                <span style={{ width:7, height:7, borderRadius:'50%', background:T.primary, display:'inline-block', animation:'pulseDot 1.5s infinite' }} />
                            )}
                        </div>

                        <MapContainer
                            center={position} zoom={13} scrollWheelZoom
                            style={{ height:'100%', width:'100%', zIndex:0 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url={isDark
                                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                }
                            />
                            {realtimeLocations.map((loc) => {
                                if (loc.latitude == null || loc.longitude == null) return null;
                                return (
                                    <Marker key={loc.technicianId} position={[loc.latitude, loc.longitude]} icon={greenIcon}>
                                        <Popup>
                                            <div style={{ padding:'14px 16px', minWidth:210 }}>
                                                {/* Popup header */}
                                                <div style={{
                                                    display:'flex', alignItems:'center', gap:8,
                                                    marginBottom:10, paddingBottom:10,
                                                    borderBottom:`1px solid ${T.border}`
                                                }}>
                                                    <div style={{
                                                        width:32, height:32, borderRadius:'50%',
                                                        background:T.gradMain, flexShrink:0,
                                                        display:'flex', alignItems:'center', justifyContent:'center',
                                                        fontSize:13, fontWeight:900, color:'#fff'
                                                    }}>
                                                        {(loc.technicianName||'?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong style={{ fontSize:13, fontWeight:800, color:T.text, display:'block' }}>
                                                            {loc.technicianName}
                                                        </strong>
                                                        {loc.status && (
                                                            <span style={{
                                                                fontSize:10, fontWeight:700, color:T.primaryDark,
                                                                background:'rgba(76,175,80,0.12)',
                                                                padding:'1px 7px', borderRadius:10
                                                            }}>{loc.status}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Coordinates */}
                                                <div style={{
                                                    background:T.surfaceAlt, borderRadius:8, padding:'6px 10px',
                                                    marginBottom:8, fontFamily:'monospace', fontSize:11,
                                                    color:T.textSub, letterSpacing:'-0.01em'
                                                }}>
                                                    📍 {loc.latitude?.toFixed(5)},  {loc.longitude?.toFixed(5)}
                                                </div>

                                                {loc.address && (
                                                    <p style={{ margin:'0 0 8px', fontSize:11, color:T.textMuted, lineHeight:1.5 }}>
                                                        {loc.address}
                                                    </p>
                                                )}

                                                <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:T.textMuted, marginBottom:10 }}>
                                                    <Clock style={{ width:10, height:10 }} />
                                                    {relTime(loc.timestamp)}
                                                </div>

                                                {/* Google Maps CTA */}
                                                <button
                                                    onClick={() => openInGoogleMaps(loc.latitude, loc.longitude)}
                                                    style={{
                                                        width:'100%', padding:'9px 0',
                                                        background:T.gradMain, border:'none',
                                                        borderRadius:10, cursor:'pointer',
                                                        color:'#fff', fontSize:12, fontWeight:800,
                                                        display:'flex', alignItems:'center',
                                                        justifyContent:'center', gap:6,
                                                        boxShadow:'0 4px 12px rgba(76,175,80,0.35)',
                                                        transition:'all .15s ease'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background=T.gradDark}
                                                    onMouseLeave={e => e.currentTarget.style.background=T.gradMain}
                                                >
                                                    <MapPin style={{ width:13, height:13 }} />
                                                    Open in Google Maps
                                                    <ExternalLink style={{ width:11, height:11, opacity:.8 }} />
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                            <ChangeView center={position} />
                        </MapContainer>
                    </div>

                    {/* ── LIVE UPDATES GRID ────────────────────────────── */}
                    {realtimeLocations.length > 0 && (
                        <div style={{
                            background:T.surface, borderRadius:20,
                            border:`1.5px solid ${T.border}`, padding:'18px 20px',
                            boxShadow:T.shadow, animation:'fadeUp .3s ease'
                        }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Radio style={{ width:15, height:15, color:T.primary }} />
                                    <span style={{ fontSize:12, fontWeight:900, color:T.text, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                                        Live Updates
                                    </span>
                                </div>
                                <span style={{
                                    background:'rgba(76,175,80,0.1)', color:T.primaryDark,
                                    fontSize:11, fontWeight:800, padding:'2px 10px', borderRadius:20,
                                    border:`1px solid rgba(76,175,80,0.2)`
                                }}>{realtimeLocations.length} active</span>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:10 }}>
                                {realtimeLocations.map((loc) => (
                                    <div key={loc.technicianId} style={{
                                        background:T.surfaceAlt, borderRadius:14,
                                        border:`1px solid ${T.border}`, padding:'12px 14px',
                                        display:'flex', flexDirection:'column', gap:8
                                    }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <div style={{
                                                width:30, height:30, borderRadius:'50%',
                                                background:T.gradMain, flexShrink:0,
                                                display:'flex', alignItems:'center', justifyContent:'center'
                                            }}>
                                                <Navigation style={{ width:13, height:13, color:'#fff' }} />
                                            </div>
                                            <div style={{ minWidth:0 }}>
                                                <p style={{ margin:0, fontSize:12, fontWeight:700, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                    {loc.technicianName}
                                                </p>
                                                <p style={{ margin:0, fontSize:10, color:T.textMuted, fontFamily:'monospace' }}>
                                                    {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                            <span style={{ fontSize:10, color:T.textMuted, display:'flex', alignItems:'center', gap:3 }}>
                                                <Clock style={{ width:9, height:9 }} />
                                                {relTime(loc.timestamp)}
                                            </span>
                                            <MapsBtn lat={loc.latitude} lng={loc.longitude} name={loc.technicianName} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default Tracking;