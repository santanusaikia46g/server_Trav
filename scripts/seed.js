require('dotenv').config();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Destination = require('../models/Destination');
const Package = require('../models/Package');

const destinationsData = [
  {
    name: 'Goa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Famous for its pristine beaches, vibrant nightlife, Portuguese heritage, and delicious seafood.',
    bestTimeToVisit: 'November to February'
  },
  {
    name: 'Ladakh',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    description: 'A land of dramatic landscapes, cold deserts, high-altitude passes, and beautiful Buddhist monasteries.',
    bestTimeToVisit: 'June to September'
  },
  {
    name: 'Kerala',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    description: 'Known as God\'s Own Country, offering tranquil backwaters, lush hill stations, and Ayurvedic wellness.',
    bestTimeToVisit: 'September to March'
  },
  {
    name: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1477584308802-e9c37c0f1676?auto=format&fit=crop&w=800&q=80',
    description: 'The land of kings, imperial forts, grand palaces, vibrant culture, and golden sand dunes.',
    bestTimeToVisit: 'October to March'
  },
  {
    name: 'Himachal',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    description: 'Home to scenic mountain towns, snow-capped peaks, and adventurous trekking trails.',
    bestTimeToVisit: 'March to June & September to December'
  }
];

const packagesData = [
  {
    title: 'Glorious Goa Getaway',
    description: 'Experience the ultimate tropical escape with our Goa Getaway. Enjoy pristine beaches, historic churches, local spice plantations, and cruise at sunset. Perfect for couples and families alike.',
    price: 14999,
    duration: '4 Days / 3 Nights',
    destination: 'Goa',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Beach Evening', description: 'Arrive at Goa Airport/Railway station. Transfer to hotel. In the evening, visit Calangute Beach and enjoy a beautiful sunset.' },
      { day: 2, title: 'North Goa Sightseeing', description: 'Explore Fort Aguada, Sinquerim Beach, Anjuna Beach, and Vagator Beach. Experience Goa\'s active nightlife.' },
      { day: 3, title: 'South Goa Culture & Cruise', description: 'Visit Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, and Miramar Beach. End the day with a Mandovi River boat cruise.' },
      { day: 4, title: 'Departure', description: 'Spend some time shopping for local spices and handicrafts. Transfer to airport/station for departure.' }
    ],
    included: ['3-star hotel accommodation', 'Daily breakfast', 'Airport/Station transfers', 'All sightseeing tours in private AC car', 'Sunset river cruise ticket'],
    excluded: ['Airfare / Train tickets', 'Lunch & dinner', 'Adventure water sports fees', 'Personal expenses']
  },
  {
    title: 'Magical Ladakh Expedition',
    description: 'Journey to the land of high passes. Marvel at the blue waters of Pangong Lake, ride double-humped camels in Nubra Valley, and cross Khardung La, one of the world\'s highest motorable roads.',
    price: 34999,
    duration: '6 Days / 5 Nights',
    destination: 'Ladakh',
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
    ],
    itinerary: [
      { day: 1, title: 'Leh Arrival & Acclimatization', description: 'Arrive at Leh Kushok Bakula Rimpochee Airport. Check-in to the hotel and rest the entire day to adapt to high altitude.' },
      { day: 2, title: 'Leh Local Sightseeing', description: 'Visit Hall of Fame, Magnetic Hill, Confluence of Indus and Zanskar rivers (Sangam), and Shanti Stupa.' },
      { day: 3, title: 'Leh to Nubra Valley via Khardung La', description: 'Drive to Nubra Valley through the famous Khardung La Pass (17,582 ft). Visit Diskit Monastery and enjoy camel rides in Hunder Dunes.' },
      { day: 4, title: 'Nubra Valley to Pangong Lake', description: 'Travel to Pangong Lake via Shyok River route. Soak in the shifting colors of the high-altitude saltwater lake.' },
      { day: 5, title: 'Pangong Lake to Leh', description: 'Drive back to Leh crossing Chang La Pass. Evening free for shopping at Leh Main Bazaar.' },
      { day: 6, title: 'Departure', description: 'Check-out from hotel. Transfer to Leh Airport for your return flight.' }
    ],
    included: ['5 nights hotel & luxury camp stay', 'Breakfast and dinner included', 'Khardung La inner line permits', 'Expert driver-guide', 'Oxygen cylinder support in vehicle'],
    excluded: ['Flight tickets', 'Lunch and snacks', 'Camel ride charges', 'Any items of personal nature']
  },
  {
    title: 'Lush Kerala Backwaters Tour',
    description: 'Relax in the serene lap of nature. Cruise through Vembanad Lake in a traditional houseboat, walk through spice plantations in Thekkady, and enjoy the misty hills of Munnar.',
    price: 22999,
    duration: '5 Days / 4 Nights',
    destination: 'Kerala',
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    ],
    itinerary: [
      { day: 1, title: 'Cochin Arrival & Transfer to Munnar', description: 'Pick up from Cochin. Enjoy a scenic 4-hour drive to Munnar, passing through Valara and Cheeyappara waterfalls.' },
      { day: 2, title: 'Munnar Tea Gardens & Hills', description: 'Visit Eravikulam National Park (Nilgiri Tahr), Mattupetty Dam, Echo Point, and Rose Gardens.' },
      { day: 3, title: 'Munnar to Thekkady Wilderness', description: 'Drive to Thekkady. Take a spice plantation walk and enjoy a boating tour on Periyar Lake.' },
      { day: 4, title: 'Thekkady to Alleppey Houseboat', description: 'Transfer to Alleppey. Board your private houseboat. Enjoy a leisurely cruise along backwaters with traditional Kerala meals.' },
      { day: 5, title: 'Departure from Cochin', description: 'After breakfast, disembark from the houseboat and transfer back to Cochin Airport/Railway station.' }
    ],
    included: ['3 nights premium resort stay', '1 night private deluxe Houseboat stay', 'All meals on the houseboat', 'Daily breakfast at resorts', 'Airport transfers and sightseeing in AC sedan'],
    excluded: ['Train/Airfare', 'Periyar boating tickets', 'Kathakali show entry tickets', 'Tips and portage']
  },
  {
    title: 'Royal Rajasthan Heritage Trail',
    description: 'Step into the past with our royal Rajasthan package. Marvel at Jaipur\'s Amber Fort, cruise the lakes of Udaipur, and experience cultural dance performances in the Thar Desert.',
    price: 26999,
    duration: '6 Days / 5 Nights',
    destination: 'Rajasthan',
    images: [
      'https://images.unsplash.com/photo-1477584308802-e9c37c0f1676?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    itinerary: [
      { day: 1, title: 'Jaipur Arrival & Pink City Sightseeing', description: 'Arrive in Jaipur, transfer to hotel. Visit Hawa Mahal and City Palace. Explore local handicraft markets.' },
      { day: 2, title: 'Jaipur Forts & Palaces', description: 'Visit Amber Fort (with elephant/jeep ride option), Jaigarh Fort, and Jal Mahal.' },
      { day: 3, title: 'Jaipur to Jodhpur (Blue City)', description: 'Drive to Jodhpur. Visit the magnificent Mehrangarh Fort, Jaswant Thada, and Umaid Bhawan Palace museum.' },
      { day: 4, title: 'Jodhpur to Udaipur via Ranakpur', description: 'Drive to Udaipur. En-route visit Ranakpur Jain Temple. Arrive in Udaipur, check-in to your hotel overlooking Lake Pichola.' },
      { day: 5, title: 'Udaipur Lake City Highlights', description: 'Explore City Palace, Jagdish Temple, Saheliyon-ki-Bari, and enjoy a romantic sunset boat ride on Lake Pichola.' },
      { day: 6, title: 'Departure from Udaipur', description: 'Check-out after breakfast. Transfer to Udaipur airport/station for departure.' }
    ],
    included: ['5 nights stay in heritage hotels', 'Daily buffet breakfast', 'Chauffeur-driven AC car for all transfers', 'Guide services at major monuments', 'Lake Pichola boat cruise'],
    excluded: ['Monuments entrance fees', 'Airfare/Train tickets', 'Lunch & dinner', 'Camera charges']
  }
];

