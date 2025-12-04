import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, MapUniversity } from '@/lib/supabase';


// Region Highlights Data
const REGION_HIGHLIGHTS = {
  north: {
    title: "Northern Thailand",
    sub: "Lanna Culture & Mountains",
    desc: "ดินแดนแห่งขุนเขาและสายหมอก โดดเด่นด้วยวัฒนธรรมล้านนา สถาปัตยกรรมวัดวาอารามที่งดงาม และวิถีชีวิตที่เรียบง่าย",
    tags: ["Doi Suthep", "Lanna Art", "Cool Weather", "Khao Soi"]
  },
  northeast: {
    title: "Northeastern Thailand",
    sub: "Isan Culture & History",
    desc: "อู่อารยธรรมบ้านเชียง แหล่งรวมวัฒนธรรมอีสานที่มีเอกลักษณ์ อาหารรสจัดจ้าน และประเพณีที่สนุกสนานรื่นเริง",
    tags: ["Mekong River", "Silk", "Spicy Food", "Dinosaur Fossils"]
  },
  central: {
    title: "Central Thailand",
    sub: "Heart of the Kingdom",
    desc: "ศูนย์กลางการปกครองและเศรษฐกิจ อู่ข้าวอู่น้ำของประเทศ เต็มไปด้วยประวัติศาสตร์สมัยอยุธยาและรัตนโกสินทร์",
    tags: ["Grand Palace", "Ayutthaya", "Floating Market", "Rice Fields"]
  },
  south: {
    title: "Southern Thailand",
    sub: "Tropical Paradise",
    desc: "สวรรค์แห่งท้องทะเลและหมู่เกาะ อาหารปักษ์ใต้รสร้อนแรง และความหลากหลายทางวัฒนธรรมไทย-มุสลิม",
    tags: ["Andaman Sea", "Islands", "Seafood", "Old Town"]
  }
};

// Soft Liquid Pastel Colors
// Soft Liquid Pastel Colors (Vibrant & Premium)
// Pastel University Colors (Visible & Clear)
const REGION_THEMES = {
  north: {
    // CMU: Pastel Purple (from Dok Rak #9966FF) - More Visible
    color: "#DDD6FE", // Light purple (darker)
    depth: "#A78BFA", // Medium purple for 3D
    mapFill: "rgba(237, 233, 254, 0.9)", // More opaque purple
    gradient: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    glow: "rgba(196, 181, 253, 0.6)"
  },
  northeast: {
    // KKU: Pastel Terracotta (from Mo Din Daeng #A73B24) - More Visible
    color: "#FED7AA", // Soft peach (darker)
    depth: "#FB923C", // Medium orange for 3D
    mapFill: "rgba(254, 215, 170, 0.9)", // More opaque peach
    gradient: "linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)",
    glow: "rgba(251, 146, 60, 0.6)"
  },
  central: {
    // RU: Pastel Gray (from Black & White) - More Visible
    color: "#E2E8F0", // Light gray (darker)
    depth: "#94A3B8", // Medium gray for 3D
    mapFill: "rgba(226, 232, 240, 0.9)", // More opaque gray
    gradient: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
    glow: "rgba(148, 163, 184, 0.6)"
  },
  south: {
    // PSU: Pastel Blue (from Navy #003C71) - More Visible
    color: "#BFDBFE", // Light blue (darker)
    depth: "#60A5FA", // Medium blue for 3D
    mapFill: "rgba(191, 219, 254, 0.9)", // More opaque blue
    gradient: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
    glow: "rgba(96, 165, 250, 0.6)"
  }
};

