# ToneVault Backend

ToneVault is a beginner-to-intermediate MERN backend for saving and browsing guitar tones.

## Install and Run

```bash
cd backend
npm install
npm run dev
```

For normal production-style running:

```bash
npm start
```

Seed the DSP catalog data:

```bash
npm run seed
```

Migrate existing tones from the old flat effects/amp shape into the DSP-ready shape:

```bash
npm run migrate:tones
```

## Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tonevault
JWT_SECRET=replace_this_with_a_long_random_secret
```

`MONGO_URI` tells Mongoose where MongoDB is running. `JWT_SECRET` is used to sign login tokens, so use a long private value in a real project.

## API Routes

### Auth

Register:

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "username": "riffmaster",
  "email": "riff@example.com",
  "password": "password123"
}
```

Login:

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "riff@example.com",
  "password": "password123"
}
```

Both routes return a `token`. Use it in protected requests:

```http
Authorization: Bearer paste_token_here
```

### Tones

Get all tones:

```http
GET http://localhost:5000/api/tones
```

Get one tone:

```http
GET http://localhost:5000/api/tones/tone_id_here
```

Create a tone:

```http
POST http://localhost:5000/api/tones
Content-Type: application/json
Authorization: Bearer paste_token_here
```

```json
{
  "title": "Metal Rhythm",
  "artistInspiredBy": "James Hetfield",
  "genre": "Metal",
  "amp": {
    "name": "Mesa Dual Rectifier",
    "settings": {
      "gain": 80,
      "bass": 55,
      "middle": 45,
      "treble": 65,
      "presence": 60,
      "master": 70
    }
  },
  "cabinet": {
    "type": "Mesa",
    "speakerCount": "4x12"
  },
  "signalChain": [
    {
      "position": 0,
      "pedal": {
        "name": "Tube Screamer TS9"
      },
      "settings": {
        "Drive": 20,
        "Tone": 55,
        "Level": 80
      }
    }
  ]
}
```

Update a tone:

```http
PUT http://localhost:5000/api/tones/tone_id_here
Content-Type: application/json
Authorization: Bearer paste_token_here
```

```json
{
  "amp": {
    "settings": {
      "gain": 70,
      "presence": 50
    }
  },
  "signalChain": [
    {
      "position": 0,
      "pedal": {
        "name": "Noise Gate"
      },
      "settings": {
        "Threshold": 45
      }
    }
  ]
}
```

For frontend compatibility, `POST /api/tones` and `PUT /api/tones/:id` still accept the old flat shape:

```json
{
  "amp": "Marshall JCM800",
  "cabinet": "4x12",
  "gain": 70,
  "bass": 50,
  "mids": 55,
  "treble": 60,
  "presence": 50,
  "effects": ["Tube Screamer TS9", "Carbon Copy"]
}
```

The API stores that data as structured `amp`, `cabinet`, and `signalChain` fields.

## DSP Catalog Models

The backend includes separate MongoDB collections for:

- `EffectCategory`: category name, importance, and recommended chain position.
- `PedalDefinition`: pedal name, category reference, description, and control definitions.
- `AmpDefinition`: amp name, category, description, and control definitions.

Tone documents now store individual pedal instances in `signalChain`, each with `position`, a pedal snapshot, and a dynamic `settings` object. Amp and cabinet data are stored as structured subdocuments to support future DSP expansion.

Delete a tone:

```http
DELETE http://localhost:5000/api/tones/tone_id_here
Authorization: Bearer paste_token_here
```

## Search and Filtering

These public routes use query params:

```http
GET http://localhost:5000/api/tones?genre=Metal
GET http://localhost:5000/api/tones?artistInspiredBy=James%20Hetfield
GET http://localhost:5000/api/tones?amp=Modern%20Metal
```

You can also combine filters:

```http
GET http://localhost:5000/api/tones?genre=Metal&amp=Modern%20Metal
```

## Postman Testing Flow

1. Send `POST /api/auth/register`.
2. Copy the returned `token`.
3. Send `POST /api/tones` with the token in the `Authorization` header.
4. Send `GET /api/tones` without a token to confirm public users can view tones.
5. Send `PUT /api/tones/:id` with the creator's token to edit the tone.
6. Send `DELETE /api/tones/:id` with the creator's token to delete the tone.

## How a Request Flows

For a public request like `GET /api/tones`, the request enters `server.js`, Express matches `/api/tones`, then the handler in `routes/toneRoutes.js` builds any filters from `req.query`. Mongoose asks MongoDB for matching tones, and Express sends the results as JSON.

For a protected request like `POST /api/tones`, the request enters `server.js`, then goes to `routes/toneRoutes.js`. Before the route handler runs, `middleware/authMiddleware.js` checks the `Authorization` header, verifies the JWT, finds the user in MongoDB, and attaches that user to `req.user`. The route then creates a tone with `creatorId: req.user._id`, saves it through Mongoose, and sends the new tone back as JSON.

For edit and delete, the route first finds the tone in MongoDB. It compares the tone's `creatorId` with `req.user._id`. If they match, the route updates or deletes the tone. If they do not match, the API returns `403 Forbidden`.
