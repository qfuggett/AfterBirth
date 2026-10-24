import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCategory } from "./care-categories";

export type CareResult = {
  id: string;
  name: string;
  specialty: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
  distanceMiles: number | null;
};

export type CareSearchResponse =
  | {
      ok: true;
      directory: "google_places" | "nppes";
      directoryLabel: string;
      origin: { lat: number; lng: number; label: string } | null;
      results: CareResult[];
      note?: string;
    }
  | { ok: false; reason: "no_directory" | "location_not_found" | "service_error" | "bad_input"; message: string };

const input = z
  .object({
    categoryId: z.string().max(40),
    place: z.string().trim().max(80).optional(),
    coords: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  })
  .refine((d) => !!d.place || !!d.coords, "Location required");

function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
const fmtPhone = (p?: string) => {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p || null;
};
const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

type Resolved = { lat: number; lng: number; label: string; city: string | null; state: string | null; zip: string | null };

async function resolveLocation(place?: string, coords?: { lat: number; lng: number }): Promise<Resolved | null> {
  if (coords) {
    // Reverse lookup through the US Census geocoder (city, state, ZIP area).
    try {
      const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${coords.lng}&y=${coords.lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=${encodeURIComponent("Incorporated Places,States,2020 Census ZIP Code Tabulation Areas")}&format=json`;
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const j = (await r.json()) as any;
      const g = j?.result?.geographies ?? {};
      const city = (g["Incorporated Places"]?.[0]?.BASENAME as string) ?? null;
      const state = (g["States"]?.[0]?.STUSAB as string) ?? null;
      const zip = (g["2020 Census ZIP Code Tabulation Areas"]?.[0]?.ZCTA5 as string) ?? null;
      return { ...coords, label: city && state ? `near ${city}, ${state}` : "near your location", city, state, zip };
    } catch {
      return { ...coords, label: "near your location", city: null, state: null, zip: null };
    }
  }
  const p = (place ?? "").trim();
  const zip = p.match(/^\d{5}$/)?.[0];
  if (zip) {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const j = (await r.json()) as any;
    const pl = j?.places?.[0];
    if (!pl) return null;
    return {
      lat: Number(pl.latitude),
      lng: Number(pl.longitude),
      label: `near ${pl["place name"]}, ${pl["state abbreviation"]} ${zip}`,
      city: pl["place name"],
      state: pl["state abbreviation"],
      zip,
    };
  }
  const m = p.match(/^([a-zA-Z .'-]{2,}),\s*([a-zA-Z]{2})$/);
  if (m) {
    const city = (m[1] ?? "").trim();
    const state = (m[2] ?? "").toUpperCase();
    const r = await fetch(`https://api.zippopotam.us/us/${state.toLowerCase()}/${encodeURIComponent(city.toLowerCase())}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as any;
    const pl = j?.places?.[0];
    if (!pl) return null;
    return { lat: Number(pl.latitude), lng: Number(pl.longitude), label: `near ${titleCase(city)}, ${state}`, city, state, zip: null };
  }
  return null;
}

async function censusGeocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const r = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`,
      { signal: AbortSignal.timeout(7000) },
    );
    const j = (await r.json()) as any;
    const c = j?.result?.addressMatches?.[0]?.coordinates;
    return c ? { lat: c.y, lng: c.x } : null;
  } catch {
    return null;
  }
}

async function searchNppes(cat: NonNullable<ReturnType<typeof getCategory>>, loc: Resolved): Promise<CareResult[]> {
  if (!cat.nppes) return [];
  const params = new URLSearchParams({ version: "2.1", taxonomy_description: cat.nppes.query, limit: "200" });
  if (loc.city && loc.state) {
    params.set("city", loc.city);
    params.set("state", loc.state);
  } else if (loc.zip) {
    params.set("postal_code", `${loc.zip.slice(0, 3)}*`);
  } else {
    return [];
  }
  const r = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`nppes ${r.status}`);
  const j = (await r.json()) as any;
  const rows: CareResult[] = [];
  const seen = new Set<string>();
  for (const p of j?.results ?? []) {
    if (p?.basic?.status && p.basic.status !== "A") continue;
    const tax = (p.taxonomies ?? []).find((t: any) => cat.nppes!.descMatch.test(t.desc ?? ""));
    if (!tax) continue;
    const addr = (p.addresses ?? []).find((a: any) => a.address_purpose === "LOCATION");
    if (!addr) continue;
    const b = p.basic ?? {};
    const name =
      p.enumeration_type === "NPI-2"
        ? titleCase(b.organization_name ?? "")
        : [b.first_name, b.last_name].filter(Boolean).map(titleCase).join(" ") + (b.credential ? `, ${b.credential}` : "");
    if (!name.trim()) continue;
    const zip5 = String(addr.postal_code ?? "").slice(0, 5);
    const address = `${titleCase([addr.address_1, addr.address_2].filter(Boolean).join(", "))}, ${titleCase(addr.city)}, ${addr.state} ${zip5}`;
    const key = `${name}|${address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      id: `npi-${p.number}`,
      name,
      specialty: tax.desc ?? null,
      address,
      phone: fmtPhone(addr.telephone_number),
      website: null,
      mapsUrl: mapsSearch(`${name} ${address}`),
      lat: null,
      lng: null,
      distanceMiles: null,
    });
  }
  // Geocode a bounded number of addresses (shared addresses geocoded once).
  const unique = [...new Set(rows.map((r) => r.address!))].slice(0, 30);
  const coords = new Map<string, { lat: number; lng: number } | null>();
  await Promise.all(
    unique.map(async (a) => {
      coords.set(a, await censusGeocode(a.replace(/, (Suite|Ste|Fl|Floor|Room|Rm|Unit|Bldg)[^,]*/gi, "")));
    }),
  );
  for (const row of rows) {
    const c = coords.get(row.address!);
    if (c) {
      row.lat = c.lat;
      row.lng = c.lng;
      row.distanceMiles = Math.round(miles(loc, c) * 10) / 10;
    }
  }
  return rows
    .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999))
    .slice(0, 25);
}

