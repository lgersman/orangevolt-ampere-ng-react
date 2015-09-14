import React from 'react';
import Ampere, { App } from 'orangevolt-ampere-ng';
import AmpereReact from 'orangevolt-ampere-ng-react';

export default class AppComponent extends React.Component {
  static defaultProps = {
    style : {}
  }
  
  static propTypes = {
    app : React.PropTypes.instanceOf(App).isRequired,
  }
  
  state = {
      // state reflects the app's promise state  
    state : 'pending'
  }
  
  constructor(props) {
    super(props);
    
      // track app promise state of the app
    this.props.app.promise.then(()=>this.setState({state:'fullfilled'}), ()=>this.setState({state:'rejected'}));
  }
  
  render() {
    return this.state.state==='pending' ? null : 
    <div 
      style={this.props.style} 
      className={`orangevolt-ampere-ng app name-${this.props.app.name}`}
    >
      huhhu app (app={JSON.stringify(this.props.app.name)}", state={JSON.stringify(this.state.state)}) !
    </div>
  }
}
