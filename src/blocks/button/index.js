/**
 * External Dependencies
 */
import "./styles.editor.scss";

/**
 * WordPress Dependencies
 */
const { __ } = wp.i18n;
const { addFilter } = wp.hooks;
const { Fragment, Component } = wp.element;
const { InspectorControls, PanelColorSettings } = wp.editor;
const { createHigherOrderComponent } = wp.compose;
const { ToggleControl, PanelBody, SelectControl, __experimentalNumberControl } =
    wp.components;

const NumberControl = __experimentalNumberControl;

// Restrict to specific block names.
const allowedBlocks = ["core/button"];

/**
 * Add custom attributes for Lemon Squeezy product selection.
 *
 * @param {Object} settings Settings for the block.
 *
 * @return {Object} settings Modified settings.
 */
function extendAttributes(settings) {
    /**
     * check if object exists for old Gutenberg version compatibility.
     * Add allowedBlocks restriction
     */
    if (
        typeof settings.attributes !== "undefined" &&
        allowedBlocks.includes(settings.name)
    ) {
        settings.attributes = Object.assign(settings.attributes, {
            overlay: {
                type: "boolean",
                default: false
            },
            use_ls: {
                type: "boolean",
                default: false
            },
            prefillUserData: {
                type: "boolean",
                default: false
            },
            store: {
                type: "string",
                default: ""
            },
            product: {
                type: "string",
                default: ""
            },
            prefillFromURL: {
                type: "boolean",
                default: false
            },
            showLogo: {
                type: "boolean",
                default: true
            },
            showMedia: {
                type: "boolean",
                default: true
            },
            showDescription: {
                type: "boolean",
                default: true
            },
            showDiscount: {
                type: "boolean",
                default: true
            },
            quantity: {
                type: "number",
                default: 1
            },
            checkoutBackgroundColor: {
                type: "string"
            },
            checkoutLinksColor: {
                type: "string"
            },
            checkoutButtonColor: {
                type: "string"
            },
            checkoutButtonTextColor: {
                type: "string"
            },
            checkoutTermsPrivacyColor: {
                type: "string"
            }
        });
    }

    return settings;
}

