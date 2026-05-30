const EffectCategory = require("../models/EffectCategory");
const PedalDefinition = require("../models/PedalDefinition");

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const CATEGORY_UI = {
  "Noise Gate": { color: "#64748b", icon: "shield" },
  Compressor: { color: "#f59e0b", icon: "activity" },
  Wah: { color: "#a855f7", icon: "waves" },
  Volume: { color: "#94a3b8", icon: "volume-2" },
  Looper: { color: "#10b981", icon: "repeat" },
  Overdrive: { color: "#f97316", icon: "flame" },
  Distortion: { color: "#ef4444", icon: "zap" },
  Fuzz: { color: "#ec4899", icon: "sparkles" },
  Phaser: { color: "#06b6d4", icon: "orbit" },
  Chorus: { color: "#3b82f6", icon: "waves" },
  Flanger: { color: "#14b8a6", icon: "radio" },
  Tremolo: { color: "#84cc16", icon: "audio-waveform" },
  Vibrato: { color: "#22c55e", icon: "waveform" },
  Octaver: { color: "#8b5cf6", icon: "chevrons-down-up" },
  "Pitch Shifter": { color: "#6366f1", icon: "arrow-up-down" },
  EQ: { color: "#eab308", icon: "sliders-horizontal" },
  Delay: { color: "#0ea5e9", icon: "clock" },
  Reverb: { color: "#38bdf8", icon: "cloud" }
};

const SELECTOR_VALUES = {
  Mode: ["Standard", "Custom", "Turbo", "Vintage", "Modern", "Shimmer", "Modulate"],
  Range: ["Low", "Mid", "High", "Extended"],
  Memory: ["Memory 1", "Memory 2", "Memory 3", "Memory 4"],
  "Turbo Mode": ["I", "II"],
  Depth: ["Low", "High"],
  Channel: ["A", "B"],
  Modulation: ["Off", "On"],
  Key: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  "Tuner Out": ["Off", "On"],
  "Record Play Overdub": ["Stop", "Record", "Play", "Overdub"],
  Bypass: ["Off", "On"]
};

const control = (name, type, defaultValue, unit = "", enumValues = []) => ({
  name,
  type,
  minValue: 0,
  maxValue: 100,
  defaultValue,
  enumValues,
  unit
});

const knob = (name, defaultValue, unit = "") => control(name, "knob", defaultValue, unit);
const selector = (name, defaultValue, enumValues = SELECTOR_VALUES[name] || []) => {
  return control(name, "selector", defaultValue, "", enumValues);
};
const footswitch = (name, defaultValue = 0) => control(name, "footswitch", defaultValue, "", SELECTOR_VALUES[name] || ["Off", "On"]);
const expression = (name, defaultValue) => control(name, "expression", defaultValue);

