import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Mise à jour des anciennes URL de notifications...');
    const result = await prisma.notification.updateMany({
        where: {
            lien: '/admin/coaching',
        },
        data: {
            lien: '/dashboard/appointments',
        },
    });
    console.log(`✅ ${result.count} notification(s) mise(s) à jour avec succès !`);
}

main()
    .catch((err) => {
        console.error('❌ Erreur lors de la mise à jour des notifications:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
