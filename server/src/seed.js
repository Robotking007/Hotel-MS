import bcrypt from 'bcryptjs';
import supabase from './supabase.js';

/**
 * QuickServe Database Seed Script
 * Run: npm run seed (or: node src/seed.js)
 *
 * Creates demo users, categories, 24 menu items, and sample orders
 */
const seed = async () => {
  console.log('\n🌱 QuickServe — Seeding Database...\n');

  try {
    // ────────────────────────────────────
    // 1. Clean existing data
    // ────────────────────────────────────
    console.log('🧹 Clearing existing data...');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // ────────────────────────────────────
    // 2. Create Demo Users
    // ────────────────────────────────────
    console.log('👤 Creating demo users...');
    const passwordHash = await bcrypt.hash('demo123', 12);

    const { data: users, error: usersErr } = await supabase
      .from('users')
      .insert([
        { name: 'Admin Chef', email: 'admin@quickserve.com', password_hash: passwordHash, phone: '+91 98765 43210', role: 'admin' },
        { name: 'Kitchen Staff', email: 'staff@quickserve.com', password_hash: passwordHash, phone: '+91 98765 43211', role: 'staff' },
        { name: 'Rahul Sharma', email: 'customer@quickserve.com', password_hash: passwordHash, phone: '+91 98765 43212', role: 'customer' },
        { name: 'Priya Patel', email: 'priya@example.com', password_hash: passwordHash, phone: '+91 98765 43213', role: 'customer' },
        { name: 'Amit Kumar', email: 'amit@example.com', password_hash: passwordHash, phone: '+91 98765 43214', role: 'customer' }
      ])
      .select();

    if (usersErr) throw usersErr;
    console.log(`   ✅ Created ${users.length} users`);

    // ────────────────────────────────────
    // 3. Create Categories
    // ────────────────────────────────────
    console.log('📂 Creating categories...');
    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .insert([
        { name: 'Starters', display_order: 1 },
        { name: 'Mains', display_order: 2 },
        { name: 'Burgers', display_order: 3 },
        { name: 'Pizza', display_order: 4 },
        { name: 'Beverages', display_order: 5 },
        { name: 'Desserts', display_order: 6 }
      ])
      .select();

    if (catErr) throw catErr;
    console.log(`   ✅ Created ${categories.length} categories`);

    const cat = {};
    categories.forEach(c => cat[c.name] = c.id);

    // ────────────────────────────────────
    // 4. Create Menu Items (24 total)
    // ────────────────────────────────────
    console.log('🍽️  Creating menu items...');
    const menuItemsData = [
      // Starters
      { name: 'Crispy Spring Rolls', description: 'Golden-fried vegetable spring rolls served with sweet chili dipping sauce and fresh herbs', price: 249, category_id: cat['Starters'], image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop' },
      { name: 'Garlic Bread Supreme', description: 'Oven-baked artisan bread loaded with roasted garlic butter, mozzarella, and Italian herbs', price: 199, category_id: cat['Starters'], image_url: 'https://images.unsplash.com/photo-1619535860434-ba1c1512361b?w=500&h=350&fit=crop' },
      { name: 'Buffalo Chicken Wings', description: 'Crispy chicken wings tossed in fiery buffalo sauce, served with blue cheese dip and celery', price: 349, category_id: cat['Starters'], image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=350&fit=crop' },
      { name: 'Loaded Nachos Platter', description: 'Tortilla chips smothered in melted cheese, jalapeños, salsa, sour cream, and guacamole', price: 299, category_id: cat['Starters'], image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=350&fit=crop' },

      // Mains
      { name: 'Grilled Chicken Steak', description: 'Herb-marinated chicken breast grilled to perfection, served with mashed potatoes and seasonal vegetables', price: 549, category_id: cat['Mains'], image_url: 'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=500&h=350&fit=crop' },
      { name: 'Pan-Seared Salmon', description: 'Atlantic salmon fillet pan-seared with lemon butter sauce, asparagus, and wild rice pilaf', price: 699, category_id: cat['Mains'], image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=350&fit=crop' },
      { name: 'Lamb Rack Rosemary', description: 'Premium lamb rack slow-roasted with rosemary and garlic, served with roasted root vegetables', price: 799, category_id: cat['Mains'], image_url: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=500&h=350&fit=crop' },
      { name: 'Truffle Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms, truffle oil, parmesan, and fresh thyme', price: 449, category_id: cat['Mains'], image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=350&fit=crop' },

      // Burgers
      { name: 'Classic Beef Smash', description: 'Double smashed beef patties, American cheese, caramelized onions, pickles, and special sauce on a brioche bun', price: 399, category_id: cat['Burgers'], image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop' },
      { name: 'BBQ Bacon Beast', description: 'Angus beef patty, crispy bacon, smoked gouda, BBQ sauce, onion rings, and coleslaw', price: 449, category_id: cat['Burgers'], image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=350&fit=crop' },
      { name: 'Chicken Avocado Deluxe', description: 'Grilled chicken breast, fresh avocado, Swiss cheese, sun-dried tomato mayo, arugula', price: 429, category_id: cat['Burgers'], image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&h=350&fit=crop' },
      { name: 'Beyond Veggie Burger', description: 'Plant-based patty with roasted peppers, vegan cheese, lettuce, tomato, and chipotle aioli', price: 379, category_id: cat['Burgers'], image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&h=350&fit=crop' },

      // Pizza
      { name: 'Margherita Classica', description: 'San Marzano tomato sauce, fresh mozzarella di bufala, basil leaves, and extra virgin olive oil', price: 349, category_id: cat['Pizza'], image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=350&fit=crop' },
      { name: 'Pepperoni Supreme', description: 'Double pepperoni, mozzarella, oregano, and our signature tomato sauce on a hand-tossed crust', price: 449, category_id: cat['Pizza'], image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=350&fit=crop' },
      { name: 'BBQ Chicken Ranch', description: 'Smoky BBQ chicken, red onions, bell peppers, cilantro, mozzarella, and ranch drizzle', price: 499, category_id: cat['Pizza'], image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=350&fit=crop' },
      { name: 'Four Cheese Fantasy', description: 'Mozzarella, gorgonzola, fontina, and parmesan on a garlic-infused white sauce base', price: 429, category_id: cat['Pizza'], image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=350&fit=crop' },

      // Beverages
      { name: 'Fresh Squeezed OJ', description: 'Farm-fresh oranges squeezed to order — pure, no sugar added, served ice-cold', price: 149, category_id: cat['Beverages'], image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&h=350&fit=crop' },
      { name: 'Iced Caramel Latte', description: 'Double espresso with silky milk, caramel syrup, and crushed ice — topped with whipped cream', price: 199, category_id: cat['Beverages'], image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=350&fit=crop' },
      { name: 'Mango Tango Smoothie', description: 'Alphonso mango blended with yogurt, honey, and a touch of cardamom — tropical bliss', price: 179, category_id: cat['Beverages'], image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=350&fit=crop' },
      { name: 'Sparkling Mint Lemonade', description: 'Fresh lime juice, crushed mint, sugar syrup, and sparkling water — refreshingly fizzy', price: 129, category_id: cat['Beverages'], image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&h=350&fit=crop' },

      // Desserts
      { name: 'Chocolate Lava Cake', description: 'Warm, gooey dark chocolate cake with a molten center, served with vanilla bean ice cream', price: 299, category_id: cat['Desserts'], image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&h=350&fit=crop' },
      { name: 'New York Cheesecake', description: 'Classic creamy cheesecake on a graham cracker crust with fresh berry compote', price: 279, category_id: cat['Desserts'], image_url: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&h=350&fit=crop' },
      { name: 'Tiramisu Royale', description: 'Espresso-soaked ladyfingers layered with mascarpone cream, cocoa, and Amaretto', price: 329, category_id: cat['Desserts'], image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=350&fit=crop' },
      { name: 'Triple Scoop Sundae', description: 'Three scoops of premium ice cream with hot fudge, whipped cream, nuts, and a cherry on top', price: 249, category_id: cat['Desserts'], image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=350&fit=crop' }
    ];

    const { data: menuItems, error: menuErr } = await supabase
      .from('menu_items')
      .insert(menuItemsData)
      .select();

    if (menuErr) throw menuErr;
    console.log(`   ✅ Created ${menuItems.length} menu items`);

    // ────────────────────────────────────
    // 5. Create Sample Orders
    // ────────────────────────────────────
    console.log('📦 Creating sample orders...');

    const customer1 = users.find(u => u.email === 'customer@quickserve.com');
    const customer2 = users.find(u => u.email === 'priya@example.com');
    const customer3 = users.find(u => u.email === 'amit@example.com');

    const sampleOrders = [
      { customer_id: customer1.id, total_amount: 847, status: 'preparing', payment_status: 'paid', payment_reference: 'pay_demo_001', estimated_time: 20 },
      { customer_id: customer2.id, total_amount: 1147, status: 'confirmed', payment_status: 'paid', payment_reference: 'pay_demo_002', estimated_time: 25 },
      { customer_id: customer3.id, total_amount: 528, status: 'ready', payment_status: 'paid', payment_reference: 'pay_demo_003', estimated_time: 15 },
      { customer_id: customer1.id, total_amount: 698, status: 'completed', payment_status: 'paid', payment_reference: 'pay_demo_004', estimated_time: 20 },
      { customer_id: customer2.id, total_amount: 378, status: 'pending', payment_status: 'pending', estimated_time: 15 }
    ];

    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .insert(sampleOrders)
      .select();

    if (ordersErr) throw ordersErr;

    // Add items to each order
    const orderItemsData = [
      // Order 1: Spring Rolls + Chicken Steak
      { order_id: orders[0].id, menu_item_id: menuItems[0].id, quantity: 1, unit_price: 249, subtotal: 249 },
      { order_id: orders[0].id, menu_item_id: menuItems[4].id, quantity: 1, unit_price: 549, subtotal: 549 },

      // Order 2: BBQ Bacon Burger + Pepperoni Pizza + Latte
      { order_id: orders[1].id, menu_item_id: menuItems[9].id, quantity: 1, unit_price: 449, subtotal: 449 },
      { order_id: orders[1].id, menu_item_id: menuItems[13].id, quantity: 1, unit_price: 449, subtotal: 449 },
      { order_id: orders[1].id, menu_item_id: menuItems[17].id, quantity: 1, unit_price: 199, subtotal: 199 },

      // Order 3: Nachos + Lava Cake
      { order_id: orders[2].id, menu_item_id: menuItems[3].id, quantity: 1, unit_price: 299, subtotal: 299 },
      { order_id: orders[2].id, menu_item_id: menuItems[20].id, quantity: 1, unit_price: 299, subtotal: 299 },

      // Order 4: Salmon + Cheesecake
      { order_id: orders[3].id, menu_item_id: menuItems[5].id, quantity: 1, unit_price: 699, subtotal: 699 },

      // Order 5: Margherita Pizza
      { order_id: orders[4].id, menu_item_id: menuItems[12].id, quantity: 1, unit_price: 349, subtotal: 349 },
    ];

    const { error: oiErr } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (oiErr) throw oiErr;
    console.log(`   ✅ Created ${orders.length} sample orders with items`);

    // ────────────────────────────────────
    // Done
    // ────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('  Demo Accounts:');
    console.log('  ┌──────────────────────────────────────────┐');
    console.log('  │  Admin:    admin@quickserve.com / demo123│');
    console.log('  │  Staff:    staff@quickserve.com / demo123│');
    console.log('  │  Customer: customer@quickserve.com / demo123│');
    console.log('  └──────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
