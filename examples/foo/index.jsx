//import { Foo } from '/index.js';
import { Foo } from 'orangevolt-ampere-ng-react';
import React from 'react';

//import styles from './index.css';

const handleClick=()=>console.log("i was clicked");

// className={styles.foo}

React.render(<Foo onClick={handleClick} />, document.getElementById('index'));
