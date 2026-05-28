/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main(){
  const prisma = new PrismaClient();
  const email = process.argv[2];
  if(!email){
    console.error('Usage: node scripts/promote_user_to_admin.js user@example.com');
    process.exit(2);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if(!user){
    console.error('User not found:', email);
    await prisma.$disconnect();
    process.exit(1);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
  console.log('Updated user:', updated.email, '-> role:', updated.role);
  await prisma.$disconnect();
}

main().catch(async (err)=>{
  console.error('Error:', err);
  process.exit(1);
});
