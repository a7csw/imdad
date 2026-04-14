import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imdad.iq' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@imdad.iq',
      password: adminPassword,
      phone: '07701234567',
      city: 'Baghdad',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Categories
  const categories = [
    { name: 'Protein', nameAr: 'بروتين', nameKu: 'پرۆتین', slug: 'protein', icon: '💪' },
    { name: 'Creatine', nameAr: 'كرياتين', nameKu: 'کریاتین', slug: 'creatine', icon: '⚡' },
    { name: 'Pre-Workout', nameAr: 'ما قبل التمرين', nameKu: 'پێش ڕاهێنان', slug: 'pre-workout', icon: '🔥' },
    { name: 'Mass Gainer', nameAr: 'رابح كتلة', nameKu: 'گەیاندنی بەرم', slug: 'mass-gainer', icon: '🏋️' },
    { name: 'BCAA', nameAr: 'بي سي أيه أيه', nameKu: 'BCAA', slug: 'bcaa', icon: '🧬' },
    { name: 'Vitamins', nameAr: 'فيتامينات', nameKu: 'ڤیتامینەکان', slug: 'vitamins', icon: '💊' },
    { name: 'Fat Burners', nameAr: 'حارق دهون', nameKu: 'شەوکردنی چەوری', slug: 'fat-burners', icon: '🔥' },
    { name: 'Accessories', nameAr: 'إكسسوارات', nameKu: 'ئامرازەکان', slug: 'accessories', icon: '🎽' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // Brands
  const brands = [
    { name: 'Optimum Nutrition', slug: 'optimum-nutrition', origin: 'USA' },
    { name: 'MuscleTech', slug: 'muscletech', origin: 'USA' },
    { name: 'Dymatize', slug: 'dymatize', origin: 'USA' },
    { name: 'BSN', slug: 'bsn', origin: 'USA' },
    { name: 'Scitec Nutrition', slug: 'scitec-nutrition', origin: 'Hungary' },
    { name: 'MyProtein', slug: 'myprotein', origin: 'UK' },
    { name: 'Universal Nutrition', slug: 'universal-nutrition', origin: 'USA' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log(`✅ ${brands.length} brands seeded`);

  console.log('\n✨ Seeding complete!\n');
  console.log('Admin credentials:');
  console.log('  Email: admin@imdad.iq');
  console.log('  Password: Admin@123456\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
