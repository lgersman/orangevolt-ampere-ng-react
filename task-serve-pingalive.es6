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
          style = `
      display  : inline-block;
      border   : 1px solid;
      padding  : 4px;  
      position : fixed;
      right    : 0;
      bottom   : 0;
      z-index  : 1000000;
      background-color : magenta;
      color    : white;
    `,
          aliveFragment = `
      <label>
        ${autoreloadInput.replace(/after build/, 'after next build')}
      </label>
    `;
    
    const poll = (uriComponentToMatch, autoreloadInput)=>{
      window.fetch(`/${uriComponentToMatch}?${new Date().getTime()}`).then(
        ()=>{
          if (eWrapper.dataset.reload==='true') {
            eWrapper.dataset.reload = false;
            eWrapper.innerHTML = `
              <label>
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
              <label>
                <marquee>Rebuilding ...</marquee>
                ${autoreloadInput}
              </label>
            `;
            eWrapper.querySelector('input').checked=window.localStorage['task-serve-pingalive-autoreload']==='true';
          }
        }
      )
    };
    
    return `
  <script>
    (function(eWrapper) {
      eWrapper.style.cssText = ${JSON.stringify(style)}
      eWrapper.innerHTML = ${JSON.stringify(aliveFragment)};
      eWrapper.dataset.reload='false';
      eWrapper.querySelector('input').checked=window.localStorage['task-serve-pingalive-autoreload']==='true';
      document.body.appendChild(eWrapper);
      
      setInterval(
        (${poll})
        .bind( 
          this, 
          ${JSON.stringify(uriComponentToMatch)},
          ${JSON.stringify(autoreloadInput)}
        ),
        ${interval}
      );
    })(document.createElement('div'));  
  </script>
    `;
  };
  
  return middleware;
}
