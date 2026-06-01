# ToneVault

ToneVault is a full-stack, premium guitar tone sharing platform built to resemble professional DSP software like Neural DSP, Helix Native, and Quad Cortex. It provides a gorgeous horizontal hardware workbench to build, share, and discover custom signal chains.

## Advanced UI/UX Features

- **Apple-style Sticky Horizontal Scroll:** A dynamically measured workbench layout that mathematically ties your browser's raw vertical scrollbar directly to the horizontal sliding of your pedalboard for an incredibly premium, 1:1 scrolljacking experience.
- **Premium Hardware UI:** Extremely detailed, CSS-heavy pedal graphics with interactive, draggable metallic knobs and mathematically accurate, shadow-cast patch cables.
- **Hardware-Accelerated Animation:** Built on top of `framer-motion` for hardware-accelerated layout transforms, buttery smooth zooming, and fluid drag-and-drop physics.

## Project Structure

This is a monorepo containing:
- `/frontend`: Next.js 15, React 19, Tailwind CSS 4, Framer Motion, and dnd-kit for an interactive drag-and-drop hardware workbench.
- `/backend`: Node.js, Express, MongoDB, Mongoose, and JWT Authentication for storing the tone catalog and signal chains.

---

## 🎸 Frontend Setup

The frontend uses Next.js and pnpm.

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend will run at `http://localhost:3000`.

---

## 🔌 Backend Setup

The backend is an Express/MongoDB application.

```bash
cd backend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tonevault
JWT_SECRET=replace_this_with_a_long_random_secret
```

### Database Seeding & Migration

Seed the DSP catalog data (pedals, amps, cabs):

```bash
cd backend
npm run seed
```

Migrate existing tones from the old flat effects/amp shape into the DSP-ready hardware shape:

```bash
npm run migrate:tones
```

---

## Backend API Routes

### Authentication

- `POST /api/auth/register`: Create a new account
- `POST /api/auth/login`: Login and receive a JWT token

### Tones (Public & Protected)

- `GET /api/tones`: Get all tones (Supports query params: `?genre=Metal&amp=Modern%20Metal`)
- `GET /api/tones/:id`: Get a specific tone
- `POST /api/tones`: Create a tone (Requires Auth)
- `PUT /api/tones/:id`: Update a tone (Requires Auth, must be creator)
- `DELETE /api/tones/:id`: Delete a tone (Requires Auth, must be creator)

### Example Tone Payload (DSP Shape)

```json
{
  "title": "Metal Rhythm",
  "artistInspiredBy": "James Hetfield",
  "genre": "Metal",
  "amp": {
    "definitionSlug": "modern-metal",
    "settings": { "gain": 80, "bass": 55, "middle": 45, "treble": 65, "presence": 60, "master": 70 }
  },
  "cabinet": {
    "definitionSlug": "4x12-v30"
  },
  "signalChain": [
    {
      "id": "pedal-12345",
      "definitionSlug": "green-drive",
      "settings": { "Drive": 20, "Tone": 55, "Level": 80 },
      "bypassed": false
    }
  ]
}
```

## DSP Catalog Architecture

The backend includes dynamic MongoDB collections to drive the UI:
- `EffectCategory`: category name, importance, and recommended chain position.
- `PedalDefinition`: pedal name, category reference, description, and control definitions.
- `AmpDefinition`: amp name, category, description, and control definitions.

Enjoy building your tones! 🤘