// Province Mapping
const REGIONS = {
  north: [
    "Chiang Mai", "Chiang Rai", "Lamphun", "Lampang", "Phrae", "Nan", "Phayao", "Mae Hong Son", "Uttaradit"
  ],
  northeast: [
    "Khon Kaen", "Udon Thani", "Loei", "Nong Khai", "Bueng Kan", "Sakon Nakhon", "Nakhon Phanom", "Mukdahan", 
    "Kalasin", "Maha Sarakham", "Roi Et", "Yasothon", "Amnat Charoen", "Ubon Ratchathani", "Si Sa Ket", "Surin", 
    "Buriram", "Nakhon Ratchasima", "Chaiyaphum", "Nong Bua Lam Phu"
  ],
  south: [
    "Chumphon", "Ranong", "Surat Thani", "Phangnga", "Phuket", "Krabi", "Nakhon Si Thammarat", "Trang", 
    "Phatthalung", "Satun", "Songkhla", "Pattani", "Yala", "Narathiwat"
  ],
  central: [
    "Bangkok", "Krung Thep", "Samut Prakan", "Nonthaburi", "Pathum Thani", "Phra Nakhon Si Ayutthaya", "Ang Thong", 
    "Lop Buri", "Sing Buri", "Chai Nat", "Saraburi", "Chon Buri", "Rayong", "Chanthaburi", "Trat", "Chachoengsao", 
    "Prachin Buri", "Nakhon Nayok", "Sa Kaeo", "Ratchaburi", "Kanchanaburi", "Suphan Buri", "Nakhon Pathom", 
    "Samut Sakhon", "Samut Songkhram", "Phetchaburi", "Prachuap Khiri Khan", "Nakhon Sawan", "Uthai Thani", 
    "Kamphaeng Phet", "Tak", "Sukhothai", "Phitsanulok", "Phichit", "Phetchabun"
  ]
};

