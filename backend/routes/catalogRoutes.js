const express = require("express");
const EffectCategory = require("../models/EffectCategory");
const PedalDefinition = require("../models/PedalDefinition");
const AmpDefinition = require("../models/AmpDefinition");

const router = express.Router();

router.get("/effect-categories", async (req, res) => {
  try {
    const categories = await EffectCategory.find({}).sort({ recommendedChainPosition: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error while getting effect categories" });
  }
});

router.get("/pedals", async (req, res) => {
  try {
    const pedals = await PedalDefinition.find({})
      .populate("category", "name importance recommendedChainPosition")
      .sort({ name: 1 });

    res.json(pedals);
  } catch (error) {
    res.status(500).json({ message: "Server error while getting pedal definitions" });
  }
});

router.get("/pedals/:slug", async (req, res) => {
  try {
    const pedal = await PedalDefinition.findOne({ slug: req.params.slug }).populate(
      "category",
      "name importance recommendedChainPosition"
    );

    if (!pedal) {
      return res.status(404).json({ message: "Pedal definition not found" });
    }

    res.json(pedal);
  } catch (error) {
    res.status(500).json({ message: "Server error while getting pedal definition" });
  }
});

router.get("/amps", async (req, res) => {
  try {
    const amps = await AmpDefinition.find({}).sort({ category: 1, name: 1 });
    res.json(amps);
  } catch (error) {
    res.status(500).json({ message: "Server error while getting amp definitions" });
  }
});

router.get("/amps/:slug", async (req, res) => {
  try {
    const amp = await AmpDefinition.findOne({ slug: req.params.slug });

    if (!amp) {
      return res.status(404).json({ message: "Amp definition not found" });
    }

    res.json(amp);
  } catch (error) {
    res.status(500).json({ message: "Server error while getting amp definition" });
  }
});

module.exports = router;
