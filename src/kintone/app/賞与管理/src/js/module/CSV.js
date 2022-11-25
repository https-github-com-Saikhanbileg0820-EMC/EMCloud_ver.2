import $ from 'jquery';
import JSZip from 'jszip';

(function () {
    ('use strict');

    const EMC = window.EMC;

    //*============================== 一覧表示時メイン処理（締日処理） ==============================
    kintone.events.on('app.record.index.show', async (e) => {
        try {
            // 一覧画面のヘッダーに給与処理ヘッダーを作成
            const headerElement = kintone.app.getHeaderSpaceElement();
            if (e.viewName !== EMC.VIEW.csv) {
                return e;
            }
            if ($(headerElement).find(`#${EMC.DOM.csvBtn}`).length === 0) {
                // ヘッダー作成（年入力／月選択／締日処理ボタン／奉行CSV出力ボタン）
                $(headerElement).append(EMC.MAKE_ELEM.HEADER(EMC.DOM.yearId, EMC.DOM.monthId, EMC.DOM.employmentArea, EMC.DOM.csvBtn));
                // 雇用形態選択作成・追加
                $(`#${EMC.DOM.employmentArea}`).append(await EMC.MAKE_ELEM.EMPLOYMENT_STATUS(EMC.APPID.environmentMaster, EMC.DOM.employmentListId));
            }

            //「奉行CSV出力」ボタン押下時
            $(`#${EMC.DOM.csvBtn}`).on('click', async () => {
                await outputCsv();
            });

            //既存の選択年月情報がある場合は反映
            if (sessionStorage.getItem(`${EMC.STORAGE.SESSION.selectYearMonth}`) !== null) {
                const info = EMC.JSON_PARSE(sessionStorage.getItem(`${EMC.STORAGE.SESSION.selectYearMonth}`));
                const year = info.year;
                const month = info.month;
                //反映処理
                $(`#${EMC.DOM.yearId}`).val(year);
                $(`#${EMC.DOM.monthId}`).val(month);
            }

            return e;
        } catch (error) {
            EMC.SPIN.HIDE();
            console.log(error);
        }
    });

    //画面の更新（ステータス更新が画面上では即座に反映されないため）
    kintone.events.on('app.record.detail.show', (event) => {
        if (sessionStorage.getItem('reload')) {
            sessionStorage.removeItem('reload');
            location.reload();
        }
        return event;
    });

    /**
     * CSV出力処理を行う関数
     */
    async function outputCsv() {
        // 給与処理ヘッダーの設定値を取得
        const year = $(`#${EMC.DOM.yearId}`).val(); // 対象年
        const month = $(`#${EMC.DOM.monthId}`).val(); // 対象月
        const employmentList = $(`#${EMC.DOM.employmentListId}`).val(); // 雇用区分

        // 未入力・未選択チェック
        if (EMC.VALIDATION.TARGET_CLASSIFICATION([year, month, employmentList], EMC.ERROR)) {
            return false;
        }

        //JSON型からオブジェクト型に変換
        employmentList.forEach((employment, index, array) => {
            array[index] = EMC.JSON_PARSE(employment);
        });

        //開始のアラート表示
        const result = await EMC.ALERT.START(`${year}年${month}月`, '上記対象月のCSVを出力します');
        if (!result.isConfirmed) {
            return;
        }
        EMC.SPIN.SHOW();

        //締日単位でまとめた配列を作成
        const closingList = EMC.EMPLOYMENT_CLOSING.MAKE_CLOSING_LIST(employmentList);
        //各締日の対象年月の支給控除管理情報取得
        const promiseAry = [];
        closingList.forEach((closing) => {
            promiseAry.push(EMC.RESTAPI.GET_RECORDS(EMC.APPID.bonusManagement, `(${EMC.EMPLOYMENT_CLOSING.MAKE_EMPLOYMENT_QUERY(closing.employment)}) and ${EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY(year, month)}`));
        });
        let OBCRecords, eachClosingRecordsList;
        const zip = new JSZip();
        try {
            eachClosingRecordsList = await Promise.all(promiseAry);
            console.log(EMC.STATUS.GET_FIRST());
            //対象レコード全件が最初のステータス（出力対象のステータス）か確認→1件でも対象外のものがあったらエラー＆処理中断
            if (!EMC.CSV.CHECK_STATUS(eachClosingRecordsList, await EMC.MAKE_ELEM.GET_LAST_STATUS())) {
                EMC.ERROR(`承認が完了していないレコードが存在します<br><a href="${EMC.URL}${kintone.app.getId()}/?view=${await EMC.RESTAPI.GET_VIEWID(kintone.app.getId(), EMC.VIEW.unapproved)}" target="_blank">対象レコードを確認する</a>`);
                EMC.SPIN.HIDE();
                return;
            }
            //奉行コードマスタアプリのレコード情報取得
            let appName = EMC.APPNAME.bonusManagement;
            console.log(appName);
            console.log(EMC.APPID.bonusManagement);
            OBCRecords = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.corporationMaster, `項目区分 in (${appName}) or 項目区分 in ("共通") and 奉行コード !="" `, `奉行コード asc`);
            console.log(OBCRecords);

            //締日数だけCSVファイルデータの作成を行う
            let processContinuousFlag;
            eachClosingRecordsList.forEach((eachClosingRecords) => {
                if (eachClosingRecords.length > 0) {
                    EMC.CSV.MAKE_FILE(eachClosingRecords, OBCRecords, EMC.CSV.MAKE_DATA, year, month, zip);
                    processContinuousFlag = true;
                }
            });
            //対象レコードがない場合は処理終了
            if (!processContinuousFlag) {
                throw new Error('対象のレコードが存在しません');
            }
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }

        //ZIPファイル出力処理
        EMC.DOWNLOAD_ZIP(zip, year, month);
        EMC.ALERT.FINISH('CSV出力完了', 'ダウンロードされていることを確認してください');
        EMC.SPIN.HIDE();
    }
})();
