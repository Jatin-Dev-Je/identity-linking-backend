"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const contact1 = await prisma.contact.create({
        data: {
            phoneNumber: '123456',
            email: 'lorraine@hillvalley.edu',
            linkPrecedence: 'primary',
        },
    });
    const contact2 = await prisma.contact.create({
        data: {
            phoneNumber: '123456',
            email: 'mcfly@hillvalley.edu',
            linkedId: contact1.id,
            linkPrecedence: 'secondary',
        },
    });
    console.log('✅ Seed completed successfully');
    console.log('Created contacts:', { contact1, contact2 });
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map