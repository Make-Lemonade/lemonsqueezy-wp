<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin Name:       Lemon Squeezy
 * Plugin URI:        https://www.lemonsqueezy.com
 * Description:       Sell digital products the easy-peasy way directly from WordPress.
 * Version:           1.0.0
 * Author:            lemonsqueezy
 * Author URI:        https://www.lemonsqueezy.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       lemonsqueezy
 * Domain Path:       /languages
 */

define( 'LSQ_PATH', plugin_dir_path( __FILE__ ) );
define( 'LSQ_URL', untrailingslashit( plugin_dir_url( __FILE__ ) ) );

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
		require_once LSQ_PATH . 'src/class-lsq-admin.php';
		require_once LSQ_PATH . 'src/class-lsq-rest-controller.php';
		require_once LSQ_PATH . 'src/class-lsq-register-block.php';

		lemonsqueezy\LSQ_Admin::get_instance();
		lemonsqueezy\LSQ_Rest_Controller::get_instance();
		lemonsqueezy\LSQ_Register_Block::get_instance();
	}
}

