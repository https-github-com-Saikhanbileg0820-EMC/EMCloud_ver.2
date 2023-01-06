import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import $ from 'jquery';
(async() => {
    "use strict";

    window.EMC = window.EMC || {};
    const client = new KintoneRestAPIClient();
        //スペース内アプリIDの取得
    const appInfo = await kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: kintone.app.getId() });
    const spaceId = appInfo.spaceId;
    const appIds = await window.EMCloud.modules.getAppsId(spaceId);

    Object.assign(window.EMC, {
        //最終ステータスを取得する処理
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
                case '入社手続':
                case '契約更改':
                case '給与改定':
                case 'その他':
                    categoriesArray = [employManagement];
                    break;
                default:
                    break;
            }
            return categoriesArray;
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