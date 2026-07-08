"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { CATEGORY_META } from "@/lib/categories";
import type { PriorityItemDTO } from "@/lib/types";

interface WardAggregate {
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
  topItem: PriorityItemDTO;
  items: PriorityItemDTO[];
}

function aggregateByWard(items: PriorityItemDTO[]): WardAggregate[] {
  const byWard = new Map<string, WardAggregate>();
  for (const item of items) {
    if (!item.ward) continue;
    const existing = byWard.get(item.ward.id);
    if (!existing) {
      byWard.set(item.ward.id, {
        wardId: item.ward.id,
        wardName: item.ward.name,
        lat: item.ward.lat,
        lng: item.ward.lng,
        topItem: item,
        items: [item],
      });
    } else {
      existing.items.push(item);
      if (item.finalScore > existing.topItem.finalScore) existing.topItem = item;
    }
  }
  return Array.from(byWard.values());
}

function radiusForScore(score: number) {
  return 10 + (score / 100) * 20;
}

export function HotspotMap({
  items,
  onSelectWard,
}: {
  items: PriorityItemDTO[];
  onSelectWard?: (wardId: string) => void;
}) {
  const aggregates = aggregateByWard(items);
  const center: [number, number] =
    aggregates.length > 0
      ? [
          aggregates.reduce((s, a) => s + a.lat, 0) / aggregates.length,
          aggregates.reduce((s, a) => s + a.lng, 0) / aggregates.length,
        ]
      : [17.0, 81.8];

  return (
    <MapContainer center={center} zoom={11} className="h-full w-full rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {aggregates.map((a) => {
        const color = CATEGORY_META[a.topItem.category].cssVar;
        return (
          <CircleMarker
            key={a.wardId}
            center={[a.lat, a.lng]}
            radius={radiusForScore(a.topItem.finalScore)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
            eventHandlers={onSelectWard ? { click: () => onSelectWard(a.wardId) } : undefined}
          >
            <Popup>
              <div className="min-w-[180px] text-sm">
                <p className="mb-1 font-semibold">{a.wardName}</p>
                <ul className="flex flex-col gap-1">
                  {a.items
                    .slice()
                    .sort((x, y) => y.finalScore - x.finalScore)
                    .slice(0, 3)
                    .map((i) => (
                      <li key={i.id} className="flex justify-between gap-2">
                        <span className="truncate">{CATEGORY_META[i.category].label.en}</span>
                        <span className="font-medium">{i.finalScore}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