const ThailandEducationMap = () => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const [enabledUniversities, setEnabledUniversities] = useState<string[]>(['north', 'northeast', 'central', 'south']);
  const [universities, setUniversities] = useState<Record<string, MapUniversity>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Fetch map settings from Supabase
  useEffect(() => {
    const fetchMapSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('map_settings')
          .select('*')
          .single();

        if (!error && data) {
          setMapVisible(data.is_visible);
          setEnabledUniversities(data.enabled_universities || []);
        }
      } catch (error) {
        console.error('Error fetching map settings:', error);
        // Keep default values if fetch fails
      }
    };

    fetchMapSettings();
  }, []);

  // Fetch universities data from Supabase
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from('map_universities')
          .select('*')
          .eq('is_visible', true)
          .order('order_index');

        if (!error && data) {
          const universitiesMap: Record<string, MapUniversity> = {};
          data.forEach((uni) => {
            universitiesMap[uni.region] = uni;
          });
          setUniversities(universitiesMap);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    fetch('/thailand.svg')
      .then(res => res.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'image/svg+xml');
        const paths = doc.querySelectorAll('path');

        const regionGroups = {
          north: { surface: [] as string[], depth: [] as string[] },
          northeast: { surface: [] as string[], depth: [] as string[] },
          central: { surface: [] as string[], depth: [] as string[] },
          south: { surface: [] as string[], depth: [] as string[] }
        };

        paths.forEach(path => {
          const title = path.getAttribute('title') || '';
          let region = 'central'; 
          
          if (REGIONS.north.some(p => title.includes(p))) region = 'north';
          else if (REGIONS.northeast.some(p => title.includes(p))) region = 'northeast';
          else if (REGIONS.south.some(p => title.includes(p))) region = 'south';
          else if (REGIONS.central.some(p => title.includes(p))) region = 'central';

          const theme = REGION_THEMES[region as keyof typeof REGION_THEMES];
          
          // Create Depth Path (3D Extrusion)
          const depthPath = path.cloneNode(true) as SVGElement;
          depthPath.setAttribute('fill', theme.depth);
          depthPath.setAttribute('stroke', 'none');
          // @ts-ignore
          regionGroups[region].depth.push(depthPath.outerHTML);

          // Configure Surface Path (Glassy Top)
          path.setAttribute('fill', theme.mapFill);
          path.setAttribute('stroke', 'rgba(255,255,255,0.8)');
          path.setAttribute('stroke-width', '1');
          path.setAttribute('class', 'province-path transition-all duration-300');
          
          // @ts-ignore
          regionGroups[region].surface.push(path.outerHTML);
        });

        // Reconstruct SVG with Groups
        // Use the correct viewBox from the file or hardcoded fallback that matches the file's dimensions
        const viewBox = '0 0 559.57 1024.76';
        
        const newSvg = `
          <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; width: 100%; height: 100%;">
            <defs>
              <filter id="glass-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- 3D Depth Layer (Shifted Down) -->
            <g transform="translate(0, 8)">
              <g id="depth-north">${regionGroups.north.depth.join('')}</g>
              <g id="depth-northeast">${regionGroups.northeast.depth.join('')}</g>
              <g id="depth-central">${regionGroups.central.depth.join('')}</g>
              <g id="depth-south">${regionGroups.south.depth.join('')}</g>
            </g>

            <!-- Surface Layer (Interactive) -->
            <g id="group-north" class="region-group cursor-pointer" data-region="north" style="pointer-events: all; transition: all 0.5s ease; transform-origin: center; transform: translate(0px, 0px);">
              ${regionGroups.north.surface.join('')}
            </g>
            <g id="group-northeast" class="region-group cursor-pointer" data-region="northeast" style="pointer-events: all; transition: all 0.5s ease; transform-origin: center; transform: translate(0px, 0px);">
              ${regionGroups.northeast.surface.join('')}
            </g>
            <g id="group-central" class="region-group cursor-pointer" data-region="central" style="pointer-events: all; transition: all 0.5s ease; transform-origin: center; transform: translate(0px, 0px);">
              ${regionGroups.central.surface.join('')}
            </g>
            <g id="group-south" class="region-group cursor-pointer" data-region="south" style="pointer-events: all; transition: all 0.5s ease; transform-origin: center; transform: translate(0px, 0px);">
              ${regionGroups.south.surface.join('')}
            </g>
          </svg>
        `;

        setSvgContent(newSvg);
      });
  }, []);

  // Handle Hover Effect
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const groups = mapContainerRef.current.querySelectorAll('.region-group');
    groups.forEach((group: any) => {
      const region = group.getAttribute('data-region');
      
      const baseTransform = 'translate(0px, 0px)';

      if (hoveredRegion && region === hoveredRegion) {
        group.style.transform = `${baseTransform} scale(1.02) translateY(-10px)`;
        group.style.filter = 'drop-shadow(0px 20px 30px rgba(0,0,0,0.2)) brightness(1.1)';
        group.style.zIndex = '50';
      } else if (hoveredRegion && region !== hoveredRegion) {
        group.style.transform = `${baseTransform} scale(0.98)`;
        group.style.filter = 'brightness(0.8) opacity(0.7) grayscale(0.2)';
        group.style.zIndex = '1';
      } else {
        group.style.transform = `${baseTransform} scale(1)`;
        group.style.filter = 'drop-shadow(0px 5px 10px rgba(0,0,0,0.1))';
        group.style.zIndex = '1';
      }
    });
  }, [hoveredRegion]);

  const handleMapHover = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const group = target.closest('.region-group');
    if (group) {
      const region = group.getAttribute('data-region');
      if (region) {
        setHoveredRegion(region);
        return;
      }
    }
    setHoveredRegion(null);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const group = target.closest('.region-group');
    if (group) {
      const region = group.getAttribute('data-region');
      if (region) {
        setSelectedMapRegion(selectedMapRegion === region ? null : region);
        setActiveRegion(null); 
        return;
      }
    }
    setSelectedMapRegion(null);
    setActiveRegion(null);
  };

  // Don't render if map is not visible
  if (!mapVisible) {
    return null;
  }

  return (
    <div 
      className="w-full py-16 flex flex-col items-center justify-center min-h-[1200px] relative overflow-visible" 
      onClick={() => { setActiveRegion(null); setSelectedMapRegion(null); }}
    >
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-rose-200/30 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-16 z-10 relative"
        onClick={() => { setActiveRegion(null); setSelectedMapRegion(null); }}
      >
        <span className="inline-block px-4 py-2 rounded-full glass-strong border border-white/40 text-sm font-medium text-indigo-900 mb-4 shadow-sm backdrop-blur-md bg-white/30">
          Academic Journey
        </span>
        <h2 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-6 drop-shadow-sm">
          Education Map
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Explore the academic milestones across different regions of Thailand
        </p>
      </motion.div>

      {/* Browser Mockup Container */}
      <div 
        className="relative w-full max-w-[800px] z-20 perspective-1000"
        onClick={() => { setActiveRegion(null); setSelectedMapRegion(null); }}
      >
        <motion.div 
          initial={{ rotateX: 5 }}
          whileInView={{ rotateX: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="rounded-2xl overflow-visible shadow-2xl bg-white/80 backdrop-blur-xl border border-white/50 relative"
        >
          
          {/* Connecting Lines Layer (Global - Outside Map Content) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <AnimatePresence>
              {/* North (CMU) - Top Left */}
              {(hoveredRegion === 'north' || activeRegion === 'north') && (
                <g key="line-north">
                  <motion.line 
                    x1="-25" y1="15" x2="30" y2="20"
                    stroke={REGION_THEMES.north.color} strokeWidth="0.5" strokeDasharray="3,3"
                    filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: 1 }} 
                    exit={{ pathLength: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="30" cy="20" r="1" 
                    fill={REGION_THEMES.north.color} 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="animate-pulse" 
                  />
                </g>
              )}
              
              {/* Northeast (KKU) - Top Right */}
              {(hoveredRegion === 'northeast' || activeRegion === 'northeast') && (
                <g key="line-northeast">
                  <motion.line 
                    x1="125" y1="25" x2="70" y2="35"
                    stroke={REGION_THEMES.northeast.color} strokeWidth="0.5" strokeDasharray="3,3"
                    filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: 1 }} 
                    exit={{ pathLength: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="70" cy="35" r="1" 
                    fill={REGION_THEMES.northeast.color} 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="animate-pulse" 
                  />
                </g>
              )}
              
              {/* Central (RU) - Middle Right */}
              {(hoveredRegion === 'central' || activeRegion === 'central') && (
                <g key="line-central">
                  <motion.line 
                    x1="125" y1="60" x2="55" y2="55"
                    stroke={REGION_THEMES.central.color} strokeWidth="0.5" strokeDasharray="3,3"
                    filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: 1 }} 
                    exit={{ pathLength: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="55" cy="55" r="1" 
                    fill={REGION_THEMES.central.color} 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="animate-pulse" 
                  />
                </g>
              )}
              
              {/* South (PSU) - Bottom Left */}
              {(hoveredRegion === 'south' || activeRegion === 'south') && (
                <g key="line-south">
                  <motion.line 
                    x1="-25" y1="85" x2="35" y2="80"
                    stroke={REGION_THEMES.south.color} strokeWidth="0.5" strokeDasharray="3,3"
                    filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: 1 }} 
                    exit={{ pathLength: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="35" cy="80" r="1" 
                    fill={REGION_THEMES.south.color} 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="animate-pulse" 
                  />
                </g>
              )}
            </AnimatePresence>
          </svg>

          {/* Browser Header */}
          <div className="bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 border-b border-slate-100 z-20 relative rounded-t-2xl">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-400/80 shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80 shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 shadow-sm" />
            </div>
            <div className="ml-6 flex-1 bg-slate-50/80 rounded-lg h-8 border border-slate-100 text-xs font-medium text-slate-400 flex items-center px-4 shadow-inner">
              <span className="text-slate-300 mr-2">https://</span>codex-th.com/education-map
            </div>
          </div>

          {/* Map Content Area */}
          <div className="relative w-full bg-gradient-to-b from-slate-50/50 to-white/50 z-10" style={{ paddingBottom: '183.13%' }}>
            <div className="absolute inset-0 w-full h-full p-8">
              
              {/* Map Layer */}
              <div 
                ref={mapContainerRef}
                className="relative w-full h-full z-20" 
                onClick={handleMapClick}
                onMouseMove={handleMapHover}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div 
                  className="w-full h-full drop-shadow-xl"
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                />
              </div>

            </div>
          </div>
        </motion.div>

        {/* Floating Markers (Outside Browser Mockup) */}
        
        {/* North - CMU (Top Left) */}
        {enabledUniversities.includes('north') && universities.north && (
          <GlassMarker 
            region="north" 
            logo={universities.north.logo_url || '/University_Logo/CMU_LOGO.svg.png'} 
            data={universities.north}
            position="top-[8%] -left-[28%]"
            delay={0.2}
            theme={REGION_THEMES.north}
            isActive={activeRegion === 'north'}
            onClick={(e: any) => { e.stopPropagation(); setActiveRegion(activeRegion === 'north' ? null : 'north'); setSelectedMapRegion(null); }}
            onHover={() => setHoveredRegion('north')}
            onLeave={() => setHoveredRegion(null)}
          />
        )}

        {/* Northeast - KKU (Top Right) */}
        {enabledUniversities.includes('northeast') && universities.northeast && (
          <GlassMarker 
            region="northeast" 
            logo={universities.northeast.logo_url || '/University_Logo/KKU_LOGO.png'} 
            data={universities.northeast}
            position="top-[20%] -right-[28%]"
            delay={0.4}
            theme={REGION_THEMES.northeast}
            isActive={activeRegion === 'northeast'}
            onClick={(e: any) => { e.stopPropagation(); setActiveRegion(activeRegion === 'northeast' ? null : 'northeast'); setSelectedMapRegion(null); }}
            onHover={() => setHoveredRegion('northeast')}
            onLeave={() => setHoveredRegion(null)}
          />
        )}

        {/* Central - RU (Middle Right) */}
        {enabledUniversities.includes('central') && universities.central && (
          <GlassMarker 
            region="central" 
            logo={universities.central.logo_url || '/University_Logo/RU_LOGO.svg.png'} 
            data={universities.central}
            position="top-[55%] -right-[28%]" 
            delay={0.6}
            theme={REGION_THEMES.central}
            isActive={activeRegion === 'central'}
            onClick={(e: any) => { e.stopPropagation(); setActiveRegion(activeRegion === 'central' ? null : 'central'); setSelectedMapRegion(null); }}
            onHover={() => setHoveredRegion('central')}
            onLeave={() => setHoveredRegion(null)}
          />
        )}

        {/* South - PSU (Bottom Left) */}
        {enabledUniversities.includes('south') && universities.south && (
          <GlassMarker 
            region="south" 
            logo={universities.south.logo_url || '/University_Logo/PSU_LOGO.png'} 
            data={universities.south}
            position="bottom-[12%] -left-[28%]"
            delay={0.8}
            theme={REGION_THEMES.south}
            isActive={activeRegion === 'south'}
            onClick={(e: any) => { e.stopPropagation(); setActiveRegion(activeRegion === 'south' ? null : 'south'); setSelectedMapRegion(null); }}
            onHover={() => setHoveredRegion('south')}
            onLeave={() => setHoveredRegion(null)}
          />
        )}

        {/* Region Info Card (Floating Right) */}
        <AnimatePresence>
          {selectedMapRegion && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="absolute top-[15%] -right-[75%] w-80 glass-strong p-6 rounded-3xl border border-white/60 shadow-2xl z-50 backdrop-blur-xl bg-white/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm mb-3" style={{ background: REGION_THEMES[selectedMapRegion as keyof typeof REGION_THEMES].gradient }}>
                  Selected Region
                </span>
                <h3 className="text-3xl font-black mb-2" style={{ color: REGION_THEMES[selectedMapRegion as keyof typeof REGION_THEMES].depth }}>
                  {REGION_HIGHLIGHTS[selectedMapRegion as keyof typeof REGION_HIGHLIGHTS].title}
                </h3>
                <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                  {REGION_HIGHLIGHTS[selectedMapRegion as keyof typeof REGION_HIGHLIGHTS].sub}
                </p>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm font-medium">
                  {REGION_HIGHLIGHTS[selectedMapRegion as keyof typeof REGION_HIGHLIGHTS].desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {REGION_HIGHLIGHTS[selectedMapRegion as keyof typeof REGION_HIGHLIGHTS].tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-100 shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

const GlassMarker = ({ region, logo, data, position, delay, theme, isActive, onClick, onHover, onLeave }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      className={`absolute ${position} z-40 cursor-pointer group`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          // Active State (Detailed Card)
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="relative w-80 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: theme.color }} />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: theme.color }} />
            <div className="relative z-10">
              <div className="w-12 h-1 rounded-full mb-4" style={{ background: theme.color }} />
              <h3 className="text-xl font-bold text-slate-800 mb-1">{data.name_th}</h3>
              <p className="text-sm text-slate-500 mb-4 font-light">{data.name_en}</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ background: theme.gradient }}>
                  {data.region_th}
                </span>
                <span className="text-sm font-medium text-slate-600">{data.year}</span>
              </div>
              <div className="text-sm text-slate-600 mt-3 space-y-1">
                <p className="font-semibold" style={{ color: theme.depth }}>{data.degree_level}</p>
                {data.faculty && <p className="text-slate-500">• {data.faculty}</p>}
                {data.major && <p className="text-slate-500">• {data.major}</p>}
              </div>
            </div>
            <img src={logo} alt="logo" className="absolute bottom-2 right-2 w-24 h-24 opacity-10 object-contain" />
          </motion.div>
        ) : (
          // Normal State (Compact Card)
          <motion.div
            key="normal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative w-24 h-24 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-center group-hover:bg-white/60 transition-all z-20">
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ background: theme.color }} />
              <img src={logo} alt={data.nameEn} className="w-16 h-16 object-contain drop-shadow-md" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 absolute top-full mt-2 z-10">
              <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl text-center min-w-[150px]">
                <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{data.name_en}</p>
                <p className="text-xs text-slate-500 text-center">{data.region_th}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ThailandEducationMap;
