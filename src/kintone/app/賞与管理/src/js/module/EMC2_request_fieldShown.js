import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import swal from 'sweetalert2';
import $ from 'jquery';
(function(){
  'use strict';

  const client = new KintoneRestAPIClient();

  const getTargetRecords = async (query) => {
    let targetBody = {
      app: kintone.app.getId(),
      condition: query
    }
    return await client.record.getAllRecords(targetBody);
  }
  
  const getLastStatus = async () => {
    const processInfo = await kintone.api(kintone.api.url('/k/v1/app/status.json', true), 'GET', {app:kintone.app.getId()});
    let finalStatus;
    for(let status in processInfo.states){
      if(!finalStatus ||finalStatus.index < processInfo.states[status].index){
        finalStatus = processInfo.states[status];
      }
    }
    for(let action of processInfo.actions){
      if(action.to === finalStatus.name){
        finalStatus['action'] = action.name;
        break;
      }
    }
    return finalStatus;
  }
  
  const updatesStatus = async (status,records,date) => {
    let updateStatus = [];
    let updateRecords = [];
    for(let record of records){
      updateStatus.push({
        id: record.$id.value,
        action: status.action
      });

      updateRecords.push({
        id:record.$id.value,
        record:{
          '実行日':{
            value:date
          }
        }
      });
    }

    let updateBody = {
      app: kintone.app.getId(),
      records:updateStatus
    }
    let updateRecordsBody = {
      app:kintone.app.getId(),
      records:updateRecords
    }

    try{
      await client.record.updateRecordsStatus(updateBody);
      await client.record.updateAllRecords(updateRecordsBody);
      return true;
    }catch(error){
      console.log(error);
      return false;
    }
  }

  kintone.events.on('app.record.index.show',(e) => {
    const headerMenuElement = kintone.app.getHeaderMenuSpaceElement();
    if(e.viewName === '奉行CSV出力' ){
        return e;
      }
    if(!$('#bulkBtn').length){
      $(headerMenuElement)[0].append($(`<button id="bulkBtn" style="height: 48px;width: 140px;background-color: #3498db;color: #fff;border: 1px solid #e3e5e8;margin-left: 20px;">一括承認</button>`)[0]);
    }

    $('#bulkBtn').on('click',() => {
      swal.fire({
        icon:'warning',
        title: `現在一覧に表示中のレコードを\n一括承認しますか？`,
        html: `一括承認実行後は元に戻せないため、<br>対象レコードの絞り込み条件をよく確認してください`,
        showCancelButton: true,
        cancelButtonText: 'キャンセル',
        confirmButtonColor: '#3498db',
        allowOutsideClick: false,
      }).then((result)=>{
        if(result.isConfirmed){
          swal.fire({
            icon:'info',
            title: `承認するレコードの実行日を選択してください`,
            html: `<input type="date" id="selectExecution" style="height:50px;width:180px;color:#3498db;border:2px solid #e3e5e8;background-color:aliceblue;text-align:center;">`,
            showCancelButton: true,
            cancelButtonText: 'キャンセル',
            confirmButtonColor: '#3498db',
            allowOutsideClick: false,
            preConfirm: () => {
              const setDate = $($('#selectExecution')[0]).val();
              if (!setDate) {
                  Swal.showValidationMessage("実行日を入力してください");
              }
            },
          }).then(async (result)=>{
            if(result.isConfirmed){
              const selectDate = $($('#selectExecution')[0]).val();
              const sortQuery = kintone.app.getQueryCondition();

              swal.fire({
                icon:'warning',
                title: `${selectDate}`,
                html: `上記の実行日で一括承認を行いますか？`,
                showCancelButton: true,
                cancelButtonText: 'キャンセル',
                confirmButtonColor: '#3498db',
                allowOutsideClick: false,
              }).then(async (result)=>{
                if(result.isConfirmed){
                  // ・最終ステータスを取得する（index番号とアクション名）
                  const lastStatus = await getLastStatus();
                  console.log(lastStatus);
                  // ・自レコード取得（Query絞り込み）
                  let queryParamter = sortQuery?`${sortQuery} and ステータス not in ("${lastStatus.name}")`:`ステータス not in ("${lastStatus.name}")`;
                  const targetsRecords = await getTargetRecords(queryParamter);
                  console.log(targetsRecords);

                  if(targetsRecords.length){
                    // ・ステータスの更新（承認済）// ・レコードの更新（実行日）
                    const update = await updatesStatus(lastStatus,targetsRecords,selectDate);
                    console.log(update);
                    if(!update){
                      swal.fire({
                        icon:'error',
                        title: `一括承認がし失敗しました。`,
                        html: `権限が足りません。`,
                        confirmButtonColor: '#3498db',
                        allowOutsideClick: false,
                      }).then(()=>{
                        location.reload();
                      })
                    }
                    if(update){
                      swal.fire({
                        icon:'success',
                        title: `一括承認が完了しました`,
                        html: `対象のレコードのステータスと<br>実行日を更新いたしました`,
                        confirmButtonColor: '#3498db',
                        allowOutsideClick: false,
                      }).then(()=>{
                        location.reload();
                      })
                    }
                  }else{
                    swal.fire({
                      icon:'error',
                      title:`対象のレコードが存在しません`,
                      html:`絞り込み条件に対応するレコードが<br>存在しないか、既に承認済になっています。<br>絞り込み条件とレコードを確認してください`,
                      confirmButtonColor: '#3498db',
                      allowOutsideClick: false,
                    })
                  }
                }
              })
            };
          })
        }
      })
    });
    return e;
  })
})();
