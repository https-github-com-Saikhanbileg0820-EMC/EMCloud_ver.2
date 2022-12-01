(() => {
    "use strict";

    //支給控除管理アプリの年月の選択肢削除→アプリから一度でも出ると削除
    const storageKey = "yearMonthSelectionInfo";
    if (sessionStorage.getItem(storageKey) !== null) {
        const yearMonthSelectionId = Number(JSON.parse(sessionStorage.getItem(storageKey)).id);
        if (kintone.app.getId() === null || kintone.app.getId() !== yearMonthSelectionId) {
            sessionStorage.removeItem(storageKey);
        }
    }
})();