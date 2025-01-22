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
const { InspectorControls } = wp.editor;
const { createHigherOrderComponent } = wp.compose;
const { ToggleControl, PanelBody, SelectControl } = wp.components;
const { nonce } = window.wpApiSettings;

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
            variant: {
                type: "string",
                default: ""
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
                variants: [],
                checkingApi: false,
                isLoadingVariants: false
            });

            if (use_ls) {
                this.getStores();
                this.checkApi();
            }
        }

        getStores() {
            return fetch("/wp-json/lsq/v1/stores")
                .then(response => response.json())
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
            return fetch("/wp-json/lsq/v1/validate")
                .then(response => response.json())
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
                variants: [], // Clear variants when loading new products
                isLoadingProducts: true,
                isLoadingVariants: false
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
                                product => product.value == this.props.attributes.product
                            );
                            if (selectedProductIndex === -1) {
                                selectedProductIndex = 0;
                            }

                            const selectedProduct = response.products[selectedProductIndex].value;
                            this.props.setAttributes({
                                product: selectedProduct,
                            });

                            // Use product ID to fetch variants.
                            const selectedProductId = response.products[selectedProductIndex].product_id;
                            if (selectedProductId) {
                                this.getVariants(selectedProductId);
                            }
                        }
                    }
                })
                .finally(() => {
                    this.setState({
                        isLoadingProducts: false
                    });
                });
        }

        getVariants(product_id) {
            // Don't proceed if we don't have a valid product ID
            if (!product_id || product_id.includes('http')) {
                return;
            }

            this.setState({
                variants: [],
                isLoadingVariants: true
            });

            const endpoint = "/wp-json/lsq/v1/variants?product_id=" + product_id;

            return fetch(endpoint, {
                credentials: 'same-origin',
                headers: {
                    'X-WP-Nonce': nonce
                }
            })
                .then(response => response.json())
                .then(response => {

                    if (true == response.success) {
                        this.setState({
                            variants: response.variants
                        });

                        if (response.variants.length) {
                            let selectedVariantIndex = response.variants.findIndex(
                                variant => variant.value == this.props.attributes.variant
                            );
                            if (selectedVariantIndex === -1) {
                                selectedVariantIndex = 0;
                            }

                            this.props.setAttributes({
                                variant: response.variants[selectedVariantIndex].value
                            });
                        }
                    }
                })
                .catch(error => {
                    alert('Error fetching variants:', error);
                })
                .finally(() => {
                    this.setState({
                        isLoadingVariants: false
                    });
                });
        }

        onChangeProduct = product => {
            // Clear variants when product changes
            this.setState({
                variants: [],
                isLoadingVariants: false
            });

            this.props.setAttributes({
                product,
                variant: '' // Clear selected variant when product changes
            });

            if (product) {
                // Find selected product by value (product URL) and get product_id from the products array.
                const selectedProduct = this.state.products.find(item => item.value === product);
                const productId = selectedProduct ? selectedProduct.product_id : null;
                this.getVariants(productId);
            }
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
        }

        onChangeURLData = prefillFromURL => {
            this.props.setAttributes({ prefillFromURL });
        };

        onChangeVariant = variant => {
            this.props.setAttributes({ variant: variant });
        };

        render() {
            const { attributes } = this.props;
            const { store, product, variant, overlay, use_ls, prefillUserData, prefillFromURL } = attributes;

            // If it's not a core button, do not include settings panel.
            if (this.props.name !== "core/button") {
                return <BlockEdit {...this.props} />;
            }

            const settings = () => {
                return this.state ? (
                    [
                        this.state.isApiConnectable ? (
                            <Fragment>
                                <p>
                                    <SelectControl
                                        label={__(
                                            "Select Store",
                                            "lemonsqueezy"
                                        )}
                                        value={store}
                                        options={this.state.stores}
                                        onChange={
                                            this.onChangeStore
                                        }
                                    />
                                </p>
                                <p>
                                    {this.state
                                        .isLoadingProducts ? (
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                color: "rgb(117, 117, 117)"
                                            }}
                                        >
                                            {__(
                                                "Loading...",
                                                "lemonsqueezy"
                                            )}
                                        </span>
                                    ) : this.state.products
                                        .length ? (
                                        <SelectControl
                                            value={product}
                                            options={
                                                this.state.products
                                            }
                                            onChange={
                                                this.onChangeProduct
                                            }
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
                                    {this.state.isLoadingVariants ? (
                                        <span style={{
                                            fontSize: "14px",
                                            color: "rgb(117, 117, 117)"
                                        }}>
                                            {__("Loading variants...", "lemonsqueezy")}
                                        </span>
                                    ) : this.state.variants && this.state.variants.length > 0 ? (
                                        <SelectControl
                                            label={__("Select Variant", "lemonsqueezy")}
                                            value={variant}
                                            options={this.state.variants}
                                            onChange={this.onChangeVariant}
                                        />
                                    ) : product ? (
                                        <span style={{
                                            fontSize: "14px",
                                            color: "rgb(117, 117, 117)"
                                        }}>
                                            {__("No variants available", "lemonsqueezy")}
                                        </span>
                                    ) : null}
                                </p>
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Use checkout overlay?",
                                            "lemonsqueezy"
                                        )}
                                        checked={overlay}
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
                                        onChange={
                                            this.onChangeOverlay
                                        }
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

                            </Fragment>
                        ) : (
                            <p>
                                {this.state.checkingApi && <small>{__(
                                    "Checking connection status",
                                    "lemonsqueezy"
                                )}</small>}

                                {!this.state.checkingApi && <small>
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
                                </small>}
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
                )
            }

            return (
                <Fragment>
                    <BlockEdit {...this.props} />
                    <InspectorControls>
                        <PanelBody
                            title={__("Lemon Squeezy", "lemonsqueezy")}
                            initialOpen={false}
                        >
                            <Fragment>
                                <p>
                                    <ToggleControl
                                        label={__(
                                            "Apply Lemon Squeezy Checkout",
                                            "lemonsqueezy"
                                        )}
                                        checked={use_ls}
                                        help={
                                            use_ls
                                                ? __(
                                                    "Your button will be used for Lemon Squeezy Checkout.",
                                                    "lemonsqueezy"
                                                )
                                                : __(
                                                    "Your button will not be used for Lemon Squeezy Checkout.",
                                                    "lemonsqueezy"
                                                )
                                        }
                                        onChange={
                                            this.changeUseLS
                                        }
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
    const { overlay, product, use_ls } = attributes;

    if (allowedBlocks.includes(blockType.name) && use_ls) {
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
