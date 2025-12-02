import lsqIcon from "../../../images/ls-icon.svg";

import { Component, Fragment } from "@wordpress/element";
import {
    RichText,
    withColors,
    PanelColorSettings,
    InspectorControls
} from "@wordpress/block-editor";
import {
    SelectControl,
    ToggleControl,
    TextControl,
    __experimentalNumberControl as NumberControl,
    BaseControl,
    Button
} from "@wordpress/components";
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
            newCustomDataKey: "",
            newCustomDataValue: ""
        };
    }

    componentDidMount() {
        wp.apiFetch({
            path: "lsq/v1/stores"
        }).then(response => {
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

                    this.getProducts(response.stores[selectedStoreIndex].value);
                }
            }
        });

        this.checkApi();
    }

    checkApi() {
        return wp
            .apiFetch({
                path: "lsq/v1/validate"
            })
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

        return wp
            .apiFetch({
                path: `lsq/v1/products?store_id=${store_id}`
            })
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

    onAttributeChange = (attribute, value) => {
        this.props.setAttributes({ [attribute]: value });
    };

    onChangeURLData = prefillFromURL => {
        this.props.setAttributes({ prefillFromURL });
    };

    handleRemoveCustomData = index => {
        const customData = [...this.props.attributes.customData];
        customData.splice(index, 1);
        this.props.setAttributes({ customData });
    };

    handleCustomDataKeyChange = (data, index) => {
        const customData = [...this.props.attributes.customData];
        customData[index].key = data;
        this.props.setAttributes({ customData });
    };

    handleCustomDataValueChange = (data, index) => {
        const customData = [...this.props.attributes.customData];
        customData[index].value = data;
        this.props.setAttributes({ customData });
    };

    handleAddCustomData() {
        if (!this.state.newCustomDataKey || !this.state.newCustomDataValue) {
            alert("Please Insert Key & Value");
            return;
        }
        const customData = [...this.props.attributes.customData];
        customData.push({
            key: this.state.newCustomDataKey,
            value: this.state.newCustomDataValue
        });

        this.setState({ newCustomDataKey: "", newCustomDataValue: "" });
        this.props.setAttributes({ customData });
    }

    render() {
        const {
            attributes,
            textColor,
            setTextColor,
            backgroundColor,
            setBackgroundColor
        } = this.props;
        const {
            content,
            store,
            product,
            overlay,
            prefillUserData,
            prefillFromURL,
            customData,
            showLogo,
            showMedia,
            showDescription,
            showDiscount,
            quantity,
            checkoutBackgroundColor,
            checkoutLinksColor,
            checkoutButtonColor,
            checkoutButtonTextColor,
            checkoutTermsPrivacyColor
        } = attributes;

        let customDataFields = [];

        if (customData.length) {
            customDataFields = customData.map((data, index) => {
                return (
                    <Fragment key={index}>
                        <div className={"lemonsqueezy-custom-data-row"}>
                            <TextControl
                                placeholder="Examples: user_name, user_id"
                                value={data.key}
                                onChange={value =>
                                    this.handleCustomDataKeyChange(value, index)
                                }
                            />
                            <TextControl
                                placeholder="Examples: JoshSmith, 123"
                                value={data.value}
                                onChange={value =>
                                    this.handleCustomDataValueChange(
                                        value,
                                        index
                                    )
                                }
                            />
                            <Button
                                onClick={() =>
                                    this.handleRemoveCustomData(index)
                                }
                                variant="secondary"
                                size="small"
                            >
                                - Remove
                            </Button>
                        </div>
                    </Fragment>
                );
            });
        }

        return (
            <div className="lsq-block">
                <h4>
                    <img src={lsqIcon} />
                    {__("Lemon Squeezy Buy Button", "lemon-squeezy")}
                </h4>
                {this.state && !this.state.isCheckingApi ? (
                    [
                        this.state.isApiConnectable ? (
                            <Fragment>
                                <InspectorControls>
                                    <PanelColorSettings
                                        title={__(
                                            "Button colors",
                                            "lemon-squeezy"
                                        )}
                                        colorSettings={[
                                            {
                                                value: textColor.color,
                                                onChange: setTextColor,
                                                label: __(
                                                    "Text",
                                                    "lemon-squeezy"
                                                )
                                            },
                                            {
                                                value: backgroundColor.color,
                                                onChange: setBackgroundColor,
                                                label: __(
                                                    "Background",
                                                    "lemon-squeezy"
                                                )
                                            }
                                        ]}
                                    />

                                    <PanelColorSettings
                                        title={__(
                                            "Checkout colors",
                                            "lemon-squeezy"
                                        )}
                                        colorSettings={[
                                            {
                                                value: checkoutBackgroundColor,
                                                onChange:
                                                    this.onAttributeChange.bind(
                                                        this,
                                                        "checkoutBackgroundColor"
                                                    ),
                                                label: __(
                                                    "Background",
                                                    "lemon-squeezy"
                                                )
                                            },
                                            {
                                                value: checkoutLinksColor,
                                                onChange:
                                                    this.onAttributeChange.bind(
                                                        this,
                                                        "checkoutLinksColor"
                                                    ),
                                                label: __(
                                                    "Links",
                                                    "lemon-squeezy"
                                                )
                                            },
                                            {
                                                value: checkoutButtonColor,
                                                onChange:
                                                    this.onAttributeChange.bind(
                                                        this,
                                                        "checkoutButtonColor"
                                                    ),
                                                label: __(
                                                    "Button",
                                                    "lemon-squeezy"
                                                )
                                            },
                                            {
                                                value: checkoutButtonTextColor,
                                                onChange:
                                                    this.onAttributeChange.bind(
                                                        this,
                                                        "checkoutButtonTextColor"
                                                    ),
                                                label: __(
                                                    "Button text",
                                                    "lemon-squeezy"
                                                )
                                            },
                                            {
                                                value: checkoutTermsPrivacyColor,
                                                onChange:
                                                    this.onAttributeChange.bind(
                                                        this,
                                                        "checkoutTermsPrivacyColor"
                                                    ),
                                                label: __(
                                                    "Terms + Privacy",
                                                    "lemon-squeezy"
                                                )
                                            }
                                        ]}
                                    />
                                </InspectorControls>

                                <SelectControl
                                    label={__("Store", "lemon-squeezy")}
                                    value={store}
                                    options={this.state.stores}
                                    onChange={this.onChangeStore}
                                />
                                {this.state.isLoadingProducts ? (
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            color: "rgb(117, 117, 117)"
                                        }}
                                    >
                                        {__("Loading...", "lemon-squeezy")}
                                    </span>
                                ) : this.state.products.length ? (
                                    <SelectControl
                                        label={__("Product", "lemon-squeezy")}
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
                                            "lemon-squeezy"
                                        )}
                                    </span>
                                )}

                                <BaseControl
                                    label={__("Button text", "lemon-squeezy")}
                                    __nextHasNoMarginBottom
                                />
                                <RichText
                                    placeholder={__(
                                        "Button text",
                                        "lemon-squeezy"
                                    )}
                                    tagName="p"
                                    className="lsq-link-text"
                                    onChange={this.onChangeContent}
                                    value={content}
                                />
                                <NumberControl
                                    label={__("Quantity", "lemon-squeezy")}
                                    __next40pxDefaultSize
                                    isShiftStepEnabled={true}
                                    shiftStep={1}
                                    value={quantity}
                                    onChange={this.onAttributeChange.bind(
                                        this,
                                        "quantity"
                                    )}
                                />
                                <div className="lsq-block-settings">
                                    <ToggleControl
                                        label={__(
                                            "Use checkout overlay?",
                                            "lemon-squeezy"
                                        )}
                                        help={
                                            overlay
                                                ? __(
                                                      "Your checkout will be opened in a modal window.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "Your customer will be redirected to your checkout page.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        checked={overlay}
                                        onChange={this.onChangeOverlay}
                                    />
                                    <ToggleControl
                                        label={__(
                                            "Pre-fill User Data",
                                            "lemon-squeezy"
                                        )}
                                        checked={prefillUserData}
                                        help={
                                            prefillUserData
                                                ? __(
                                                      "If logged-in, pre-fill user's data on checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't pre-fill user's data on checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        onChange={this.onChangeUserData}
                                    />
                                    <ToggleControl
                                        label={__(
                                            "Pre-fill from URL",
                                            "lemon-squeezy"
                                        )}
                                        checked={prefillFromURL}
                                        help={
                                            prefillFromURL
                                                ? __(
                                                      "If there are checkout query strings in URL, it'll pre-fill the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't pre-fill URL data on checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        onChange={this.onChangeURLData}
                                    />
                                    <ToggleControl
                                        label={__("Show Logo", "lemon-squeezy")}
                                        checked={showLogo}
                                        help={
                                            showLogo
                                                ? __(
                                                      "Show the Lemon Squeezy logo in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't show the Lemon Squeezy logo in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        onChange={this.onAttributeChange.bind(
                                            this,
                                            "showLogo"
                                        )}
                                    />
                                    <ToggleControl
                                        label={__(
                                            "Show Media",
                                            "lemon-squeezy"
                                        )}
                                        help={
                                            showMedia
                                                ? __(
                                                      "Show the product media in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't show the product media in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        checked={showMedia}
                                        onChange={this.onAttributeChange.bind(
                                            this,
                                            "showMedia"
                                        )}
                                    />
                                    <ToggleControl
                                        label={__(
                                            "Show Description",
                                            "lemon-squeezy"
                                        )}
                                        help={
                                            showDescription
                                                ? __(
                                                      "Show the product description in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't show the product description in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        checked={showDescription}
                                        onChange={this.onAttributeChange.bind(
                                            this,
                                            "showDescription"
                                        )}
                                    />
                                    <ToggleControl
                                        label={__(
                                            "Show Discount",
                                            "lemon-squeezy"
                                        )}
                                        help={
                                            showDiscount
                                                ? __(
                                                      "Show the product discount in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "It won't show the product discount in the checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        checked={showDiscount}
                                        onChange={this.onAttributeChange.bind(
                                            this,
                                            "showDiscount"
                                        )}
                                    />
                                </div>
                                <p>
                                    <small
                                        className={
                                            "lemonsqueezy-custom-data-header"
                                        }
                                    >
                                        <strong>Custom Data</strong>
                                        <br />
                                        <Button
                                            size="small"
                                            variant="link"
                                            href={
                                                "https://docs.lemonsqueezy.com/help/checkout/passing-custom-data"
                                            }
                                            target={"_blank"}
                                        >
                                            Read more about custom data
                                        </Button>
                                    </small>
                                </p>
                                <div>
                                    <div
                                        className={
                                            "lemonsqueezy-custom-data-row"
                                        }
                                    >
                                        <TextControl
                                            label={__(
                                                "Data Key",
                                                "lemon-squeezy"
                                            )}
                                            placeholder={__(
                                                "Data Key",
                                                "lemon-squeezy"
                                            )}
                                            value={this.state.newCustomDataKey}
                                            onChange={val =>
                                                this.setState({
                                                    newCustomDataKey: val
                                                })
                                            }
                                        />
                                        <TextControl
                                            label={__(
                                                "Data Value",
                                                "lemon-squeezy"
                                            )}
                                            placeholder={__(
                                                "Data Value",
                                                "lemon-squeezy"
                                            )}
                                            value={
                                                this.state.newCustomDataValue
                                            }
                                            onChange={val =>
                                                this.setState({
                                                    newCustomDataValue: val
                                                })
                                            }
                                        />
                                        <Button
                                            onClick={() =>
                                                this.handleAddCustomData()
                                            }
                                            variant="secondary"
                                            size="small"
                                        >
                                            + Add Data
                                        </Button>
                                    </div>
                                    {customDataFields}
                                </div>
                            </Fragment>
                        ) : (
                            <p>
                                <small>
                                    {__(
                                        "Uh oh! Looks like you haven't connected your store yet! Please visit the",
                                        "lemon-squeezy"
                                    )}{" "}
                                    <a
                                        href={
                                            /*global lsData*/ /*eslint no-undef: "error"*/ lsData.settings_url
                                        }
                                    >
                                        {__(
                                            "Lemon Squeezy Settings",
                                            "lemon-squeezy"
                                        )}
                                    </a>{" "}
                                    {__(
                                        "and connect to Lemon Squeezy.",
                                        "lemon-squeezy"
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
                                "lemon-squeezy"
                            )}
                        </small>
                    </p>
                )}
            </div>
        );
    }
}

export default withColors("backgroundColor", { textColor: "color" })(Edit);
