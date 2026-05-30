const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { seedEffectCategories } = require("./effectCategories");
const { seedPedalDefinitions } = require("./pedalDefinitions");
const { seedAmpDefinitions } = require("./ampDefinitions");

dotenv.config();

const runSeeds = async () => {
  await connectDB();

  const categories = await seedEffectCategories();
  const pedals = await seedPedalDefinitions();
  const amps = await seedAmpDefinitions();

  console.log(`Seeded ${categories.length} effect categories`);
  console.log(`Seeded ${pedals.length} pedal definitions`);
  console.log(`Seeded ${amps.length} amp definitions`);

  await mongoose.connection.close();
};

runSeeds().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
