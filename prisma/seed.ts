import {PrismaClient} from "../src/generated/prisma";
import {randomPointInCircle} from "../src/services/geoPointService";

const prisma = new PrismaClient();

async function seed() {
    // Diving Centers
    await prisma.divingCenter.deleteMany({});
    await prisma.divingCenter.createMany({
        data: [
            {
                "name": "La Bombona Diving",
                "longitude": 99.82786494391709,
                "latitude": 10.09949848404374
            },
            {
                "name": "Coral Grand Divers",
                "longitude": 99.82705089619611,
                "latitude": 10.103286921162093,
            },
            {
                "name": "Scuba Birds",
                "longitude": 99.8225499878697,
                "latitude": 10.08176692114223,
            },
            {
                "name": "Sairee Cottage Diving",
                "longitude": 99.82832599207734,
                "latitude": 10.097139068851266
            },
            {
                "name": "Mojo Diver",
                "longitude": 99.82729089627196,
                "latitude": 10.10268799673875
            }
        ]
    });

    // Diving Centers
    await prisma.fish.deleteMany({});

    const fish = await prisma.fish.createManyAndReturn({
        data: [
            {
                "name": "Titan triggerfish",
                "image": "https://example.com/titan_triggerfish.jpg",
            },
            {
                "name": "Blotched porcupine pufferfish",
                "image": "https://example.com/blotched_pufferfish.jpg"
            },
            {
                "name": "Common lionfish",
                "image": "https://example.com/lionfish.jpg"
            },
            {
                "name": "Orange-spine unicornfish",
                "image": "https://example.com/orange_spine_unicornfish.jpg"
            },
            {
                "name": "Butterflyfish (e.g. Lined Butterflyfish)",
                "image": "https://example.com/butterflyfish.jpg"
            },
            {
                "name": "Chevron barracuda",
                "image": "https://example.com/chevron_barracuda.jpg"
            },
            {
                "name": "White-eyed moray eel",
                "image": "https://example.com/white_eyed_moray.jpg"
            }
        ]
    });

    // Fish Sightings
    await prisma.fishSighting.deleteMany({});

    for (const f of fish) {
        const sightings = [];
        for (let i = 0; i < 10; i++) {
            const location = randomPointInCircle();
            // Last event (i=9) is current time, each previous event is 5 minutes earlier
            const minutesAgo = (9 - i) * 5;
            const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

            sightings.push({
                fishId: f.id,
                latitude: location.lat,
                longitude: location.lon,
                timestamp: timestamp
            });
        }
        await prisma.fishSighting.createMany({
            data: sightings
        });
    }

}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });