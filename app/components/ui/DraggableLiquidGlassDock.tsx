import React, { useState, useRef, useEffect } from 'react';
import { Home, Terminal, FileCode, Grip } from 'lucide-react';

type ActiveSection = 'about' | 'try-api' | 'documentation';

interface DraggableDockProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

const DraggableDock: React.FC<DraggableDockProps> = ({ activeSection, setActiveSection }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const dragTimeout = useRef<NodeJS.Timeout | null>(null);

  const dockItems = [
    {
      id: 'about' as ActiveSection,
      title: 'Home',
      icon: <Home className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-400 to-pink-400'
    },
    {
      id: 'try-api' as ActiveSection,
      title: 'Try API',
      icon: <Terminal className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'documentation' as ActiveSection,
      title: 'Documentation',
      icon: <FileCode className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-400 to-emerald-400'
    },
  ];

  // Initialize position on mount
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const centerX = (window.innerWidth - 280) / 2;
      const bottomY = window.innerHeight - 120;
      setPosition({ x: centerX, y: bottomY });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Auto-expand dock on hover
  useEffect(() => {
    if (hoveredItem !== null) {
      setIsDockExpanded(true);
    } else {
      const timer = setTimeout(() => {
        if (!isDragging) {
          setIsDockExpanded(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hoveredItem, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isItemClick = target.closest('[data-dock-item]');
    const isGripHandle = target.closest('[data-grip-handle]');
    
    if (!isItemClick || isGripHandle) {
      e.preventDefault();
      
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        
        // Delay drag start to differentiate from clicks
        dragTimeout.current = setTimeout(() => {
          setIsDragging(true);
          setDragStarted(true);
        }, 150);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStarted) {
      e.preventDefault();
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Enhanced boundary detection with better padding
      const padding = 20;
      const dockWidth = isDockExpanded ? 280 : 200;
      const dockHeight = 80;
      
      const maxX = window.innerWidth - dockWidth - padding;
      const maxY = window.innerHeight - dockHeight - padding;
      
      setPosition({
        x: Math.max(padding, Math.min(newX, maxX)),
        y: Math.max(padding, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    
    if (dragTimeout.current) {
      clearTimeout(dragTimeout.current);
      dragTimeout.current = null;
    }
    
    setIsDragging(false);
    setDragStarted(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, dragOffset, dragStarted]);

  const handleItemClick = (item: typeof dockItems[0], index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't trigger if we're dragging
    if (isDragging || dragStarted) return;
    
    setActiveSection(item.id);
    
    // Enhanced ripple effect
    const dockItem = document.getElementById(`dock-item-${index}`);
    if (dockItem) {
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 bg-white/30 rounded-2xl animate-ping pointer-events-none';
      dockItem.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <div
      className="fixed z-50 transition-all duration-500 ease-out"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'center',
      }}
    >
      <div
        ref={dockRef}
        className={`
          relative transition-all duration-500 ease-out select-none
          ${isDragging ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${isDockExpanded ? 'w-80' : 'w-52'}
        `}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsDockExpanded(true)}
        onMouseLeave={() => {
          if (!isDragging) {
            setIsDockExpanded(false);
          }
        }}
      >
        {/* Enhanced glow effect matching your brand */}
        <div className={`
          absolute inset-0 rounded-3xl blur-2xl scale-110 pointer-events-none
          transition-all duration-500 ease-out
          ${isDockExpanded ? 'opacity-100' : 'opacity-60'}
          bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30
          ${isDragging ? 'animate-pulse' : ''}
        `}></div>
        
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl blur-xl scale-125 pointer-events-none animate-pulse"></div>
        
        {/* Main dock container */}
        <div className="relative">
          {/* Glass morphism background */}
          <div className={`
            absolute inset-0 rounded-3xl backdrop-blur-2xl transition-all duration-500
            bg-gradient-to-r from-black/20 via-gray-900/10 to-black/20
            border border-white/10 shadow-2xl
            ${isDragging ? 'border-purple-400/30' : ''}
          `}></div>
          
          {/* Animated border */}
          <div className={`
            absolute inset-0 rounded-3xl transition-all duration-500
            bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20
            ${isDockExpanded ? 'opacity-100' : 'opacity-0'}
            animate-pulse
          `}></div>
          
          {/* Drag handle */}
          <div 
            data-grip-handle
            className={`
              absolute -top-4 left-1/2 transform -translate-x-1/2
              flex items-center justify-center w-12 h-3 rounded-full
              bg-gradient-to-r from-purple-500/40 to-pink-500/40
              backdrop-blur-sm border border-white/20
              transition-all duration-300 hover:from-purple-400/60 hover:to-pink-400/60
              ${isDragging ? 'scale-125 from-purple-400/80 to-pink-400/80' : ''}
              cursor-grab active:cursor-grabbing
            `}
            title="Drag to move dock"
          >
            <Grip className="w-3 h-3 text-white/60" />
          </div>
          
          {/* Dock items */}
          <div className="relative flex items-center justify-center gap-3 p-4">
            {dockItems.map((item, index) => (
              <div
                key={index}
                id={`dock-item-${index}`}
                data-dock-item
                className={`
                  relative group transition-all duration-500 ease-out
                  ${hoveredItem === index ? 'scale-125 -translate-y-3' : 'scale-100 translate-y-0'}
                  ${activeSection === item.id ? 'scale-110 -translate-y-1' : ''}
                  ${isDockExpanded ? 'mx-2' : 'mx-0'}
                `}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => handleItemClick(item, index, e)}
              >
                {/* Item glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none
                  bg-gradient-to-r ${item.color} blur-lg scale-110
                  ${hoveredItem === index ? 'opacity-60' : 'opacity-0'}
                  ${activeSection === item.id ? 'opacity-40' : ''}
                `}></div>
                
                {/* Item container */}
                <div className={`
                  relative flex items-center justify-center w-14 h-14 rounded-2xl
                  cursor-pointer transition-all duration-500 ease-out
                  backdrop-blur-xl border shadow-xl
                  ${hoveredItem === index 
                    ? `bg-gradient-to-r ${item.hoverColor} border-white/30 shadow-2xl` 
                    : 'bg-white/5 border-white/10'
                  }
                  ${activeSection === item.id 
                    ? `bg-gradient-to-r ${item.color} border-white/20` 
                    : ''
                  }
                  hover:shadow-2xl
                  active:scale-95
                `}>
                  {/* Icon */}
                  <div className={`
                    transition-all duration-500 pointer-events-none
                    ${hoveredItem === index ? 'text-white scale-110' : 'text-white/70'}
                    ${activeSection === item.id ? 'text-white scale-105' : ''}
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Active indicator */}
                  {activeSection === item.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Enhanced tooltip */}
                <div className={`
                  absolute -top-16 left-1/2 transform -translate-x-1/2 
                  px-4 py-2 rounded-xl backdrop-blur-xl
                  bg-gradient-to-r from-black/80 to-gray-900/80
                  border border-white/10 shadow-2xl
                  transition-all duration-300 ease-out pointer-events-none
                  ${hoveredItem === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
                  whitespace-nowrap
                `}>
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                </div>
                
                {/* Micro-interactions */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none
                  ${hoveredItem === index ? 'bg-white/5' : 'bg-transparent'}
                `}></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Flowing animation overlay */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className={`
            absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
            skew-x-12 transition-all duration-1000 ease-out
            ${isDockExpanded ? 'translate-x-full' : '-translate-x-full'}
          `}></div>
        </div>
        
        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-medium animate-pulse">
            Dragging...
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableDock;