/*
  pingAlive is a connect/express middleware useful for development 
  it tracks if the server is alive and reconnects when again available 
  (-> i.e. when building is done again)
*/

export default function({uriComponentToMatch='ping-alive', interval=2000}={}) {
    
  const middleware = (req, res, next)=>req.url.includes(uriComponentToMatch) && res.status(204).end() || next();

  middleware.client = ({interval=2000}={})=>{
    const autoreloadInput = `
      <input type="checkbox" onchange="window.localStorage['task-serve-pingalive-autoreload']=this.checked.toString()">
      Auto reload after build ?          
    `,
          disablePingAlive = `
      <input type="checkbox" onchange="this.parentElement.parentElement.onDisabledChanged(this.checked);">
      Disable
    `,
          style = `
      display           : inline-block;
      border            : 1px solid;
      padding           : 4px;  
      position          : fixed;
      right             : 0;
      bottom            : 0;
      z-index           : 1000000;
      background-color  : magenta;
      color             : white;
    `,
          aliveFragment = `
      <label style="font-weight : bold">
        ${autoreloadInput.replace(/after build/, 'after next build')}
      </label>
      <br>
      <label>
        ${disablePingAlive}
      </label>
    `;
    
    const poll = (uriComponentToMatch, autoreloadInput, disablePingAlive)=>{
      window.fetch(`/${uriComponentToMatch}?${new Date().getTime()}`).then(
        ()=>{
          if (eWrapper.dataset.reload==='true') {
            eWrapper.dataset.reload = false;
            eWrapper.innerHTML = `
              <label style="font-weight : bold">
                Rebuilding done
                <button type="button" onclick="document.location.reload()">Reload ?</button>
              </label>
            `;
            window.localStorage['task-serve-pingalive-autoreload']==='true' && document.location.reload();
          }
        },
        ()=>{
          if (eWrapper.dataset.reload==='false') {
            eWrapper.dataset.reload = true;
            eWrapper.innerHTML = `
                <marquee>Rebuilding ...</marquee>
                <label style="font-weight : bold">
                  ${autoreloadInput}
                </label>
                <br>
                <label onclick="this.parentElement.querySelector('marquee') && this.parentElement.querySelector('marquee').remove()">
                  ${disablePingAlive}
                </label>
            `;
            eWrapper.querySelector('input').checked=window.localStorage['task-serve-pingalive-autoreload']==='true';
          }
        }
      );
    };
    
    return `
  <script>
    (function(eWrapper) {
      eWrapper.style.cssText = ${JSON.stringify(style)}
      eWrapper.innerHTML = ${JSON.stringify(aliveFragment)};
      eWrapper.dataset.reload='false';
      eWrapper.querySelector('input').checked=window.localStorage['task-serve-pingalive-autoreload']==='true';
      document.body.appendChild(eWrapper);
      
      var intervalHandle; 
      
      eWrapper.querySelectorAll('input')[1].checked = window.localStorage['task-serve-pingalive-disabled']=='true';
      eWrapper.onDisabledChanged = function(checked) {
        window.localStorage['task-serve-pingalive-disabled']=checked.toString(); 
        eWrapper.querySelector('input').disabled = checked;
        
        if (checked) {
          window.clearInterval(intervalHandle);
        } else {
          intervalHandle = setInterval(
            (${poll})
            .bind( 
              this, 
              ${JSON.stringify(uriComponentToMatch)},
              ${JSON.stringify(autoreloadInput)},
              ${JSON.stringify(disablePingAlive)}
            ),
            ${interval}
          );
        }
      };      
      
        // trigger initial activation
      eWrapper.onDisabledChanged(window.localStorage['task-serve-pingalive-disabled']==='true');
      
    })(document.createElement('div'));  
  </script>
    `;
  };
  
  return middleware;
}
