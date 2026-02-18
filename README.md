# রঞ্জনের কীর্তি (ranjan-er-kirti)

A responsive public mosaic gallery where anyone can upload images — stored permanently on Cloudinary.

## Features

- 📷 Public image upload (no login required)
- 🖼️ Beautiful mosaic/masonry gallery layout
- 💾 Permanent storage via Cloudinary
- 🌍 Globally accessible
- 🔍 Lightbox viewer with keyboard navigation
- ✨ Bengali-inspired editorial aesthetic

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Cloudinary

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Fill in your values from [cloudinary.com/console](https://cloudinary.com/console):

```
CLOUDINARY_CLOUD_NAME=myname
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=myname
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ranjan_kirti
```

### 3. Create an Upload Preset in Cloudinary

1. Go to **Settings → Upload** in your Cloudinary dashboard
2. Click **Add upload preset**
3. Set **Signing Mode** to **Unsigned**
4. Name it `ranjan_kirti` (or whatever you set in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)
5. Save

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Gallery | `/` | Mosaic grid of all uploaded images |
| Upload | `/upload` | Drag & drop upload interface |

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Architecture

```
ranjan-er-kirti/
├── pages/
│   ├── index.js          # Gallery page (mosaic)
│   ├── upload.js         # Upload page
│   ├── _app.js           # App wrapper
│   └── api/
│       └── images.js     # API: GET list images, POST save metadata
├── components/
│   └── Navbar.js         # Navigation bar
├── styles/
│   └── globals.css       # Global styles & mosaic layout
├── .env.local.example    # Environment variables template
└── next.config.js        # Next.js config (Cloudinary image domain)
```

**Upload flow:**
1. User selects images on `/upload`
2. Browser uploads directly to Cloudinary (`unsigned` preset)
3. Success response saved to `/api/images` (POST)
4. Gallery at `/` calls `/api/images` (GET) → fetches from Cloudinary Admin API

This direct-upload approach keeps your server load minimal.

---

*Built with Next.js + Cloudinary*
