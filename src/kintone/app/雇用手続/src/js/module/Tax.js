(function() {
  'use strict';
  kintone.events.on(['app.record.edit.change.年税額','app.record.create.change.年税額'], function(event) {
    let record = event.record
    let result = Number(record.年税額.value)/12
    let six = result%100
    let tax= result-six
    record["_6月分"].value=Number(record.年税額.value)-tax*11
    record["_7月分"].value=tax
    record["_8月分"].value=tax
    record["_9月分"].value=tax
    record["_10月分"].value=tax
    record["_11月分"].value=tax
    record["_12月分"].value=tax
    record["_1月分"].value=tax
    record["_2月分"].value=tax
    record["_3月分"].value=tax
    record["_4月分"].value=tax
    record["_5月分"].value=tax
    
    return event;
  });
})();
