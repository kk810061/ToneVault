const EffectCategory = require("../models/EffectCategory");

const effectCategories = [
  { name: "Noise Gate", importance: "utility", recommendedChainPosition: 10 },
  { name: "Compressor", importance: "dynamics", recommendedChainPosition: 20 },
  { name: "Wah", importance: "filter", recommendedChainPosition: 25 },
  { name: "Volume", importance: "utility", recommendedChainPosition: 28 },
  { name: "Overdrive", importance: "gain", recommendedChainPosition: 30 },
  { name: "Distortion", importance: "gain", recommendedChainPosition: 40 },
  { name: "Fuzz", importance: "gain", recommendedChainPosition: 50 },
  { name: "EQ", importance: "tone shaping", recommendedChainPosition: 60 },
  { name: "Chorus", importance: "modulation", recommendedChainPosition: 70 },
  { name: "Phaser", importance: "modulation", recommendedChainPosition: 80 },
  { name: "Flanger", importance: "modulation", recommendedChainPosition: 90 },
  { name: "Tremolo", importance: "modulation", recommendedChainPosition: 92 },
  { name: "Vibrato", importance: "modulation", recommendedChainPosition: 94 },
  { name: "Pitch Shifter", importance: "pitch", recommendedChainPosition: 96 },
  { name: "Octaver", importance: "pitch", recommendedChainPosition: 98 },
  { name: "Delay", importance: "time based", recommendedChainPosition: 100 },
  { name: "Reverb", importance: "ambience", recommendedChainPosition: 110 },
  { name: "Looper", importance: "utility", recommendedChainPosition: 120 }
];

const seedEffectCategories = async () => {
  const categories = [];

  for (const category of effectCategories) {
    const savedCategory = await EffectCategory.findOneAndUpdate(
      { name: category.name },
      category,
      { new: true, upsert: true, runValidators: true }
    );

    categories.push(savedCategory);
  }

  return categories;
};

module.exports = {
  effectCategories,
  seedEffectCategories
};
