import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import jQuery from 'jquery';
import JSZip from 'jszip';
(function($) {
    ("use strict");

    const EMC = window.EMC;

    //* 詳細画面表示時処理（ボタン生成・ボタン押下時のCSV出力）
    kintone.events.on("app.record.detail.show", (event) => {
        if (!document.getElementById("csv_btn") && event.record.ステータス.value === "情報入力完了" /*後変数化*/ ) {
            const space = $(".gaia-argoui-app-toolbar-menu");
            const btn = document.createElement("button");
            btn.id = "csv_btn";
            btn.innerHTML = "奉行CSV出力";
            btn.onclick = () => {
                outputCsv("division");
            };

            space[0].prepend(btn);
            $("#csv_btn").css({
                // position: "relative",
                // left: "-57%",
                height: "30px",
                width: "160px",
                backgroundColor: "#351696",
                border: "none",
                color: "#ffffff",
                borderRadius: "5px",
            });
        } else if (document.getElementById("csv_btn") && event.record.ステータス.value !== "情報入力完了") {
            $("#csv_btn").remove();
        }

        return event;
    });

    //* 一覧画面表示時処理（ボタン生成・ボタン押下時のCSV出力）
    kintone.events.on("app.record.index.show", (event) => {
        //!特定ビューのみに表示（現在は一覧名を固定で設定→後変数化）
        if (event.viewName === "奉行CSV出力" && !document.getElementById(EMC.DOM.csvBtn)) {
            const headerElement = kintone.app.getHeaderSpaceElement();
            $(headerElement).append(EMC.MAKE_ELEM.HEADER(EMC.DOM.yearId, EMC.DOM.monthId, EMC.DOM.csvBtn));
            // ボタン押下時
            $(`#${EMC.DOM.csvBtn}`).on("click", async() => {
                await outputCsv("bulk");
            });
        }
        return event;
    });

    /**
     * CSV出力処理を行う関数
     * @param {String} type - 処理実行タイプ
     */
    async function outputCsv(type) {
        //開始のアラート表示
        const result = await EMC.ALERT.START("奉行用CSVの出力を行います");
        if (!result.isConfirmed) {
            return;
        }
        EMC.SPIN.SHOW();

        let record, year, month;
        if (type === "division") {
            record = kintone.app.record.get().record;
            //入社年月日の入力チェック
            if (!record["入社年月日"].value) {
                EMC.ERROR("入社年月日の入力がありません");
                EMC.SPIN.HIDE();
                return false;
            }
            const dateAry = record["入社年月日"].value.split("-");
            year = dateAry[0];
            month = dateAry[1];
        } else {
            year = $(`#${EMC.DOM.yearId}`).val();
            month = ("0" + $(`#${EMC.DOM.monthId}`).val()).slice(-2);
            const nextYear = Number(month) + 1 === 13 ? Number(year) + 1 : year;
            const nextMonth = Number(month) + 1 === 13 ? "01" : `0${Number(month) + 1}`.slice(-2);
            //対象範囲のレコードを取得
            record = await EMC.RESTAPI.GET_RECORDS(kintone.app.getId(), `${kintone.app.getQueryCondition()} and 入社年月日 >= "${year}-${month}-01" and 入社年月日 < "${nextYear}-${nextMonth}-01"`);
            //対象レコードの存在チェック
            if (!record.length) {
                EMC.ERROR("対象のレコードが存在しません");
                EMC.SPIN.HIDE();
                return false;
            }
        }

        //選択項目のみを抽出
        const employmentProcedureForm = await kintone.api(kintone.api.url("/k/v1/app/form/fields.json", true), "GET", { app: kintone.app.getId() });
        const convertOBCForm = await kintone.api(kintone.api.url("/k/v1/app/form/fields.json", true), "GET", { app: EMC.APPID.convertOBCItem });
        let convertField = [];
        for (keyEmp of Object.keys(employmentProcedureForm.properties)) {
            for (keyConv of Object.keys(convertOBCForm.properties)) {
                if (keyEmp === keyConv) {
                    convertField.push(keyEmp);
                    break;
                }
            }
        }
        //不必要項目の除去
        const removeField = ["$id", "$revision", "レコード番号", "作成日時", "作成者", "更新日時", "更新者", "作業者", "ステータス", "カテゴリー"];
        convertField = convertField.filter((field) => {
            return !removeField.includes(field);
        });
console.log(convertField)
        //! 変換アプリに奉行項目コードの連携・転記
        const convertOBCRecords = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.convertOBCItem);
        let convertOBCRecordId;
        if (type === "division") {
                let cont = 1
                for(let j in record["t_家族"].value){
                      let subtable = record["t_家族"].value[j].value
                      Object.keys(subtable).forEach((keys)=>{
                        let aru =`${keys}_${cont}`
                        record[aru]=subtable[keys]
                      })
                      cont++
                    }
            let method = "POST";
            convertOBCRecords.forEach((record) => {
                if (record.起票元アプリID.value == kintone.app.getId() && record.起票元レコードID.value == kintone.app.record.getId()) {
                    method = "PUT";
                    convertOBCRecordId = record.$id.value;
                }
            });
            //登録・更新処理
            convertOBCRecordId = await EMC.CONVERT_APP_COOP.DIVISON(record, convertField, EMC.APPID.convertOBCItem, method, convertOBCRecordId);
        } else {
            let bulkConvertAry = [];
            record.forEach((record) => {
                let cont = 1
                for(let j in record["t_家族"].value){
                      let subtable = record["t_家族"].value[j].value
                      Object.keys(subtable).forEach((keys)=>{
                        let aru =`${keys}_${cont}`
                        record[aru]=subtable[keys]
                      })
                      cont++
                    }
                let methodFixed = false;
                convertOBCRecordId = "";
                convertOBCRecords.forEach((OBCRecord) => {
                    if (!methodFixed && OBCRecord.起票元アプリID.value == kintone.app.getId() && OBCRecord.起票元レコードID.value == record.$id.value) {
                        bulkConvertAry.push({
                            record: record,
                            method: "PUT",
                            id: OBCRecord.$id.value,
                        });
                        methodFixed = true;
                    }
                });
                if (!methodFixed) {
                    bulkConvertAry.push({
                        record: record,
                        method: "POST",
                        id: "",
                    });
                }
            });
            //登録・更新処理
            await EMC.CONVERT_APP_COOP.BULK(convertField, EMC.APPID.convertOBCItem, bulkConvertAry, EMC.RESTAPI.PUT_RECORDS, EMC.RESTAPI.POST_RECORDS);
        }

        let convertOBCRecord, targetRecord;
        if (type === "division") {
            convertOBCRecord = await EMC.RESTAPI.GET_RECORD(EMC.APPID.convertOBCItem, convertOBCRecordId);
            targetRecord = Object.assign(record, convertOBCRecord.record);
        } else {
            convertOBCRecord = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.convertOBCItem);
            targetRecord = [];
            record.forEach((record) => {
                convertOBCRecord.forEach((OBCRecord) => {
                    if (OBCRecord.起票元アプリID.value == kintone.app.getId() && OBCRecord.起票元レコードID.value == record.$id.value) {
                        targetRecord.push(Object.assign(record, OBCRecord));
                    }
                });
            });
        }

        let OBCCoopRecords, data;
        try {
            //奉行コードマスタアプリのレコード情報取得
            OBCCoopRecords = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.corporationMaster, `奉行コード != "" and 項目区分 not in ("変動")`, `奉行コード asc`);

            //CSVファイルデータの作成を行う
            if (type === "division") {
                data = EMC.CSV.MAKE_FILE([targetRecord], OBCCoopRecords, EMC.CSV.MAKE_DATA, year, month);
            } else {
                data = EMC.CSV.MAKE_FILE(targetRecord, OBCCoopRecords, EMC.CSV.MAKE_DATA, year, month);
            }

            //対象レコードがない場合は処理終了
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }

        if (data) {
            //CSVファイルの出力処理
            EMC.DOWNLOAD_CSV(data, year, month);
        } else {
            //ZIPファイル出力処理
            EMC.DOWNLOAD_ZIP(zip, year, month);
        }
        EMC.ALERT.FINISH("CSV出力完了", "ダウンロードされていることを確認してください");
        EMC.SPIN.HIDE();
    }
})(jQuery);