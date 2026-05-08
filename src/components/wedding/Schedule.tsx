import { useEffect, useState } from "react";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { MapPin, Users, Heart, Wine, Utensils, Music } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToString } from "react-dom/server";

// Fix static leaflet icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

// Custom map icon in elegant gold
const createCustomIcon = (IconComponent: any) => {
  const iconHtml = renderToString(<IconComponent size={20} color="white" strokeWidth={2} />);
  return new L.DivIcon({
    className: "custom-map-icon",
    html: `<div style="background-color: #d4af37; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.15); border: 2px solid white; margin-left: -14px; margin-top: -28px;">${iconHtml}</div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
  });
};


export const Schedule = ({ events }: { events?: any[] }) => {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Increment key on every mount so React always creates a fresh DOM node
    // for Leaflet. This prevents the "Map container is being reused" error
    // caused by React StrictMode's double-invoke leaving a stale _leaflet_id.
    setMapKey(k => k + 1);
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const displaySchedule = (events && events.length > 0)
    ? events.map(item => ({
        ...item,
        Icon: [Users, Heart, Wine, Utensils, Music][Math.min(item.icon_index || 0, 4)],
        leafletIcon: createCustomIcon([Users, Heart, Wine, Utensils, Music][Math.min(item.icon_index || 0, 4)])
      }))
    : [];

  const mapCenter: [number, number] = (displaySchedule.length > 0)
    ? [displaySchedule[0].lat, displaySchedule[0].lng]
    : [40.6492, 14.6125];

  return (
    <Section id="schedule" eyebrow="Order of the Day" title="The Schedule" className="gradient-warm bg-ivory">
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-primary/20" />
        <div className="space-y-12">
          {displaySchedule.map((s, i) => (
            <Reveal key={s.title + i} delay={i * 100}>
              <div className={`relative grid md:grid-cols-2 gap-6 items-center ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                <div className={`pl-12 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <p className="font-display text-3xl md:text-4xl text-primary/80 mb-1">{s.time}</p>
                  <h3 className="font-display text-2xl mb-2">{s.title}</h3>
                  <p className="text-warm-mid text-sm leading-loose font-light">
                    <span className="block font-medium text-warm-dark">{s.venue}</span>
                    {s.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.3em] text-gold border-b border-gold/40 pb-1 hover:text-warm-dark hover:border-warm-mid transition-colors"
                  >
                    <MapPin className="w-3 h-3" /> View on Map
                  </a>
                </div>
                <div className="hidden md:block" />
                <span className="absolute left-4 md:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-background border-2 border-primary/60 shadow-soft" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <div id="map" className="max-w-4xl mx-auto mt-16 overflow-hidden border border-blush h-[450px] relative z-0 ">
          <div style={{ width: '100%', height: '100%', filter: "sepia(15%) saturate(85%)" }}>
            {mounted && <MapContainer
              dragging={false}
              closePopupOnClick={true}
              center={mapCenter} 
              zoom={32}
              scrollWheelZoom={false} 
              touchZoom={false} 
              style={{ width: '100%', height: '100%', zIndex: 0 }
              }>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {displaySchedule.map((s, i) => (
                <Marker key={i} position={[s.lat, s.lng]} icon={s.leafletIcon}>
                  <Popup className="font-display font-medium">
                    <div className="text-center ">
                      <p className="font-bold text-xl text-primary">{s.title}</p>
                      <p className="text-lg font-medium">{s.time}</p>
                      <p className="text-sm text-warm-dark">{s.venue}</p>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" className=" font-medium inline-flex items-center gap-2 mt-2 text-[11px] uppercase tracking-[0.3em] text-warm-dark border-b border-warm-dark/40 pb-1 hover:text-warm-dark hover:border-warm-mid transition-colors">
                        <MapPin className="w-3 h-3" /> View on Map
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>}
          </div>
        </div>
      </Reveal>
    </Section>
  );
};
