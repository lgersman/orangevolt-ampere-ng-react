import React from 'react';
import Ampere, { App, Ui } from 'orangevolt-ampere-ng';
import AppComponent from './app.jsx';
import BaseComponent from './base.jsx';

export default class SplashComponent extends BaseComponent {
  static defaultProps = {
    style   : {}
  }
  
  static propTypes = {
    app         : React.PropTypes.instanceOf(App).isRequired,
    style       : React.PropTypes.object,
    caption     : React.PropTypes.string,
    description : React.PropTypes.string
  }
  
  state = {
      // state reflects the app's promise state  
    state : 'pending'
  }
  
  constructor(props) {
    super(props);
  
      // track app promise state of the app
    this.props.app.promise.then(()=>this.setState({state:'fullfilled'}), ()=>this.setState({state:'rejected'}));
    
    this.state.caption = ('caption' in this.props) ? this.props.caption : `Initializing ${Ui.caption(this.props.app)}`;
    this.state.description = ('description' in this.props) ? this.props.description : '';
  }
    
  render = ()=>{
    var content;
    debugger
    if (React.Children.count(this.props.children)) {
      debugger
      content = <div>{this.props.children}</div>;
    } else {
      content = <div className="content">
        <div>splash (app={JSON.stringify(this.props.app.name)}", state={JSON.stringify(this.state.state)}) !</div>
        { this.state.caption ? <h3 className="caption">{this.state.caption}</h3> : null }
        <div>
          <div className="mdl-spinner mdl-js-spinner is-active"></div>
        </div>
        { this.state.description ? <div className="description">{this.state.description}</div> : null }
      </div>
    }
     
    return this.state.state!=='pending1' ? <div 
      style={this.props.style} 
      className={`orangevolt-ampere-ng splash name-${this.props.app.name}`}
    >
      { content }
    </div>
    : 
    <AppComponent app={this.props.app}/> 
  }
}