async function searchPlaces(apiKey: string, cat: NonNullable<ReturnType<typeof getCategory>>, loc: Resolved): Promise<CareResult[]> {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.primaryTypeDisplayName",
    },
    body: JSON.stringify({
      textQuery: cat.placesQuery,
      maxResultCount: 20,
      locationBias: { circle: { center: { latitude: loc.lat, longitude: loc.lng }, radius: 25000 } },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) {
    console.error("[places] status", r.status);
    throw new Error(`places ${r.status}`);
  }
  const j = (await r.json()) as any;
  return (j?.places ?? [])
    .map((p: any): CareResult => {
      const lat = p.location?.latitude ?? null;
      const lng = p.location?.longitude ?? null;
      return {
        id: `gp-${p.id}`,
        name: p.displayName?.text ?? "Unnamed place",
        specialty: p.primaryTypeDisplayName?.text ?? null,
        address: p.formattedAddress ?? null,
        phone: p.nationalPhoneNumber ?? null,
        website: p.websiteUri ?? null,
        mapsUrl: p.googleMapsUri ?? mapsSearch(`${p.displayName?.text ?? ""} ${p.formattedAddress ?? ""}`),
        lat,
        lng,
        distanceMiles: lat != null && lng != null ? Math.round(miles(loc, { lat, lng }) * 10) / 10 : null,
      };
    })
    .sort((a: CareResult, b: CareResult) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));
}

export const searchCare = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }): Promise<CareSearchResponse> => {
    const cat = getCategory(data.categoryId);
    if (!cat) return { ok: false, reason: "bad_input", message: "Unknown care type." };
    const placesKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!placesKey && !cat.nppes) {
      return {
        ok: false,
        reason: "no_directory",
        message: "No connected directory can search this kind of care yet, so we are not showing any results.",
      };
    }
    let loc: Resolved | null = null;
    try {
      loc = await resolveLocation(data.place, data.coords);
    } catch {
      loc = null;
    }
    if (!loc) {
      return { ok: false, reason: "location_not_found", message: "We couldn't find that place. Try a 5-digit ZIP code or “City, ST”." };
    }
    try {
      if (placesKey) {
        const results = await searchPlaces(placesKey, cat, loc);
        return {
          ok: true,
          directory: "google_places",
          directoryLabel: "Google Places",
          origin: { lat: loc.lat, lng: loc.lng, label: loc.label },
          results,
        };
      }
      const results = await searchNppes(cat, loc);
      return {
        ok: true,
        directory: "nppes",
        directoryLabel: "NPPES NPI Registry (U.S. Centers for Medicare & Medicaid Services)",
        origin: { lat: loc.lat, lng: loc.lng, label: loc.label },
        results,
        note: "Specialty comes from what each clinician registered. Addresses can be out of date, and some listings are billing offices rather than clinics.",
      };
    } catch {
      return { ok: false, reason: "service_error", message: "The directory didn't respond. No results are shown. Please try again in a moment." };
    }
  });
