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
            store: {
                type: "string",
                default: ""
            },
            product: {
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

            // Set initial state if there is non available from higher order component.
            this.setState({
                products: []
            });

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

        onChangeProduct = product => {
            this.props.setAttributes({ product: product });
        };

        onChangeStore = store => {
            this.setState({
                products: []
            });
            this.getProducts(store);
            this.props.setAttributes({ store });
            this.onChangeProduct();
        };

        onChangeOverlay = overlay => {
            this.props.setAttributes({ overlay: overlay });
        };

        render() {
            const { attributes } = this.props;
            const { store, product, overlay } = attributes;

            // If it's not a core button, do not include settings panel.
            if (this.props.name !== "core/button") {
                return <BlockEdit {...this.props} />;
            }

            return (
                <Fragment>
                    <BlockEdit {...this.props} />
                    <InspectorControls>
                        <PanelBody
                            title={__("Lemon Squeezy", "lemonsqueezy")}
                            initialOpen={false}
                        >
                            {this.state ? (
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
                                                    options={
                                                        this.state.stores
                                                    }
                                                    onChange={
                                                        this.onChangeStore
                                                    }
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
