import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CareResult } from "@/lib/care.functions";

/** Browser-only map of results. Loaded lazily; never imported during SSR. */
export default function CareMap({ origin, results }: { origin: { lat: number; lng: number; label: string }; results: CareResult[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([origin.lat, origin.lng], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);
    const pts: L.LatLngExpression[] = [[origin.lat, origin.lng]];
    L.circleMarker([origin.lat, origin.lng], { radius: 8, color: "#2f5d46", fillColor: "#5f8a6f", fillOpacity: 0.9 })
      .addTo(map)
      .bindPopup(`Search center: ${origin.label}`);
    results.forEach((r, i) => {
      if (r.lat == null || r.lng == null) return;
      pts.push([r.lat, r.lng]);
      const icon = L.divIcon({
        className: "",
        html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:#9c4a2c;color:#fff;font:700 13px sans-serif;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i + 1}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const el = document.createElement("div");
      const b = document.createElement("strong");
      b.textContent = `${i + 1}. ${r.name}`;
      const a = document.createElement("div");
      a.textContent = r.address ?? "";
      el.append(b, a);
      L.marker([r.lat, r.lng], { icon, title: `${i + 1}. ${r.name}` }).addTo(map).bindPopup(el);
    });
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    return () => {
      map.remove();
    };
  }, [origin, results]);
  return <div ref={ref} className="h-96 w-full" role="region" aria-label="Map of results. The list view has the same information." />;
}
