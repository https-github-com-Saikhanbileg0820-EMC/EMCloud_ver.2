(function() {
  'use strict';
  kintone.events.on('app.record.edit.show', function(event) {
    let e =event.record
    
    for (let i in e){
      e[i].disabled=true;
    }
    
  });
})();
