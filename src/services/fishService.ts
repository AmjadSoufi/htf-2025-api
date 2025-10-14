import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

export const getAllFish = async () => {
    const fish = await prisma.fish.findMany({
        include: {
            sightings: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1
            }
        }
    });

    return fish.map(({sightings, ...f}) => {
        const sighting = sightings[0];
        return {
            ...f,
            latestSighting: sighting ? {
                latitude: sighting.latitude,
                longitude: sighting.longitude,
                timestamp: sighting.timestamp
            } : null
        };
    });
};

export const getFishById = async (id: string) => {
    const fish = await prisma.fish.findUnique({
        where: {
            id
        },
        include: {
            sightings: true
        }
    });

    if (!fish) {
        return null;
    }

    return {
        ...fish,
        sightings: fish.sightings.map(sighting => ({
            latitude: sighting.latitude,
            longitude: sighting.longitude,
            timestamp: sighting.timestamp
        }))
    };
};
