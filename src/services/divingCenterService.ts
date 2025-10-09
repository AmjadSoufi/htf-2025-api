import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

export const getAllDivingCenters = async () => {
    return await prisma.divingCenter.findMany();
};