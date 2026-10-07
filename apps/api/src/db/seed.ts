import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db, pool } from './index';
import {
  driverProfiles,
  menuCategories,
  menuItems,
  restaurants,
  userRoles,
  users,
} from './schema';
import { UserRole } from '@food-delivery/types';

const SEED_PASSWORD = 'Password123!';

const restaurantNames = [
  'Savanna Kitchen',
  'Mama Tolu’s Kitchen',
  'The Jollof House',
  'Lagos Grill',
  'Urban Bites',
  'Naija Bowl',
  'Pepper & Spice',
  'The Food Yard',
  'Coastal Kitchen',
  'Chop & Chill',
  'Taste of Home',
  'The Rice Room',
  'Green Plate',
  'City Eats',
  'Palm Grove Kitchen',
];

const cuisines = ['Nigerian', 'Continental', 'Fast Food', 'African', 'Grill'];

const categories = ['Main Meals', 'Rice Dishes', 'Soups'];

const menuItemsByCategory: Record<string, string[]> = {
  'Main Meals': ['Chicken and Chips', 'Beef Burger', 'Grilled Chicken'],
  'Rice Dishes': ['Jollof Rice', 'Fried Rice', 'Ofada Rice'],
  Soups: ['Egusi Soup', 'Efo Riro', 'Ogbono Soup'],
};

async function seed() {
  console.log('🌱 Starting database seed...');

  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  await db.transaction(async (tx) => {
    /*
     * -------------------------------------------------------
     * ADMIN
     * -------------------------------------------------------
     */

    const [admin] = await tx
      .insert(users)
      .values({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@example.com',
        password,
        phone: '+2348000000000',
      })
      .returning();

    await tx.insert(userRoles).values({
      userId: admin.id,
      role: UserRole.ADMIN,
    });

    /*
     * -------------------------------------------------------
     * CUSTOMERS
     * -------------------------------------------------------
     */

    const customers = await tx
      .insert(users)
      .values(
        Array.from({ length: 10 }, (_, index) => ({
          firstName: `Customer${index + 1}`,
          lastName: 'User',
          email: `customer${index + 1}@example.com`,
          password,
          phone: `+23480100000${String(index + 1).padStart(2, '0')}`,
          emailVerified: true,
        })),
      )
      .returning();

    await tx.insert(userRoles).values(
      customers.map((user) => ({
        userId: user.id,
        role: UserRole.CUSTOMER,
      })),
    );

    /*
     * -------------------------------------------------------
     * DRIVERS
     * -------------------------------------------------------
     */

    const drivers = await tx
      .insert(users)
      .values(
        Array.from({ length: 10 }, (_, index) => ({
          firstName: `Driver${index + 1}`,
          lastName: 'User',
          email: `driver${index + 1}@example.com`,
          password,
          phone: `+23480200000${String(index + 1).padStart(2, '0')}`,
        })),
      )
      .returning();

    await tx.insert(userRoles).values(
      drivers.flatMap((user) => [
        {
          userId: user.id,
          role: UserRole.CUSTOMER,
        },
        {
          userId: user.id,
          role: UserRole.DRIVER,
        },
      ]),
    );

    await tx.insert(driverProfiles).values(
      drivers.map((user) => ({
        userId: user.id,
        verificationStatus: 'APPROVED' as const,
        isOnline: false,
      })),
    );

    /*
     * -------------------------------------------------------
     * RESTAURANT OWNERS
     * -------------------------------------------------------
     */

    const owners = await tx
      .insert(users)
      .values(
        Array.from({ length: 10 }, (_, index) => ({
          firstName: `Owner${index + 1}`,
          lastName: 'User',
          email: `owner${index + 1}@example.com`,
          password,
          phone: `+23480300000${String(index + 1).padStart(2, '0')}`,
        })),
      )
      .returning();

    await tx.insert(userRoles).values(
      owners.flatMap((user) => [
        {
          userId: user.id,
          role: UserRole.CUSTOMER,
        },
        {
          userId: user.id,
          role: UserRole.RESTAURANT_OWNER,
        },
      ]),
    );

    /*
     * -------------------------------------------------------
     * RESTAURANTS
     * -------------------------------------------------------
     */

    const restaurantRows = await tx
      .insert(restaurants)
      .values(
        restaurantNames.map((name, index) => ({
          ownerId: owners[index % owners.length].id,
          name,
          description: `A seed restaurant serving quality ${cuisines[index % cuisines.length]} meals.`,
          address: `${index + 1} Market Street`,
          city: 'Ibadan',
          cuisineType: cuisines[index % cuisines.length],
          verificationStatus: 'APPROVED' as const,
          isOpen: false,
        })),
      )
      .returning();

    /*
     * -------------------------------------------------------
     * MENU CATEGORIES + ITEMS
     * -------------------------------------------------------
     */

    for (const restaurant of restaurantRows) {
      for (const categoryName of categories) {
        const [category] = await tx
          .insert(menuCategories)
          .values({
            restaurantId: restaurant.id,
            name: categoryName,
          })
          .returning();

        const items = menuItemsByCategory[categoryName];

        await tx.insert(menuItems).values(
          items.map((name, index) => ({
            restaurantId: restaurant.id,
            categoryId: category.id,
            name,
            description: `Delicious ${name.toLowerCase()} prepared fresh.`,
            price: String((2500 + index * 500).toFixed(2)),
            isAvailable: true,
          })),
        );
      }
    }
  });

  console.log('✅ Database seed completed.');
  console.log('');
  console.log('Development password:', SEED_PASSWORD);
  console.log('');
  console.log('Accounts:');
  console.log('Admin:    admin@example.com');
  console.log('Customers: customer1@example.com → customer10@example.com');
  console.log('Drivers:   driver1@example.com → driver10@example.com');
  console.log('Owners:    owner1@example.com → owner10@example.com');
}

seed()
  .catch((error) => {
    console.error('❌ Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
