# Lambourne House Theme

This folder is a WordPress theme and also includes a static PHP local preview for quick front-end checks.

## Run Locally

Requirements:

- PHP available in PATH

Double-click:

```text
start-local-preview.bat
```

Or run:

```powershell
.\local-static-preview.ps1
```

Then open:

- `http://localhost:8080/`
- `http://localhost:8080/about-us/`
- `http://localhost:8080/contact-us/`
- `http://localhost:8080/our-team/`

Use another port:

```powershell
.\local-static-preview.ps1 -Port 8081
```

or:

```bat
start-local-preview.bat 8081
```

Keep the server window open while previewing. Press `Ctrl+C` to stop it.

The static preview renders the same HTML partials, CSS, JS, images, and videos from this theme folder. It does not run WordPress admin, plugins, database content, or real contact-form email sending.

More detail is in `LOCAL_PREVIEW.md`.
