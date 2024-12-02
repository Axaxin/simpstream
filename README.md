# FLV Worker

A simple FLV player deployed on Cloudflare Workers that supports FLV files, RTMP streams, and M3U8 streams.

## Features

- Login page with password protection
- FLV/RTMP/M3U8 video playback
- Clean and responsive UI
- Background image from Unsplash
- Session management with JWT

## Deployment Instructions

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Configure environment variables in Cloudflare Dashboard:
   - `AUTH_PASSWORD`: Set your desired login password
   - `JWT_SECRET`: Set a secure random string for JWT signing

4. Deploy to Cloudflare Workers:
```bash
wrangler publish
```

## Usage

1. Visit your worker's URL
2. Login with the configured password
3. Enter a video URL (FLV/RTMP/M3U8) in the input field
4. Click "Play" to start playback

## Security

- Password-protected access
- JWT-based session management
- HttpOnly cookies
- SameSite cookie policy
- No sensitive data exposure

## Technologies Used

- Cloudflare Workers
- FLV.js for video playback
- JWT for authentication
- Unsplash for background images