const pedalDefinitions = [
  {
    name: "Boss NS-2",
    categoryName: "Noise Gate",
    description: "Industry-standard noise suppressor for high-gain rigs and tight stop-start rhythm playing.",
    controls: [knob("Threshold", 45), knob("Decay", 35), selector("Mode", 0), footswitch("Bypass", 0)]
  },
  {
    name: "Boss CS-3",
    categoryName: "Compressor",
    description: "Versatile compressor/sustainer for clean funk, country picking, lead sustain, and level smoothing.",
    controls: [knob("Sustain", 45), knob("Attack", 40), knob("Tone", 50), knob("Level", 65)]
  },
  {
    name: "Dunlop Cry Baby 535Q",
    categoryName: "Wah",
    description: "Modern adjustable wah used for classic rock, funk, metal leads, and expressive filter sweeps.",
    controls: [expression("Pedal", 0), knob("Q", 55), selector("Range", 50), knob("Boost", 0)]
  },
  {
    name: "Boss FV-500",
    categoryName: "Volume",
    description: "Rugged volume/expression pedal for swells, gain staging, and hands-free parameter control.",
    controls: [expression("Pedal", 100), knob("Minimum Volume", 0), footswitch("Tuner Out", 0)]
  },
  {
    name: "Boss RC-5",
    categoryName: "Looper",
    description: "Compact phrase looper for practice, live layering, and building ambient or rhythmic backing parts.",
    controls: [knob("Loop Level", 75), knob("Rhythm Level", 45), selector("Memory", 0), footswitch("Record Play Overdub", 0)]
  },
  {
    name: "Tube Screamer TS808",
    categoryName: "Overdrive",
    description: "Classic smooth mid-hump overdrive for blues leads, edge-of-breakup push, and tightening high-gain amps.",
    controls: [knob("Overdrive", 32), knob("Tone", 52), knob("Level", 72)]
  },
  {
    name: "Tube Screamer TS9",
    categoryName: "Overdrive",
    description: "Mid-forward overdrive for tightening amps, pushing solos forward, and adding focused drive.",
    controls: [knob("Drive", 35), knob("Tone", 50), knob("Level", 70)]
  },
  {
    name: "Boss SD-1",
    categoryName: "Overdrive",
    description: "Asymmetrical clipping overdrive with a familiar mid push for rock, metal boosts, and lead sustain.",
    controls: [knob("Drive", 38), knob("Tone", 55), knob("Level", 72)]
  },
  {
    name: "Boss BD-2",
    categoryName: "Overdrive",
    description: "Dynamic blues overdrive that ranges from transparent grit to fuzzy amp-like breakup.",
    controls: [knob("Gain", 42), knob("Tone", 52), knob("Level", 65)]
  },
  {
    name: "Klon Centaur",
    categoryName: "Overdrive",
    description: "Transparent-style overdrive and boost with rich harmonic content and polished upper mids.",
    controls: [knob("Gain", 28), knob("Treble", 55), knob("Output", 72)]
  },
  {
    name: "Boss DS-1",
    categoryName: "Distortion",
    description: "Classic hard-clipping distortion for punk, grunge, alt rock, and aggressive lead tones.",
    controls: [knob("Distortion", 55), knob("Tone", 50), knob("Level", 65)]
  },
  {
    name: "Boss DS-2",
    categoryName: "Distortion",
    description: "Turbo distortion with two voicings, covering classic DS-1 crunch through focused lead midrange.",
    controls: [knob("Distortion", 58), knob("Tone", 50), knob("Level", 65), selector("Turbo Mode", 0)]
  },
  {
    name: "ProCo RAT 2",
    categoryName: "Distortion",
    description: "Gritty distortion/fuzz hybrid with filter-based tone shaping for rock, punk, doom, and lead bite.",
    controls: [knob("Distortion", 60), knob("Filter", 45), knob("Volume", 65)]
  },
  {
    name: "Big Muff Pi",
    categoryName: "Fuzz",
    description: "Sustaining fuzz with a thick, scooped voice for stoner rock, shoegaze, leads, and walls of sound.",
    controls: [knob("Sustain", 72), knob("Tone", 50), knob("Volume", 65)]
  },
  {
    name: "Fuzz Face",
    categoryName: "Fuzz",
    description: "Vintage two-transistor fuzz with expressive cleanup from guitar volume and touch-sensitive response.",
    controls: [knob("Fuzz", 78), knob("Volume", 70)]
  },
  {
    name: "Boss FZ-1W",
    categoryName: "Fuzz",
    description: "Modern Waza fuzz covering vintage and modern textures with strong definition and usable cleanup.",
    controls: [knob("Fuzz", 65), knob("Tone", 52), knob("Level", 66), selector("Mode", 0)]
  },
  {
    name: "MXR Phase 90",
    categoryName: "Phaser",
    description: "Single-knob four-stage phaser for Van Halen-style swirl, funk movement, and subtle modulation.",
    controls: [knob("Speed", 38)]
  },
  {
    name: "Boss CE-2W",
    categoryName: "Chorus",
    description: "Waza chorus covering classic CE-2 warmth and CE-1-style dimensional modulation.",
    controls: [knob("Rate", 35), knob("Depth", 55), selector("Mode", 0)]
  },
  {
    name: "Small Clone",
    categoryName: "Chorus",
    description: "Iconic analog chorus with wide, watery modulation for clean arpeggios, grunge, and ambient parts.",
    controls: [knob("Rate", 38), selector("Depth", 50)]
  },
  {
    name: "Boss BF-3",
    categoryName: "Flanger",
    description: "Flexible flanger for jet sweeps, metallic movement, stereo modulation, and modern effect textures.",
    controls: [knob("Manual", 50), knob("Depth", 55), knob("Rate", 35), knob("Resonance", 45), selector("Mode", 0)]
  },
  {
    name: "Boss TR-2",
    categoryName: "Tremolo",
    description: "Classic amp-style tremolo for surf, roots, indie, and rhythmic volume modulation.",
    controls: [knob("Rate", 40), knob("Wave", 50), knob("Depth", 55)]
  },
  {
    name: "Boss VB-2W",
    categoryName: "Vibrato",
    description: "Pitch-modulating vibrato for vintage wobble, lo-fi movement, and expressive warble.",
    controls: [knob("Rate", 38), knob("Depth", 50), knob("Rise Time", 25), selector("Mode", 0)]
  },
  {
    name: "Boss OC-5",
    categoryName: "Octaver",
    description: "Modern octave pedal with vintage and polyphonic modes for bass doubling, synth-like lines, and octave leads.",
    controls: [knob("Direct Level", 75), knob("Octave Down", 45), knob("Octave Up", 20), selector("Mode", 50)]
  },
  {
    name: "Boss PS-6",
    categoryName: "Pitch Shifter",
    description: "Pitch shifter and harmonist for intelligent harmony, dive-bomb effects, detune, and octave movement.",
    controls: [knob("Balance", 50), knob("Shift", 50), knob("Key", 50), selector("Mode", 0)]
  },
  {
    name: "Boss GE-7",
    categoryName: "EQ",
    description: "Seven-band graphic EQ for boosts, cuts, solo shaping, problem-frequency control, and amp matching.",
    controls: [
      knob("100 Hz", 50),
      knob("200 Hz", 50),
      knob("400 Hz", 50),
      knob("800 Hz", 50),
      knob("1.6 kHz", 50),
      knob("3.2 kHz", 50),
      knob("6.4 kHz", 50),
      knob("Level", 50)
    ]
  },
  {
    name: "Boss EQ-200",
    categoryName: "EQ",
    description: "Programmable graphic EQ for precise tone sculpting, dual EQ setups, and modern preset-based rigs.",
    controls: [
      selector("Channel", 0),
      knob("31 Hz", 50),
      knob("62 Hz", 50),
      knob("125 Hz", 50),
      knob("250 Hz", 50),
      knob("500 Hz", 50),
      knob("1 kHz", 50),
      knob("2 kHz", 50),
      knob("4 kHz", 50),
      knob("8 kHz", 50),
      knob("16 kHz", 50),
      knob("Level", 50)
    ]
  },
  {
    name: "Boss DD-3",
    categoryName: "Delay",
    description: "Digital delay with crisp repeats for slapback, rhythmic echoes, leads, and clean ambient repeats.",
    controls: [knob("Effect Level", 35), knob("Feedback", 30), knob("Delay Time", 45, "ms"), selector("Mode", 50)]
  },
  {
    name: "MXR Carbon Copy",
    categoryName: "Delay",
    description: "Analog delay with dark repeats, soft modulation, and simple mix control for leads and ambience.",
    controls: [knob("Delay", 45, "ms"), knob("Regen", 35), knob("Mix", 30), selector("Modulation", 0)]
  },
  {
    name: "Boss RV-6",
    categoryName: "Reverb",
    description: "Compact multi-mode reverb covering room, hall, plate, spring, shimmer, modulate, and dynamic ambience.",
    controls: [knob("Effect Level", 38), knob("Tone", 52), knob("Time", 48), selector("Mode", 50)]
  }
];

const seedPedalDefinitions = async () => {
  const savedPedals = [];

  for (const pedal of pedalDefinitions) {
    const category = await EffectCategory.findOne({ name: pedal.categoryName });

    if (!category) {
      throw new Error(`Missing effect category: ${pedal.categoryName}`);
    }

    const savedPedal = await PedalDefinition.findOneAndUpdate(
      { name: pedal.name },
      {
        name: pedal.name,
        slug: pedal.slug || slugify(pedal.name),
        category: category._id,
        description: pedal.description,
        controls: pedal.controls,
        ui: pedal.ui || CATEGORY_UI[pedal.categoryName] || { color: "#71717a", icon: "circle" }
      },
      { new: true, upsert: true, runValidators: true }
    );

    savedPedals.push(savedPedal);
  }

  return savedPedals;
};

module.exports = {
  pedalDefinitions,
  seedPedalDefinitions
};
