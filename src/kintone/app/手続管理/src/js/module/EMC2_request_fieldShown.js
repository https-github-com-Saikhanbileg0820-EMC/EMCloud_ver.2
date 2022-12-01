(function(){
  'use strict';

  const REQUESTS = ['基本情報','家族情報','通勤情報','口座情報','住所変更','休職','復職','退職','休職_退職','産休_育休','入社手続'];
  const client = new KintoneRestAPIClient();
  const CONFIG = window.EMC;

  // kintone.events.on(['app.record.edit.submit','app.record.create.submit'], (e) => {
  //   if(!e)return false;
  //   let employmentCategory = e.record['雇用区分'].value;
  //   let applicationCategory = e.record['申請区分'].value;
  //   if(applicationCategory == '入社'){
  //     if(!employmentCategory){
  //       e.record['雇用区分'].error = '雇用区分を入力してください';
  //       return false;
  //     }
  //   }
  //   return e;
  // })

  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.detail.show'], (e) => {
    kintone.app.record.setFieldShown(`雇用区分`,false);
    e.record['締日処理'].disabled = true;
    return e;
  })
  kintone.events.on(['app.record.create.show','app.record.edit.show'], (e) => {
    e.record['締日処理'].disabled = true;
    return e;
  })

  kintone.events.on(['app.record.create.show','app.record.create.change.申請区分','app.record.edit.show','app.record.edit.change.申請区分','app.record.detail.show'], (e) => {
    try{
      const request = e.record['申請区分'].value;
      // 一旦、全部非表示
      for(let requestGroup of REQUESTS){
        kintone.app.record.setFieldShown(`g_${requestGroup}`,false);
      }
      // 「申請区分」が選択されていたら対象グループを表示
      if(request){
        switch(request){
          case '休職（その他）':
            kintone.app.record.setFieldShown(`g_休職`,true);
            kintone.app.record.setFieldShown(`g_休職_退職`,true);
            kintone.app.record.setFieldShown(`休職事由`,true);
            kintone.app.record.setFieldShown(`産前産後添付書類`,false);
            kintone.app.record.setFieldShown(`延長理由`,false);
            break;
          case '休職（産休育休）':
            kintone.app.record.setFieldShown(`g_休職`,true);
            kintone.app.record.setFieldShown(`g_産休_育休`,true);
            kintone.app.record.setFieldShown(`g_休職_退職`,true);
            kintone.app.record.setFieldShown(`産前産後添付書類`,true);
            kintone.app.record.setFieldShown(`休職事由`,false);
            kintone.app.record.setFieldShown(`延長理由`,false);
            break;
          case '休職（育休）':
            kintone.app.record.setFieldShown(`g_休職`,true);
            kintone.app.record.setFieldShown(`g_産休_育休`,true);
            kintone.app.record.setFieldShown(`g_休職_退職`,true);
            kintone.app.record.setFieldShown(`延長理由`,true);
            kintone.app.record.setFieldShown(`産前産後添付書類`,false);
            kintone.app.record.setFieldShown(`休職事由`,false);
            break;
          case '退職':
            kintone.app.record.setFieldShown(`g_退職`,true);
            kintone.app.record.setFieldShown(`g_休職_退職`,true);
            break;
          case '入社手続':
            kintone.app.record.setFieldShown(`g_入社手続`,true);
            // kintone.app.record.setFieldShown(`g_人事部入力`,true);
            break;
          case '契約更改':
            // kintone.app.record.setFieldShown(`g_人事部入力`,true);
            // kintone.app.record.setFieldShown(`g_`,true);
            break;
          default:
            kintone.app.record.setFieldShown(`g_${request}`,true);
            break;
        }
        
        
        // if(
        //   request == '休職（その他）'
        // ||request == '休職（産休育休）'
        // ||request == '休職（育休）'){
        //   kintone.app.record.setFieldShown(`g_休職_退職`,true);
        // }else if(
        //   request == '退職'){
        //   kintone.app.record.setFieldShown(`g_休職_退職`,true);
        // }else{
        //   kintone.app.record.setFieldShown(`g_${request}`,true);
        // }
      }
      return e;
    }catch(error){
      console.log(error);
    }
  });

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

                  // ===========================================

                  const SELF_FIELDS = await kintone.api(kintone.api.url('/k/v1/form.json',true),'GET',{app:kintone.app.getId()});
                  const ALL_EMPLOYEE = await CONFIG.GET_ALL_RECORDS({'app': CONFIG.APPID.employment});
                  console.log(ALL_EMPLOYEE);
                  let perEmployee = {};
                  for(let emoployee of ALL_EMPLOYEE){
                    if(perEmployee[emoployee['社員番号'].value]){
                      perEmployee[emoployee['社員番号'].value].push(emoployee);
                    }else{
                      perEmployee[emoployee['社員番号'].value] = [emoployee];
                    }
                  }
                  console.log(perEmployee);


                  let coopOptions;;
                  for(let selfField of SELF_FIELDS.properties){
                    if(selfField.code == '申請区分'){
                      for(let option of selfField.options){
                        coopOptions? coopOptions += `,"${option}"`: coopOptions = `"${option}"`;
                      }
                    }
                  }
                  console.log(coopOptions);
                  const COOP_FIELDS = await CONFIG.GET_ALL_RECORDS({'app': CONFIG.APPID.corporationMaster,'condition': `該当申請 in (${coopOptions})`});
                  console.log(COOP_FIELDS);

                  let applicationsFields = {};
                  for(let coop of COOP_FIELDS){
                    for(let currentApplication of coop['該当申請'].value){
                      if(applicationsFields[currentApplication]){
                        applicationsFields[currentApplication].push(coop['EMCloudフィールドコード'].value)
                      }else{
                        applicationsFields[currentApplication] = [coop['EMCloudフィールドコード'].value];
                      }
                    }
                  }
                  console.log(applicationsFields);

                  let perApplication = {};
                  for(let targetRecrod of targetsRecords){
                    if(perApplication[targetRecrod['申請区分'].value]){
                      perApplication[targetRecrod['申請区分'].value].push(targetRecrod);
                    }else{
                      perApplication[targetRecrod['申請区分'].value] = [targetRecrod]
                    }
                  }
                  console.log(perApplication);


                  

                  let employmentPutRequests = [];
                  let requests = [];
                  for(let Application in perApplication){
                    let postRecordArray = [];
                    for(let perApplicationRecord of perApplication[Application]){
                      let postRecordObj = {};
                      for(let perApplicationFields of applicationsFields[Application]){
                          postRecordObj[perApplicationFields] = {"value": perApplicationRecord[perApplicationFields].value}
                      }
                      postRecordArray.push(postRecordObj);
                    }
                    let coopId = false;
                    switch(Application){
                      case '基本情報':
                      case '口座情報':
                      case '住所変更':
                        coopId = CONFIG.APPID.basicInfomation
                        break;
                      case '家族情報':
                        coopId = CONFIG.APPID.commuteInfo
                        break;
                      case '通勤情報':
                        coopId = CONFIG.APPID.dependentExemption
                        break;
                     default:
                      break;
                    }
                    if(coopId){
                      requests.push({
                        method:"POST",
                        api: "/k/v1/records.json",
                        payload:{
                          app: coopId,
                          records: postRecordArray
                        }
                      })
                    }
                    if(await CONFIG.APPLICATIONS_CATEGORIES(Application)){
                      employmentPutRequests = employmentPutRequests.concat(postRecordArray);
                    }
                  }
                  console.log(requests);


                  const EMP_MANAGEMENT = await CONFIG.GET_ALL_RECORDS({'app': CONFIG.APPID.corporationMaster,'condition': `該当申請 in ("人事部入力")`});
                  requests = requests.concat(await CONFIG.CREATE_BULK_EMPLOYEE_BODY(employmentPutRequests,perEmployee,CONFIG.APPID.employment));
                  requests = requests.concat(await CONFIG.CREATE_BULK_EMPLOYMANAGEMENT_BODY(targetsRecords,EMP_MANAGEMENT,CONFIG.APPID.employManagement))

                  console.log(requests);

                  try{
                    let bulkResp = await CONFIG.BULKREQUEST({requests:requests});
                    console.log(bulkResp);
                  }catch(error){
                    console.log(error);
                    return false;
                  }
                  
                  // ===========================================

                  
                  

                  if(targetsRecords.length){
                    // ・ステータスの更新（承認済）// ・レコードの更新（実行日）
                    const update = await updatesStatus(lastStatus,targetsRecords,selectDate);
                    console.log(update);
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
