const express = require("express");
const Tone = require("../models/Tone");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const toCreator = (creator) => {
  if (!creator || !creator._id) {
    return undefined;
  }

  return {
    id: creator._id.toString(),
    _id: creator._id,
    username: creator.username,
    email: creator.email
  };
};

const mapToObject = (value) => {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }

  return value || {};
};

const cabinetToLabel = (cabinet) => {
  if (!cabinet) {
    return "";
  }

  if (typeof cabinet === "string") {
    return cabinet;
  }

  return [cabinet.type, cabinet.speakerCount].filter(Boolean).join(" ");
};

const normalizeCabinet = (body) => {
  if (body.cabinet && typeof body.cabinet === "object") {
    return {
      type: body.cabinet.type,
      speakerCount: body.cabinet.speakerCount
    };
  }

  if (typeof body.cabinet === "string") {
    return {
      type: "",
      speakerCount: body.cabinet
    };
  }

  return undefined;
};

const normalizeAmp = (body) => {
  if (body.amp && typeof body.amp === "object") {
    return {
      ampDefinitionId: body.amp.ampDefinitionId,
      name: body.amp.name,
      bypassed: body.amp.bypassed,
      settings: body.amp.settings || {}
    };
  }

  if (
    typeof body.amp === "string" ||
    body.gain !== undefined ||
    body.bass !== undefined ||
    body.mids !== undefined ||
    body.treble !== undefined ||
    body.presence !== undefined
  ) {
    return {
      name: body.amp,
      settings: {
        gain: body.gain,
        bass: body.bass,
        middle: body.middle ?? body.mids,
        treble: body.treble,
        presence: body.presence,
        master: body.master
      }
    };
  }

  return undefined;
};

const normalizeSignalChain = (body) => {
  if (Array.isArray(body.signalChain)) {
    return body.signalChain.map((item, index) => ({
      position: item.position ?? index,
      pedal: {
        pedalDefinitionId: item.pedal?.pedalDefinitionId,
        name: item.pedal?.name || item.name
      },
      settings: item.settings || {}
    }));
  }

  if (Array.isArray(body.effects)) {
    return body.effects.map((effect, index) => ({
      position: index,
      pedal: {
        name: effect
      },
      settings: {}
    }));
  }

  return undefined;
};

const buildTonePayload = (body, creatorId) => {
  const payload = {
    title: body.title,
    artistInspiredBy: body.artistInspiredBy,
    genre: body.genre,
    thumbnailUrl: body.thumbnailUrl
  };

  if (creatorId) {
    payload.creatorId = creatorId;
  }

  const amp = normalizeAmp(body);
  const cabinet = normalizeCabinet(body);
  const signalChain = normalizeSignalChain(body);

  if (amp) {
    payload.amp = amp;
  }

  if (cabinet) {
    payload.cabinet = cabinet;
  }

  if (signalChain) {
    payload.signalChain = signalChain;
  }

  return payload;
};

const applyToneUpdates = (tone, updates) => {
  ["title", "artistInspiredBy", "genre", "signalChain", "thumbnailUrl"].forEach((key) => {
    if (updates[key] !== undefined) {
      tone[key] = updates[key];
    }
  });

  if (updates.amp) {
    const newSettings = updates.amp.settings || {};
    const oldSettings = tone.amp?.settings || {};
    const mergedSettings = { ...mapToObject(oldSettings), ...newSettings };

    tone.amp = {
      ampDefinitionId: updates.amp.ampDefinitionId ?? tone.amp?.ampDefinitionId,
      name: updates.amp.name ?? tone.amp?.name,
      bypassed: updates.amp.bypassed ?? tone.amp?.bypassed ?? false,
      settings: mergedSettings
    };
  }

  if (updates.cabinet) {
    tone.cabinet = {
      type: updates.cabinet.type ?? tone.cabinet?.type,
      speakerCount: updates.cabinet.speakerCount ?? tone.cabinet?.speakerCount
    };
  }
};

const toToneResponse = (tone) => {
  const object = tone.toObject ? tone.toObject() : tone;
  const creator = toCreator(object.creatorId);
  const ampSettings = object.amp?.settings || {};
  const signalChain = object.signalChain || [];

  return {
    ...object,
    id: object._id.toString(),
    creator: creator || {
      id: object.creatorId?.toString(),
      _id: object.creatorId
    },
    ampDetails: object.amp,
    cabinetDetails: object.cabinet,
    amp: object.amp?.name || "",
    cabinet: cabinetToLabel(object.cabinet),
    gain: ampSettings.gain,
    bass: ampSettings.bass,
    mids: ampSettings.middle,
    treble: ampSettings.treble,
    presence: ampSettings.presence,
    effects: signalChain.map((item) => item.pedal?.name).filter(Boolean),
    signalChain: signalChain.map((item) => ({
      ...item,
      settings: mapToObject(item.settings)
    }))
  };
};

// GET /api/tones
// Public route. Supports filtering with query params like ?genre=Metal&amp=Modern%20Metal
router.get("/", async (req, res) => {
  try {
    const { genre, artistInspiredBy, amp, creatorId, limit } = req.query;
    const filters = {};

    if (genre) {
      filters.genre = genre;
    }

    if (artistInspiredBy) {
      filters.artistInspiredBy = artistInspiredBy;
    }

    if (amp) {
      filters["amp.name"] = amp;
    }

    if (creatorId) {
      filters.creatorId = creatorId;
    }

    const query = Tone.find(filters)
      .populate("creatorId", "username email")
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(Number(limit));
    }

    const tones = await query;

    res.json(tones.map(toToneResponse));
  } catch (error) {
    res.status(500).json({ message: "Server error while getting tones" });
  }
});

// GET /api/tones/:id
// Public route for viewing one tone.
router.get("/:id", async (req, res) => {
  try {
    const tone = await Tone.findById(req.params.id).populate("creatorId", "username email");

    if (!tone) {
      return res.status(404).json({ message: "Tone not found" });
    }

    res.json(toToneResponse(tone));
  } catch (error) {
    res.status(500).json({ message: "Server error while getting tone" });
  }
});

// POST /api/tones
// Protected route. The logged-in user's id becomes the creatorId.
router.post("/", protect, async (req, res) => {
  try {
    const tone = await Tone.create(buildTonePayload(req.body, req.user._id));

    const populatedTone = await tone.populate("creatorId", "username email");

    res.status(201).json(toToneResponse(populatedTone));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error while creating tone" });
  }
});

// PUT /api/tones/:id
// Protected route. Only the user who created the tone can edit it.
router.put("/:id", protect, async (req, res) => {
  try {
    const tone = await Tone.findById(req.params.id);

    if (!tone) {
      return res.status(404).json({ message: "Tone not found" });
    }

    if (tone.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own tones" });
    }

    const updates = buildTonePayload(req.body);

    applyToneUpdates(tone, updates);

    const updatedTone = await tone.save();

    await updatedTone.populate("creatorId", "username email");

    res.json(toToneResponse(updatedTone));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error while updating tone" });
  }
});

// DELETE /api/tones/:id
// Protected route. Only the user who created the tone can delete it.
router.delete("/:id", protect, async (req, res) => {
  try {
    const tone = await Tone.findById(req.params.id);

    if (!tone) {
      return res.status(404).json({ message: "Tone not found" });
    }

    if (tone.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own tones" });
    }

    await tone.deleteOne();

    res.json({ message: "Tone deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting tone" });
  }
});

module.exports = router;
