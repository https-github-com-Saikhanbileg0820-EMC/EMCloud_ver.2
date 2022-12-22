(function() {
  'use strict';
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
    let record = event.record
    !record["社員番号"].value ?  record["社員番号"].error="必須項目です。" :"";
    console.log(record["配偶者有無"].value)
    if(record["配偶者有無"].value==="配偶者あり"){
      !record["氏名_配偶者"].value?  record["氏名_配偶者"].error="必須項目です。":"";
      }
      if(record["t_家族"].value.length>1){
        record["t_家族"].value.forEach((value)=>{
          if(!value.value["氏名_家族"].value){
            value.value["氏名_家族"].error="必須項目です。"
          }
        })
      }
    return event;
  });
})();
