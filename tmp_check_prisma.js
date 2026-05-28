import { PrismaClient } from '@prisma/client';

(async function () {
  const p = new PrismaClient();
  try {
    const r = await p.trendingPost.findFirst();
    console.log('RESULT', r ? 'found' : 'none');
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await p.$disconnect();
  }
})();
