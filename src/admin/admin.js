import "./admin.scss";
import lsqIcon from "../../images/ls-icon.svg";

const lsqUrl = "https://www.lemonsqueezy.com/";

const { __ } = wp.i18n;

const {
    BaseControl,
    Button,
    PanelBody,
    PanelRow,
    Card,
    CardMedia,
    CardBody,
    Notice
} = wp.components;

const { render, Component, Fragment } = wp.element;

class AdminSettings extends Component {
    constructor() {
        super(...arguments);

        this.state = {
            isSettingsLoaded: false,
            isAPILoading: false,
            isAPISaving: false,
            isTestAPISaving: false,
            lsqApiKey: "",
            lsqApiKeyTest: "",
            showingTestInput: false,
            enteredApiKeyTest: "",
            lsqUser: null,
            oauth: window.lsq_oauth || {}
        };
    }

    async componentDidMount() {
        wp.api.loadPromise.then(() => {
            this.settings = new wp.api.models.Settings();

            if (false === this.state.isSettingsLoaded) {
                this.settings.fetch().then(response => {
                    this.setState({
                        lsqApiKey: response.lsq_api_key,
                        lsqApiKeyTest: response.lsq_api_key_test,
                        isSettingsLoaded: true
                    });

                    this.checkApi();
                });
            }
        });
    }

    removeTestKey() {
        this.setState({isTestAPISaving: true});

        return fetch("/wp-json/lsq/v1/delete_test_key", {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8',
                'X-WP-Nonce' : Lemonsqueezy.nonce
            })
        })
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        lsqApiKeyTest: '',
                        isTestAPISaving: false
                    });
                } else {
                    this.setState({
                        isTestAPISaving: false,
                    });

                    if ( response.error ) {
                        alert( response.error );
                    }
                }
            });
    }

    saveTestApiKey() {
        this.setState({isTestAPISaving: true});

        return fetch("/wp-json/lsq/v1/save_test_key", {
            method: 'POST',
            credentials: 'same-origin',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8',
                'X-WP-Nonce' : Lemonsqueezy.nonce
            }),
            body: JSON.stringify({ test_key: this.state.enteredApiKeyTest }),
        })
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        lsqApiKeyTest: this.state.enteredApiKeyTest,
                        isTestAPISaving: false
                    });
                } else {
                    this.setState({
                        isTestAPISaving: false,
                        lsqApiKeyTest: '',
                    });

                    if ( response.error ) {
                        alert( response.error );
                    }
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
        window.location.href = window.Lemonsqueezy.oauth_url;
    }

    oauthDisconnect() {
        this.changeOptions("lsq_api_key", "").then(() => {
            this.setState({
                lsqUser: null
            });
        });
    }

    saveTestKey() {
        this.saveTestApiKey();
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
                                {__(
                                    "1. Connect to Lemon Squeezy",
                                    "lemonsqueezy"
                                )}
                            </h2>
                            <p>
                                {__(
                                    'To get started, use the "Connect to Lemon Squeezy" button on the right. When prompted, click "Authorize" to connect your Lemon Squeezy account with this WordPress site.',
                                    "lemonsqueezy"
                                )}
                            </p>
                        </div>
                        <div className="lsq-content lsq-content--step">
                            <h2>
                                {__(
                                    "2. Add the Lemon Squeezy block and start selling!",
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
                                    {this.state.oauth.error && (
                                        <Notice
                                            status="error"
                                            className="lsq-notice"
                                        >
                                            An error occurred:&nbsp;
                                            {this.state.oauth.error}
                                        </Notice>
                                    )}
                                    {this.state.lsqUser && (
                                        <Card size="small" className="lsq-card">
                                            <CardMedia>
                                                <div className="lsq-avatar">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="80px"
                                                        height="80px"
                                                        viewBox="0 0 80 80"
                                                        version="1.1"
                                                    >
                                                        <circle
                                                            fill={
                                                                this.state
                                                                    .lsqUser
                                                                    .attributes
                                                                    .color
                                                            }
                                                            width="80"
                                                            height="80"
                                                            cx="40"
                                                            cy="40"
                                                            r="40"
                                                        />
                                                        <text
                                                            x="50%"
                                                            y="50%"
                                                            alignmentBaseline="middle"
                                                            textAnchor="middle"
                                                            fontSize="32"
                                                            fontWeight="400"
                                                            dy=".1em"
                                                            dominantBaseline="middle"
                                                            fill="#ffffff"
                                                        >
                                                            {this.state.lsqUser.attributes.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </text>
                                                    </svg>
                                                    {this.state.lsqUser
                                                        .attributes
                                                        .avatar_url && (
                                                        <img
                                                            src={
                                                                this.state
                                                                    .lsqUser
                                                                    .attributes
                                                                    .avatar_url
                                                            }
                                                        />
                                                    )}
                                                </div>
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
                                        {this.state.lsqUser && <>
                                            <Button
                                                isPrimary
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
                                            {! this.state.lsqApiKeyTest && <>

                                                {! this.state.showingTestInput && <Button onClick={() => this.setState({showingTestInput: true})} isSmall>Need to Test? Enter your Test Key</Button>}
                                                {this.state.showingTestInput && <>
                                                    <input className={"lsq-input"} onChange={(el) => {
                                                        this.setState({enteredApiKeyTest: el.target.value});
                                                    }} type={"text"} placeholder={"Enter your Test API Key"} />
                                                    <Button
                                                        isBusy={this.state.isTestAPISaving}
                                                        isSecondary
                                                        onClick={
                                                            () => this.saveTestKey()
                                                        }>Save Test API Key</Button>
                                                    <Button onClick={() => this.setState({showingTestInput: false})}>Cancel</Button>
                                                    <div><br/>
                                                        <Button isLink target={"_blank"} href={"https://docs.lemonsqueezy.com/help/getting-started/test-mode"}>Read about the test mode.</Button>
                                                    </div>
                                                </>
                                                }
                                            </>
                                            }
                                            {this.state.lsqApiKeyTest && <>
                                                <p>You&apos;re on Test Mode.</p>
                                                <Button
                                                    isBusy={this.state.isTestAPISaving}
                                                    isSecondary

                                                    onClick={
                                                        () => this.removeTestKey()
                                                    }>Remove Test Mode</Button>
                                            </>}

                                        </>}
                                        {!this.state.lsqUser && (
                                            <Button
                                                isPrimary

                                                isBusy={
                                                    this.state.isAPILoading ||
                                                    !this.state.isSettingsLoaded
                                                }
                                                disabled={
                                                    this.state.isAPILoading ||
                                                    !this.state.isSettingsLoaded
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
