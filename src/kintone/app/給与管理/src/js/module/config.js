
(async () => {
    window.EMC = window.EMC || {};

    //スペース内アプリIDの取得
    const appInfo = await kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: kintone.app.getId() });
    const spaceId = appInfo.spaceId;
    const appIds = await window.EMCloud.modules.getAppsId(spaceId);

    Object.assign(window.EMC, {
        //*アプリID情報→ここアプリ名から自動取得できたらいい
        APPID: {
            corporationMaster: appIds.EMCcorporationMaster, //?連携情報マスタ
            environmentMaster: appIds.EMCenvironmentMaster, //?環境マスタ
            salaryManagement: appIds.EMCsalaryManagement, //?給与管理
            procedureManagement: appIds.EMCprocedureManagement, //?手続き管理
            paymentDeduction: appIds.EMCpaymentDeduction, //?支給控除管理
            convertOBCItem: appIds.EMCconvertOBCItem, //?奉行項目コード変換DB
            employee: appIds.EMCemployee, //?社員情報
            employManagement: appIds.EMCemployManagement, //?雇用管理
            dependentExemption: appIds.EMCdependentExemption, //?扶養控除
            commuteInfo: appIds.EMCcommuteInfo, //?通勤管理
            basicInfomation: appIds.EMCbasicInfomation, //?基本情報
        },
    });
})();
