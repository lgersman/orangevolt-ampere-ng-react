import React from 'react';

export default class BaseComponent extends React.Component {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
  componentDidUpdate() {
    componentHandler.upgradeDom();
  } 

}
