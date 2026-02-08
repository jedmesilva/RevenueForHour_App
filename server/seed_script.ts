
import { storage } from "./storage";

async function seed() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  console.log("Seeding data...");

  // Clear existing for clean slate (optional, but good for dev)
  // await storage.clearDay(today);
  // await storage.clearDay(yesterday);

  // Check if we have data first?
  const existingToday = await storage.getEntriesByDate(today);
  if (existingToday.length === 0) {
    // Add for today
    await storage.createEntry({ date: today, hour: 9, amount: 5000 }); // R$ 50
    await storage.createEntry({ date: today, hour: 11, amount: 12500 }); // R$ 125
    await storage.createEntry({ date: today, hour: 14, amount: 7550 }); // R$ 75.50
    await storage.createEntry({ date: today, hour: 16, amount: 20000 }); // R$ 200
  }

  const existingYesterday = await storage.getEntriesByDate(yesterday);
  if (existingYesterday.length === 0) {
    // Add for yesterday
    await storage.createEntry({ date: yesterday, hour: 10, amount: 8000 }); // R$ 80
    await storage.createEntry({ date: yesterday, hour: 15, amount: 15000 }); // R$ 150
  }
  
  console.log("Seeding complete!");
}

seed().catch(console.error);
