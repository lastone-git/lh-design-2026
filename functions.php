<?php
if (!defined('ABSPATH')) {
    exit;
}

function lh_v2_theme_setup() {
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'lh_v2_theme_setup');

function lh_v2_theme_version() {
    $theme = wp_get_theme();
    $version = $theme->get('Version');

    return $version ? $version : '1.0.0';
}

function lh_v2_enqueue_assets() {
    $version = lh_v2_theme_version();
    $page_style = 'home';

    if (lh_v2_is_about_request()) {
        $page_style = 'about';
    } elseif (lh_v2_is_contact_request()) {
        $page_style = 'contact';
    } elseif (lh_v2_is_team_request()) {
        $page_style = 'team';
    } elseif (lh_v2_is_news_events_request()) {
        $page_style = 'news-events';
    } elseif (lh_v2_is_process_request()) {
        $page_style = 'process';
    } elseif (lh_v2_is_coworking_request()) {
        $page_style = 'coworking';
    } elseif (lh_v2_is_office_space_request()) {
        $page_style = 'office-space';
    } elseif (lh_v2_is_meeting_room_request()) {
        $page_style = 'meeting-room';
    }

    wp_enqueue_style(
        'lh-v2-style',
        get_stylesheet_uri(),
        array(),
        $version
    );

    wp_enqueue_style(
        'lh-v2-base',
        get_template_directory_uri() . '/css/base.css',
        array('lh-v2-style'),
        $version
    );

    wp_enqueue_style(
        'lh-v2-header',
        get_template_directory_uri() . '/css/header.css',
        array('lh-v2-base'),
        $version
    );

    wp_enqueue_style(
        'lh-v2-footer',
        get_template_directory_uri() . '/css/footer.css',
        array('lh-v2-base'),
        $version
    );

    wp_enqueue_style(
        'lh-v2-page-' . $page_style,
        get_template_directory_uri() . '/css/pages/' . $page_style . '.css',
        array('lh-v2-header', 'lh-v2-footer'),
        $version
    );

    wp_enqueue_script(
        'lh-v2-site',
        get_template_directory_uri() . '/js/site.js',
        array(),
        $version,
        true
    );
}
add_action('wp_enqueue_scripts', 'lh_v2_enqueue_assets');

function lh_v2_render_html_section($slug) {
    $slug = trim($slug, '/');

    if (!preg_match('/^[A-Za-z0-9_\/-]+$/', $slug) || false !== strpos($slug, '..')) {
        return;
    }

    $path = get_template_directory() . '/html/' . $slug . '.html';

    if (!file_exists($path)) {
        return;
    }

    $html = file_get_contents($path);

    if (false === $html) {
        return;
    }

    $replacements = array(
        '{{theme_url}}' => esc_url(get_template_directory_uri()),
        '{{home_url}}' => esc_url(home_url('/')),
        '{{site_year}}' => esc_html(gmdate('Y')),
        '{{admin_post_url}}' => esc_url(admin_url('admin-post.php')),
        '{{current_url}}' => esc_url(lh_v2_current_url()),
        '{{contact_form_nonce}}' => wp_nonce_field('lh_contact_request', 'lh_contact_nonce', true, false),
        '{{coworking_offer_nonce}}' => wp_nonce_field('lh_coworking_day_request', 'lh_coworking_day_nonce', true, false),
    );

    echo strtr($html, $replacements);
}

function lh_v2_current_url() {
    $host = isset($_SERVER['HTTP_HOST']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'])) : '';
    $path = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '/';

    if (!$host) {
        return home_url('/');
    }

    return (is_ssl() ? 'https://' : 'http://') . $host . $path;
}

function lh_v2_render_coworking_offer_popup() {
    lh_v2_render_html_section('shared/coworking-offer-popup');
}

function lh_v2_render_homepage() {
    $sections = array(
        'shared/site-header',
        'pages/home/hero',
        'pages/home/welcome',
        'pages/home/media-grid',
        'pages/home/quote',
        'pages/home/process-steps',
        'pages/home/marquee-suites',
        'pages/home/quote-image',
        'pages/home/marquee-icons',
        'shared/site-footer',
    );

    echo '<div class="lh-homepage">';

    foreach ($sections as $index => $section) {
        if (1 === $index) {
            echo '<main class="lh-homepage__main">';
        }

        lh_v2_render_html_section($section);

        if ('pages/home/marquee-icons' === $section) {
            echo '</main>';
        }
    }

    lh_v2_render_coworking_offer_popup();

    echo '</div>';
}

function lh_v2_render_about_page() {
    echo '<div class="lh-homepage lh-about-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/about/about-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    echo '</div>';
}

function lh_v2_render_contact_page() {
    echo '<div class="lh-homepage lh-contact-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/contact/contact-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    echo '</div>';
}

function lh_v2_render_team_page() {
    echo '<div class="lh-homepage lh-team-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/team/team-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    echo '</div>';
}

function lh_v2_render_news_events_page() {
    echo '<div class="lh-homepage lh-news-events-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/news-events/news-events-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    echo '</div>';
}

function lh_v2_render_process_page() {
    echo '<div class="lh-homepage lh-process-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/process/process-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    echo '</div>';
}

function lh_v2_render_coworking_page() {
    echo '<div class="lh-homepage lh-coworking-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/coworking/coworking-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    lh_v2_render_coworking_offer_popup();

    echo '</div>';
}

function lh_v2_render_office_space_page() {
    echo '<div class="lh-homepage lh-office-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/office-space/office-space-page');
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    lh_v2_render_coworking_offer_popup();

    echo '</div>';
}

