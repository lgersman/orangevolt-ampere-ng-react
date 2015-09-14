import React from 'react';
import Ampere, { App, Ui } from 'orangevolt-ampere-ng';
import AppComponent from './app.jsx';
import BaseComponent from './base.jsx';

export default class SplashComponent extends BaseElement {
  static defaultProps = {
    style   : {}
  }
  
  static propTypes = {
    app     : React.PropTypes.instanceOf(App).isRequired,
    style   : React.PropTypes.object,
    caption : React.PropTypes.string
  }
  
  state = {
      // state reflects the app's promise state  
    state : 'pending'
  }
  
  constructor(props) {
    super(props);
  
      // track app promise state of the app
    this.props.app.promise.then(()=>this.setState({state:'fullfilled'}), ()=>this.setState({state:'rejected'}));
    
    this.state.caption = this.props.caption || `Initializing ${Ui.caption(this.props.app)}`;
  }
    
  render = ()=>{
    return <div 
      style={this.props.style} 
      className={`orangevolt-ampere-ng splash name-${this.props.app.name}`}
    >
      { this.state.state=='pending' ? 
        <div id="splash" fit layout horizontal center-center>
          <div>
            splash (app={JSON.stringify(this.props.app.name)}", state={JSON.stringify(this.state.state)}) !
            <h3 className="caption">{this.state.caption}</h3>
            <div className="mdl-spinner mdl-js-spinner is-active"></div>
          </div>
        </div> : 
        <AppComponent app={this.props.app}/> 
      }
    </div>
  }
}
