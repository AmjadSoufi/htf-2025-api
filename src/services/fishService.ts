/**
 * Fish Service
 *
 * Manages fish data and sighting information for the diving application.
 * This service handles retrieving fish species information and transforming
 * sighting data for client consumption.
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Helper: compute squared distance between two lat/lon points
const squaredDistance = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) => {
  const dLat = a.latitude - b.latitude;
  const dLon = a.longitude - b.longitude;
  return dLat * dLat + dLon * dLon;
};

// Known preferred temperature ranges for certain species/names (°C).
// Keys are lower-cased fish name or species identifiers. Values are [min, max].
const PREFERRED_TEMPERATURE_RANGES: Record<string, [number, number]> = {
  // example species entries (common tropical reef inhabitants)
  clownfish: [24, 28],
  "blue tang": [24, 28],
  parrotfish: [25, 29],
  grouper: [22, 28],
  surgeonfish: [24, 29],
  lionfish: [23, 29],
  angelfish: [24, 28],
  mandarin: [23, 27],
  // fallback examples by generic family names
  tuna: [18, 24],
  shark: [16, 26],
};

const getPreferredRangeForFish = (
  fishName: string | undefined,
  rarity?: any
) => {
  if (fishName) {
    const key = fishName.toLowerCase();
    if (PREFERRED_TEMPERATURE_RANGES[key])
      return PREFERRED_TEMPERATURE_RANGES[key];
  }

  // Fallback based on rarity to provide something reasonable.
  // Common diving sensors are simulated around 28-30°C (tropical). Use that for COMMON.
  if (rarity === "COMMON") return [28, 30];
  if (rarity === "RARE") return [22, 28];
  if (rarity === "EPIC") return [20, 28];

  // Default generic range
  return [20, 30];
};

/**
 * Retrieves all fish species with their most recent sighting.
 *
 * This function fetches all fish from the database and includes only the
 * latest sighting for each fish. The response is transformed to provide
 * a clean API structure with the most recent location data.
 */
export const getAllFish = async () => {
  // Fetch all fish with only their most recent sighting
  // Sightings are ordered newest first, and limited to 1 result
  const fish = await prisma.fish.findMany({
    include: {
      sightings: {
        orderBy: {
          timestamp: "desc",
        },
        take: 1,
      },
    },
  });

  // Fetch temperature sensors with their latest reading so we can attach
  // the nearest sensor's reading to each sighting for display in the client.
  const sensors = await prisma.temperatureSensor.findMany({
    include: {
      readings: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  // Transform the data structure for cleaner API response
  // Destructure to separate sightings array from rest of fish data
  return fish.map(({ sightings, ...f }) => {
    // Extract the single sighting (if it exists)
    const sighting = sightings[0];

    if (!sighting) {
      return {
        ...f,
        latestSighting: null,
      };
    }

    // Find nearest temperature sensor (by simple Euclidean distance on lat/lon)
    let nearestSensor = null;
    let nearestDist = Infinity;
    for (const s of sensors) {
      const r = s.readings?.[0] ?? null;
      const dist = squaredDistance(
        { latitude: sighting.latitude, longitude: sighting.longitude },
        { latitude: s.latitude, longitude: s.longitude }
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestSensor = { sensor: s, reading: r } as any;
      }
    }

    const temp = nearestSensor?.reading
      ? Number(nearestSensor.reading.temperature)
      : null;
    const tempTimestamp = nearestSensor?.reading
      ? nearestSensor.reading.timestamp
      : null;

    // Determine preferred temperature range for this fish
    const [preferredMin, preferredMax] = getPreferredRangeForFish(
      f.name,
      f.rarity
    );
    const inPreferredRange =
      temp != null ? temp >= preferredMin && temp <= preferredMax : null;

    // Return fish data with latestSighting instead of sightings array
    // Add optional temperature info and preferred range
    return {
      ...f,
      preferredTemperatureMin: preferredMin,
      preferredTemperatureMax: preferredMax,
      latestSighting: {
        latitude: sighting.latitude,
        longitude: sighting.longitude,
        timestamp: sighting.timestamp,
        temperature: temp,
        temperatureTimestamp: tempTimestamp,
        isTemperatureInPreferredRange: inPreferredRange,
      },
    };
  });
};

/**
 * Retrieves a specific fish by ID with all its sightings.
 *
 * This function fetches a single fish along with ALL of its sightings
 * (unlike getAllFish which only returns the latest sighting). Sighting data
 * is filtered to only include location and timestamp information.
 */
export const getFishById = async (id: string) => {
  // Fetch the specific fish with all of its sightings
  const fish = await prisma.fish.findUnique({
    where: {
      id,
    },
    include: {
      sightings: true,
    },
  });

  // Return null if fish doesn't exist
  if (!fish) {
    return null;
  }

  // Fetch temperature sensors once so we can attach nearest sensor reading
  const sensors = await prisma.temperatureSensor.findMany({
    include: {
      readings: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  // Determine preferred range for this fish once
  const [preferredMin, preferredMax] = getPreferredRangeForFish(
    fish.name,
    fish.rarity
  );

  // Transform sightings to only include relevant location data
  // and attach nearest sensor latest reading when available
  return {
    ...fish,
    preferredTemperatureMin: preferredMin,
    preferredTemperatureMax: preferredMax,
    sightings: fish.sightings.map((sighting) => {
      let nearestSensor = null;
      let nearestDist = Infinity;
      for (const s of sensors) {
        const r = s.readings?.[0] ?? null;
        const dist = squaredDistance(
          { latitude: sighting.latitude, longitude: sighting.longitude },
          { latitude: s.latitude, longitude: s.longitude }
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestSensor = { sensor: s, reading: r } as any;
        }
      }
      const temp = nearestSensor?.reading
        ? Number(nearestSensor.reading.temperature)
        : null;
      const tempTimestamp = nearestSensor?.reading
        ? nearestSensor.reading.timestamp
        : null;
      const inPreferredRange =
        temp != null ? temp >= preferredMin && temp <= preferredMax : null;

      return {
        latitude: sighting.latitude,
        longitude: sighting.longitude,
        timestamp: sighting.timestamp,
        temperature: temp,
        temperatureTimestamp: tempTimestamp,
        isTemperatureInPreferredRange: inPreferredRange,
      };
    }),
  };
};
