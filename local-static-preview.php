<?php
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$themeRoot = realpath(__DIR__);
$assetPath = realpath($themeRoot . DIRECTORY_SEPARATOR . ltrim(str_replace('/', DIRECTORY_SEPARATOR, $requestPath), DIRECTORY_SEPARATOR));

if (PHP_SAPI === 'cli-server' && $assetPath && 0 === strpos($assetPath, $themeRoot) && is_file($assetPath)) {
    return false;
}

function lh_preview_render_html_section($slug) {
    $slug = trim($slug, '/');

    if (!preg_match('/^[A-Za-z0-9_\/-]+$/', $slug) || false !== strpos($slug, '..')) {
        return;
    }

    $path = __DIR__ . '/html/' . $slug . '.html';

    if (!file_exists($path)) {
        return;
    }

    $html = file_get_contents($path);

    if (false === $html) {
        return;
    }

    $replacements = array(
        '{{theme_url}}' => '',
        '{{home_url}}' => '/',
        '{{site_year}}' => date('Y'),
        '{{admin_post_url}}' => '#',
        '{{current_url}}' => htmlspecialchars($_SERVER['REQUEST_URI'] ?? '/', ENT_QUOTES, 'UTF-8'),
        '{{contact_form_nonce}}' => '<input type="hidden" name="lh_contact_nonce" value="local-preview">',
        '{{coworking_offer_nonce}}' => '<input type="hidden" name="lh_coworking_day_nonce" value="local-preview">',
    );

    echo strtr($html, $replacements);
}

function lh_preview_page($pageStyle, $bodyClass, $sections, $showCoworkingOffer = false) {
    http_response_code(200);
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lambourne House Local Preview</title>
  <link rel="icon" href="/images/branding/favicon-local.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/header.css">
  <link rel="stylesheet" href="/css/footer.css">
  <link rel="stylesheet" href="/css/pages/<?php echo htmlspecialchars($pageStyle, ENT_QUOTES, 'UTF-8'); ?>.css">
  <script src="/js/site.js" defer></script>
</head>
<body>
  <div class="lh-homepage <?php echo htmlspecialchars($bodyClass, ENT_QUOTES, 'UTF-8'); ?>">
    <?php lh_preview_render_html_section('shared/site-header'); ?>
    <main class="lh-homepage__main">
      <?php foreach ($sections as $section) : ?>
        <?php lh_preview_render_html_section($section); ?>
      <?php endforeach; ?>
    </main>
    <?php lh_preview_render_html_section('shared/site-footer'); ?>
    <?php if ($showCoworkingOffer) : ?>
      <?php lh_preview_render_html_section('shared/coworking-offer-popup'); ?>
    <?php endif; ?>
  </div>
</body>
</html>
    <?php
}

function lh_preview_not_found() {
    http_response_code(404);
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found - Lambourne House Local Preview</title>
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
    <?php
}

$route = trim($requestPath, '/');

if ('' === $route) {
    lh_preview_page('home', '', array(
        'pages/home/hero',
        'pages/home/welcome',
        'pages/home/media-grid',
        'pages/home/quote',
        'pages/home/process-steps',
        'pages/home/marquee-suites',
        'pages/home/quote-image',
        'pages/home/marquee-icons',
    ), true);
    return;
}

if ('about-us' === $route) {
    lh_preview_page('about', 'lh-about-page', array('pages/about/about-page'));
    return;
}

if ('contact-us' === $route) {
    lh_preview_page('contact', 'lh-contact-page', array('pages/contact/contact-page'));
    return;
}

if ('our-team' === $route || 'team' === $route) {
    lh_preview_page('team', 'lh-team-page', array('pages/team/team-page'));
    return;
}

if ('news-events' === $route) {
    lh_preview_page('news-events', 'lh-news-events-page', array('pages/news-events/news-events-page'));
    return;
}

if ('our-process' === $route || 'process' === $route) {
    lh_preview_page('process', 'lh-process-page', array('pages/process/process-page'));
    return;
}

if ('coworking' === basename($route)) {
    lh_preview_page('coworking', 'lh-coworking-page', array('pages/coworking/coworking-page'), true);
    return;
}

if ('office-space' === basename($route)) {
    lh_preview_page('office-space', 'lh-office-page', array('pages/office-space/office-space-page'), true);
    return;
}

$roomRoutes = array(
    'pearl-suite' => 'pearl-suite',
    'harlech-suite' => 'harlech-suite',
    'harlech-room' => 'harlech-suite',
    'foundry-room' => 'foundry-room',
    'murrayfield-room' => 'murrayfield-room',
    'pods' => 'pods',
    'portside' => 'portside',
);

$roomSlug = basename($route);

if (isset($roomRoutes[$roomSlug])) {
    lh_preview_page('meeting-room', 'lh-meeting-room-page', array('pages/rooms/' . $roomRoutes[$roomSlug]), true);
    return;
}

lh_preview_not_found();
