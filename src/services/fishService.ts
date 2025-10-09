import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

export const getAllFish = async () => {
    return prisma.fish.findMany();
};

export const getFishById = async (id: string) => {
    return prisma.fish.findUnique({
        where: {
            id
        },
        include: {
            sightings: true
        }
    });
};
