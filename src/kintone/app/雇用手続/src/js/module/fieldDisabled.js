(() => {
    'use strict';

    const events = ['app.record.edit.show'];
    kintone.events.on(events, (event) => {
        const record = event.record;
        const status = record.ステータス.value;

        //特定ステータス以外は入力制御を行わない
        if (status !== '情報入力完了' && status !== '手続き完了') {
            return event;
        }

        const EMC = window.EMC;
        const disabledFields = EMC.DISABLED.joinCompany;

        const notExistsFields = [];
        //対象フィールドを非活性化
        disabledFields.forEach((field) => {
            //フィールドの存在チェック
            if (record[field]) {
                record[field].disabled = true;
            } else {
                notExistsFields.push(field);
            }
        });

        //存在しないフィールドがあった場合、設定を見直す旨のconsole.logを表示させる
        if (notExistsFields.length) {
            let mess = `設定されていないフィールドがあります\n[対象フィールド]\n`;
            notExistsFields.forEach((field) => {
                mess += `${field}\n`;
            });
            mess += `config.jsのDISABLED→joinCompanyのフィールド一覧を\nkintoneフィールドと照らし合わせてください`;
            console.log(mess);
        }

        return event;
    });
})();
