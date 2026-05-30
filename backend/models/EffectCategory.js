const mongoose = require("mongoose");

const effectCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    importance: {
      type: String,
      required: true,
      trim: true
    },
    recommendedChainPosition: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EffectCategory", effectCategorySchema);
