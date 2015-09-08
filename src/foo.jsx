import React from 'react';
import Ampere from 'orangevolt-ampere-ng';

export default class Foo extends React.Component {
  onPClicked= evt=>{
    console.log('p clicked');
  }
  
  onButtonClicked= evt=>{
    console.log('button clicked');
  }
  
  render = ()=>
    <p onClick={this.onPClicked}>
      <button type="button" onClick={this.onButtonClicked}>click me</button>
    </p>
  
  moep() {
    console.log('moep');
  }
}
