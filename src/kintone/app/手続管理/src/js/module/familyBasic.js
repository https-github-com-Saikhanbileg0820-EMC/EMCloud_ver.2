import { KintoneRestAPIClient } from '@kintone/rest-api-client';
(function() {
  'use strict';
    const CONFIG = window.EMC;
  kintone.events.on(['app.record.edit.change.氏名_ヘッダー','app.record.create.change.氏名_ヘッダー'],async  function(event) {
    let client = new KintoneRestAPIClient();
    const putFields = async()=>{
       let employee= await client.record.getRecords({'app':CONFIG.APPID.employment,'query': `社員番号 = "${event.record.社員番号.value}"`})
       const setRecord = kintone.app.record.get();
       console.log(employee)
       setRecord.record["t_家族"].value = employee.records[0]["t_家族"].value
       setRecord.record["死亡年月日_配偶者"].value = employee.records[0]["死亡年月日_配偶者"].value
       setRecord.record["健保扶養区分_配偶者"].value = employee.records[0]["健保扶養区分_配偶者"].value
       setRecord.record["障害者区分_配偶者"].value = employee.records[0]["障害者区分_配偶者"].value
       setRecord.record["配偶者扶養有無"].value = employee.records[0]["配偶者扶養有無"].value
       setRecord.record["同居区分_配偶者"].value = employee.records[0]["同居区分_配偶者"].value
       setRecord.record["居住者区分_配偶者"].value = employee.records[0]["居住者区分_配偶者"].value
       setRecord.record["住所_配偶者"].value = employee.records[0]["住所_配偶者"].value
       setRecord.record["郵便番号_配偶者"].value = employee.records[0]["郵便番号_配偶者"].value
       setRecord.record["生年月日_配偶者"].value = employee.records[0]["生年月日_配偶者"].value
       setRecord.record["性別_配偶者"].value = employee.records[0]["性別_配偶者"].value
       setRecord.record["氏名_配偶者"].value = employee.records[0]["氏名_配偶者"].value
       setRecord.record["フリガナ_配偶者"].value = employee.records[0]["フリガナ_配偶者"].value
       setRecord.record["配偶者有無"].value = employee.records[0]["配偶者有無"].value
       kintone.app.record.set(setRecord);
     }
      putFields()
  });
  kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
    const setRecord = event.record;
    if(setRecord["申請区分"].value!=="家族情報"){
      if(setRecord["申請区分"].value==="入社手続"){return event}
       setRecord["死亡年月日_配偶者"].value = ""
       setRecord["健保扶養区分_配偶者"].value = ""
       setRecord["障害者区分_配偶者"].value = ""
       setRecord["配偶者扶養有無"].value = ""
       setRecord["同居区分_配偶者"].value = ""
       setRecord["居住者区分_配偶者"].value = ""
       setRecord["住所_配偶者"].value = ""
       setRecord["郵便番号_配偶者"].value = ""
       setRecord["生年月日_配偶者"].value = ""
       setRecord["性別_配偶者"].value = ""
       setRecord["氏名_配偶者"].value = ""
       setRecord["フリガナ_配偶者"].value = ""
       setRecord["配偶者有無"].value = ""
       setRecord.t_家族.value.forEach((row, i) => {
        let b =setRecord.t_家族.value[i].value
        for (let j of Object.keys(b)){
          setRecord.t_家族.value[i].value[j].value = "";
        }
         setRecord.t_家族.value.splice(i, 1);
      
    });
    
    }
    
    
    return event; 
  });
})();
