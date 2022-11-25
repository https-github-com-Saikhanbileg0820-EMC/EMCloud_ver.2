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
            bonusManagement: appIds.EMCbonusManagement,//?賞与管理 ←アプリコードが決定次第変更
        },
        APPNAME:{
            bonusManagement:'"賞与"',
          
        },

        //*ビュー情報
        VIEW: {
            unapproved: "残タスク",
            csv:"奉行CSV出力",
        },


        //*各DOM要素ID情報
        DOM: {
            yearId: "inputYear", //?指定年
            monthId: "selectMonth", //?指定月
            employmentListId: "options-id", //?雇用区分
            closingBtn: "closingProcessingBtn", //?締日処理ボタン
            csvBtn: "outPutCSVBtn", //?CSV出力ボタン
            employmentArea: "employmentStatus", //?雇用形態選択表示領域
        },

        //StorageKey情報
        STORAGE: {
            SESSION: {
                selectYearMonth: "yearMonthSelectionInfo",
            },
        },

        //kintone関連
        KINTONE: {
            SPACE: {
                indexBottom: kintone.app.getHeaderSpaceElement(),
            },
        },

        //*URL（環境部分まで）
        URL: `${location.protocol}//${location.hostname}/k/`,

        //*制御用フィールド

    });
})();