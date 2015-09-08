//import { Foo } from '/index.js';
import { Foo } from 'orangevolt-ampere-ng-react';
import React from 'react';

const handleClick=()=>console.log("i was clicked");

React.render(<Foo onClick={handleClick}/>, document.getElementById('index'));
