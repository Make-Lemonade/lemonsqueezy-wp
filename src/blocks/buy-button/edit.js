import { Component } from "@wordpress/element";
import { RichText, withColors } from "@wordpress/block-editor";
import { SelectControl, ToggleControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

class Edit extends Component {
    onChangeContent = content => {
        this.props.setAttributes({ content });
    };

    onChangeAlignment = textAlignment => {
        this.props.setAttributes({ textAlignment });
    };

    onChangeproduct = product => {
        this.props.setAttributes({ product });
    };

    onChangeOverlay = overlay => {
        this.props.setAttributes({ overlay: overlay });
    };

    render() {
        const {
            attributes,
        } = this.props;
        const { content, product, overlay } = attributes;

        // Get that dynamically via REST API endpoint.
        const products = [
            { label: 'Select Product', value: '' },
            { label: 'Big', value: '100%' },
            { label: 'Medium', value: '50%' },
            { label: 'Small', value: '25%' },
        ]

        return (
            // Check if API connection is active. If not output alternative text.
            <div className="lsq-block">
                <h4>Lemon Squeezy Product Block</h4>
                <SelectControl
                    value={ product }
                    options={ products }
                    onChange={this.onChangeproduct}
                />
                <RichText
                    placeholder={__( 'Customize Link Text', 'lemonsqueezy' )}
                    tagName="p"
                    className="lsq-link-text"
                    onChange={this.onChangeContent}
                    value={content}
                />
                <ToggleControl
                    label={ __( 'Use checkout overlay?', 'lemonsqueezy' ) }
                    checked={overlay}
                    onChange={this.onChangeOverlay}
                />
                <Button isPrimary>{ __( 'Insert Product Link', 'lemonsqueezy' ) }</Button>
           </div>
        );
    }
}

export default withColors("backgroundColor", { textColor: "color" })(Edit);
