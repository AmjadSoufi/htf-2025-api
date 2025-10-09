import {PrismaClient} from '../generated/prisma';
import {randomPointInCircle} from './geoPointService';
import {FISH_SIGHTING_UPDATE_RATE} from "../globals";

const prisma = new PrismaClient();

export const updateFishSightings = async () => {
    const allFish = await prisma.fish.findMany();

    const minToUpdate = 1;
    const maxToUpdate = allFish.length;
    const numToUpdate = Math.floor(Math.random() * (maxToUpdate - minToUpdate + 1)) + minToUpdate;

    // Shuffle and select fish to update
    const shuffled = [...allFish].sort(() => Math.random() - 0.5);
    const fishToUpdate = shuffled.slice(0, numToUpdate);

    for (const fish of fishToUpdate) {
        // Find the oldest sighting for this fish
        const oldestSighting = await prisma.fishSighting.findFirst({
            where: {fishId: fish.id},
            orderBy: {timestamp: 'asc'}
        });

        if (oldestSighting) {
            // Delete the oldest sighting
            await prisma.fishSighting.delete({
                where: {id: oldestSighting.id}
            });
        }

        // Create a new sighting with current timestamp and random location
        const location = randomPointInCircle();
        await prisma.fishSighting.create({
            data: {
                fishId: fish.id,
                latitude: location.lat,
                longitude: location.lon,
                timestamp: new Date()
            }
        });
    }

    console.log(`Updated sightings for ${fishToUpdate.length} out of ${allFish.length} fish at ${new Date().toISOString()}`);
};

export const startFishSightingUpdates = () => {
    // Run every 5 minutes (5 * 60 * 1000 milliseconds)
    const interval = setInterval(updateFishSightings, FISH_SIGHTING_UPDATE_RATE * 60 * 1000);
    console.log(`🐟 Fish sighting updates started - running every ${FISH_SIGHTING_UPDATE_RATE} minutes`);
    return interval;
};