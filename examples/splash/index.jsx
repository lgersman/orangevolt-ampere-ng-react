import React from 'react';
import Ampere, { Ui } from 'orangevolt-ampere-ng';
import AmpereReact from 'orangevolt-ampere-ng-react';

class SplashFigure extends React.Component {
  static defaultProps = {
    cb                : ()=>{},
    splashDescription : ''
  }
  
  static propTypes = {
    cb                : React.PropTypes.func.isRequired,
    caption           : React.PropTypes.string.isRequired,
    splashCaption     : React.PropTypes.string,
    splashDescription : React.PropTypes.string
  }
  
  constructor(props) {
    super(props);
    
    let _view;
    Ampere.domain('mydomain', domain=>
      domain.createModule('mymodule', module=>{
        module.options[Ampere.UI.CAPTION] = this.props.caption;
        module.createState('mystate', state=>
          state.createView('myview', view=>{
            _view = view.createTemplate('mytemplate');
          })
        )
      })
    );
    
    this.state = {
      app : Ampere.app(_view, this.props.cb)
    };
  }
  
  render = ()=>{
    return <figure style={{
      display       : 'flex',
      flexDirection : 'column',
      alignItems    : 'stretch',
      
      flex          : '1 1 auto'/*,
      minWidth      : '200px',
      minHeight     : '200px'*/
    }}>
      <figcaption style={{
        backgroundColor : 'lightgrey'
      }}>Example : SplashComponent {Ui.caption(this.state.app)}</figcaption>
      <AmpereReact.Splash 
        caption={('splashCaption' in this.props) ? this.props.splashCaption : this.props.caption}
        description={this.props.splashDescription}
        app={this.state.app} 
      />
    </figure>
  }
}

React.render(
  <div style={{
    display         : 'flex',
    flexDirection   : 'column',
    alignItems      : 'stretch'/*,
    
    position        : 'fixed',
    left            : 0,
    right           : 0,
    bottom          : 0,
    top             : 0*/
  }}>
    <SplashFigure caption="immediately resolved no caption" splashCaption="">
      <span>Application</span>
    </SplashFigure>
    <SplashFigure caption="immediately resolved fcggfdgg dfgfdg fdgfdgfdgdfgfdg"/>
    <SplashFigure caption="immediately rejected" cb={
      app=>Promise.reject('i was immediately rejected')
    }/>
    <SplashFigure caption="delayed resolved" cb={
      app=>new Promise((resolve, reject)=>
        setTimeout(()=>resolve('i was delayed resolved'), 3000)
      )
    }/>
    <SplashFigure caption="delayed resolved no caption" splashDescription="Loading resources ..." splashCaption="" cb={
      app=>new Promise((resolve, reject)=>
        setTimeout(()=>resolve('i was delayed resolved'), 3000)
      )
    }/>
    <SplashFigure caption="delayed rejected" splashDescription="Loading resources ..." cb={
      app=>new Promise((resolve, reject)=>
        setTimeout(()=>reject('i was delayed rejected'), 4000)
      )
    }/>
    
    <SplashFigure caption="delayed resolved custom splash" cb={
      app=>new Promise((resolve, reject)=>
        setTimeout(()=>resolve('i was delayed resolved'), 6000)
      )
    }>  
      <strong>Loading stuff ...</strong>
    </SplashFigure>
    
    <SplashFigure caption="delayed rejected custom splash" cb={
      app=>new Promise((resolve, reject)=>
        setTimeout(()=>reject('i was delayed rejected'), 8000)
      )
    }/>
  </div>
  , 
  document.getElementById('index')
);
