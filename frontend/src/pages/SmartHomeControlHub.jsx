import React, { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Thermometer, Fan, Plug, Home, Search, RotateCcw, Moon, Sun, Power, ChevronUp, ChevronDown, Trash2, Plus, Menu, User, Mail, MapPin, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { toast } from '../hooks/use-toast';

// Mock Data
const initialDevices = [
  { id: 'dev-1', name: 'Main Light', type: 'light', status: 'off', brightness: 80 },
  { id: 'dev-2', name: 'Ceiling Light', type: 'light', status: 'off', brightness: 100 },
  { id: 'dev-3', name: 'Reading Lamp', type: 'light', status: 'off', brightness: 60 },
  { id: 'dev-4', name: 'Main Thermostat', type: 'thermostat', status: 'off', temperature: 72 },
  { id: 'dev-5', name: 'Bedroom AC', type: 'thermostat', status: 'off', temperature: 68 },
  { id: 'dev-6', name: 'Ceiling Fan', type: 'fan', status: 'off', speed: 2 },
  { id: 'dev-7', name: 'Desk Fan', type: 'fan', status: 'off', speed: 1 },
  { id: 'dev-8', name: 'Coffee Maker', type: 'plug', status: 'off' },
  { id: 'dev-9', name: 'TV', type: 'plug', status: 'off' },
  { id: 'dev-10', name: 'Phone Charger', type: 'plug', status: 'off' },
  { id: 'dev-11', name: 'Kitchen Light', type: 'light', status: 'off', brightness: 90 },
  { id: 'dev-12', name: 'Workspace Light', type: 'light', status: 'off', brightness: 85 },
];

const initialRooms = [
  { 
    id: 'room-1', 
    name: 'Living Room', 
    color: '#450693', 
    devices: [
      { id: 'dev-1', name: 'Main Light', type: 'light', status: 'on', brightness: 80 },
      { id: 'dev-9', name: 'TV', type: 'plug', status: 'on' }
    ] 
  },
  { 
    id: 'room-2', 
    name: 'Office', 
    color: '#8C00FF', 
    devices: [
      { id: 'dev-12', name: 'Workspace Light', type: 'light', status: 'on', brightness: 85 },
      { id: 'dev-7', name: 'Desk Fan', type: 'fan', status: 'off', speed: 1 }
    ] 
  },
  { 
    id: 'room-3', 
    name: 'Bedroom', 
    color: '#FF3F7F', 
    devices: [
      { id: 'dev-3', name: 'Reading Lamp', type: 'light', status: 'on', brightness: 60 },
      { id: 'dev-5', name: 'Bedroom AC', type: 'thermostat', status: 'off', temperature: 68 }
    ] 
  },
  { 
    id: 'room-4', 
    name: 'Kitchen', 
    color: '#FFC400', 
    devices: [
      { id: 'dev-11', name: 'Kitchen Light', type: 'light', status: 'on', brightness: 90 },
      { id: 'dev-8', name: 'Coffee Maker', type: 'plug', status: 'off' }
    ] 
  },
];

const STORAGE_KEY = 'smart-home-state';
const THEME_KEY = 'smart-home-theme';

const DeviceIcon = ({ type, className }) => {
  const iconProps = { className: className || 'w-5 h-5' };
  switch (type) {
    case 'light':
      return <Lightbulb {...iconProps} />;
    case 'thermostat':
      return <Thermometer {...iconProps} />;
    case 'fan':
      return <Fan {...iconProps} />;
    case 'plug':
      return <Plug {...iconProps} />;
    default:
      return <Home {...iconProps} />;
  }
};

const DeviceCard = ({ device, onUpdate, onRemove, isDragging, inRoom, roomColor, theme }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('deviceId', device.id);
  };

  const toggleDevice = () => {
    onUpdate({ ...device, status: device.status === 'on' ? 'off' : 'on' });
  };

  const updateBrightness = (value) => {
    onUpdate({ ...device, brightness: value[0] });
  };

  const updateTemperature = (value) => {
    onUpdate({ ...device, temperature: value[0] });
  };

  const updateSpeed = (direction) => {
    const newSpeed = direction === 'up' 
      ? Math.min(3, (device.speed || 1) + 1)
      : Math.max(1, (device.speed || 1) - 1);
    onUpdate({ ...device, speed: newSpeed });
  };

  const iconBgColor = device.status === 'on' && roomColor ? roomColor : (theme === 'dark' ? '#374151' : '#f3f4f6');
  const ringColor = device.status === 'on' && roomColor ? roomColor : '';
  
  // Glowing effect for lights in dark mode
  const isLightOn = device.type === 'light' && device.status === 'on';
  const glowStyle = isLightOn && theme === 'dark' ? {
    filter: 'drop-shadow(0 0 8px rgba(255, 223, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 223, 0, 0.6))',
  } : {};

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        relative group rounded-xl p-4 shadow-sm border transition-all duration-300 cursor-move overflow-hidden
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        hover:shadow-md
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={device.status === 'on' && roomColor ? { boxShadow: `0 0 0 2px ${roomColor}` } : {}}
      aria-label={`${device.name} - ${device.type} - ${device.status}`}
    >
      {/* Colored top border for devices in rooms */}
      {inRoom && roomColor && (
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: roomColor }}
        />
      )}
      {inRoom && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          aria-label="Remove device from room"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-all duration-300"
            style={{ 
              backgroundColor: iconBgColor,
              color: device.status === 'on' ? '#ffffff' : (theme === 'dark' ? '#9ca3af' : '#4b5563'),
              ...glowStyle
            }}
          >
            <DeviceIcon type={device.type} />
          </div>
          <div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{device.name}</h4>
            <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{device.type}</p>
          </div>
        </div>
        <Switch
          checked={device.status === 'on'}
          onCheckedChange={toggleDevice}
          aria-label={`Toggle ${device.name}`}
        />
      </div>

      {device.status === 'on' && (
        <div className={`mt-4 pt-4 border-t space-y-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          {device.type === 'light' && (
            <div>
              <div className={`flex justify-between text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Brightness</span>
                <span className="font-medium">{device.brightness}%</span>
              </div>
              <Slider
                value={[device.brightness]}
                onValueChange={updateBrightness}
                min={0}
                max={100}
                step={1}
                className="w-full"
                aria-label="Brightness control"
              />
            </div>
          )}

          {device.type === 'thermostat' && (
            <div>
              <div className={`flex justify-between text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Temperature</span>
                <span className="font-medium">{device.temperature}°F</span>
              </div>
              <Slider
                value={[device.temperature]}
                onValueChange={updateTemperature}
                min={60}
                max={80}
                step={1}
                className="w-full"
                aria-label="Temperature control"
              />
            </div>
          )}

          {device.type === 'fan' && (
            <div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Speed</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => updateSpeed('down')}
                    disabled={device.speed <= 1}
                    aria-label="Decrease fan speed"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <span className={`text-sm font-medium w-8 text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{device.speed}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => updateSpeed('up')}
                    disabled={device.speed >= 3}
                    aria-label="Increase fan speed"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RoomPanel = ({ room, devices, onDrop, onUpdateDevice, onRemoveDevice, theme }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const deviceId = e.dataTransfer.getData('deviceId');
    if (deviceId) {
      onDrop(room.id, deviceId);
    }
  };

  return (
    <Card
      className={`transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
      style={isOver ? { boxShadow: `0 0 0 4px ${room.color}`, transform: 'scale(1.02)' } : {}}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: room.color }}
          />
          <span className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{room.name}</span>
          <span className={`text-sm font-normal ml-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {devices.length} {devices.length === 1 ? 'device' : 'devices'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 min-h-[200px]">
          {devices.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-[200px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <Plus className="w-8 h-8 mb-2" />
              <p className="text-sm">Drag devices here</p>
            </div>
          ) : (
            devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onUpdate={onUpdateDevice}
                onRemove={() => onRemoveDevice(room.id, device.id)}
                inRoom
                roomColor={room.color}
                theme={theme}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SmartHomeControlHub = () => {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedDevice, setDraggedDevice] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { devices: savedDevices, rooms: savedRooms } = JSON.parse(savedState);
        setDevices(savedDevices);
        setRooms(savedRooms);
      } catch (error) {
        console.error('Failed to load saved state:', error);
        setDevices(initialDevices);
        setRooms(initialRooms);
      }
    } else {
      setDevices(initialDevices);
      setRooms(initialRooms);
    }
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Save state to localStorage
  useEffect(() => {
    if (devices.length > 0 || rooms.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ devices, rooms }));
    }
  }, [devices, rooms]);

  // Get available devices (not assigned to any room)
  const availableDevices = useMemo(() => {
    const assignedDeviceIds = rooms.flatMap(room => room.devices.map(d => d.id));
    return devices.filter(device => !assignedDeviceIds.includes(device.id));
  }, [devices, rooms]);

  // Filter available devices by search query
  const filteredAvailableDevices = useMemo(() => {
    if (!searchQuery) return availableDevices;
    return availableDevices.filter(device =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableDevices, searchQuery]);

  const updateDevice = (updatedDevice) => {
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setRooms(prev => prev.map(room => ({
      ...room,
      devices: room.devices.map(d => d.id === updatedDevice.id ? updatedDevice : d)
    })));
  };

  const handleDrop = (roomId, deviceId) => {
    // Find the device
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Remove device from all rooms first
    const updatedRooms = rooms.map(room => ({
      ...room,
      devices: room.devices.filter(d => d.id !== deviceId)
    }));

    // Add device to the target room
    const finalRooms = updatedRooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          devices: [...room.devices, device]
        };
      }
      return room;
    });

    setRooms(finalRooms);
    
    const targetRoom = finalRooms.find(r => r.id === roomId);
    toast({
      title: 'Device assigned',
      description: `${device.name} moved to ${targetRoom.name}`,
    });
  };

  const removeDeviceFromRoom = (roomId, deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    const room = rooms.find(r => r.id === roomId);
    
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          devices: r.devices.filter(d => d.id !== deviceId)
        };
      }
      return r;
    }));

    toast({
      title: 'Device removed',
      description: `${device.name} removed from ${room.name}`,
    });
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDevices(initialDevices);
    setRooms(initialRooms);
    setResetDialogOpen(false);
    toast({
      title: 'Dashboard reset',
      description: 'All devices and room assignments have been restored to defaults',
    });
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`border-b shadow-sm sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <SheetHeader>
                    <SheetTitle className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>Profile</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: '#450693' }}
                      >
                        UP
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Umang Patel</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>umang.p@somaiya.edu</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>B510, Bhaskaracharya</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Vidyavihar, Mumbai</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="p-2 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #450693, #8C00FF)' }}>
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Smart Home Control Hub</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Manage and organize your smart devices</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 hidden sm:flex">
                    <RotateCcw className="w-4 h-4" />
                    Reset Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <DialogHeader>
                    <DialogTitle className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>Reset Dashboard</DialogTitle>
                    <DialogDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      This will remove all device assignments and restore the dashboard to its default state. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReset}>
                      Reset
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar - Available Devices */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className={`shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Available Devices</CardTitle>
                <div className="relative mt-3">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-9 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400' : ''}`}
                    aria-label="Search available devices"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {filteredAvailableDevices.length === 0 ? (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <p className="text-sm">
                        {searchQuery ? 'No devices found' : 'All devices are assigned'}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableDevices.map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onUpdate={updateDevice}
                        isDragging={draggedDevice === device.id}
                        theme={theme}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid - Rooms */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <RoomPanel
                key={room.id}
                room={room}
                devices={room.devices}
                onDrop={handleDrop}
                onUpdateDevice={updateDevice}
                onRemoveDevice={removeDeviceFromRoom}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHomeControlHub;

/*
 * DEVELOPER NOTES
 * 
 * SUGGESTED UNIT TEST CASES:
 * 1. Test drag and drop functionality - ensure devices move correctly between rooms and sidebar
 * 2. Test localStorage persistence - verify state saves and loads correctly on page refresh
 * 3. Test device controls - validate brightness (0-100%), temperature (60-80°F), and fan speed (1-3) ranges
 * 4. Test search functionality - ensure filtering works for both device name and type
 * 5. Test reset functionality - confirm all devices return to unassigned state with default values
 * 
 * SUGGESTED FUTURE FEATURES:
 * 1. Theme switcher (light/dark mode) with persistent preference
 * 2. MQTT integration for real device control with WebSocket communication
 * 3. Device scheduling and automation (e.g., turn on lights at sunset)
 * 4. Energy consumption stats and analytics dashboard with charts
 * 5. Mobile-optimized layout with touch-friendly drag & drop and responsive grid
 * 6. Device grouping and scenes (e.g., "Movie Mode" turns off lights and turns on TV)
 * 7. Voice control integration with Web Speech API
 * 8. Multi-user support with device access permissions
 * 9. Device history and activity logs
 * 10. Custom room creation and management
 */