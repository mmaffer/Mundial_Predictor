import { PrismaClient, MatchPhase } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import teamsData from './teams.json';
import stadiumsData from './stadiums.json';
import matchesData from './matches.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mundial.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: adminUsername,
      firstName: 'Administrador',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // ─── Teams ──────────────────────────────────────────────────────────────────
  for (const team of teamsData) {
    await prisma.team.upsert({
      where: { shortName: team.shortName },
      update: { name: team.name, flagEmoji: team.flagEmoji, groupName: team.groupName },
      create: team,
    });
  }
  console.log(`✅ ${teamsData.length} teams seeded`);

  // ─── Stadiums ───────────────────────────────────────────────────────────────
  for (const stadium of stadiumsData) {
    await prisma.stadium.upsert({
      where: { name: stadium.name },
      update: {},
      create: stadium,
    });
  }
  console.log(`✅ ${stadiumsData.length} stadiums seeded`);

  // ─── Matches ────────────────────────────────────────────────────────────────
  for (const m of matchesData) {
    const homeTeam = await prisma.team.findUnique({ where: { shortName: m.homeTeamShortName } });
    const awayTeam = await prisma.team.findUnique({ where: { shortName: m.awayTeamShortName } });
    const stadium = await prisma.stadium.findUnique({ where: { name: m.stadiumName } });

    if (!homeTeam || !awayTeam) {
      console.warn(`⚠️  Skipping match: team not found (${m.homeTeamShortName} vs ${m.awayTeamShortName})`);
      continue;
    }

    const existing = await prisma.match.findFirst({
      where: { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, scheduledAt: new Date(m.scheduledAt) },
    });

    if (!existing) {
      await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          stadiumId: stadium?.id,
          phase: m.phase as MatchPhase,
          groupName: m.groupName,
          matchday: m.matchday,
          scheduledAt: new Date(m.scheduledAt),
        },
      });
    }
  }
  console.log(`✅ ${matchesData.length} matches seeded`);

  // ─── Public rooms ────────────────────────────────────────────────────────────
  const publicRooms = [
    { name: 'Sala Latinoamérica',  code: 'LATAM26', maxMembers: 5000,  isPrivate: false },
    { name: 'Mundial Oficial 2026', code: 'WC2026',  maxMembers: 50000, isPrivate: false },
    { name: 'Predicción Europa',   code: 'EUR26',   maxMembers: 10000, isPrivate: false },
  ];

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  for (const room of publicRooms) {
    await prisma.room.upsert({
      where: { code: room.code },
      update: {},
      create: { ...room, creatorId: admin.id },
    });
  }
  console.log('✅ Public rooms created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
