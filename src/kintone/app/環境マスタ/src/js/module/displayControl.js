(() => {
    "use strict";

    const CONFIG = window.EMC;
    const controlEvents = ["app.record.create.show", "app.record.edit.show", "app.record.detail.show", "app.record.create.change.マスタ区分", "app.record.edit.change.マスタ区分"];

    kintone.events.on(controlEvents, function(e) {
        try {
            for (let master of CONFIG.MASTER_CLASS) {
                kintone.app.record.setFieldShown(`g_${master}`, false);
            }

            if (e.record["マスタ区分"].value) {
                kintone.app.record.setFieldShown(`g_${e.record["マスタ区分"].value}`, true);
            }

            return e;
        } catch (error) {
            console.log(error);
        }
    });
})();