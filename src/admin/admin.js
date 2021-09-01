import "./admin.scss";
import axios from 'axios';
 
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
 
         this.changeOptions = this.changeOptions.bind( this );
 
         this.state = {
             isAPILoaded: false,
             isAPISaving: false,
             lsq_api_status: false,
             lsq_api_key: '',
             isApiConnectable : false,
             
         };
     }
 
     componentDidMount() {
         wp.api.loadPromise.then( () => {
             this.settings = new wp.api.models.Settings();
 
             if ( false === this.state.isAPILoaded ) {
                 this.settings.fetch().then( response => {
                     this.setState({
                         lsq_api_status: Boolean( response.lsq_api_status ),
                         lsq_api_key: response.lsq_api_key,
                         isAPILoaded: true
                     });
                 });
             }
         });
     }
 
     changeOptions( option, value ) {
         this.setState({ isAPISaving: true });

         this.checkApi();
 
         const model = new wp.api.models.Settings({
             [option]: value
         });
 
         model.save().then( response => {
             this.setState({
                 [option]: response[option],
                 isAPISaving: false
             });
         });
     }

     checkApi() {
        const headers = {
            'Accept' : 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            'Authorization': 'Bearer ' + this.state.lsq_api_key
          }

        axios.get('https://api.lemonsqueezy.com/v1/stores/1', '', {
            headers: headers
          })
        .then(res => {
            if( res ) {
                this.setState({
                    isApiConnectable: true,
                });
            }
        })
        .catch(error => {
            if( error ) {
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
                         <div className="lsq-logo"></div>
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
                     <PanelBody>
                         <div className="lsq-info">
                             <h2>{ __( 'Got a question for us?', 'lemonsqueezy' ) }</h2>
 
                             <p>{ __( 'We would love to help you out if you need any help.', 'lemonsqueezy' ) }</p>
 
                             <div className="lsq-info-button-group">
                                 <Button
                                     isPrimary
                                     isLarge
                                     target="_blank"
                                     href="#"
                                 >
                                     { __( 'Ask a question', 'lemonsqueezy' ) }
                                 </Button>
                             </div>
                         </div>
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