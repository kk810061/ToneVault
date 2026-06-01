const mongoose = require("mongoose");

const pedalSnapshotSchema = new mongoose.Schema(
  {
    pedalDefinitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PedalDefinition"
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const signalChainItemSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 0
    },
    pedal: {
      type: pedalSnapshotSchema,
      required: true
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: false }
);

// Removed strict ampSettingsSchema

const ampSnapshotSchema = new mongoose.Schema(
  {
    ampDefinitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AmpDefinition"
    },
    name: {
      type: String,
      trim: true
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    bypassed: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const cabinetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      default: ""
    },
    speakerCount: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const toneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    artistInspiredBy: {
      type: String,
      trim: true
    },
    genre: {
      type: String,
      trim: true
    },
    amp: {
      type: ampSnapshotSchema,
      default: () => ({})
    },
    cabinet: {
      type: cabinetSchema,
      default: () => ({})
    },
    thumbnailUrl: {
      type: String,
      default: ""
    },
    signalChain: {
      type: [signalChainItemSchema],
      default: [],
      validate: {
        validator(items) {
          const positions = items.map((item) => item.position);
          return positions.length === new Set(positions).size;
        },
        message: "Signal chain positions must be unique"
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

toneSchema.pre("validate", function sortSignalChain(next) {
  if (Array.isArray(this.signalChain)) {
    this.signalChain.sort((a, b) => a.position - b.position);
  }

  next();
});

module.exports = mongoose.model("Tone", toneSchema);
