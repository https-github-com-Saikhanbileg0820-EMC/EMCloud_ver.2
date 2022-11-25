(async () => {
    window.EMC = window.EMC || {};

    //スペース内アプリIDの取得
    const appInfo = await kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: kintone.app.getId() });
    const spaceId = appInfo.spaceId;
    const appIds = await window.EMCloud.modules.getAppsId(spaceId);

    Object.assign(window.EMC, {
        APPID: {
            //*アプリID情報→ここアプリ名から自動取得できたらいい
            employee: appIds.EMCemployee, //? 社員情報
            employProcedure: appIds.EMCemployProcedure, //? 雇用手続
            employManagement: appIds.EMCemployManagement, //? 雇用管理
            relationDataMaster: appIds.EMCcorporationMaster, //? 連携情報マスタ
        },
    });
})();
