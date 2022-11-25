(function() {
  'use strict';
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
    let record = event.record
    let value = event.record.申請区分.value
    switch(value){
      case "休職（産休育休）":
       !record["休職開始年月日"].value ?  record["休職開始年月日"].error="必須項目です。" :"";
       !record["休職終了予定日"].value ?  record["休職終了予定日"].error="必須項目です。" :"";
       !record["子の氏名"].value ?  record["子の氏名"].error="必須項目です。" :"";
       !record["子_生年月日"].value ?  record["子_生年月日"].error="必須項目です。" :"";
       !record["子_続柄"].value ?  record["子_続柄"].error="必須項目です。" :"";
       //!record["出産予定日"].value ?  record["出産予定日"].error="必須項目です。" :"";
       //!record["出産日"].value ?  record["出産日"].error="必須項目です。" :"";
        break;
      case "休職（育休）":
       !record["休職開始年月日"].value ?  record["休職開始年月日"].error="必須項目です。" :"";
       !record["休職終了予定日"].value ?  record["休職終了予定日"].error="必須項目です。" :"";
       !record["子の氏名"].value ?  record["子の氏名"].error="必須項目です。" :"";
       !record["子_生年月日"].value ?  record["子_生年月日"].error="必須項目です。" :"";
       !record["子_続柄"].value ?  record["子_続柄"].error="必須項目です。" :"";
       //!record["出産予定日"].value ?  record["出産予定日"].error="必須項目です。" :"";
       //!record["出産日"].value ?  record["出産日"].error="必須項目です。" :"";
        break;
      case "休職（その他）":
        !record["休職開始年月日"].value ?  record["休職開始年月日"].error="必須項目です。" :"";
        !record["休職終了予定日"].value ?  record["休職終了予定日"].error="必須項目です。" :"";
        !record["休職事由"].value ?  record["休職事由"].error="必須項目です。" :"";
        
        break;
      case "復職":
        !record["休職終了年月日"].value ?  record["休職終了年月日"].error="必須項目です。" :"";
        break;
      case "入社":
        !record["雇用区分"].value ?  record["雇用区分"].error="必須項目です。" :"";
        break;
    }
    return event
  });
})();
