const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
    const user = await prisma.utilisateur.findUnique({ where: { email: 'thomas.dupont.5@ethicaldata.local' }, include: { roles: true }});
    console.log(JSON.stringify(user, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
}
test().finally(() => prisma.$disconnect());
