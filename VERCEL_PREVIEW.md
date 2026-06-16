# Vercel Static Preview

This theme can be deployed to Vercel as a static visual preview. It does not run WordPress, PHP, plugins, the database, or real form submissions.

## Files to Upload

Upload these extra files/folders to the root of the GitHub repo:

- `package.json`
- `vercel.json`
- `scripts/build-static-preview.mjs`
- `VERCEL_PREVIEW.md`

The existing theme folders also need to be present:

- `css`
- `html`
- `icons`
- `images`
- `js`
- `videos`
- `style.css`

## Vercel Settings

Import the GitHub repo into Vercel and use:

- Framework preset: `Other`
- Build command: `npm run build`
- Output directory: `dist-preview`

Vercel will run the build script and serve the generated static pages.

## Preview Routes

- `/`
- `/about-us/`
- `/contact-us/`
- `/our-team/`
- `/news-events/`
- `/our-process/`
- `/coworking/`
- `/office-space/`
- `/meeting-rooms/pearl-suite/`
- `/meeting-rooms/harlech-suite/`
- `/meeting-rooms/foundry-room/`
- `/meeting-rooms/murrayfield-room/`
- `/meeting-rooms/pods/`
- `/meeting-rooms/portside/`
