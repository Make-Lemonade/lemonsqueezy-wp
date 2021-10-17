// Concept of extending core button block. Copy that into /buy-button/index.js for preview.

/**
 * External Dependencies
 */
 import "./styles.editor.scss";

 /**
  * WordPress Dependencies
  */
 const { __ } = wp.i18n;
 const { addFilter } = wp.hooks;
 const { Fragment, Component }	= wp.element;
 const { InspectorControls }	= wp.editor;
 const { createHigherOrderComponent } = wp.compose;
 const { ToggleControl, PanelBody, SelectControl } = wp.components;
  
  // Restrict to specific block names.
  const allowedBlocks = [ 'core/button' ];
 
  
  /**
   * Add custom attributes for Lemon Squeezy product selection.
   *
   * @param {Object} settings Settings for the block.
   *
   * @return {Object} settings Modified settings.
   */
  function extendAttributes( settings ) {
    
   /**
    * check if object exists for old Gutenberg version compatibility.
    * Add allowedBlocks restriction
    */
    if ( typeof settings.attributes !== 'undefined' && allowedBlocks.includes( settings.name ) ) {
      settings.attributes = Object.assign( settings.attributes, {
        overlay:{ 
         type: 'boolean',
         default: true,
       },
       product:{ 
         type: 'string',
         default: '',
       },
      });
    }
  
    return settings;
  }
  
 
  const extendControls = createHigherOrderComponent((BlockEdit) => {
   return class Edit extends Component {
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
       onChangeProduct = product => {
           this.props.setAttributes({ product : product });
       };
   
       onChangeOverlay = overlay => {
           this.props.setAttributes({ overlay: overlay });
       };
   
       render() {
           const {
               attributes,
           } = this.props;
           const { product, overlay } = attributes;
       
           return (
             <Fragment>
             <BlockEdit {...this.props} />
             <InspectorControls>
                 <PanelBody>
                   <h4>{__( 'Lemon Squeezy Product Block', 'lemonsqueezy' )}</h4>
                   {this.state ?
                       [ this.state.isApiConnectable ?
                           <p>
                           <SelectControl
                               value={ product }
                               options={ this.state.products }
                               onChange={this.onChangeProduct}
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
                   </PanelBody>
              </InspectorControls>
           </Fragment>
               
           );
       }
   }
 }, 'extendControls')
 
  
  /**
   * Add custom element class in save element.
   *
   * @param {Object} extraProps     Block element.
   * @param {Object} blockType      Blocks object.
   * @param {Object} attributes     Blocks attributes.
   *
   * @return {Object} extraProps Modified block element.
   */
  function saveExtendedOptions( extraProps, blockType, attributes ) {
 
    const { overlay, product } = attributes;
    
    if ( typeof overlay !== 'undefined' && !overlay && allowedBlocks.includes( blockType.name ) ) {
      extraProps.overlay = overlay;
      extraProps.product = product;
    }
  
    return extraProps;
  }
  
  //add filters
  
  addFilter(
    'blocks.registerBlockType',
    'editorskit/custom-attributes',
    extendAttributes
  );
  
  addFilter(
    'editor.BlockEdit',
    'editorskit/custom-advanced-control',
    extendControls
  );
  
  addFilter(
    'blocks.getSaveContent.extraProps',
    'editorskit/saveExtendedOptions',
    saveExtendedOptions
  );