const seedDatabase = async ({ autoOnly = false } = {}) => {
  try {
    console.log('Seed: Starting Supabase database check / seeding...');

    // 1. Admin seeding
    const adminCount = await Admin.count().catch(() => 0);
    if (!autoOnly || adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const rawPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
      const existing = await Admin.findByUsername ? await Admin.findByUsername(username) : await Admin.findOne({ username }).catch(() => null);

      if (!existing) {
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        await Admin.create({ username, password: hashedPassword });
        console.log(`Seed: Admin user created. Username: ${username}, Password: ${rawPassword}`);
      }
    }

    // 2. Destinations seeding
    const destCount = await Destination.count().catch(() => 0);
    if (!autoOnly || destCount === 0) {
      for (const dest of destinationsData) {
        const existing = await Destination.findOne({ name: dest.name }).catch(() => null);
        if (!existing) {
          await Destination.create(dest);
        }
      }
      console.log('Seed: Destinations processed/seeded.');
    }

    // 3. Packages seeding
    const pkgCount = await Package.count().catch(() => 0);
    if (!autoOnly || pkgCount === 0) {
      for (const pkg of packagesData) {
        const existingList = await Package.find({ search: pkg.title }).catch(() => []);
        const existing = existingList.find(p => p.title === pkg.title);
        if (!existing) {
          await Package.create(pkg);
        }
      }
      console.log('Seed: Packages processed/seeded.');
    }

    console.log('Seed: Database setup & auto-seeding completed successfully.');
  } catch (error) {
    console.error('Seed: Error during database seeding:', error.message);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDatabase;
