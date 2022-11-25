import { handleError } from '../logger';
//2022-10-26 変更 → のち賞与アプリのコードも追加
//2022-11-25 追加 → 賞与管理・雇用手続マスタアプリのコード追加
const appCodes = [
    'EMCemployee',
    'EMCdependentExemption',
    'EMCcommuteInfo',
    'EMCbasicInfomation',
    'EMCprocedureManagement',
    'EMCsalaryManagement',
    'EMCpaymentDeduction',
    'EMCcorporationMaster',
    'EMCenvironmentMaster',
    'EMCemployHiring',
    'EMCemployManagement',
    'EMCachievement',
    'EMCtemplateFile',
    'EMCconvertOBCItem',
    'EMCemployProcedure',
    'EMCbonusManagement',
    'EMCemployProcedureMaster',
];

/**
 *
 * アプリIDを取得
 * resp…
 * app:{
 *     appCode: appId,
 *     ex)
 *     EMChResources: 999
 * }
 * @param {Number} spaceID EMクラウドスペースID
 * @return {Object} スペース内アプリID
 */
const getAppsId = (spaceID) => {
    return new Promise(function (resolve, reject) {
        // 同セッションで、同スペースのアプリID取得済みだったらセッションから返す
        const ids = sessionStorage.getItem('appIds');
        if (ids) {
            const parsed = JSON.parse(ids);
            if (parsed['space'] === spaceID) {
                return resolve(parsed['appIds']);
            } else {
                // 同セッションで別スペース情報の場合、クリア
                sessionStorage.removeItem('appIds');
            }
        }
        const body = {
            id: spaceID,
        };
        kintone.api(
            kintone.api.url('/k/v1/space', true),
            'GET',
            body,
            function (resp) {
                const respAppsID = {};
                appCodes.forEach((appCode) => {
                    for (let i = 0; i < resp.attachedApps.length; i++) {
                        const attachedApp = resp.attachedApps[i];
                        // スペースID付き || スペースID無し 考慮
                        if (`${appCode}${spaceID}` === attachedApp.code || `${appCode}` === attachedApp.code) {
                            respAppsID[appCode] = attachedApp.appId;
                        }
                    }
                });
                sessionStorage.setItem(
                    'appIds',
                    JSON.stringify({
                        space: spaceID,
                        appIds: respAppsID,
                    })
                );
                return resolve(respAppsID);
            },
            function (error) {
                handleError(error);
                reject(error);
            }
        );
    }).catch(function (error) {
        handleError(error);
        reject(error);
    });
};
export { getAppsId };
