<?php

namespace lemonsqueezy;

/**
 * Class to handle rest api connections of the lemon squeezy plugin.
 */
class LSQ_Register_Block {
	/**
	 * Contains instance or null
	 *
	 * @var object|null
	 */
	private static $instance = null;

	/**
	 * Returns instance of LSQ_Rest.
	 *
	 * @return object
	 */
	public static function get_instance() {

		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor for LSQ_Register_Block.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_filter( 'render_block', array( $this, 'filter_button_block_markup' ), 10, 2 );
	}

	/**
	 * Register block types.
	 *
	 * @param string $block current block.
	 * @param array  $options list of options.
	 * @return void
	 */
	public function register_block_type( $block, $options = array() ) {
		register_block_type(
			'lemonsqueezy/' . $block,
			array_merge(
				array(
					'editor_script' => 'lemonsqueezy-editor-script',
					'editor_style'  => 'lemonsqueezy-editor-style',
					'script'        => 'lemonsqueezy-script',
					'style'         => 'lemonsqueezy-style',
				),
				$options
			)
		);
	}

	/**
	 * Register lemon squeezy blocks and enqueue assets.
	 *
	 * @return void
	 */
	public function register_blocks() {
		wp_register_script( 'lemonsqueezy-editor-script', LSQ_URL . '/dist/editor.js', array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-components', 'lodash', 'wp-blob', 'wp-data', 'wp-html-entities', 'wp-compose', 'wp-block-editor' ), '1.0.0', true );
		wp_register_script( 'lemonsqueezy-script', LSQ_URL . '/dist/script.js', array(), '1.0.0', true );
		wp_register_style( 'lemonsqueezy-style', LSQ_URL . '/dist/style.css', array(), '1.0.0' );

		$this->register_block_type( 'button' );
	}

	/**
	 * Add button size class.
	 *
	 * @param  string $block_content Block content to be rendered.
	 * @param  array  $block         Block attributes.
	 * @return string
	 */
	public function filter_button_block_markup( $block_content = '', $block = array() ) {
		if ( isset( $block['blockName'] ) && 'core/button' === $block['blockName'] ) {
			$args = wp_parse_args( $block['attrs'] );

			if ( ! isset( $args['product'] ) || empty( $args['product'] ) ) {
				return $block_content;
			}

			$purchase_link = $args['product'];

			// If overlay is activated we have to include the script and add parameter to URL.
			if ( $args['overlay'] ) {
				wp_enqueue_script( 'lemonsqueezy-checkout', 'https://app.lemonsqueezy.com/js/checkout.js', array(), null, true );

				$purchase_link = $purchase_link . '?embed=1';
				$block_content = str_replace( '<a class="wp-block-button__link">', '<a class="wp-block-button__link lemonsqueezy-button" href="' . $purchase_link . '">', $block_content );
			} else {
				$block_content = str_replace( '<a class="wp-block-button__link">', '<a class="wp-block-button__link" href="' . $purchase_link . '">', $block_content );
			}
		}
		return $block_content;
	}
}
