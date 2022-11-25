(function() {
   "use strict";
    
    kintone.events.on('app.record.create.change.申請区分', (event) => {
      console.log("編集開始1");
      document.querySelectorAll(".control-group-field-gaia input.input-text-cybozu").forEach( e => e.disabled = false );
      return event;
    });
    
    kintone.events.on('app.record.edit.change.申請区分', (event) => {
      console.log("編集開始2");
      document.querySelectorAll(".control-group-field-gaia input.input-text-cybozu").forEach( e => e.disabled = false );
      return event;
    });
})();