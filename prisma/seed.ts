import {PrismaClient} from "../src/generated/prisma";

const prisma = new PrismaClient();

async function seed() {
    // Diving Centers
    await prisma.divingCenter.deleteMany({});
    await prisma.divingCenter.createMany({
        data: [
            {
                "name": "Master Divers",
                "locationLatitude": 10.0927,
                "locationLongitude": 99.8366
            },
            {
                "name": "The Divers Boat",
                "locationLatitude": 10.0987,
                "locationLongitude": 99.8250
            },
            {
                "name": "IDC Koh Tao",
                "locationLatitude": 10.1009,
                "locationLongitude": 99.8263
            },
            {
                "name": "Sairee Cottage Diving",
                "locationLatitude": 10.0981,
                "locationLongitude": 99.8302
            },
            {
                "name": "Big Blue Diving",
                "locationLatitude": 10.0965,
                "locationLongitude": 99.8274
            }
        ]
    });

    // Diving Centers
    await prisma.fish.deleteMany({});
    await prisma.fish.createMany({
        data: [
            {
                "name": "Titan triggerfish",
                "image": "https://example.com/titan_triggerfish.jpg"
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

}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });