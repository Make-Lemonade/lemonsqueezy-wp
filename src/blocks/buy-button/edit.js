import { Component } from "@wordpress/element";
import { RichText } from "@wordpress/block-editor";
import { SelectControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

class Edit extends Component {
    componentDidMount() {
		fetch( '/wp-json/lsq/v1/products' )
			.then( ( response ) => response.json() )
			.then( response => {
				if ( true == response.success ) {
					this.setState( {
						products: response.products,
					} );
				}
			} )

        this.checkApi();
	}

    checkApi() {
		return fetch( '/wp-json/lsq/v1/validate' )
			.then( ( response ) => response.json() )
			.then( response => {
				if ( true == response.success ) {
					this.setState( {
						isApiConnectable: true,
					} );
				} else {
					this.setState( {
						isApiConnectable: false,
					} );
				}
			} )
	}

    onChangeContent = content => {
        this.props.setAttributes({ content });
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
    
        return (
            <div className="lsq-block">
                <h4>{__( 'Lemon Squeezy Product Block', 'lemonsqueezy' )}</h4>
                {this.state ?
                    [ this.state.isApiConnectable ?
                        <p>
                        <SelectControl
                            value={ product }
                            options={ this.state.products }
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
                        </p>
                    :
                        <p>
                         { __( "Uh oh! Looks like you haven't connected your store yet! Please visit the Lemon Squeezy Settings and add your API key.", 'lemonsqueezy' ) }
                        </p>
                    ]
                :
                ''
                }
           </div>
        );
    }
}

export default Edit;
