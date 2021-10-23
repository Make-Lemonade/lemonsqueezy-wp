import './admin.scss';
import lsqIcon from '../../images/ls-icon.svg';

const lsqUrl = 'https://www.lemonsqueezy.com/',
	lsqApiUrl = 'https://www.lemonsqueezy.com/';

const { __ } = wp.i18n;

const {
	BaseControl,
	Button,
	// ExternalLink,
	PanelBody,
	PanelRow,
	// Notice,
} = wp.components;

const {
	render,
	Component,
	Fragment
} = wp.element;

class AdminSettings extends Component {

	constructor() {
		super(...arguments);

		this.state = {
			isAPILoaded: false,
			isAPISaving: false,
			lsq_api_key: '',
			isApiConnectable: false
		};
	}

	async componentDidMount() {
		wp.api.loadPromise.then(() => {
			this.settings = new wp.api.models.Settings();

			if (false === this.state.isAPILoaded) {
				this.settings.fetch().then(response => {
					this.setState({
						lsq_api_key: response.lsq_api_key,
						isApiConnectable: Boolean(response.lsq_api_key),
						isAPILoaded: true
					});

					this.checkApi();
				});
			}
		});
	}

	changeOptions(option, value) {
		this.setState({ isAPISaving: true });

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			[option]: value
		});

		model.save().then(response => {
			this.setState({
				[option]: response[option],
				isAPISaving: false
			});

			this.checkApi();
		});
	}

	checkApi() {
		return fetch('/wp-json/lsq/v1/validate')
			.then((response) => response.json())
			.then(response => {
				if (true == response.success) {
					this.setState({
						isApiConnectable: true,
					});
				} else {
					this.setState({
						isApiConnectable: false,
					});
				}
			})
	}

	render() {
		const isApiConnectable = this.state.isApiConnectable;

		return (
			<Fragment>
				<div className="lsq-header">
					<div className="lsq-header__logo">
						<img src={lsqIcon} className="lsq-header__logo-icon" />
						{__('LemonSqueezy.com', 'lemonsqueezy')}
					</div>
					<div className="lsq-header__cta">
						{__('Want to make money with digital products?', 'lemonsqueezy')}
						<a href={lsqUrl} className="lsq-button lsq-button--secondary">{__('Start selling today', 'lemonsqueezy')}</a>
					</div>
				</div>

				<div className="lsq-main">
					<div className="lsq-main__column lsq-main__column--left">
						<div className="lsq-content lsq-content--intro">
							<h1>{__('Connect your store', 'lemonsqueezy')}</h1>
							<p>{__('The Lemon Squeezy plugin connects your Lemon Squeezy store to your WordPress site to bring your products right into the block editor.', 'lemonsqueezy')}</p>
						</div>
						<div className="lsq-content lsq-content--step">
							<h2>{__('1. Create an API key', 'lemonsqueezy')}</h2>
							<p>{__('To get started, you need to create an API key via your Lemon Squeezy dashboard. In your dashboard, click your avatar in the upper right hand corner, click Account, and then scroll to the bottom of the Account Settings panel to create a new API key.', 'lemonsqueezy')}</p>
						</div>
						<div className="lsq-content lsq-content--step">
							<h2>{__('2. Add your key here', 'lemonsqueezy')}</h2>
							<p>{__('Once you have your API key, paste it in the Lemon Squeezy API Key field on the right and save it. Once saved, your store will be connected to your WordPress site!', 'lemonsqueezy')}</p>
						</div>
						<div className="lsq-content lsq-content--step">
							<h2>{__('3. Add the Lemon Squeezy block and start selling!', 'lemonsqueezy')}</h2>
							<p>{__('To add products to your posts or pages, simply add the Lemon Squeezy block and select which product you’d like to insert. Use the block settings to select a checkout link or a checkout overlay.', 'lemonsqueezy')}</p>
						</div>
					</div>
					<div className="lsq-main__column lsq-main__column--right">
						<PanelBody className="lsq-panel">
							<PanelRow className="lsq-panel__row">
								<BaseControl
									label={__('Add your Lemon Squeezy API key', 'lemonsqueezy')}
									id="lsq-options-lsq-api"
									className="lsq-panel__control"
								>
									<div className="lsq-field-wrapper">
										<input
											type="text"
											id="lsq-options-lsq-api"
											value={this.state.lsq_api_key}
											placeholder={__('Enter an API key', 'lemonsqueezy')}
											disabled={this.state.isAPISaving}
											onChange={e => this.setState({ lsq_api_key: e.target.value })}
											className="lsq-field lsq-field--text"
										/>
										{this.state.lsq_api_key
											?
											[
												isApiConnectable
													?
													<span className="lsq-field-wrapper__icon dashicons dashicons-yes"></span>
													:
													<span className="lsq-field-wrapper__icon dashicons dashicons-no"></span>
											]
											:
											''
										}
									</div>
									<div className="lsq-panel__buttons">
										<Button
											isPrimary
											isLarge
											disabled={this.state.isAPISaving}
											onClick={() => this.changeOptions('lsq_api_key', this.state.lsq_api_key)}
											className="lsq-button lsq-button--primary"
										>
											{__('Save API Key', 'lemonsqueezy')}
										</Button>
									</div>
									<div className="lsq-panel__footer">
										<p><a href={lsqApiUrl}>{__('View API documentation', 'lemonsqueezy')}</a></p>
										<p>&copy; {(new Date().getFullYear())} Lemon Squeezy, LLC <span className="lsq-u-bullet-spacer">&bull;</span> <a href={lsqUrl}>LemonSqueezy.com</a></p>
									</div>
								</BaseControl>
							</PanelRow>
						</PanelBody>
					</div>
				</div>
			</Fragment>
		);
	}
}

render(
	<AdminSettings />,
	document.getElementById('lsq-plugin')
);