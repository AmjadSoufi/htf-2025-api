import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

export const getAllFish = async () => {
    return prisma.fish.findMany();
};