function lh_v2_render_meeting_room_page($room_section = '') {
    $room_section = $room_section ? $room_section : lh_v2_get_meeting_room_section();

    if (!$room_section) {
        return;
    }

    echo '<div class="lh-homepage lh-meeting-room-page">';

    lh_v2_render_html_section('shared/site-header');

    echo '<main class="lh-homepage__main">';
    lh_v2_render_html_section('pages/rooms/' . $room_section);
    echo '</main>';

    lh_v2_render_html_section('shared/site-footer');

    lh_v2_render_coworking_offer_popup();

    echo '</div>';
}

function lh_v2_is_page_request($slug) {
    if (is_page($slug)) {
        return true;
    }

    $path = isset($_SERVER['REQUEST_URI']) ? wp_parse_url(wp_unslash($_SERVER['REQUEST_URI']), PHP_URL_PATH) : '';

    if (!$path) {
        return false;
    }

    return $slug === basename(untrailingslashit($path));
}

function lh_v2_is_about_request() {
    return lh_v2_is_page_request('about-us');
}

function lh_v2_is_contact_request() {
    return lh_v2_is_page_request('contact-us');
}

function lh_v2_is_team_request() {
    return lh_v2_is_page_request('team') || lh_v2_is_page_request('our-team');
}

function lh_v2_is_news_events_request() {
    return lh_v2_is_page_request('news-events');
}

function lh_v2_is_process_request() {
    return lh_v2_is_page_request('our-process') || lh_v2_is_page_request('process');
}

function lh_v2_is_coworking_request() {
    return lh_v2_is_page_request('coworking');
}

function lh_v2_is_office_space_request() {
    return lh_v2_is_page_request('office-space');
}

function lh_v2_meeting_room_pages() {
    return array(
        'pearl-suite' => 'pearl-suite',
        'harlech-suite' => 'harlech-suite',
        'harlech-room' => 'harlech-suite',
        'foundry-room' => 'foundry-room',
        'murrayfield-room' => 'murrayfield-room',
        'pods' => 'pods',
        'portside' => 'portside',
    );
}

function lh_v2_get_meeting_room_section() {
    foreach (lh_v2_meeting_room_pages() as $slug => $section) {
        if (lh_v2_is_page_request($slug)) {
            return $section;
        }
    }

    return '';
}

function lh_v2_is_meeting_room_request() {
    return '' !== lh_v2_get_meeting_room_section();
}

function lh_v2_forced_page_templates() {
    return array(
        'about-us' => 'page-about-us.php',
        'contact-us' => 'page-contact-us.php',
        'our-team' => 'page-our-team.php',
        'team' => 'page-our-team.php',
        'news-events' => 'page-news-events.php',
        'our-process' => 'page-our-process.php',
        'process' => 'page-our-process.php',
        'coworking' => 'page-coworking.php',
        'office-space' => 'page-office-space.php',
        'pearl-suite' => 'page-meeting-room.php',
        'harlech-suite' => 'page-meeting-room.php',
        'harlech-room' => 'page-meeting-room.php',
        'foundry-room' => 'page-meeting-room.php',
        'murrayfield-room' => 'page-meeting-room.php',
        'pods' => 'page-meeting-room.php',
        'portside' => 'page-meeting-room.php',
    );
}

function lh_v2_prevent_forced_page_404($preempt, $wp_query) {
    foreach (lh_v2_forced_page_templates() as $slug => $file) {
        if (!lh_v2_is_page_request($slug)) {
            continue;
        }

        $wp_query->is_404 = false;
        status_header(200);

        return true;
    }

    return $preempt;
}
add_filter('pre_handle_404', 'lh_v2_prevent_forced_page_404', 10, 2);

