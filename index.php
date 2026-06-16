<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();

if (lh_v2_is_about_request()) {
    lh_v2_render_about_page();
} elseif (lh_v2_is_contact_request()) {
    lh_v2_render_contact_page();
} else {
    lh_v2_render_homepage();
}

get_footer();
