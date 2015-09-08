import React from 'react';
import Ampere from 'orangevolt-ampere-ng';

//import {Ampere,React} from 'orangevolt-ampere-ng-react';

console.log(`Ampere.VERSION=${Ampere.VERSION}`);

export default class Bar extends React.Component {
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
