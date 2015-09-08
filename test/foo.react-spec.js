require('./util.js');

import Foo from '../src/foo';
import React from 'react/addons';

const tu = React.addons.TestUtils;

describe('React', ()=>{
  describe('Foo', ()=>{
    it('clicks', done=>{
      debugger
        // handleClick wid noch nicht aufgerufen
      const handleClick=()=>{ 
        console.log('i was clicked');
        done(); 
      };
      
      const detachedComp = tu.renderIntoDocument(<Foo onClick={handleClick} meee="too"></Foo>),
            button = tu.findRenderedDOMComponentWithTag(detachedComp, 'button')
      ;
      
      expect(button).not.toBeUndefined();
      
      tu.Simulate.click(React.findDOMNode(button));
      
      detachedComp.moep();
    });  
  });
})
