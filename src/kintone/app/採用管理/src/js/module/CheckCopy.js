(function() {
    "use strict";
    var events = [
        // レコード編集時の処理
        'app.record.edit.change.連絡先有無',
        'app.record.create.change.連絡先有無'
        ]
    kintone.events.on(events,function(event) {
      
    if(event.record["連絡先有無"].value.length===0){
      event.record["連絡先住所_郵便番号"].value="";
      event.record["連絡先住所_都道府県"].value="";
      event.record["連絡先住所_市区町村"].value="";
      event.record["連絡先住所_番地"].value="";
      event.record["連絡先住所_建物名"].value="";
      event.record["連絡先住所_都道府県_カナ"].value="";
      event.record["連絡先住所_市区町村_カナ"].value="";
      event.record["連絡先住所_建物名_カナ"].value="";
      event.record["連絡先住所"].value="";
      event.record["連絡先住所カナ"].value="";
    }else{
      event.record["連絡先住所_郵便番号"].value=event.record["現住所_郵便番号"].value;
      event.record["連絡先住所_都道府県"].value=event.record["現住所_都道府県"].value;
      event.record["連絡先住所_市区町村"].value=event.record["現住所_市区町村"].value;
      event.record["連絡先住所_番地"].value=event.record["現住所_番地"].value;
      event.record["連絡先住所_建物名"].value=event.record["現住所_建物名"].value;
      event.record["連絡先住所_都道府県_カナ"].value=event.record["現住所_都道府県_カナ"].value;
      event.record["連絡先住所_市区町村_カナ"].value=event.record["現住所_市区町村_カナ"].value;
      event.record["連絡先住所_建物名_カナ"].value=event.record["現住所_建物名_カナ"].value;
      event.record["連絡先住所"].value=event.record["現住所"].value;
      event.record["連絡先住所カナ"].value=event.record["現住所カナ"].value;
    }
    return event;
    });
})();

