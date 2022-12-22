import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { Spinner } from 'spin.js';
import { TextEncoder } from './encoding.js';
import Swal from 'sweetalert2';
import $ from 'jquery';
(() => {
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
            let error = e.error || e;
            let errorMessage = error.errors || error.message || error;
            console.log(`エラー発生\n【エラー詳細】\n${errorMessage}`);
            await Swal.fire({
                icon: 'error',
                title: 'エラーが発生しました',
                html: `【エラー詳細】<br>${typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)}`,
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
            //*レコードの一括作成
            POST_RECORDS: async (appId, records) => {
                const body = {
                    app: appId,
                    records: records,
                };
                const resp = await client.record.addAllRecords(body);
                return resp;
            },
            //*レコードの一括更新
            PUT_RECORDS: async (appId, records) => {
                const body = {
                    app: appId,
                    records: records,
                };
                const resp = await client.record.updateAllRecords(body);
                return resp;
            },
            //*ステータスの更新
            PUT_STATUS: async (appId, recordId, action) => {
                const body = {
                    app: appId,
                    records: [],
                };
                if (typeof recordId === 'object') {
                    recordId.forEach((id, index) => {
                        body.records.push({ id: id, action: action[index] });
                    });
                } else {
                    body.records.push({ id: recordId, action: action });
                }
                await kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', body);
            },
            //*ビューIDの取得
            GET_VIEWID: async (appId, viewName) => {
                const resp = await kintone.api(kintone.api.url('/k/v1/app/views', true), 'GET', { app: appId });
                let targetViewId;
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
            HEADER: (yearId, monthId, employmentAreaId, closingBtnId, csvBtnId) => {
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
              <button id="${closingBtnId}" style="height: 47px;width: 160px;color: hsl(0deg 0% 100%);background-color: #3498db;border: none;margin-left: 30px;margin-top: 85px;">締日処理</button>
              <button id="${csvBtnId}" style="height: 47px;width: 160px;color: hsl(0deg 0% 100%);background-color: #3498db;border: none;margin-left: 30px;margin-top: 85px;">奉行CSV出力</button>
              </div>`;
            },
            //*雇用形態選択の生成
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
            CHECK_STATUS: (eachClosingRecordsList, firstStatus) => {
                let validStatusFlag = true;
                eachClosingRecordsList.forEach((records) => {
                    records.forEach((record) => {
                        if (record.ステータス.value !== firstStatus) {
                            validStatusFlag = false;
                        }
                    });
                });
                return validStatusFlag;
            },
            //*ファイル生成
            MAKE_FILE: (eachEmploymentRecords, OBCRecords, employmentList, year, month, makeDatefunc, zip) => {
                //締日情報の取得
                const index = employmentList.findIndex((employment) => {
                    return employment.employment === eachEmploymentRecords[0].雇用区分.value;
                });
                let closing = employmentList[index].closing;
                if (!isNaN(closing)) {
                    closing += '日';
                }
                closing += '締め';
                const folder = zip.folder(`【${closing}】`);
                console.log(folder)
                //CSVデータ作成&ZIPファイルに追加処理
                makeDatefunc(eachEmploymentRecords, OBCRecords, year, month, closing, folder);
            },
            //*データの作成
            MAKE_DATA: (eachEmploymentRecords, OBCRecords, year, month, closing, folder) => {
                //カラム情報
                const fluctuationColumnInfo = [];
                const fixedColumnInfo = [];
                const allColumnInfo = [fluctuationColumnInfo, fixedColumnInfo];
                OBCRecords.forEach((record) => {
                    //変動と固定で出力ファイルを分ける
                    if (record.項目区分.value === '変動') {
                        fluctuationColumnInfo.push({ header: record.奉行コード.value, fieldCode: record.EMCloudフィールドコード.value });
                    } else if (record.項目区分.value === '共通') {
                        fluctuationColumnInfo.push({ header: record.奉行コード.value, fieldCode: record.EMCloudフィールドコード.value });
                        fixedColumnInfo.push({ header: record.奉行コード.value, fieldCode: record.EMCloudフィールドコード.value });
                    } else {
                        fixedColumnInfo.push({ header: record.奉行コード.value, fieldCode: record.EMCloudフィールドコード.value });
                    }
                });
                console.log(allColumnInfo)
                allColumnInfo.forEach((columnInfo, majorIndex) => {
                    let type;
                    if (majorIndex === 0) {
                        type = '変動';
                    } else {
                        type = '固定';
                    }

                    //エクセルでも文字化けしないようにBOMを付与しておく
                    let data = '\ufeff';
                    //ヘッダーの作成
                    columnInfo.forEach((column, minorIndex, array) => {
                        data = `${data}${column.header},`;
                        //行末に改行コード付与
                        if (minorIndex + 1 === array.length) {
                            data = `${data}\n`;
                        }
                    });
                    //CSV内容の作成
                    eachEmploymentRecords.forEach((record, indexPaDe, arrayPaDe) => {
                      console.log(record)
                        columnInfo.forEach((column, indexColu, arrayColu) => {
                            if (record[column.fieldCode]) {
                                //値がnullの場合は空文字に変換
                                let value = record[`${column.fieldCode}`].value;
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
                    //ファイル名取得
                    const fileName = `【${type}】${year}年${month}月${closing}${DateTime.now().toFormat('yyyyLLdd')}.csv`;
                    //ZIPファイルにCSV追加
                    folder.file(fileName, data);
                });
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
                download.download = `【${year}年${month}月】給与情報${DateTime.now().toFormat('yyyyLLdd')}`;
                download.click();
                (window.URL || window.webkitURL).revokeObjectURL(url);
            }
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
            MAKE_DATE_QUERY: (year, month, closing) => {
                year = Number(year);
                month = Number(month);
                let upperDate, lowerDate;
                if (closing === '月末') {
                    upperDate = DateTime.local(year, month).endOf('month').toFormat('yyyy-LL-dd');
                    lowerDate = DateTime.local(year, month).startOf('month').toFormat('yyyy-LL-dd');
                } else {
                    closing = Number(closing);
                    upperDate = DateTime.local(year, month, closing).toFormat('yyyy-LL-dd');
                    lowerDate = DateTime.local(year, month, closing).minus({ month: 1 }).plus({ day: 1 }).toFormat('yyyy-LL-dd');
                }
                return `実行日 >= "${lowerDate}" and 実行日 <= "${upperDate}"`;
            },
        },

        //?締日処理関連
        CLOSING_DATE_PROCESS: {
            //*給与管理・手続き管理からの連携項目を取得（取得元は連携情報マスタ）
            GET_CORPORATION_ITEM: async (id, getFunc) => {
                const COOPS = await getFunc(id, `連携元アプリ in ("給与管理", "手続管理")`);

                let salaryFields = [];
                let procedureFields = [];
                for (let recordIndex in COOPS) {
                    for (let appName of COOPS[recordIndex]['連携元アプリ'].value) {
                        if (appName === '給与管理') {
                            salaryFields.push(COOPS[recordIndex]['EMCloudフィールドコード'].value);
                        }
                        if (appName === '手続管理') {
                          //連携情報データ抜き取
                          if(COOPS[recordIndex]['EMCloudフィールドコード'].value.split("_")[1]==="家族"){if(COOPS[recordIndex]['EMCloudフィールドコード'].value==="t_家族")procedureFields.push(COOPS[recordIndex]['EMCloudフィールドコード'].value);}else{procedureFields.push(COOPS[recordIndex]['EMCloudフィールドコード'].value);}
                            
                        }
                    }
                }
                return {
                    salary: salaryFields,
                    procedure: procedureFields,
                };
            },
            //*給与管理／手続管理／支給控除管理からデータ取得
            GET_RECORDS: async (year, month, employments, appId, getFunc, queryFunc) => {
                let targetPeriodRecords = [];
                // 選択された雇用区分数だけループ
                for (let j = 0; j < employments.length; j++) {
                    // 雇用区分名
                    let employmentName = employments[j].employment;
                    // 給与締日
                    let employmentClosingDate = employments[j].closing;

                    // 給与管理・手続管理・支給控除管理に対して対象のレコードを絞り込むクエリを作成
                    // 同フィールドに更新情報があった場合に、更新日時が最新のものが優先して反映されるように（降順）したいが、
                    // 後の処理で配列にpushする際に順番が逆になる為、「order by 更新日時 asc」（昇順）で取得する
                    let condition = `雇用区分 = "${employmentName}" and ${queryFunc(year, month, employmentClosingDate)} and ステータス = "承認済"`;
                    // let conditionProcedure = `雇用区分_絞込用 = "${employmentName}" and ${queryFunc(year, month, employmentClosingDate)}`;
                    //2022-10-25改修 → "更新日時"から"実行日"への変更
                    let orderBy = `実行日 asc , $id asc`;
                    // 給与管理／手続管理／支給控除管理から対象実行日のレコードを取得
                    let salary = await getFunc(appId.salary, condition, orderBy); // 給与管理
                    let procedure = await getFunc(appId.procedure, condition, orderBy); // 手続管理
                    let deduction = await getFunc(appId.deduction, condition, orderBy); // 支給控除管理

                    targetPeriodRecords.push({
                        salary: salary,
                        procedure: procedure,
                        deduction: deduction,
                    });
                }
                console.log(targetPeriodRecords)
                return targetPeriodRecords;
            },
            //*社員番号でのデータ統合
            DATA_FORMATTING: (subjectRecords) => {
                let forEachEmployee = {}; // 追加・更新したいデータを社員番号ごとにまとめた連想配列
                let alreadyEmployee = []; // 既に支給控除管理に対象年月のレコードが存在する社員番号の配列
                let newEmployee = []; // 支給控除管理にはまだ社員番号が存在せず、新規レコード追加する社員番号の配列
                for (let subjectRecord of subjectRecords) {
                    // deduction（支給控除管理）
                    for (let deduction of subjectRecord.deduction) {
                        alreadyEmployee.push({ num: deduction['社員番号'].value, id: deduction['$id'].value });
                        if (forEachEmployee[deduction['社員番号'].value]) {
                            if (forEachEmployee[deduction['社員番号'].value]['deduction']) {
                                forEachEmployee[deduction['社員番号'].value]['deduction'].push(deduction);
                            } else {
                                forEachEmployee[deduction['社員番号'].value]['deduction'] = [deduction];
                            }
                        } else {
                            forEachEmployee[deduction['社員番号'].value] = { deduction: [deduction] };
                        }
                    }

                    // procedure（手続管理）
                    for (let procedure of subjectRecord.procedure) {
                        if (alreadyEmployee.findIndex(({ num }) => num === procedure['社員番号'].value) === -1) {
                            if (newEmployee.findIndex((num) => num === procedure['社員番号'].value) === -1) {
                                newEmployee.push(procedure['社員番号'].value);
                            }
                        }
                        if (forEachEmployee[procedure['社員番号'].value]) {
                            if (forEachEmployee[procedure['社員番号'].value]['procedure']) {
                                forEachEmployee[procedure['社員番号'].value]['procedure'].push(procedure);
                            } else {
                                forEachEmployee[procedure['社員番号'].value]['procedure'] = [procedure];
                            }
                        } else {
                            forEachEmployee[procedure['社員番号'].value] = { procedure: [procedure] };
                        }
                    }

                    // salary（給与管理）
                    for (let salary of subjectRecord.salary) {
                        if (alreadyEmployee.findIndex(({ num }) => num === salary['社員番号'].value) === -1) {
                            if (newEmployee.findIndex((num) => num === salary['社員番号'].value) === -1) {
                                newEmployee.push(salary['社員番号'].value);
                            }
                        }
                        if (forEachEmployee[salary['社員番号'].value]) {
                            if (forEachEmployee[salary['社員番号'].value]['salary']) {
                                forEachEmployee[salary['社員番号'].value]['salary'].push(salary);
                            } else {
                                forEachEmployee[salary['社員番号'].value]['salary'] = [salary];
                            }
                        } else {
                            forEachEmployee[salary['社員番号'].value] = { salary: [salary] };
                        }
                    }
                }

                return {
                    target: forEachEmployee,
                    new: newEmployee,
                    already: alreadyEmployee,
                };
            },
            //*POST用のレコードデータとPUT用のレコードデータの作成・結合
            JOIN_RECORD: (moldingRecords, COOP_FIELDS, unifyFunc,employeeJoining) => {
                let postEmployees = moldingRecords.new; // POST社員
                let putEmployees = moldingRecords.already; // PUT社員
                let targetRecords = moldingRecords.target; // 対象レコード情報

                let putRecords = [];
                let postRecords = [];

                console.log(targetRecords);

                const falseFieldType = ["__ID__","__REVISION__","RECORD_NUMBER","CREATED_TIME","CREATOR","UPDATED_TIME","MODIFIER","FILE"];

                //bodyの作成
                // POST
                let postUnifyResult;
                for (let postEmployee of postEmployees) {
                    postUnifyResult = unifyFunc(targetRecords[postEmployee], COOP_FIELDS);
                    console.log(postUnifyResult)
                    if(employeeJoining[postEmployee]){
                        for(let employeeField in employeeJoining[postEmployee]){
                          if(!postUnifyResult[employeeField] ||  !postUnifyResult[employeeField].value){
                              if(falseFieldType.indexOf(employeeJoining[postEmployee][employeeField].type) == -1){
                                  postUnifyResult[employeeField] = {value: employeeJoining[postEmployee][employeeField].value};
                              }
                          }
                      }
                    }
                    postRecords.push(postUnifyResult);
                }

                console.log(postUnifyResult);

                // PUT
                let putUnifyResult;
                for (let putEmployee of putEmployees) {
                    putUnifyResult = unifyFunc(targetRecords[putEmployee.num], COOP_FIELDS);
                      if(employeeJoining[putEmployee]){
                        for(let employField in employeeJoining[putEmployee]){
                          if(!putUnifyResult[employField] || !putUnifyResult[employField].value){
                              if(falseFieldType.indexOf(employeeJoining[putEmployee][employField].type) == -1){
                                  putUnifyResult[employField] = {value: employeeJoining[putEmployee][employField].value};
                              }
                          }
                      }
                    }
                    putRecords.push({
                        id: putEmployee.id,
                        record: putUnifyResult,
                    });
                }

                console.log(putUnifyResult);

                return {
                    PUT: putRecords,
                    POST: postRecords,
                };
            },
            //*API用のbodyを作成
            UNIFICATION_RECORDS: (target, COOP_FIELDS) => {
                let postPutRecord = {};
                for (let targetApp in target) {
                    for (let postTarget of target[targetApp]) {
                      
                        if (targetApp === 'deduction') {
                            for (let fieldS of COOP_FIELDS.salary) {
                                if (postPutRecord[fieldS]) {
                                    postPutRecord[fieldS] = { value: postPutRecord[fieldS].value ? postPutRecord[fieldS].value : postTarget[fieldS].value };
                                } else {
                                    postPutRecord[fieldS] = { value: postTarget[fieldS].value };
                                }
                            }

                            for (let fieldP of COOP_FIELDS.procedure) {
                                if (postPutRecord[fieldP]) {
                                    postPutRecord[fieldP] = { value: postPutRecord[fieldP].value ? postPutRecord[fieldP].value : postTarget[fieldP].value };
                                } else {
                                    postPutRecord[fieldP] = { value: postTarget[fieldP].value };
                                }
                            }
                        } else if (targetApp === 'salary') {
                            for (let fieldS of COOP_FIELDS.salary) {
                                if (postPutRecord[fieldS]) {
                                    //2022-10-25改修 → 反映条件の変更（取得データの値がtrueの場合、取得値反映、falseの場合、既存値のまま）
                                    if (postTarget[fieldS].value) postPutRecord[fieldS].value = postTarget[fieldS].value;
                                    // postPutRecord[fieldS] = { value: postPutRecord[fieldS].value ? postPutRecord[fieldS].value : postTarget[fieldS].value };
                                } else {
                                    postPutRecord[fieldS] = { value: postTarget[fieldS].value };
                                }
                            }
                        } else if (targetApp === 'procedure') {
                            for (let fieldP of COOP_FIELDS.procedure) {
                                if (postPutRecord[fieldP]) {
                                    //2022-10-25改修 → 反映条件の変更（取得データの値がtrueの場合、取得値反映、falseの場合、既存値のまま）
                                    if (postTarget[fieldP].value) postPutRecord[fieldP].value = postTarget[fieldP].value;
                                    // postPutRecord[fieldP] = { value: postPutRecord[fieldP].value ? postPutRecord[fieldP].value : postTarget[fieldP].value };
                                } else {
                                    postPutRecord[fieldP] = { value: postTarget[fieldP].value };
                                }
                            }
                        }
                    }
                }
                console.log(postPutRecord)
                return postPutRecord;
            },
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

        //?選択年月情報の保存
        SAVE_SELECTINFO: (year, month) => {
            const dataObj = {
                year: year,
                month: month,
                id: kintone.app.getId(),
            };

            sessionStorage.setItem('yearMonthSelectionInfo', JSON.stringify(dataObj));
            return;
        },
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
            BULK: async ( appId, targetobjs, putFunc, postFunc) => {
                const putRecords = [];
                const postRecords = [];
                
                targetobjs.forEach((bulkConvertAry)=>{
                  bulkConvertAry.forEach((dataObj) => {
                    const record = dataObj.record;
                    const method = dataObj.method;
                    const id = dataObj.id;

                    const recordInfo = {};
                    Object.keys(record).forEach((field) => {
                        recordInfo[field] = { value: record[field] };
                    });
                    recordInfo['起票元アプリID'] = { value: kintone.app.getId() };
                    recordInfo['起票元レコードID'] = { value: record.$id };

                    if (method === 'PUT') {
                        putRecords.push({
                            id: id,
                            record: recordInfo,
                        });
                    } else {
                        postRecords.push(recordInfo);
                    }
                });
                  
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
})();
