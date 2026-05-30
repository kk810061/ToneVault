const mongoose = require("mongoose");

const ampControlSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
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
    }
  },
  { _id: false }
);

const ampDefinitionSchema = new mongoose.Schema(
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
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    toneCharacteristics: {
      type: [String],
      default: []
    },
    controls: {
      type: [ampControlSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AmpDefinition", ampDefinitionSchema);
