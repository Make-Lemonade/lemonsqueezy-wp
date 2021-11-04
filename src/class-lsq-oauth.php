<?php

namespace lemonsqueezy;

class LSQ_OAuth {

	/**
	 * @var string
	 */
	protected $client_id;

	/**
	 * @var string
	 */
	protected $redirect_uri;

	/**
	 * @param string $client_id
	 * @param string $redirect_uri
	 */
	public function __construct( $client_id, $redirect_uri ) {
		$this->client_id = $client_id;
		$this->redirect_uri = $redirect_uri;
	}

	/**
	 * Handle OAuth authorization
	 *
	 * @return void
	 */
	public function handle_authorize() {
		if ( empty( $_GET['oauth_authorize'] ) ) {
			return;
		}

		if ( empty( $_SESSION['lsq_oauth_code'] ) ) {
			$_SESSION['lsq_oauth_code'] = wp_generate_password( 40, false );
		}
		if ( empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
			$_SESSION['lsq_oauth_code_verifier'] = wp_generate_password( 128, false );
		}

		$code_challenge = strtr(
			rtrim(
				base64_encode( hash( 'sha256', $_SESSION['lsq_oauth_code_verifier'], true ) ),
				'='
			),
			'+/',
			'-_'
		);

		$query = http_build_query(
			array(
				'client_id' => $this->client_id,
				'redirect_uri' => $this->redirect_uri,
				'response_type' => 'code',
				'scope' => '',
				'state' => $_SESSION['lsq_oauth_code'],
				'code_challenge' => $code_challenge,
				'code_challenge_method' => 'S256',
			)
		);

		wp_redirect( LSQ_APP_URL . '/oauth/authorize?' . $query );
		exit;
	}

	/**
	 * Handle OAuth token exchange
	 *
	 * @return void
	 */
	public function handle_callback() {
		if ( empty( $_GET['oauth_callback'] ) ) {
			return;
		}

		if ( ! empty( $_GET['error'] ) ) {
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . json_encode(
					array(
						'error' => filter_var( $_GET['error'], FILTER_SANITIZE_STRING ),
					)
				),
				'before'
			);
			return;
		}

		if ( empty( $_SESSION['lsq_oauth_code'] ) || empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
			return;
		}

		$code = isset( $_GET['code'] ) ? filter_var( $_GET['code'], FILTER_SANITIZE_STRING ) : null;
		$state = isset( $_GET['state'] ) ? filter_var( $_GET['state'], FILTER_SANITIZE_STRING ) : null;

		if ( $_SESSION['lsq_oauth_code'] !== $state || ! $code ) {
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . json_encode(
					array(
						'error' => __( 'Invalid oauth state/code', 'lemon-squeezy' ),
					)
				),
				'before'
			);
			return;
		}

		$response = wp_remote_post(
			LSQ_APP_URL . '/oauth/token',
			array(
				'body' => array(
					'grant_type' => 'authorization_code',
					'client_id' => $this->client_id,
					'redirect_uri' => $this->redirect_uri,
					'code_verifier' => $_SESSION['lsq_oauth_code_verifier'],
					'code' => $code,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . json_encode(
					array(
						'error' => $response->get_error_message(),
					)
				),
				'before'
			);
			return;
		}

		$data = json_decode( $response['body'] );

		if ( ! empty( $data->access_token ) ) {
			update_option( 'lsq_api_key', $data->access_token );
		}
		if ( ! empty( $data->expires_in ) ) {
			update_option( 'lsq_api_key_expires', time() + $data->expires_in );
		}
	}
}
