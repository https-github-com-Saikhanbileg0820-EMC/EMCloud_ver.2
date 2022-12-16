import $ from 'jquery';
import jQuery from 'jquery';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import Swal from 'sweetalert2';
jQuery.noConflict();
(function ($) {
    'use strict';
    const EMC = window.EMC;
    const skipFieldType = ['CATEGORY','CREATED_TIME','CREATOR','MODIFIER','RECORD_NUMBER','STATUS','STATUS_ASSIGNEE','UPDATED_TIME'];
    let client = new KintoneRestAPIClient();

    // sweetAlert発動
    const doSweetAlert = (icon, title, html, cancelBtn, cancelText) => {
        return Swal.fire({
            icon: icon,
            title: title,
            html: html,
            showCancelButton: cancelBtn,
            cancelButtonText: cancelText,
            confirmButtonColor: '#3498db',
            allowOutsideClick: false,
        });
    };

    // 連携情報マスタから連携フィールドの一覧を取得
    const getRelationFields = async (appName) => {
        let relationFields = await client.record.getAllRecords({ app: EMC.APPID.corporationMaster, condition: `連携元アプリ in (${appName})` });
        let fieldsArray = [];
        for (let field of relationFields) {
            fieldsArray.push(field['EMCloudフィールドコード'].value);
        }
        return fieldsArray;
    }

    // 雇用管理へ連携する際のリクエストパラメーターを作成
    const createRelationParam = async (relationFieldsArray,appId,action) => {
        let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
        let param = {
            app: appId,
            record: {},
        };
        for (let relation of relationFieldsArray) {
            param.record[relation] = { value: selfRecords.record[relation].value ? selfRecords.record[relation].value : '' };
        }
        if(action ==="承認済"){
          param.record['申請区分']={value: selfRecords.record["雇用手続区分"].value}
        }
        console.log(param)
        return param;
    };

    // 扶養控除アプリへ連携する際のリクエストパラメーターを作成
    const createFamilyParam = async (familyInfo, selfRecords) => {
        let rowObj = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let family of familyInfo) {
          //連携情報要らない項目を別にするため
          if(selfRecords.record[family]===undefined){continue};
            rowObj[family] = { value: selfRecords.record[family].value };
        }
        rowObj["変更日"] = { value: selfRecords.record["実行日"].value };
        return { app: EMC.APPID.dependentExemption, record: rowObj };
    };

    // 通勤管理アプリへ連携する際のリクエストパラメーターを作成
    const createGotoParam = async (gotoInfo, selfRecords) => {
        let paramGoto = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let goto of gotoInfo) {
          if (selfRecords.record[goto].value === "") continue;
            paramGoto[goto] = { value: selfRecords.record[goto].value };
        }
        paramGoto["変更日"] = { value: selfRecords.record["実行日"].value };
        return { app: EMC.APPID.commuteInfo, record: paramGoto };
    };

    //2022-11-25 石井 追記
    // 基本情報アプリへ連携する際のリクエストパラメーターを作成
    const createbasicParam = async (basicInfo, selfRecords) => {
        let parambasic = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let basic of basicInfo) {
          if(selfRecords.record[basic].value==="")continue;
            parambasic[basic] = { value: selfRecords.record[basic].value };
        }
        parambasic["変更日"] = { value: selfRecords.record["実行日"].value };
        parambasic["申請区分"] = { value: selfRecords.record["雇用手続区分"].value };
        
        return { app: EMC.APPID.basicInfomation, record: parambasic };
    };

    // 社員情報アプリへ連携する際のリクエストパラメーターを作成
    const createEmployeeParam = async ( selfRecords, familyInfo, gotoInfo,basicInfo) => {
        let paramEmployee = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
        let subjectId = subjectEmployee.records[0].$id.value;
        for (let basic of basicInfo) {
          if(selfRecords.record[basic].value==="")continue;
            paramEmployee[basic] = { value: selfRecords.record[basic].value };
        }
        for (let goto of gotoInfo) {
          if(selfRecords.record[goto].value==="")continue;
            paramEmployee[goto] = { value: selfRecords.record[goto].value };
        }
        for (let family of familyInfo) {
          //連携情報要らない項目を別にするため
          if(selfRecords.record[family]===undefined){continue};
            paramEmployee[family] = { value: selfRecords.record[family].value };
        }
        paramEmployee["住所情報変更日"] = { value: selfRecords.record["実行日"].value };
        paramEmployee["基本情報変更日"] = { value: selfRecords.record["実行日"].value };
        paramEmployee["口座情報変更日"] = { value: selfRecords.record["実行日"].value };
        paramEmployee["家族情報変更日"] = { value: selfRecords.record["実行日"].value };
        paramEmployee["通勤情報変更日"] = { value: selfRecords.record["実行日"].value };

        return { app: EMC.APPID.employee, id: subjectId, record: paramEmployee };
    };
    const NewAgreement = async()=>{
        let relationFieldEmploy = await getRelationFields('"雇用手続"');//  雇用情報
        let relationFieldProdure = await getRelationFields('"雇用手続⑤"');//  手続管理
        let relationFieldSalary = await getRelationFields('"雇用手続⑥"');//  給与管理
        let selfRecord = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
        let Employfield = await client.record.getAllRecords({app:EMC.APPID.employManagement,condition:`社員番号="${selfRecord.record["社員番号"].value}"`,orderBy:"$id desc"})
        let record = {}
        Object.keys(Employfield[0]).forEach((key)=>{
          if(skipFieldType.indexOf(Employfield[0][`${key}`].type) === -1){
            record[`${key}`]={value : Employfield[0][`${key}`].value}
          }
        })
        console.log(record)
        // リクエストパラメーターを作成
        let relationParamEmploy = await createRelationParam(relationFieldEmploy,EMC.APPID.employManagement,'');
        let relationParamProdure = await createRelationParam(relationFieldProdure,EMC.APPID.procedureManagement,'承認済');
        let relationParamSalary = await createRelationParam(relationFieldSalary,EMC.APPID.salaryManagement,'承認済');
        Object.keys(relationParamEmploy.record).forEach((key)=>{
          if(!relationParamEmploy.record[`${key}`].value){
            if(record[`${key}`])
            relationParamEmploy.record[`${key}`].value=record[`${key}`].value;
          }
        })
        let idP,idS;
        try {
            let addRespemploy = await client.record.addRecord(relationParamEmploy);
            let addRespprodure = await client.record.addRecord(relationParamProdure);
            let addRespsalary = await client.record.addRecord(relationParamSalary);
            idP = addRespprodure.id;
            idS = addRespsalary.id;
            
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        try{
            // 給与管理、手続管理に承認
            let procedureManagement =await client.record.updateRecordStatus({app:EMC.APPID.procedureManagement,action:"承認",id:idP});;
            let salaryManagement = await client.record.updateRecordStatus({app:EMC.APPID.salaryManagement,action:"承認",id:idS});
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        
        let gotoArray = await getRelationFields('"雇用手続②"'); // 通勤情報連携フィールド
        let basicArray = await getRelationFields('"雇用手続③"'); //基本情報フィールド
        let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
        let gotoParam = await createGotoParam(gotoArray, selfRecords); // 通勤管理リクエストパラメーター作成
        let employeeParam = await createEmployeeParam(selfRecords, [], gotoArray,basicArray); // 社員情報リクエストパラメーター作成
        let basicParam = await createbasicParam(basicArray, selfRecords); //基本情報リクエストパラメータ作成
        const bulkParams = {
            requests: [
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: gotoParam,
                },
                {
                    method: 'PUT',
                    api: '/k/v1/record.json',
                    payload: employeeParam,
                },
                //2022-11-25 石井 追記
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: basicParam,
                },
            ],
        };
        try {
            // 社員情報へ連携（レコード作成）
            const bulkResp = await client.bulkRequest(bulkParams);
            console.log(bulkResp);
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '社員情報の連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        
        
    }
    const Retirement = async()=>{
      let RetirementRecord = await getRelationFields('"雇用手続④"');
      let relationParamRetirement = await createRelationParam(RetirementRecord,EMC.APPID.procedureManagement,'承認済');
      let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
      let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
      let subjectId = subjectEmployee.records[0].$id.value;
      let id;
      try {
            let addRespRetirement = await client.record.addRecord(relationParamRetirement);
            id = addRespRetirement.id;
            
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        console.log(id)
        try{
            // 手続管理に承認
            let Retire =await client.record.updateRecordStatus({app:EMC.APPID.procedureManagement,action:"承認",id:id});;
            let employeeRetire = await client.record.updateRecord({app:EMC.APPID.employee, id:subjectId, record:relationParamRetirement.record })
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        
        
    };
    const Reinstatement = async()=>{
      let RetirementRecord = await getRelationFields('"雇用手続⑨"');
      let relationParamRetirement = await createRelationParam(RetirementRecord,EMC.APPID.procedureManagement,'承認済');
      let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
      let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
      let subjectId = subjectEmployee.records[0].$id.value;
      let id;
      try {
            let addRespRetirement = await client.record.addRecord(relationParamRetirement);
            id = addRespRetirement.id;
            
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        console.log(id)
        try{
            // 手続管理に承認
            let Retire =await client.record.updateRecordStatus({app:EMC.APPID.procedureManagement,action:"承認",id:id});;
            let employeeRetire = await client.record.updateRecord({app:EMC.APPID.employee, id:subjectId, record:relationParamRetirement.record })
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
    };
    const Childcare = async()=>{
      let RetirementRecord = await getRelationFields('"雇用手続⑦"');
      let relationParamRetirement = await createRelationParam(RetirementRecord,EMC.APPID.procedureManagement,'承認済');
      let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
      let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
      let subjectId = subjectEmployee.records[0].$id.value;
      let id;
      try {
            let addRespRetirement = await client.record.addRecord(relationParamRetirement);
            id = addRespRetirement.id;
            
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        console.log(id)
        try{
            // 手続管理に承認
            let Retire =await client.record.updateRecordStatus({app:EMC.APPID.procedureManagement,action:"承認",id:id});;
            let employeeRetire = await client.record.updateRecord({app:EMC.APPID.employee, id:subjectId, record:relationParamRetirement.record })
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
    };
    const Absence = async()=>{
      let RetirementRecord = await getRelationFields('"雇用手続⑧"');
      let relationParamRetirement = await createRelationParam(RetirementRecord,EMC.APPID.procedureManagement,'承認済');
      let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
      let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
      let subjectId = subjectEmployee.records[0].$id.value;
      let id;
      try {
            let addRespRetirement = await client.record.addRecord(relationParamRetirement);
            id = addRespRetirement.id;
            
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
        console.log(id)
        try{
            // 手続管理に承認
            let Retire =await client.record.updateRecordStatus({app:EMC.APPID.procedureManagement,action:"承認",id:id});;
            let employeeRetire = await client.record.updateRecord({app:EMC.APPID.employee, id:subjectId, record:relationParamRetirement.record })
            
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }
    };
    kintone.events.on('app.record.detail.process.proceed', async (event) => {
        const nextStatus = event.nextStatus.value;
        event.record.ステータス_連携.value = nextStatus
        switch(nextStatus){
          case '契約締結':
            await NewAgreement();
            break;
          case '退職後の処理':
            await Retirement();//退職処理
            break;
          case '復職手続事務処理':
            await Reinstatement();//復職処理
            break;
          case '手続事務処理（育児休業）'://育児処理
            await Childcare();
            break;
          case '休職手続事務処理'://休職処理
            await Absence()
            break;
        }
        if (nextStatus !== '情報入力完了') {
            return event;
        }

        //雇用管理への連携
        // 連携情報マスタから連携フィールドを取得
        let relationFieldsArray = await getRelationFields('"雇用手続"');
        // リクエストパラメーターを作成
        let relationParam = await createRelationParam(relationFieldsArray,EMC.APPID.employManagement,'');
        try {
            // 雇用管理へ連携（レコード作成）
            let addResp = await client.record.addRecord(relationParam);
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '雇用管理への連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }

        //社員情報への連携
        // 連携情報マスタから連携フィールドを取得
        let familyInfoArray = await getRelationFields('"雇用手続①"'); // 扶養控除連携フィールド
        let gotoArray = await getRelationFields('"雇用手続②"'); // 通勤情報連携フィールド
        let basicArray = await getRelationFields('"雇用手続③"'); //基本情報フィールド
        let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });

        let familyParam = await createFamilyParam(familyInfoArray, selfRecords); // 扶養控除リクエストパラメーター作成
        let gotoParam = await createGotoParam(gotoArray, selfRecords); // 通勤管理リクエストパラメーター作成
        let employeeParam = await createEmployeeParam( selfRecords, familyInfoArray, gotoArray,basicArray); // 社員情報リクエストパラメーター作成
        //2022-11-25 石井 追記
        let basicParam = await createbasicParam(basicArray, selfRecords); //基本情報リクエストパラメータ作成
        const bulkParams = {
            requests: [
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: familyParam,
                },
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: gotoParam,
                },
                {
                    method: 'PUT',
                    api: '/k/v1/record.json',
                    payload: employeeParam,
                },
                //2022-11-25 石井 追記
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: basicParam,
                },
            ],
        };
        try {
            // 社員情報へ連携（レコード作成）
            const bulkResp = await client.bulkRequest(bulkParams);
            console.log(bulkResp);
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '社員情報の連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }

        return event;
    });
})(jQuery);
