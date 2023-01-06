import { KintoneRestAPIClient } from '@kintone/rest-api-client';
(function() {
  'use strict';
  const skipFieldType = ['CATEGORY','CREATED_TIME','CREATOR','MODIFIER','RECORD_NUMBER','STATUS','STATUS_ASSIGNEE','UPDATED_TIME'];

     const events = ['app.record.create.change.実行日', 'app.record.edit.change.実行日'];
     
     
  kintone.events.on(events, function(event) {
    const APP_ID = {
        'employManagement': window.EMC.APPID.employManagement,              //雇用情報
        'salaryManagement': kintone.app.getId(),
     }
    let record = event.record.氏名.value;
     if(record===undefined){
       return event
     }
    let client = new KintoneRestAPIClient();
       // 社員情報のフィールドコードを取得
      const getter = async()=>{
        const nowFields = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {app:APP_ID.salaryManagement});
        const targetFields = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {app:APP_ID.employManagement});
        let targetNow = nowFields.properties;
        let targetPro = targetFields.properties;
        let target = [];
        for (let i in targetNow){
        for (let j in targetPro){
          if(targetNow[i].code===targetPro[j].code){
            if(skipFieldType.indexOf(`${targetNow[i].type}`) === -1){
              if(targetNow[i].code==="実行日")continue;
              target.push(targetNow[i].code)
            }
            
          }
          
        }}
        return target
      }
    //社員情報から取得　
     const putFields = async()=>{
       let arr =await getter();
       let employee= await client.record.getRecords({'app':APP_ID.employManagement,'query': `社員番号 = "${event.record.社員番号.value}" and 実行日<="${event.record.実行日.value}" order by 実行日 desc, $id desc`})
       const setRecord = kintone.app.record.get();
       for(let i of arr){
         setRecord.record[i].value = employee.records[0][i].value; 
       }
       kintone.app.record.set(setRecord);
     }
     
     putFields();
     
     
  });
})();
