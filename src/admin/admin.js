import "./admin.scss";
import lsqIcon from "../../images/ls-icon.svg";

const lsqUrl = "https://www.lemonsqueezy.com/";

const { __ } = wp.i18n;

const { BaseControl, Button, PanelBody, PanelRow, Card, CardMedia, CardBody } =
    wp.components;

const { render, Component, Fragment } = wp.element;

class AdminSettings extends Component {
    constructor() {
        super(...arguments);

        this.state = {
            isSettingsLoaded: false,
            isAPILoading: false,
            isAPISaving: false,
            lsqApiKey: "",
            lsqUser: null
        };
    }

    async componentDidMount() {
        wp.api.loadPromise.then(() => {
            this.settings = new wp.api.models.Settings();

            if (false === this.state.isSettingsLoaded) {
                this.settings.fetch().then(response => {
                    this.setState({
                        lsqApiKey: response.lsq_api_key,
                        isSettingsLoaded: true
                    });

                    this.checkApi();
                });
            }
        });
    }

    checkApi() {
        this.setState({
            isAPILoading: true
        });

        return fetch("/wp-json/lsq/v1/validate")
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        isAPILoading: false,
                        lsqUser: response.user
                    });
                } else {
                    this.setState({
                        isAPILoading: false,
                        lsqUser: null
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

        return model.save().then(response => {
            this.setState({
                [option]: response[option],
                isAPISaving: false
            });
        });
    }

    oauthAuthorize() {
        window.location.href =
            "/wp-admin/admin.php?page=lemonsqueezy&oauth_authorize=1";
    }

    oauthDisconnect() {
        this.changeOptions("lsq_api_key", "").then(() => {
            this.setState({
                lsqUser: null
            });
        });
    }

    render() {
        const panelLabel = this.state.lsqUser
            ? __("Connected to Lemon Squeezy", "lemonsqueezy")
            : __("Connect to Lemon Squeezy", "lemonsqueezy");
        let buttonLabel = this.state.isAPILoading
            ? __("Checking...", "lemonsqueezy")
            : __("Connect to Lemon Squeezy", "lemonsqueezy");

        return (
            <Fragment>
                <div className="lsq-header">
                    <div className="lsq-header__logo">
                        <img src={lsqIcon} className="lsq-header__logo-icon" />
                        {__("LemonSqueezy.com", "lemonsqueezy")}
                    </div>
                    <div className="lsq-header__cta">
                        {__(
                            "Want to make money with digital products?",
                            "lemonsqueezy"
                        )}
                        <a
                            href={lsqUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="lsq-button lsq-button--secondary"
                        >
                            {__("Start selling today", "lemonsqueezy")}
                        </a>
                    </div>
                </div>

                <div className="lsq-main">
                    <div className="lsq-main__column lsq-main__column--left">
                        <div className="lsq-content lsq-content--intro">
                            <h1>{__("Connect your store", "lemonsqueezy")}</h1>
                            <p>
                                {__(
                                    "The Lemon Squeezy plugin connects your Lemon Squeezy stores to your WordPress site to bring your products right into the block editor.",
                                    "lemonsqueezy"
                                )}
                            </p>
                        </div>
                        <div className="lsq-content lsq-content--step">
                            <h2>
                                {__("1. Create an API key", "lemonsqueezy")}
                            </h2>
                            <p>
                                {__(
                                    "To get started, you need to",
                                    "lemonsqueezy"
                                )}{" "}
                                <a
                                    href="https://app.lemonsqueezy.com/account"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {__("create an API key", "lemonsqueezy")}
                                </a>{" "}
                                {__(
                                    "via your Lemon Squeezy dashboard. In your dashboard, click your avatar in the upper right hand corner, click Account, and then scroll to the bottom of the Account Settings panel to create a new API key.",
                                    "lemonsqueezy"
                                )}
                            </p>
                        </div>
                        <div className="lsq-content lsq-content--step">
                            <h2>
                                {__("2. Add your key here", "lemonsqueezy")}
                            </h2>
                            <p>
                                {__(
                                    "Once you have your API key, paste it in the Lemon Squeezy API Key field on the right and save it. Once saved, your store will be connected to your WordPress site!",
                                    "lemonsqueezy"
                                )}
                            </p>
                        </div>
                        <div className="lsq-content lsq-content--step">
                            <h2>
                                {__(
                                    "3. Add the Lemon Squeezy block and start selling!",
                                    "lemonsqueezy"
                                )}
                            </h2>
                            <p>
                                {__(
                                    "To add products to your posts or pages, simply add the Lemon Squeezy block and select which product you’d like to insert. Use the block settings to select a checkout link or a checkout overlay.",
                                    "lemonsqueezy"
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="lsq-main__column lsq-main__column--right">
                        <PanelBody className="lsq-panel">
                            <PanelRow className="lsq-panel__row">
                                <BaseControl
                                    label={panelLabel}
                                    id="lsq-options-lsq-api"
                                    className="lsq-panel__control"
                                >
                                    {this.state.lsqUser && (
                                        <Card size="small" className="lsq-card">
                                            <CardMedia>
                                                <img
                                                    src={
                                                        this.state.lsqUser
                                                            .attributes
                                                            .avatar_url
                                                    }
                                                    className="lsq-card__avatar"
                                                />
                                            </CardMedia>
                                            <CardBody className="lsq-card__body">
                                                <p>Connected as:</p>
                                                <h3>
                                                    {
                                                        this.state.lsqUser
                                                            .attributes.name
                                                    }
                                                </h3>
                                                <div>
                                                    {
                                                        this.state.lsqUser
                                                            .attributes.email
                                                    }
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                    <div className="lsq-panel__buttons">
                                        {this.state.lsqUser && (
                                            <Button
                                                isPrimary
                                                isLarge
                                                isBusy={this.state.isAPISaving}
                                                disabled={
                                                    this.state.isAPISaving
                                                }
                                                onClick={() =>
                                                    this.oauthDisconnect()
                                                }
                                                className="lsq-button lsq-button--primary"
                                            >
                                                Disconnect from Lemon Squeezy
                                            </Button>
                                        )}
                                        {!this.state.lsqUser && (
                                            <Button
                                                isPrimary
                                                isLarge
                                                isBusy={this.state.isAPILoading}
                                                disabled={
                                                    this.state.isAPILoading
                                                }
                                                onClick={() =>
                                                    this.oauthAuthorize()
                                                }
                                                className="lsq-button lsq-button--primary"
                                            >
                                                {buttonLabel}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="lsq-panel__footer">
                                        <p>
                                            &copy; {new Date().getFullYear()}{" "}
                                            Lemon Squeezy, LLC{" "}
                                            <span className="lsq-u-bullet-spacer">
                                                &bull;
                                            </span>{" "}
                                            <a
                                                target="blank"
                                                rel="noreferrer"
                                                href={lsqUrl}
                                            >
                                                LemonSqueezy.com
                                            </a>
                                        </p>
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

render(<AdminSettings />, document.getElementById("lsq-plugin"));
