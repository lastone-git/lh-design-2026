# Local Theme Preview

## Static PHP Preview

Use this for quick visual checks of the theme without WordPress, WSL, MySQL or a database.

Requirements:

- PHP available in PATH

### Start With Double-Click

Double-click:

```text
start-local-preview.bat
```

Or run it from a terminal:

```powershell
.\start-local-preview.bat
```

### Start With PowerShell

```powershell
.\local-static-preview.ps1
```

Preview URLs:

- Home: `http://localhost:8080/`
- About: `http://localhost:8080/about-us/`
- Contact: `http://localhost:8080/contact-us/`
- Our Team: `http://localhost:8080/our-team/`

Use another port:

```powershell
.\local-static-preview.ps1 -Port 8081
```

or:

```bat
start-local-preview.bat 8081
```

Stop it:

```powershell
Ctrl+C
```

This preview serves the theme files directly and renders the HTML partials with local replacements for `{{theme_url}}`, `{{home_url}}`, and related placeholders. It is ideal for checking layout, CSS, JS, images, and responsive behaviour.

It does not run WordPress itself, so it will not test WordPress admin behaviour, real page routing, plugins, database content, or actual contact form emails.
