const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Tone = require("../models/Tone");

dotenv.config();

const isPlainObject = (value) => {
  return value && typeof value === "object" && !Array.isArray(value);
};

const migrateTone = (tone) => {
  const updates = {};

  if (!isPlainObject(tone.amp)) {
    updates.amp = {
      name: typeof tone.amp === "string" ? tone.amp : "",
      settings: {
        gain: tone.gain ?? 50,
        bass: tone.bass ?? 50,
        middle: tone.middle ?? tone.mids ?? 50,
        treble: tone.treble ?? 50,
        presence: tone.presence ?? 50,
        master: tone.master ?? 50
      }
    };
  }

  if (!isPlainObject(tone.cabinet)) {
    updates.cabinet = {
      type: "",
      speakerCount: typeof tone.cabinet === "string" ? tone.cabinet : ""
    };
  }

  if (!Array.isArray(tone.signalChain) && Array.isArray(tone.effects)) {
    updates.signalChain = tone.effects.map((effect, index) => ({
      position: index,
      pedal: {
        name: effect
      },
      settings: {}
    }));
  }

  return updates;
};

const runMigration = async () => {
  await connectDB();

  const cursor = Tone.collection.find({});
  let checked = 0;
  let migrated = 0;

  for await (const tone of cursor) {
    checked += 1;
    const updates = migrateTone(tone);

    if (Object.keys(updates).length === 0) {
      continue;
    }

    await Tone.collection.updateOne(
      { _id: tone._id },
      {
        $set: updates,
        $unset: {
          effects: "",
          gain: "",
          bass: "",
          mids: "",
          middle: "",
          treble: "",
          presence: "",
          master: ""
        }
      }
    );

    migrated += 1;
  }

  console.log(`Checked ${checked} tones`);
  console.log(`Migrated ${migrated} tones`);

  await mongoose.connection.close();
};

runMigration().catch(async (error) => {
  console.error("Tone migration failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
