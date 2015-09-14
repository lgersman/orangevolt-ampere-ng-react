import AmpereReact from 'orangevolt-ampere-ng-react';
import React from 'react';
import Ampere from 'orangevolt-ampere-ng';

Ampere.domain('mydomain', domain=>
  domain.createModule('mymodule', module=>
    module.createState('mystate', state=>
      state.createView('myview', view=>{
        view.createTemplate('mytemplate');
        
        React.render(
          <AmpereReact.App app={Ampere.app(view)}/>, 
          document.getElementById('index')
        );
      })
    )
  )
);
