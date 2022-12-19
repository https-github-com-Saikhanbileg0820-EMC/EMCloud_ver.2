(() => {
    'use strict';
const requist= [
  "契約区分",
"入社年月日",
"入社区分",
"応募職種",
"電話番号1",
"電話番号2",
"FAX番号",
"メールアドレス2",
"緊急連絡先_電話番号",
"国内外区分",
"寡婦_ひとり親区分",
"障害者区分",
"勤労学生区分",
"災害者区分",
"外国人区分",
"居住者区分",
"課税区分",
"履歴書",
"職務経歴書",
"応募受付年月日",
"採用経路",
"辞退_取消タスク",
"辞退_取消確定",
"辞退_取消年月日",
"辞退_取消理由",
'基礎年金番号',
'資格取得年月日_健保',
'資格喪失年月日_健保',
'健保標準報酬',
'資格取得年月日_厚年',
'資格喪失年月日_厚年',
'厚年標準報酬',
'従業員区分',
'労災保険区分',
'雇用保険番号',
'資格取得年月日_雇保',
'資格喪失年月日_雇保'
    
  ]
    const events = ['app.record.edit.show'];
    kintone.events.on(events, (event) => {
        const record = event.record;
        const status = record.ステータス.value;
        const notExistsFields = [];
        //特定ステータス以外は入力制御を行わない
        if (status !== '情報入力完了' && status !== '手続完了'&& status !== '契約締結'&& status !== '承認') {
            return event;
        }

        const EMC = window.EMC;
        const disabledFields = EMC.DISABLED.joinCompany;

        
        //家族すサブテーブル非活性化
        let kazoku = record["t_家族"].value
        for (let i in kazoku){
          Object.keys(kazoku[i].value).forEach((key)=>{
            kazoku[i].value[`${key}`].disabled=true;
          });
        }
        $(".add-row-image-gaia").hide();
        $(".remove-row-image-gaia").hide();
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
    kintone.events.on(['app.record.create.change.雇用手続区分','app.record.create.show','app.record.detail.show','app.record.edit.show'], (event) => {
        const record = event.record;
        const notExistsFields = [];
        kintone.app.record.setFieldShown('レコード番号', false);
        if(record.雇用手続区分.value==="契約更改"){
          requist.forEach((field)=>{
            if (record[field]) {
              kintone.app.record.setFieldShown(field, false);
            } else {
                notExistsFields.push(field);
            }
          })
        }


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
