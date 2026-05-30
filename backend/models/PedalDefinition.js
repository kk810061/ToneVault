const mongoose = require("mongoose");

const pedalControlSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      default: "knob"
    },
    minValue: {
      type: Number,
      required: true
    },
    maxValue: {
      type: Number,
      required: true,
      validate: {
        validator(value) {
          return value > this.minValue;
        },
        message: "maxValue must be greater than minValue"
      }
    },
    defaultValue: {
      type: Number,
      required: true
    },
    enumValues: {
      type: [String],
      default: []
    },
    unit: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const pedalDefinitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EffectCategory",
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    controls: {
      type: [pedalControlSchema],
      default: []
    },
    ui: {
      color: {
        type: String,
        trim: true,
        default: ""
      },
      icon: {
        type: String,
        trim: true,
        default: ""
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PedalDefinition", pedalDefinitionSchema);
