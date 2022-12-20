import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { Spinner } from 'spin.js';
import { TextEncoder } from './encoding.js';
import Swal from 'sweetalert2';
import jQuery from 'jquery';

(($) => {
    window.EMC = window.EMC || {};

    const client = new KintoneRestAPIClient();
    const DateTime = luxon.DateTime;

    Object.assign(window.EMC, {
        //%=== 汎用 ===%
        //?アラート（sweetAlert）
        ALERT: {
            //*処理開始
            START: async (title, html) => {
                const alertObj = {
                    icon: 'info',
                    title: title,
                    showCancelButton: true,
                    cancelButtonText: 'キャンセル',
                    confirmButtonColor: '#3498db',
                    allowOutsideClick: false,
                };
                if (html) {
                    alertObj.html = html;
                }
                const result = await Swal.fire(alertObj);
                return result;
            },
            //*処理終了
            FINISH: async (title, html) => {
                const alertObj = {
                    icon: 'success',
                    title: title,
                    confirmButtonColor: '#3498db',
                    allowOutsideClick: false,
                };
                if (html) {
                    alertObj.html = html;
                }
                await Swal.fire(alertObj);
            },
        },
        //?雇用区分・締日関連
        EMPLOYMENT_CLOSING: {
            //*雇用区分の配列から締日でまとめられた配列を生成
            MAKE_CLOSING_LIST: (employmentList) => {
                const closingList = [];
                employmentList.forEach((employment) => {
                    //締日が一致するところのindexを取得
                    const index = closingList.findIndex((closing) => {
                        return closing.closing === employment.closing;
                    });
                    //要素の有無で処理分岐
                    if (index > -1) {
                        closingList[index].employment += `,${employment.employment}`;
                    } else {
                        closingList.push({ employment: employment.employment, closing: employment.closing });
                    }
                });
                return closingList;
            },
            //*雇用区分用のクエリ生成
            MAKE_EMPLOYMENT_QUERY: (employments) => {
                const employmentAry = employments.split(',');
                let employmentQuery;
                employmentAry.forEach((employment) => {
                    if (employmentQuery) {
                        employmentQuery += ` or 雇用区分 = "${employment}"`;
                    } else {
                        employmentQuery = `雇用区分 = "${employment}"`;
                    }
                });
                return employmentQuery;
            },
            //*締日から対象範囲の実行日を絞り込むクエリ生成
            MAKE_DATE_QUERY: (year, month) => {
                year = Number(year);
                month = Number(month);
                let upperDate, lowerDate;
                upperDate = DateTime.local(year, month).endOf('month').toFormat('yyyy-LL-dd');
                lowerDate = DateTime.local(year, month).startOf('month').toFormat('yyyy-LL-dd');

                return `実行日 >= "${lowerDate}" and 実行日 <= "${upperDate}"`;
            },
        },

        //?バリデーション
        VALIDATION: {
            //*対象年月、雇用区分の入力チェック
            TARGET_CLASSIFICATION: (inputValues, errorFunc) => {
                const inputFields = ['対象年', '対象月', '雇用形態選択'];
                let errorTxt = '';

                inputValues.forEach((inputValue, index) => {
                    if (!inputValue || inputValue.length === 0 || !inputValue[0] || (index === 0 && isNaN(Number(inputValue)))) {
                        errorTxt += `${inputFields[index]},`;
                    }
                });

                if (errorTxt) {
                    errorTxt = errorTxt.slice(0, -1);
                    errorTxt = `[設定値を確認してください]<br>${errorTxt}`;
                    errorFunc(errorTxt);
                    return true;
                }
                return false;
            },
            //*社員番号と実行日の重複チェック
            DUPLICATION_CHECK: async (employeeNumber, executionDate, closing, getFunc, queryFunc) => {
                const executionDateAry = executionDate.split('-').map(Number);
                let closingDisplay = closing;
                if (closing !== '月末') {
                    if (Number(closing) < executionDateAry[2]) {
                        executionDateAry[1] = executionDateAry[1] + 1;
                    }
                    closingDisplay = `${closing}日`;
                }
                const query = `社員番号 = "${employeeNumber}" and ${queryFunc(executionDateAry[0], executionDateAry[1], closing)}`;
                const resp = await getFunc(kintone.app.getId(), query);
                if (resp.length !== 0) {
                    return { id: Number(resp[0].$id.value), year: executionDateAry[0], month: executionDateAry[1], closing: closingDisplay };
                }
                return false;
            },
        },

        //?エラーハンドリング処理
        ERROR: async (e) => {
            let errorMessage = e.message ? e.message : e;
            console.log(`エラー発生\n【エラー詳細】\n${errorMessage}`);
            await Swal.fire({
                icon: 'error',
                title: 'エラーが発生しました',
                html: `【エラー詳細】<br>${errorMessage}`,
                confirmButtonColor: '#3498db',
                allowOutsideClick: false,
            });
            return;
        },

        //?kintoneRESTAPI関連
        RESTAPI: {
            //*レコードの一括取得
            GET_RECORDS: async (appId, condition, orderBy) => {
                const body = {
                    app: appId,
                };
                if (condition) {
                    body.condition = condition;
                }
                if (orderBy) {
                    body.orderBy = orderBy;
                }
                const resp = await client.record.getAllRecords(body);
                return resp;
            },
            //*レコードの取得
            GET_RECORD: async (appId, condition, orderBy) => {
                const body = {
                    app: appId,
                };
                if (condition) {
                    body.condition = condition;
                }
                if (orderBy) {
                    body.orderBy = orderBy;
                }
                const resp = await client.record.getAllRecords(body);
                return resp;
            },
            //*ビューIDの取得
            GET_VIEWID: async (appId, viewName) => {
                const resp = await kintone.api(kintone.api.url('/k/v1/app/views', true), 'GET', { app: appId });
                let targetViewId;
                console.log(resp.views);
                for (const [key, value] of Object.entries(resp.views)) {
                    if (key === viewName) {
                        targetViewId = value.id;
                        break;
                    }
                }
                return targetViewId;
            },
        },

        //?JSONのオブジェクト変換(JSON.parseに機能追加したもの)
        JSON_PARSE: (data) => {
            let convertData = data;
            //型の確認
            if (typeof data === 'string') {
                convertData = JSON.parse(data);
            }
            return convertData;
        },

        //?スピナー
        SPIN: {
            SHOW: () => {
                if ($('.kintone-spinner').length == 0) {
                    var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
                    var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');
                    $(document.body).append(spin_div, spin_bg_div);
                    $(spin_div).css({
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        'z-index': '510',
                        'background-color': '#fff',
                        padding: '26px',
                        '-moz-border-radius': '4px',
                        '-webkit-border-radius': '4px',
                        'border-radius': '4px',
                    });
                    $(spin_bg_div).css({
                        position: 'fixed',
                        top: '0px',
                        left: '0px',
                        'z-index': '500',
                        width: '100%',
                        height: '200%',
                        'background-color': '#000',
                        opacity: '0.5',
                        filter: 'alpha(opacity=50)',
                        '-ms-filter': 'alpha(opacity=50)',
                    });
                    var opts = {
                        color: '#000',
                    };
                    new Spinner(opts).spin(document.getElementById('kintone-spin'));
                }

                $('.kintone-spinner').show();
            },
            HIDE: () => {
                $('.kintone-spinner').hide();
            },
        },

        //%=== 専用処理 ===%

        //?エレメントの生成
        MAKE_ELEM: {
            //* 一覧画面ヘッダーメニューの年月選択とボタンの生成
            HEADER: (yearId, monthId, employmentAreaId, csvBtnId) => {
                const today = DateTime.now();
                // 現在年を取得
                let thisYear = today.year;
                // 現在月を取得
                let thisMonth = today.month;
                // 月選択ドロップダウンの選択肢を生成
                let monthSelect = ``;
                for (let month = 1; month <= 12; month++) {
                    // 現在月を初期値にする
                    if (month === thisMonth) {
                        monthSelect += `<option value="${month}" selected>${month}月</option>`;
                    } else {
                        monthSelect += `<option value="${month}">${month}月</option>`;
                    }
                }
                // 年入力／月選択／締日処理ボタン／奉行CSV出力ボタン
                return `<div style="height: 140px;width: 850px;line-height: 225px;margin-left: 20px;margin-bottom: 10px;display:flex;">
              <input type="text" id="${yearId}" value="${thisYear}" style="height: 45px;width: 80px;background-color: #f7f9fa;border: 1px solid #e3e7e8;padding-left: 10px;margin-left: 25px;margin-top: 85px;margin-right: 5px;"> 年
              <select id="${monthId}" style="height: 50px;width: 80px;background-color: #f7f9fa;border: 1px solid #e3e7e8;margin-top: 85px;margin-left: 5px;">${monthSelect}</select>
              <div id="${employmentAreaId}" style="width: 250px;height: 135px;margin-left: 20px;"></div>
              <button id="${csvBtnId}" style="height: 47px;width: 160px;color: hsl(0deg 0% 100%);background-color: #3498db;border: none;margin-left: 30px;margin-top: 85px;">奉行CSV出力</button>
              </div>`;
            },
            //最終ステータスを取得する処理
            GET_LAST_STATUS: async () => {
                const resp = await kintone.api(kintone.api.url('/k/v1/app/status.json', true), 'GET', { app: kintone.app.getId() });

                const states = resp.states;

                const lastStates = {};
                for (let [state, info] of Object.entries(states)) {
                    if (!Object.keys(lastStates).length) {
                        lastStates.state = state;
                        lastStates.index = Number(info.index);
                        continue;
                    } else if (Number(info.index) > lastStates.index) {
                        lastStates.state = state;
                        lastStates.index = Number(info.index);
                    }
                }

                return lastStates.state;
            },
            EMPLOYMENT_STATUS: async (environmentMasterId, employmentListId) => {
                let multiChoiceItems = [];
                const employmentData = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: environmentMasterId, query: `マスタ区分 in ("雇用区分")order by SEQ asc`, fields: ['雇用区分', '締日選択', '給与締日'] });
                // 雇用形態ごとに締日が月末と日付指定のものが分かるようにvalueを分ける
                for (let i = 0; i < employmentData.records.length; i++) {
                    if (employmentData.records[i]['締日選択'].value === '月末') {
                        multiChoiceItems.push({
                            label: `【${employmentData.records[i]['締日選択'].value}】` + employmentData.records[i]['雇用区分'].value,
                            value: `{"employment":"${employmentData.records[i]['雇用区分'].value}","closing":"${employmentData.records[i]['締日選択'].value}"}`,
                        });
                    } else {
                        multiChoiceItems.push({
                            label: `【${employmentData.records[i]['給与締日'].value}日】` + employmentData.records[i]['雇用区分'].value,
                            value: `{"employment":"${employmentData.records[i]['雇用区分'].value}","closing":${employmentData.records[i]['給与締日'].value}}`,
                        });
                    }
                }
                // 複数選択フィールド生成（kintone UI Component）
                return new Kuc.MultiChoice({
                    items: multiChoiceItems,
                    value: [''],
                    selectedIndex: [],
                    // error: 'Error occurred!',
                    className: 'options-class',
                    id: employmentListId,
                    visible: true,
                    disabled: false,
                });
            },
        },

        //?CSVファイル出力関連
        CSV: {
            //*対象レコードのステータス確認
            CHECK_STATUS: (eachClosingRecordsList, lastStatus) => {
                let validStatusFlag = true;
                eachClosingRecordsList.forEach((records) => {
                    records.forEach((record) => {
                        if (record.ステータス.value !== lastStatus) {
                            console.log(record.ステータス.value);
                            validStatusFlag = false;
                        }
                    });
                });
                return validStatusFlag;
            },
            //*ファイル生成
            MAKE_FILE: (procedureData, OBCRecords, makeDatefunc, year, month, zip) => {
                let dataContainer;
                if (zip) {
                    dataContainer = zip.folder(`【奉行】賞与_${year}年${month}月`);
                }

                //CSVデータ作成&ZIPファイルに追加処理
                const data = makeDatefunc(procedureData, OBCRecords, year, month, dataContainer);

                if (data) {
                    return data;
                } else {
                    return false;
                }
            },
            //*データの作成
            MAKE_DATA: (procedureData, OBCRecords, year, month, dataContainer) => {
                //カラム情報
                const allColumnInfo = [];
                OBCRecords.forEach((record) => {
                    allColumnInfo.push({ header: record.奉行コード.value, fieldCode: record.EMCloudフィールドコード.value });
                });

                //エクセルでも文字化けしないようにBOMを付与しておく
                let data = '\ufeff';
                //ヘッダーの作成
                allColumnInfo.forEach((column, minorIndex, array) => {
                    data = `${data}${column.header},`;
                    //行末に改行コード付与
                    if (minorIndex + 1 === array.length) {
                        data = `${data}\n`;
                    }
                });
                //CSV内容の作成
                procedureData.forEach((record, indexPaDe, arrayPaDe) => {
                    allColumnInfo.forEach((column, indexColu, arrayColu) => {
                        if (record[column.fieldCode]) {
                            //値がnullの場合は空文字に変換
                            let value = record[column.fieldCode].value;
                            if (value === null) {
                                value = '';
                            }
                            data = `${data}${value},`;
                        } else {
                            data = `${data},`;
                        }
                        //行末に改行コード付与
                        if (indexColu + 1 === arrayColu.length) {
                            data = `${data}\n`;
                        }
                    });
                    //余計な改行コード削除
                    if (indexPaDe + 1 === arrayPaDe.length) {
                        data = data.slice(0, -2);
                    }
                });
                if (dataContainer) {
                    //ファイル名取得
                    const fileName = `賞与データ_${year}年${month}月.csv`;
                    //ZIPファイルにCSV追加
                    dataContainer.file(fileName, data);
                    return false;
                } else {
                    return data;
                }
            },
        },

        //?ZIPファイルの出力
        DOWNLOAD_ZIP: async (zip, year, month) => {
            const encoder = new TextEncoder('shift_jis', { NONSTANDARD_allowLegacyEncoding: true });
            const blob = await zip.generateAsync({ type: 'blob', encodeFileName: (fileName) => encoder.encode(fileName) });
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(blob);
            } else {
                const url = (window.URL || window.webkitURL).createObjectURL(blob);
                const download = document.createElement('a');
                download.href = url;
                download.download = `【${year}年${month}月】賞与情報${DateTime.now().toFormat('yyyyLLdd')}`;
                download.click();
                (window.URL || window.webkitURL).revokeObjectURL(url);
            }
        },

        //?CSVファイルの出力
        DOWNLOAD_CSV: async (data, year, month) => {
            const fileName = `社員情報マスタデータ_${year}年${month}月入社.csv`;
            const blob = new Blob([data], { type: 'text/csv' });
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                const url = (window.URL || window.webkitURL).createObjectURL(blob);
                const download = document.createElement('a');
                download.href = url;
                download.download = fileName;
                download.click();
                (window.URL || window.webkitURL).revokeObjectURL(url);
            }
        },

        //?ステータス関連
        STATUS: {
            //*最初のステータスの取得
            GET_FIRST: async () => {
                const resp = await kintone.api(kintone.api.url('/k/v1/app/status.json', true), 'GET', { app: kintone.app.getId() });

                const states = resp.states;

                const firstStates = {};
                for (let [state, info] of Object.entries(states)) {
                    if (!Object.keys(firstStates).length) {
                        firstStates.state = state;
                        firstStates.index = Number(info.index);
                        continue;
                    } else if (Number(info.index) < firstStates.index) {
                        firstStates.state = state;
                        firstStates.index = Number(info.index);
                    }
                }
                return firstStates.state;
            },
        },

        //?奉行項目コード連携
        CONVERT_APP_COOP: {
            //*一件の登録
            DIVISON: async (record, convertField, appId, method, convertOBCRecordId) => {
                //bodyの作成
                const body = {
                    app: appId,
                    record: {},
                };

                //連携対象フィールド分ループ
                convertField.forEach((field) => {
                    body.record[field] = { value: record[field].value };
                });

                //アプリID・レコードIDの追加
                body.record['起票元アプリID'] = { value: kintone.app.getId() };
                body.record['起票元レコードID'] = { value: kintone.app.record.getId() };

                try {
                    if (method === 'POST') {
                        const convertOBCResp = await kintone.api(kintone.api.url('/k/v1/record', true), method, body);
                        return convertOBCResp.id;
                    } else {
                        body['id'] = convertOBCRecordId;
                        await kintone.api(kintone.api.url('/k/v1/record', true), method, body);
                        return convertOBCRecordId;
                    }
                } catch (e) {
                    console.log(e.message);
                }
            },
            //*一括登録
            BULK: async (convertField, appId, bulkConvertAry, putFunc, postFunc) => {
                const putRecords = [];
                const postRecords = [];

                bulkConvertAry.forEach((dataObj) => {
                    const record = dataObj.record;
                    const method = dataObj.method;
                    const id = dataObj.id;

                    const recordInfo = {};
                    convertField.forEach((field) => {
                        recordInfo[field] = { value: record[field].value };
                    });
                    recordInfo['起票元アプリID'] = { value: kintone.app.getId() };
                    recordInfo['起票元レコードID'] = { value: record.$id.value };

                    if (method === 'PUT') {
                        putRecords.push({
                            id: id,
                            record: recordInfo,
                        });
                    } else {
                        postRecords.push(recordInfo);
                    }
                });
                try {
                    //更新
                    await putFunc(appId, putRecords);
                    //新規作成
                    await postFunc(appId, postRecords);
                } catch (e) {
                    console.log(e.message);
                }
            },
        },
    });
})(jQuery);