const extendControls = createHigherOrderComponent(BlockEdit => {
    return class Edit extends Component {
        componentDidMount() {
            const { use_ls } = this.props.attributes;

            // Set initial state if there is non available from higher order component.
            this.setState({
                products: [],
                stores: [],
                checkingApi: false
            });

            if (use_ls) {
                this.getStores();
                this.checkApi();
            }
        }

        getStores() {
            return wp
                .apiFetch({
                    path: "lsq/v1/stores"
                })
                .then(response => {
                    if (true == response.success) {
                        this.setState({
                            stores: response.stores
                        });

                        if (response.stores.length) {
                            let selectedStoreIndex = response.stores.findIndex(
                                store =>
                                    store.value == this.props.attributes.store
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
        }

        checkApi() {
            this.setState({
                checkingApi: true
            });
            return wp
                .apiFetch({
                    path: "lsq/v1/validate"
                })
                .then(response => {
                    let isApiConnectable = false;

                    if (true == response.success) {
                        isApiConnectable = true;
                    }

                    this.setState({
                        isApiConnectable,
                        checkingApi: false
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
                            let selectedProductIndex =
                                response.products.findIndex(
                                    product =>
                                        product.value ==
                                        this.props.attributes.product
                                );
                            if (selectedProductIndex === -1) {
                                selectedProductIndex = 0;
                            }

                            this.props.setAttributes({
                                product:
                                    response.products[selectedProductIndex]
                                        .value
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

        onChangeProduct = product => {
            this.props.setAttributes({ product: product });
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

        changeUseLS = use_ls => {
            this.props.setAttributes({ use_ls: use_ls });

            if (use_ls && !this.state.stores.length) {
                this.getStores();
                this.checkApi();
            }
        };

        onChangeURLData = prefillFromURL => {
            this.props.setAttributes({ prefillFromURL });
        };

        onAttributeChange = (attribute, value) => {
            this.props.setAttributes({ [attribute]: value });
        };

        render() {
            const { attributes } = this.props;
            const {
                store,
                product,
                overlay,
                use_ls,
                prefillUserData,
                prefillFromURL,
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

            // If it's not a core button, do not include settings panel.
            if (this.props.name !== "core/button") {
                return <BlockEdit {...this.props} />;
            }

            const settings = () => {
                return this.state ? (
                    [
                        this.state.isApiConnectable ? (
                            <Fragment>
                                <SelectControl
                                    label={__("Select Store", "lemon-squeezy")}
                                    value={store}
                                    options={this.state.stores}
                                    onChange={this.onChangeStore}
                                />
                                {this.state.isLoadingProducts ? (
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            color: "rgb(117, 117, 117)"
                                        }}
                                    >
                                        {__("Loading...", "lemon-squeezy")}
                                    </p>
                                ) : this.state.products.length ? (
                                    <SelectControl
                                        label={__("Product", "lemon-squeezy")}
                                        value={product}
                                        options={this.state.products}
                                        onChange={this.onChangeProduct}
                                    />
                                ) : (
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            color: "rgb(117, 117, 117)"
                                        }}
                                    >
                                        {__(
                                            "No products found",
                                            "lemon-squeezy"
                                        )}
                                    </p>
                                )}
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
                                <ToggleControl
                                    label={__(
                                        "Use checkout overlay?",
                                        "lemon-squeezy"
                                    )}
                                    checked={overlay}
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
                                    label={__("Show Media", "lemon-squeezy")}
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
                                    label={__("Show Discount", "lemon-squeezy")}
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
                                            label: __("Links", "lemon-squeezy")
                                        },
                                        {
                                            value: checkoutButtonColor,
                                            onChange:
                                                this.onAttributeChange.bind(
                                                    this,
                                                    "checkoutButtonColor"
                                                ),
                                            label: __("Button", "lemon-squeezy")
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
                            </Fragment>
                        ) : (
                            <p>
                                {this.state.checkingApi && (
                                    <small>
                                        {__(
                                            "Checking connection status",
                                            "lemon-squeezy"
                                        )}
                                    </small>
                                )}

                                {!this.state.checkingApi && (
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
                                )}
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
                );
            };

            return (
                <Fragment>
                    <BlockEdit {...this.props} />
                    <InspectorControls>
                        <PanelBody
                            title={__("Lemon Squeezy", "lemon-squeezy")}
                            initialOpen={false}
                        >
                            <Fragment>
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Apply Lemon Squeezy Checkout",
                                            "lemon-squeezy"
                                        )}
                                        checked={use_ls}
                                        help={
                                            use_ls
                                                ? __(
                                                      "Your button will be used for Lemon Squeezy Checkout.",
                                                      "lemon-squeezy"
                                                  )
                                                : __(
                                                      "Your button will not be used for Lemon Squeezy Checkout.",
                                                      "lemon-squeezy"
                                                  )
                                        }
                                        onChange={this.changeUseLS}
                                    />
                                </p>
                            </Fragment>
                            {use_ls && settings()}
                        </PanelBody>
                    </InspectorControls>
                </Fragment>
            );
        }
    };
}, "extendControls");

/**
 * Add custom element class in save element.
 *
 * @param {Object} extraProps     Block element.
 * @param {Object} blockType      Blocks object.
 * @param {Object} attributes     Blocks attributes.
 *
 * @return {Object} extraProps Modified block element.
 */
function saveExtendedOptions(extraProps, blockType, attributes) {
    const { overlay, product } = attributes;

    if (allowedBlocks.includes(blockType.name)) {
        extraProps.overlay = overlay;
        extraProps.product = product;
    }

    return extraProps;
}

//add filters
addFilter(
    "blocks.registerBlockType",
    "lemon-squeezy/custom-attributes",
    extendAttributes
);

addFilter(
    "editor.BlockEdit",
    "lemon-squeezy/custom-advanced-control",
    extendControls
);

addFilter(
    "blocks.getSaveContent.extraProps",
    "lemon-squeezy/saveExtendedOptions",
    saveExtendedOptions
);
