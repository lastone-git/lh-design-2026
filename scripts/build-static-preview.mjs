import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const themeRoot = path.resolve(scriptDir, '..');
const outputRoot = path.join(themeRoot, 'dist-preview');

const assetDirs = ['css', 'icons', 'images', 'js', 'videos'];
const assetFiles = ['style.css'];
const currentYear = String(new Date().getFullYear());

const pages = [
  {
    path: '/',
    style: 'home',
    bodyClass: '',
    sections: [
      'pages/home/hero',
      'pages/home/welcome',
      'pages/home/media-grid',
      'pages/home/quote',
      'pages/home/process-steps',
      'pages/home/marquee-suites',
      'pages/home/quote-image',
      'pages/home/marquee-icons'
    ],
    offer: true
  },
  { path: '/about-us/', style: 'about', bodyClass: 'lh-about-page', sections: ['pages/about/about-page'] },
  { path: '/contact-us/', style: 'contact', bodyClass: 'lh-contact-page', sections: ['pages/contact/contact-page'] },
  { path: '/our-team/', style: 'team', bodyClass: 'lh-team-page', sections: ['pages/team/team-page'] },
  { path: '/team/', style: 'team', bodyClass: 'lh-team-page', sections: ['pages/team/team-page'] },
  { path: '/news-events/', style: 'news-events', bodyClass: 'lh-news-events-page', sections: ['pages/news-events/news-events-page'] },
  { path: '/our-process/', style: 'process', bodyClass: 'lh-process-page', sections: ['pages/process/process-page'] },
  { path: '/process/', style: 'process', bodyClass: 'lh-process-page', sections: ['pages/process/process-page'] },
  { path: '/coworking/', style: 'coworking', bodyClass: 'lh-coworking-page', sections: ['pages/coworking/coworking-page'], offer: true },
  { path: '/office-space/', style: 'office-space', bodyClass: 'lh-office-page', sections: ['pages/office-space/office-space-page'], offer: true },
  { path: '/meeting-rooms/pearl-suite/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/pearl-suite'], offer: true },
  { path: '/meeting-rooms/harlech-suite/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/harlech-suite'], offer: true },
  { path: '/meeting-rooms/harlech-room/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/harlech-suite'], offer: true },
  { path: '/meeting-rooms/foundry-room/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/foundry-room'], offer: true },
  { path: '/meeting-rooms/murrayfield-room/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/murrayfield-room'], offer: true },
  { path: '/meeting-rooms/pods/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/pods'], offer: true },
  { path: '/meeting-rooms/portside/', style: 'meeting-room', bodyClass: 'lh-meeting-room-page', sections: ['pages/rooms/portside'], offer: true }
];

const replacementsFor = (currentUrl) => ({
  '{{theme_url}}': '',
  '{{home_url}}': '/',
  '{{site_year}}': currentYear,
  '{{admin_post_url}}': '#',
  '{{current_url}}': escapeHtml(currentUrl),
  '{{contact_form_nonce}}': '<input type="hidden" name="lh_contact_nonce" value="static-preview">',
  '{{coworking_offer_nonce}}': '<input type="hidden" name="lh_coworking_day_nonce" value="static-preview">'
});

cleanOutput();
copyAssets();

for (const page of pages) {
  writePage(page.path, renderPage(page));
}

writePage('/404/', renderNotFound());
writeFileSync(path.join(outputRoot, '404.html'), renderNotFound());

console.log(`Built ${pages.length} preview pages in ${path.relative(themeRoot, outputRoot)}`);

function cleanOutput() {
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });
}

function copyAssets() {
  for (const dir of assetDirs) {
    const source = path.join(themeRoot, dir);

    if (existsSync(source)) {
      cpSync(source, path.join(outputRoot, dir), { recursive: true });
    }
  }

  for (const file of assetFiles) {
    const source = path.join(themeRoot, file);

    if (existsSync(source)) {
      cpSync(source, path.join(outputRoot, file));
    }
  }
}

function renderPage({ path: pagePath, style, bodyClass, sections, offer = false }) {
  const mainHtml = sections.map((section) => renderSection(section, pagePath)).join('\n');
  const offerHtml = offer ? renderSection('shared/coworking-offer-popup', pagePath) : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lambourne House Preview</title>
  <link rel="icon" href="/images/branding/favicon-local.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/header.css">
  <link rel="stylesheet" href="/css/footer.css">
  <link rel="stylesheet" href="/css/pages/${escapeAttribute(style)}.css">
  <script src="/js/site.js" defer></script>
</head>
<body>
  <div class="lh-homepage ${escapeAttribute(bodyClass)}">
    ${renderSection('shared/site-header', pagePath)}
    <main class="lh-homepage__main">
      ${mainHtml}
    </main>
    ${renderSection('shared/site-footer', pagePath)}
    ${offerHtml}
  </div>
</body>
</html>
`;
}

function renderNotFound() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found - Lambourne House Preview</title>
  <link rel="icon" href="/images/branding/favicon-local.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/css/base.css">
</head>
<body>
  <main class="lh-homepage" style="min-height:100vh;display:grid;place-items:center;padding:32px;text-align:center;">
    <div>
      <h1>Preview page not found</h1>
      <p><a href="/">Go to the homepage</a></p>
    </div>
  </main>
</body>
</html>
`;
}

function renderSection(slug, currentUrl) {
  const filePath = path.join(themeRoot, 'html', `${slug}.html`);

  if (!existsSync(filePath)) {
    throw new Error(`Missing preview section: ${slug}`);
  }

  return replaceTokens(readFileSync(filePath, 'utf8'), replacementsFor(currentUrl));
}

function replaceTokens(html, replacements) {
  return Object.entries(replacements).reduce(
    (output, [token, value]) => output.split(token).join(value),
    html
  );
}

function writePage(routePath, html) {
  const normalized = routePath === '/' ? '' : routePath.replace(/^\/|\/$/g, '');
  const dir = path.join(outputRoot, normalized);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
