import {DIVING_AREA_LAT, DIVING_AREA_LON, DIVING_AREA_RADIUS} from "../globals";
import {point} from "@turf/helpers";
import destination from "@turf/destination";

/**
 * Returns a random point within a circle on Earth's surface.
 * - center: { lat, lon } in degrees
 * - radiusKm: circle radius in kilometers
 * Returns: { lat, lon }
 */
export function randomPointInCircle() {
    const bearing = Math.random() * 360;
    const distanceKm = DIVING_AREA_RADIUS * Math.sqrt(Math.random());

    const centerPt = point([DIVING_AREA_LON, DIVING_AREA_LAT]);
    const dest = destination(centerPt, distanceKm, bearing, {units: 'kilometers'});
    const [lon, lat] = dest.geometry.coordinates;
    return {lat, lon};
}