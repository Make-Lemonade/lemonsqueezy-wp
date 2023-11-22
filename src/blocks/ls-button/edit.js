import lsqIcon from "../../../images/ls-icon.svg";

import { Component, Fragment } from "@wordpress/element";
import { RichText, withColors, PanelColorSettings, InspectorControls } from "@wordpress/block-editor";
import { SelectControl, ToggleControl, TextControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stores: [],
            products: [],
            isCheckingApi: true,
            isApiConnectable: false,
            isLoadingProducts: false,
            newCustomDataKey: '',
            newCustomDataValue: ''
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
                        let selectedStoreIndex = response.stores.findIndex(
                            store => store.value == this.props.attributes.store
                        );
                        if (selectedStoreIndex === -1) {
                            selectedStoreIndex = 0;
                        }

                        this.getProducts(
                            response.stores[selectedStoreIndex].value
                        );
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
            products: [],
            isLoadingProducts: true
        });

        return fetch("/wp-json/lsq/v1/products?store_id=" + store_id)
            .then(response => response.json())
            .then(response => {
                if (true == response.success) {
                    this.setState({
                        products: response.products
                    });

                    if (response.products.length) {
                        let selectedProductIndex = response.products.findIndex(
                            product =>
                                product.value == this.props.attributes.product
                        );
                        if (selectedProductIndex === -1) {
                            selectedProductIndex = 0;
                        }

                        this.props.setAttributes({
                            product:
                                response.products[selectedProductIndex].value
                        });
                    }
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
        this.props.setAttributes({ store });
        this.getProducts(store);
    };

    onChangeOverlay = overlay => {
        this.props.setAttributes({ overlay: overlay });
    };

    onChangeUserData = prefillUserData => {
        this.props.setAttributes({ prefillUserData });
    };

    onChangeURLData = prefillFromURL => {
        this.props.setAttributes({ prefillFromURL });
    };

    handleRemoveCustomData = ( index ) => {
        const customData = [ ...this.props.attributes.customData ];
        customData.splice( index, 1 );
        this.props.setAttributes( { customData } );
    };


    handleCustomDataKeyChange = ( data, index ) => {
        const customData = [ ...this.props.attributes.customData ];
        customData[ index ].key = data;
        this.props.setAttributes( { customData } );
    };

    handleCustomDataValueChange = ( data, index ) => {
        const customData = [ ...this.props.attributes.customData ];
        customData[ index ].value = data;
        this.props.setAttributes( { customData } );
    };

    handleAddCustomData() {
        if ( ! this.state.newCustomDataKey || ! this.state.newCustomDataValue ) {
            alert( 'Please Insert Key & Value' );
            return;
        }
        const customData = [ ...this.props.attributes.customData ];
        customData.push( {
            key: this.state.newCustomDataKey,
            value: this.state.newCustomDataValue
        } );

        this.setState({ newCustomDataKey: '', newCustomDataValue: '' });
        this.props.setAttributes( { customData } );
    };

    render() {
        const { attributes, textColor, setTextColor, backgroundColor, setBackgroundColor } = this.props;
        const { content, store, product, overlay, prefillUserData, prefillFromURL, customData } = attributes;

        let customDataFields = [];

        if ( customData.length ) {
            customDataFields = customData.map( ( data, index ) => {
                return <Fragment key={ index }>
                    <div className={"lemonsqueezy-custom-data-row"}>
                        <TextControl
                            placeholder="Examples: user_name, user_id"
                            value={ data.key }
                            onChange={ ( value ) => this.handleCustomDataKeyChange( value, index ) }
                        />
                        <TextControl
                            placeholder="Examples: JoshSmith, 123"
                            value={ data.value }
                            onChange={ ( value ) => this.handleCustomDataValueChange( value, index ) }
                        />
                        <Button onClick={() => this.handleRemoveCustomData(index)} isSecondary isSmall>- Remove</Button>
                    </div>
                </Fragment>;
            } );
        }

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
                                <InspectorControls>
                                    <PanelColorSettings
                                        title={__('Color settings')}
                                        colorSettings={[
                                            {
                                                value: textColor.color,
                                                onChange: setTextColor,
                                                label: __('Text color')
                                            },
                                            {
                                                value: backgroundColor.color,
                                                onChange: setBackgroundColor,
                                                label: __('Background color')
                                            }
                                        ]}
                                    />
                                </InspectorControls>
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
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Pre-fill User Data",
                                            "lemonsqueezy"
                                        )}
                                        checked={prefillUserData}
                                        help={
                                            prefillUserData
                                                ? __(
                                                    "If logged-in, pre-fill user's data on checkout.",
                                                    "lemonsqueezy"
                                                )
                                                : __(
                                                    "It won't pre-fill user's data on checkout.",
                                                    "lemonsqueezy"
                                                )
                                        }
                                        onChange={
                                            this.onChangeUserData
                                        }
                                    />
                                </p>
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Pre-fill from URL",
                                            "lemonsqueezy"
                                        )}
                                        checked={prefillFromURL}
                                        help={
                                            prefillFromURL
                                                ? __(
                                                    "If there are checkout query strings in URL, it'll pre-fill the checkout.",
                                                    "lemonsqueezy"
                                                )
                                                : __(
                                                    "It won't pre-fill URL data on checkout.",
                                                    "lemonsqueezy"
                                                )
                                        }
                                        onChange={
                                            this.onChangeURLData
                                        }
                                    />
                                </p>
                                <p>
                                    <small className={"lemonsqueezy-custom-data-header"}>
                                        <strong>Custom Data</strong><br/>
                                        <Button
                                            isSmall
                                            isLink
                                            href={"https://docs.lemonsqueezy.com/help/checkout/passing-custom-data"}
                                            target={"_blank"}>
                                            Read more about custom data
                                        </Button>
                                    </small>
                                </p>
                                <div>

                                    <div className={"lemonsqueezy-custom-data-row"}>
                                        <TextControl
                                            label={__(
                                                "Data Key",
                                                "lemonsqueezy"
                                            )}
                                            placeholder={__(
                                                "Data Key",
                                                "lemonsqueezy"
                                            )}
                                            value={this.state.newCustomDataKey}
                                            onChange={(val) => this.setState({ newCustomDataKey: val })}
                                        />
                                        <TextControl
                                            label={__(
                                                "Data Value",
                                                "lemonsqueezy"
                                            )}
                                            placeholder={__(
                                                "Data Value",
                                                "lemonsqueezy"
                                            )}
                                            value={this.state.newCustomDataValue}
                                            onChange={(val) => this.setState({ newCustomDataValue: val })}
                                        />
                                        <Button onClick={() => this.handleAddCustomData()} isSecondary isSmall>+ Add Data</Button>
                                    </div>
                                    {customDataFields}

                                </div>
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
                                        "and connect to Lemon Squeezy.",
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

export default withColors('backgroundColor', {textColor: 'color'})(Edit);
