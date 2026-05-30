const AmpDefinition = require("../models/AmpDefinition");

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const AMP_ENUM_VALUES = {
  bright: ["Off", "On"],
  "top boost": ["Off", "On"],
  channel: ["Clean", "Crunch", "Lead"],
  "modern vintage": ["Vintage", "Modern"],
  tight: ["Off", "On"],
  sat: ["Off", "On"],
  "mid boost": ["Off", "On"],
  excursion: ["Loose", "Medium", "Tight"]
};

const control = (name, defaultValue, enumValues = []) => ({
  name,
  minValue: 0,
  maxValue: 100,
  defaultValue,
  enumValues
});

const ampControl = (name, defaultValue) => control(name, defaultValue, AMP_ENUM_VALUES[name] || []);

const baseControls = ({
  gain = 45,
  bass = 50,
  middle = 50,
  treble = 55,
  presence = 45,
  master = 65
} = {}) => [
  ampControl("gain", gain),
  ampControl("bass", bass),
  ampControl("middle", middle),
  ampControl("treble", treble),
  ampControl("presence", presence),
  ampControl("master", master)
];

const ampDefinitions = [
  {
    name: "Fender Twin Reverb",
    category: "Clean",
    description: "High-headroom American clean with glassy top end, scooped mids, tight lows, lush spring reverb character, and excellent pedal platform behavior.",
    toneCharacteristics: ["high headroom", "glassy", "scooped", "pedal platform"],
    controls: [...baseControls({ gain: 22, bass: 45, middle: 38, treble: 62, presence: 50, master: 75 }), ampControl("bright", 60), ampControl("reverb", 35)]
  },
  {
    name: "Fender Deluxe Reverb",
    category: "Clean",
    description: "Classic American combo with sparkling cleans, earlier breakup than a Twin, warm lows, sweet top end, and roots/blues edge-of-breakup response.",
    toneCharacteristics: ["sparkling", "edge of breakup", "warm", "roots"],
    controls: [...baseControls({ gain: 34, bass: 48, middle: 42, treble: 58, presence: 48, master: 68 }), ampControl("bright", 50), ampControl("reverb", 40)]
  },
  {
    name: "Fender Bassman",
    category: "Clean",
    description: "Tweed-inspired clean-to-crunch platform with round low end, woody mids, smooth highs, and vintage blues/rock authority.",
    toneCharacteristics: ["tweed", "round lows", "woody mids", "vintage crunch"],
    controls: [...baseControls({ gain: 42, bass: 55, middle: 56, treble: 52, presence: 45, master: 70 }), ampControl("normal volume", 50), ampControl("bright volume", 42)]
  },
  {
    name: "Vox AC30",
    category: "Clean",
    description: "British chime with jangly highs, vocal upper mids, responsive EL84 compression, and iconic indie/classic-rock sparkle.",
    toneCharacteristics: ["chime", "jangly", "upper mids", "compressed"],
    controls: [...baseControls({ gain: 38, bass: 45, middle: 55, treble: 63, presence: 52, master: 68 }), ampControl("cut", 45), ampControl("top boost", 65)]
  },
  {
    name: "Marshall Plexi",
    category: "Classic Rock",
    description: "Vintage British crunch with open dynamics, bright attack, chewy mids, and classic rock power-amp breakup.",
    toneCharacteristics: ["british", "open", "chewy mids", "power amp crunch"],
    controls: [...baseControls({ gain: 58, bass: 48, middle: 65, treble: 62, presence: 58, master: 72 }), ampControl("normal volume", 45), ampControl("bright volume", 65)]
  },
  {
    name: "Marshall JCM800",
    category: "Classic Rock",
    description: "Punchy British master-volume crunch with cutting upper mids, tight pick attack, and hard-rock rhythm authority.",
    toneCharacteristics: ["punchy", "upper mids", "tight attack", "hard rock"],
    controls: [...baseControls({ gain: 62, bass: 52, middle: 68, treble: 60, presence: 56, master: 70 }), ampControl("preamp", 68)]
  },
  {
    name: "Marshall JCM900",
    category: "Classic Rock",
    description: "More saturated Marshall voice with sharper attack, modernized gain, tighter low end, and aggressive 90s rock character.",
    toneCharacteristics: ["saturated", "sharp attack", "90s rock", "tight"],
    controls: [...baseControls({ gain: 68, bass: 50, middle: 58, treble: 62, presence: 60, master: 68 }), ampControl("channel", 60), ampControl("contour", 45)]
  },
  {
    name: "Peavey 5150",
    category: "High Gain",
    description: "Aggressive high-gain standard with saturated mids, tight low end, fast attack, and modern metal rhythm focus.",
    toneCharacteristics: ["aggressive", "saturated", "tight lows", "metal"],
    controls: [...baseControls({ gain: 72, bass: 55, middle: 42, treble: 62, presence: 58, master: 65 }), ampControl("resonance", 62)]
  },
  {
    name: "EVH 5150 III",
    category: "High Gain",
    description: "Refined 5150-family high gain with articulate saturation, strong note separation, tight bass, and polished lead sustain.",
    toneCharacteristics: ["articulate", "polished", "tight bass", "lead sustain"],
    controls: [...baseControls({ gain: 68, bass: 52, middle: 48, treble: 60, presence: 55, master: 65 }), ampControl("resonance", 58), ampControl("channel", 70)]
  },
  {
    name: "Mesa Dual Rectifier",
    category: "High Gain",
    description: "Massive American high gain with deep lows, percussive attack, scooped-to-modern voicing, and huge palm-muted rhythm tones.",
    toneCharacteristics: ["massive", "deep lows", "percussive", "scooped"],
    controls: [...baseControls({ gain: 70, bass: 58, middle: 42, treble: 63, presence: 56, master: 64 }), ampControl("modern vintage", 70), ampControl("solo", 55)]
  },
  {
    name: "Soldano SLO-100",
    category: "High Gain",
    description: "Smooth boutique high gain with singing lead sustain, focused mids, controlled lows, and premium hot-rodded clarity.",
    toneCharacteristics: ["smooth", "singing sustain", "focused mids", "boutique"],
    controls: [...baseControls({ gain: 64, bass: 50, middle: 60, treble: 58, presence: 54, master: 66 }), ampControl("depth", 52)]
  },
  {
    name: "Friedman BE-100",
    category: "High Gain",
    description: "Hot-rodded British high gain with polished saturation, chewy mids, tight lows, and refined modern rock aggression.",
    toneCharacteristics: ["hot rodded", "british", "chewy mids", "refined"],
    controls: [...baseControls({ gain: 66, bass: 52, middle: 58, treble: 56, presence: 52, master: 66 }), ampControl("tight", 60), ampControl("sat", 45)]
  },
  {
    name: "ENGL Fireball 100",
    category: "High Gain",
    description: "Tight German high gain with precise low end, sharp attack, compressed saturation, and modern metal clarity.",
    toneCharacteristics: ["german", "precise", "compressed", "modern metal"],
    controls: [...baseControls({ gain: 70, bass: 54, middle: 44, treble: 64, presence: 60, master: 64 }), ampControl("depth punch", 62), ampControl("mid boost", 35)]
  },
  {
    name: "Mesa Mark IV",
    category: "High Gain",
    description: "Focused Mark-series voice with liquid sustain, tight low end, strong graphic-EQ shaping potential, and articulate progressive-metal leads.",
    toneCharacteristics: ["focused", "liquid sustain", "graphic eq", "progressive"],
    controls: [
      ...baseControls({ gain: 66, bass: 42, middle: 55, treble: 65, presence: 52, master: 64 }),
      ampControl("80 Hz", 58),
      ampControl("240 Hz", 45),
      ampControl("750 Hz", 38),
      ampControl("2200 Hz", 55),
      ampControl("6600 Hz", 52)
    ]
  },
  {
    name: "Bogner Uberschall",
    category: "High Gain",
    description: "Dark, massive high gain with thick low mids, huge low end, smooth saturation, and heavy modern rock/metal authority.",
    toneCharacteristics: ["dark", "massive", "low mids", "heavy"],
    controls: [...baseControls({ gain: 72, bass: 60, middle: 48, treble: 55, presence: 50, master: 64 }), ampControl("depth", 66), ampControl("excursion", 55)]
  },
  {
    name: "Diezel VH4",
    category: "High Gain",
    description: "Tight German multi-channel high gain with percussive tracking, authoritative low mids, and precise modern metal definition.",
    toneCharacteristics: ["percussive", "low mids", "precise", "multi channel"],
    controls: [...baseControls({ gain: 68, bass: 55, middle: 52, treble: 58, presence: 56, master: 64 }), ampControl("deep", 60), ampControl("channel", 75)]
  },
  {
    name: "PRS Archon",
    category: "High Gain",
    description: "Modern high gain with smooth saturation, clear note separation, strong low-end punch, and versatile rock-to-metal response.",
    toneCharacteristics: ["smooth", "note separation", "low punch", "versatile"],
    controls: [...baseControls({ gain: 66, bass: 53, middle: 50, treble: 58, presence: 54, master: 65 }), ampControl("bright", 40), ampControl("depth", 55)]
  }
];

const seedAmpDefinitions = async () => {
  const savedAmps = [];

  for (const amp of ampDefinitions) {
    const savedAmp = await AmpDefinition.findOneAndUpdate(
      { name: amp.name },
      {
        ...amp,
        slug: amp.slug || slugify(amp.name)
      },
      { new: true, upsert: true, runValidators: true }
    );

    savedAmps.push(savedAmp);
  }

  return savedAmps;
};

module.exports = {
  ampDefinitions,
  seedAmpDefinitions
};
