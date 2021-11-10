import lsqIcon from "../../../images/ls-icon.svg";

import { Component, Fragment } from "@wordpress/element";
import { RichText } from "@wordpress/block-editor";
import { SelectControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stores: [],
            products: [],
            isCheckingApi: true,
            isApiConnectable: false,
            isLoadingProducts: false
        };
    }

    componentDidMount() {
        fetch("/wp-json/lsq/v1/stores")
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        stores: response.stores
                    });

                    if (response.stores.length) {
                        this.getProducts(response.stores[0].value);
                    }
                }
            });

        this.checkApi();
    }

    checkApi() {
        return fetch("/wp-json/lsq/v1/validate")
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        isApiConnectable: true
                    });
                } else {
                    this.setState({
                        isApiConnectable: false
                    });
                }
            })
            .finally(() => {
                this.setState({
                    isCheckingApi: false
                });
            });
    }

    getProducts(store_id) {
        this.setState({
            isLoadingProducts: true
        });

        return fetch("/wp-json/lsq/v1/products?store_id=" + store_id)
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        products: response.products
                    });
                }
            })
            .finally(() => {
                this.setState({
                    isLoadingProducts: false
                });
            });
    }

    onChangeContent = content => {
        this.props.setAttributes({ content });
    };

    onChangeProduct = product => {
        this.props.setAttributes({ product });
    };

    onChangeStore = store => {
        this.setState({
            products: []
        });
        this.getProducts(store);
        this.props.setAttributes({ store });
    };

    onChangeOverlay = overlay => {
        this.props.setAttributes({ overlay: overlay });
    };

    render() {
        const { attributes } = this.props;
        const { content, store, product, overlay } = attributes;

        return (
            <div className="lsq-block">
                <h4>
                    <img src={lsqIcon} />
                    {__("Lemon Squeezy Buy Button", "lemonsqueezy")}
                </h4>
                {this.state && !this.state.isCheckingApi ? (
                    [
                        this.state.isApiConnectable ? (
                            <Fragment>
                                <p>
                                    <SelectControl
                                        value={store}
                                        options={this.state.stores}
                                        onChange={this.onChangeStore}
                                    />
                                </p>
                                <p>
                                    {this.state.isLoadingProducts ? (
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                color: "rgb(117, 117, 117)"
                                            }}
                                        >
                                            {__("Loading...", "lemonsqueezy")}
                                        </span>
                                    ) : this.state.products.length ? (
                                        <SelectControl
                                            value={product}
                                            options={this.state.products}
                                            onChange={this.onChangeProduct}
                                        />
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                color: "rgb(117, 117, 117)"
                                            }}
                                        >
                                            {__(
                                                "No products found",
                                                "lemonsqueezy"
                                            )}
                                        </span>
                                    )}
                                </p>
                                <p>
                                    <RichText
                                        placeholder={__(
                                            "Button text*",
                                            "lemonsqueezy"
                                        )}
                                        tagName="p"
                                        className="lsq-link-text"
                                        onChange={this.onChangeContent}
                                        value={content}
                                    />
                                </p>
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Use checkout overlay?",
                                            "lemonsqueezy"
                                        )}
                                        help={
                                            overlay
                                                ? __(
                                                      "Your checkout will be opened in a modal window.",
                                                      "lemonsqueezy"
                                                  )
                                                : __(
                                                      "Your customer will be redirected to your checkout page.",
                                                      "lemonsqueezy"
                                                  )
                                        }
                                        checked={overlay}
                                        onChange={this.onChangeOverlay}
                                    />
                                </p>
                            </Fragment>
                        ) : (
                            <p>
                                <small>
                                    {__(
                                        "Uh oh! Looks like you haven't connected your store yet! Please visit the",
                                        "lemonsqueezy"
                                    )}{" "}
                                    <a
                                        href={
                                            /*global lsData*/ /*eslint no-undef: "error"*/ lsData.settings_url
                                        }
                                    >
                                        {__(
                                            "Lemon Squeezy Settings",
                                            "lemonsqueezy"
                                        )}
                                    </a>{" "}
                                    {__(
                                        "and add your API key.",
                                        "lemonsqueezy"
                                    )}
                                </small>
                            </p>
                        )
                    ]
                ) : (
                    <p>
                        <small>
                            {__(
                                "We're fetching your data, hold on for a second!",
                                "lemonsqueezy"
                            )}
                        </small>
                    </p>
                )}
            </div>
        );
    }
}

export default Edit;
