import './admin.scss';
import lsqIcon from '../../images/ls-icon.svg';
 
 const { __ } = wp.i18n;

 const {
     BaseControl,
     Button,
     ExternalLink,
     PanelBody,
     PanelRow,
     Notice,
 } = wp.components;
 
 const {
     render,
     Component,
     Fragment
 } = wp.element;
 

 class AdminSettings extends Component {

     constructor() {
        super( ...arguments );
    
        this.state = {
            isAPILoaded: false,
            isAPISaving: false,
            lsq_api_key: '',
            isApiConnectable: false
        };
    }
    
    async componentDidMount() {
        wp.api.loadPromise.then( () => {
            this.settings = new wp.api.models.Settings();
    
            if ( false === this.state.isAPILoaded ) {
                this.settings.fetch().then( response => {
                    this.setState({
                        lsq_api_key: response.lsq_api_key,
                        isApiConnectable: Boolean( response.lsq_api_key ),
                        isAPILoaded: true
                    });

                    this.checkApi();
                });
            }
        });
    }

    changeOptions( option, value ) {
        this.setState({ isAPISaving: true });
    
        const model = new wp.api.models.Settings({
            // eslint-disable-next-line camelcase
            [option]: value
        });

        model.save().then( response => {
            this.setState({
                [option]: response[option],
                isAPISaving: false
            });

            this.checkApi();
        });
    }

    checkApi() {
        return fetch('/wp-json/lsq/v1/validate')
        .then((response) => response.json())
        .then(response => {
            if( true == response.success ) {
                this.setState({
                    isApiConnectable: true,
                  });
            } else {
                this.setState({
                    isApiConnectable: false,
                  });
            }
        })
     }
 
     render() {
        const isApiConnectable = this.state.isApiConnectable;

      
         return (
             <Fragment>
                 <div className="lsq-header">
                     <div className="lsq-container">
                         <div className="lsq-header__logo">
                             <img src={lsqIcon} className="lsq-header__logo-icon" />
                             { __( 'LemonSqueezy.com', 'lemonsqueezy' ) }
                         </div>
                     </div>
                 </div>
 
                 <div className="lsq-main">
                     <PanelBody
                         title={ __( 'Settings', 'lemonsqueezy' ) }
                     >
                         <PanelRow>
                             <BaseControl
                                 label={ __( 'Lemon Squeezy API Key', 'lemonsqueezy' ) }
                                 help={ __( 'In order to use the Lemon Squeezy plugin, you need to use an API key.', 'lemonsqueezy' ) }
                                 id="lsq-options-lsq-api"
                                 className="lsq-text-field"
                             >
                                 <input
                                     type="text"
                                     id="lsq-options-lsq-api"
                                     value={ this.state.lsq_api_key }
                                     placeholder={ __( 'Lemon Squeezy API Key', 'lemonsqueezy' ) }
                                     disabled={ this.state.isAPISaving }
                                     onChange={ e => this.setState({ lsq_api_key: e.target.value }) }
                                 />
                                 <div className="lsq-text-field-button-group">
                                     <Button
                                         isPrimary
                                         isLarge
                                         disabled={ this.state.isAPISaving }
                                         onClick={ () => this.changeOptions( 'lsq_api_key', this.state.lsq_api_key ) }
                                     >
                                         { __( 'Save', 'lemonsqueezy' ) }
                                     </Button>
                                 
                                     <ExternalLink href="#">
                                         { __( 'Get API Key', 'lemonsqueezy' ) }
                                     </ExternalLink>
                                 </div>
                                 { isApiConnectable
                                 ? <Notice status="success">{ __( 'Successfully connected to Lemon Squeezy API.', 'lemonsqueezy' ) }</Notice>
                                 : <Notice status="error">{ __( 'Could not connect to Lemon Squeezy API.', 'lemonsqueezy' ) }</Notice>
                                 }
                             </BaseControl>
                         </PanelRow>
                     </PanelBody>
                 </div>
             </Fragment>
         );
     }
 }
 
 render(
     <AdminSettings/>,
     document.getElementById( 'lsq-plugin' )
 );