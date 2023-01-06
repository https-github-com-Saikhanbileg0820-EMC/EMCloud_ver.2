import { KintoneRestAPIClient } from '@kintone/rest-api-client';
(async () => {
    "use strict";

    window.EMC = window.EMC || {};
    const client = new KintoneRestAPIClient();
        //スペース内アプリIDの取得
    const appInfo = await kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: kintone.app.getId() });
    const spaceId = appInfo.spaceId;
    const appIds = await window.EMCloud.modules.getAppsId(spaceId);

    Object.assign(window.EMC, {
        APPID:{
            employment: appIds.EMCemployee, //社員情報
            corporationMaster: appIds.EMCcorporationMaster, //連携情報マスタ
            basicInfomation:  appIds.EMCbasicInfomation, //基本情報
            commuteInfo: appIds.EMCcommuteInfo, //通勤情報
            dependentExemption: appIds.EMCdependentExemption, //家族情報
            employManagement: appIds.EMCemployManagement, //雇用情報
        },
        //最終ステータスを取得する処理
        GET_LAST_STATUS: async() => {
            const resp = await kintone.api(kintone.api.url("/k/v1/app/status.json", true), "GET", { app: kintone.app.getId() });

            const states = resp.states;

            const lastStates = {};
            for (let [state, info] of Object.entries(states)) {
                if (!Object.keys(lastStates).length) {
                    lastStates.state = state;
                    lastStates.index = Number(info.index);
                    continue;
                } else if (Number(info.index) > lastStates.index) {
                    lastStates.state = state;
                    lastStates.index = Number(info.index);
                }
            }

            return lastStates.state;
        },
        UPDATE_EMPLOYEE_BODY: async (record,COOP_FIELDS,attend) => {
            let employeePutBody = {};
            for(let coopRecord of COOP_FIELDS){
                if(!record[coopRecord['EMCloudフィールドコード'].value]){
                  employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:""};
                  continue};
                if(coopRecord['EMCloudフィールドコード'].value == '社員番号' || !record[coopRecord['EMCloudフィールドコード'].value].value){
                  if(coopRecord['EMCloudフィールドコード'].value == '社員番号'){continue}
                  employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:""};
                  continue};
                if(coopRecord['EMCloudフィールドコード'].value == '変更日'){
                    let changeDateField;
                    switch(record['申請区分'].value){
                        case '基本情報':
                            changeDateField = '基本情報変更日';
                            break;
                        case '住所情報':
                            changeDateField = '住所情報変更日';
                            break;
                        case '家族情報':
                            changeDateField = '家族情報変更日';
                            break;
                        case '通勤情報':
                            changeDateField = '通勤情報変更日';
                            break;
                        case '口座情報':
                            changeDateField = '口座情報変更日';
                            break;
                        case '入社手続':
                            changeDateField = true;
                            break;
                        default:
                            break;
                    }

                    if(changeDateField){
                        employeePutBody[changeDateField] = {value:record[coopRecord['EMCloudフィールドコード'].value].value};
                    }else{
                        continue;
                    }
                    
                }else{
                    employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:record[coopRecord['EMCloudフィールドコード'].value].value};
                }
            }
            console.log(employeePutBody);
            return {
                method: "PUT",
                api: "/k/v1/record.json",
                payload: {
                    app: attend,
                    updateKey: {
                        field: "社員番号",
                        value: record['社員番号'].value
                    },
                    record: employeePutBody
                }
            }
        },
        HISTORY_EMPLOYEE_BODY: async (record,COOP_FIELDS,attend,employRecord) => {
            let employeePutBody = {};
            for(let coopRecord of COOP_FIELDS){
              
                if(!record[coopRecord['EMCloudフィールドコード'].value]){
                    if(employRecord===undefined)continue;
                  if(employRecord[coopRecord['EMCloudフィールドコード'].value] ){
                    employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:employRecord[coopRecord['EMCloudフィールドコード'].value].value};
                };
                  continue};
                if(record[coopRecord['EMCloudフィールドコード'].value].value){
                    employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:record[coopRecord['EMCloudフィールドコード'].value].value};
                }else {
                    if(employRecord===undefined)continue;
                    if(employRecord[coopRecord['EMCloudフィールドコード'].value] ){
                  if(record[coopRecord['EMCloudフィールドコード'].value].value===""||record[coopRecord['EMCloudフィールドコード'].value].value===null) continue;
                    employeePutBody[coopRecord['EMCloudフィールドコード'].value] = {value:employRecord[coopRecord['EMCloudフィールドコード'].value].value};
                };
             }
            }
            console.log(employeePutBody);
            return {
                method: "POST",
                api: "/k/v1/record.json",
                payload: {
                    app: attend,
                    record: employeePutBody
                }
            }
        },
        APPLICATION_CATEGORIES: async (category,employment,basicInfomation,commuteInfo,dependentExemption,employManagement) => {
            let categoriesArray;
            switch(category){
                case '基本情報':
                case '口座情報':
                case '住所変更':
                    categoriesArray = [employment,basicInfomation];
                    break;
                case '家族情報':
                    categoriesArray = [employment,dependentExemption];
                    break;
                case '通勤情報':
                    categoriesArray = [employment,commuteInfo];
                    break;
                case '休職（その他）':
                case '休職（産休育休）':
                case '休職（育休）':
                case '復職':
                case '退職':
                    categoriesArray = [employment];
                    break;
                case '入社手続':
                    categoriesArray = [employment,basicInfomation,commuteInfo,dependentExemption,employManagement];
                    break;
                case '契約更改':
                    categoriesArray = [employment,basicInfomation,commuteInfo,employManagement];
                    break;
                default:
                    break;
            }
            return categoriesArray;
        },
        APPLICATIONS_CATEGORIES: async (category) => {
            let categoryFlg = false;
            switch(category){
                case '基本情報':
                case '口座情報':
                case '住所変更':
                case '家族情報':
                case '通勤情報':
                case '休職（その他）':
                case '休職（産休育休）':
                case '休職（育休）':
                case '復職':
                case '退職':
                case '入社手続':
                case '契約更改':
                    categoryFlg = true;
                    break;
                default:
                    break;
            }
            return categoryFlg;
        },
        CREATE_BULK_EMPLOYEE_BODY: async (records,employeeRecords,appId) => {

            let putParamEmployee = {};
            for(let record of records){
                putParamEmployee[record['社員番号'].value] = {};
                for(let field in record){
                    if(field !== "社員番号" && record[field].value !== ""){
                        putParamEmployee[record['社員番号'].value][field] = {value: record[field].value};
                    }
                }
            }


            console.log(putParamEmployee);
            let putEmployeeBodyArray = [];
            for(let employment in putParamEmployee){
                putEmployeeBodyArray.push({
                        updateKey:{
                        field: "社員番号",
                        value: employment
                    },
                    record: putParamEmployee[employment]
                });
            }

            return {
                method: "PUT",
                api: "/k/v1/records.json",
                payload: {
                    app: appId,
                    records: putEmployeeBodyArray
                }
            }

        },
        CREATE_BULK_EMPLOYMANAGEMENT_BODY: async (records,fields,appId) => {

            let postManagementArray = [];
            for(let record of records){
                let postManagement = {'社員番号':{value: record['社員番号'].value}};
                for(let field of fields){
                    postManagement[field['EMCloudフィールドコード'].value] = {value: record[field['EMCloudフィールドコード'].value].value}
                }
                postManagementArray.push(postManagement);
            }

            return {
                method: "POST",
                api: "/k/v1/records.json",
                payload: {
                    app: appId,
                    records: postManagementArray
                }
            }
        },
        GET_ALL_RECORDS: async (param) => {
            return await client.record.getAllRecords(param);
        },
        UPDATE_RECORDS: async (param) => {
            return await client.record.updateRecords(param);
        },
        BULKREQUEST: async (param) => {
            const resp = await client.bulkRequest(param);
            console.log(resp);
            return resp;
        }
    });
})();