function lh_v2_force_page_template($template) {
    $forced_templates = lh_v2_forced_page_templates();

    foreach ($forced_templates as $slug => $file) {
        if (!lh_v2_is_page_request($slug)) {
            continue;
        }

        $page_template = get_template_directory() . '/' . $file;

        return file_exists($page_template) ? $page_template : $template;
    }

    return $template;
}
add_filter('template_include', 'lh_v2_force_page_template');

function lh_v2_handle_contact_request() {
    if (!isset($_POST['lh_contact_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['lh_contact_nonce'])), 'lh_contact_request')) {
        wp_safe_redirect(add_query_arg('contact', 'invalid', home_url('/contact-us/')));
        exit;
    }

    $name = isset($_POST['lh_name']) ? sanitize_text_field(wp_unslash($_POST['lh_name'])) : '';
    $company = isset($_POST['lh_company']) ? sanitize_text_field(wp_unslash($_POST['lh_company'])) : '';
    $email = isset($_POST['lh_email']) ? sanitize_email(wp_unslash($_POST['lh_email'])) : '';
    $phone = isset($_POST['lh_phone']) ? sanitize_text_field(wp_unslash($_POST['lh_phone'])) : '';
    $interest = isset($_POST['lh_interest']) ? sanitize_text_field(wp_unslash($_POST['lh_interest'])) : '';
    $message = isset($_POST['lh_message']) ? sanitize_textarea_field(wp_unslash($_POST['lh_message'])) : '';

    if (!$name || !$email || !$phone || !$interest || !is_email($email)) {
        wp_safe_redirect(add_query_arg('contact', 'missing', home_url('/contact-us/')));
        exit;
    }

    $body = implode("\n\n", array(
        'Name: ' . $name,
        'Company: ' . ($company ? $company : '-'),
        'Email: ' . $email,
        'Phone: ' . $phone,
        'How can we help: ' . $interest,
        'Message: ' . ($message ? $message : '-'),
    ));

    $headers = array(
        'Reply-To: ' . $name . ' <' . $email . '>',
    );

    wp_mail('enquiries@lambourne.house', 'Lambourne House contact request', $body, $headers);

    wp_safe_redirect(add_query_arg('contact', 'sent', home_url('/contact-us/')));
    exit;
}
add_action('admin_post_lh_contact_request', 'lh_v2_handle_contact_request');
add_action('admin_post_nopriv_lh_contact_request', 'lh_v2_handle_contact_request');

function lh_v2_handle_coworking_day_request() {
    $source_url = isset($_POST['lh_source_url']) ? esc_url_raw(wp_unslash($_POST['lh_source_url'])) : home_url('/coworking/');
    $redirect = wp_validate_redirect($source_url, home_url('/coworking/'));
    $redirect = remove_query_arg('coworking-day', $redirect);

    if (!isset($_POST['lh_coworking_day_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['lh_coworking_day_nonce'])), 'lh_coworking_day_request')) {
        wp_safe_redirect(add_query_arg('coworking-day', 'invalid', $redirect));
        exit;
    }

    $name = isset($_POST['lh_name']) ? sanitize_text_field(wp_unslash($_POST['lh_name'])) : '';
    $email = isset($_POST['lh_email']) ? sanitize_email(wp_unslash($_POST['lh_email'])) : '';
    $phone = isset($_POST['lh_phone']) ? sanitize_text_field(wp_unslash($_POST['lh_phone'])) : '';
    $preferred_date = isset($_POST['lh_preferred_date']) ? sanitize_text_field(wp_unslash($_POST['lh_preferred_date'])) : '';

    if (!$name || !$email || !$phone || !$preferred_date || !is_email($email) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $preferred_date)) {
        wp_safe_redirect(add_query_arg('coworking-day', 'missing', $redirect));
        exit;
    }

    $body = implode("\n\n", array(
        'Free coworking day request',
        'Name: ' . $name,
        'Email: ' . $email,
        'Phone: ' . $phone,
        'Preferred date: ' . $preferred_date,
        'Source page: ' . $redirect,
    ));

    $headers = array(
        'Reply-To: ' . $name . ' <' . $email . '>',
    );

    wp_mail('enquiries@lambourne.house', 'Lambourne House free coworking day request', $body, $headers);

    wp_safe_redirect(add_query_arg('coworking-day', 'sent', $redirect));
    exit;
}
add_action('admin_post_lh_coworking_day_request', 'lh_v2_handle_coworking_day_request');
add_action('admin_post_nopriv_lh_coworking_day_request', 'lh_v2_handle_coworking_day_request');
