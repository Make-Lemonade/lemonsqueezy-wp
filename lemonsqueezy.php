<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin Name:       Lemon Squeezy
 * Plugin URI:        https://www.lemonsqueezy.com
 * Description:       Sell digital products the easy-peasy way directly from WordPress.
 * Version:           1.3.0
 * Requires at least: 5.3
 * Requires PHP:      7.0
 * Author:            Lemon Squeezy
 * Author URI:        https://www.lemonsqueezy.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       lemonsqueezy
 * Domain Path:       /languages
 */

define( 'LSQ_PATH', plugin_dir_path( __FILE__ ) );
define( 'LSQ_URL', untrailingslashit( plugin_dir_url( __FILE__ ) ) );

if ( ! defined( 'LSQ_API_URL' ) ) {
	define( 'LSQ_API_URL', 'https://api.lemonsqueezy.com' );
}
if ( ! defined( 'LSQ_APP_URL' ) ) {
	define( 'LSQ_APP_URL', 'https://app.lemonsqueezy.com' );
}
if ( ! defined( 'LSQ_OAUTH_CLIENT_ID' ) ) {
	define( 'LSQ_OAUTH_CLIENT_ID', '94d59e1b-7459-4371-a131-7ad050c8ca0d' );
}

// Bootmanager for Lemon Squeety plugin.
if ( ! function_exists( 'lsq_run_plugin' ) ) {
	add_action( 'plugins_loaded', 'lsq_run_plugin' );

	/**
	 * Run plugin
	 *
	 * @return void
	 */
	function lsq_run_plugin() {
		// localize.
		$textdomain_dir = plugin_basename( dirname( __FILE__ ) ) . '/languages';
		load_plugin_textdomain( 'lemonsqueezy', false, $textdomain_dir );

		// Initialize classes.
		include_once LSQ_PATH . 'src/class-lsq-oauth.php';
		include_once LSQ_PATH . 'src/class-lsq-updater.php';
		include_once LSQ_PATH . 'src/class-lsq-admin.php';
		include_once LSQ_PATH . 'src/class-lsq-rest-controller.php';
		include_once LSQ_PATH . 'src/class-lsq-register-block.php';

		lemonsqueezy\LSQ_Admin::get_instance();
		lemonsqueezy\LSQ_Rest_Controller::get_instance();
		lemonsqueezy\LSQ_Register_Block::get_instance();
	}
}
