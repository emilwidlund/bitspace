import { PrismaClient } from '@prisma/client';
import ClientPage from './ClientPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../server/utils';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await getServerSession(authOptions);

    const prisma = new PrismaClient();
    const circuits = await prisma.node.findMany({ where: { type: 'CIRCUIT' } });

    return <ClientPage circuits={circuits} />;
}
