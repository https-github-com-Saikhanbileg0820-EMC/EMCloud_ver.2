/**
 * @fileoverview 帳票出力プラグイン
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 * CONFIG:
 *     config.conf:{
 *         pluginUse: //プラグイン有効,
 *         checkStatusHold: //詳細⇔編集画面切替時に出力チェックボックスの状態を保持する,
 *         primaryKey:[], //主キー,
 *         app_templateFile:{ //テンプレートファイル格納アプリ設定
 *             appId: 1,
 *             fieldCode:{
 *                 reportName: "",
 *                 templateFile: ""
 *             }
 *         },
 *         dispTemplateList: [], //メニューに表示するテンプレートを保持するレコードID
 *         app_reportKey:{ //帳票用キー格納アプリ設定
 *             appId: 1,
 *             fieldCode:{
 *                 outputClass: "",
 *                 appName: "",
 *                 kintoneFieldCode: "",
 *                 outsidefieldname: ""
 *             },
 *             getAppsId:{
 *                 "アプリ名1": {
 *                     appId: 1,
 *                     keyFieldCode: [],
 *                     conditions:{
 *                         symbol: "",
 *                         keyValue: ""
 *                     },
 *                 }
 *             }
 *         },
 *         exportMenu:[ //帳票出力メニュー設定
 *             {
 *                 "spaceId": "", //表示スペースID
 *                 "menuTitle": "", //メニューのタイトル
 *                 "exportBtn_dispFlg": boolean, //帳票出力ボタン表示フラグ
 *                 "saveFieldCode": "" //出力チェックボックスのチェック状態保存フィールドコード
 *             }
 *         ]
 *     }
 *
 **/
jQuery.noConflict();
(function (PLUGIN_ID, $) {
    'use strict';

    const message = {
        warn_statementErr: '\n・不正な構文が入力されています。',
        warn_index_multi: '\n・サブテーブル内フィールドの行インデックス指定文字が複数入力されていたため、値が出力されなかったセルがあります。',
        warn_index_no: '\n・サブテーブル内フィールドの行インデックス指定がないため、値が出力されなかったセルがあります。',
        warn_record_no: '\n・関連するレコードが存在しないアプリがあるため、値が出力されなかったセルがあります。',
        warn_index_no_number: '\n・サブテーブル内フィールドの行インデックス指定文字が数字ではないため、値が出力されなかったセルがあります。',
        warn_fieldCode_no: '\n・指定フィールドがアプリに存在しないため、値が出力されなかったセルがあります。',
        warn_ifStatementErr: '\n・不正な条件式が記入されているため、値が正常に出力されなかったセルがあります。',
        warn_ifStatementOperator: '\n・不正な条件式が記入されています。比較フィールドタイプと比較演算子が合致しません。',
    };

    var save_alreadyOutput = {};
    var config = {};
    var processedCells = {};

    /**
     * セッション管理（出力チェックボックスの保持に使用）
     */
    var SESSION = {
        isAble: 'sessionStorage' in window && window.sessionStorage !== null,
        key: 'exportReport_output_' + kintone.app.getId(),
        /**
         * セッションに保存
         * @param {String} value 設定値
         */
        set: function (value) {
            if (SESSION.isAble) {
                sessionStorage.setItem(SESSION.key, value); //チェックされた出力ボックスを保持
            }
        },
        /**
         * セッションを取得
         * @return {String} 設定値
         */
        get: function () {
            if (SESSION.isAble) {
                return sessionStorage.getItem(SESSION.key);
            } else {
                return;
            }
        },
        /**
         * セッション削除
         */
        remove: function () {
            if (SESSION.isAble) {
                sessionStorage.removeItem(SESSION.key);
                return;
            }
        },
    };

    //2022-10-12追記
    /**
     * スペース内アプリの一覧配列を生成する関数
     * @returns {Array} スペース内アプリの一覧配列
     */
    // function createAppAry() {
    //     /* スペース内のアプリ一覧取得 */
    //     return new Promise((resolve) => {
    //         kintone.api(kintone.api.url('/k/v1/app.json', true), 'GET', { id: kintone.app.getId() }, (appInfoResp) => {
    //             const spaceId = appInfoResp.spaceId;
    //             return kintone.api(kintone.api.url('/k/v1/space.json', true), 'GET', { id: spaceId }, (spaceInfoResp) => {
    //                 const spaceAppList = spaceInfoResp.attachedApps;
    //                 /* アプリ名の配列生成 */
    //                 const appNameAry = [];
    //                 spaceAppList.forEach((app) => {
    //                     appNameAry.push(app.name);
    //                 });
    //                 resolve(appNameAry);
    //             });
    //         });
    //     });
    // }
    async function createAppAry() {
        /* スペース内のアプリ一覧取得 */
        const appInfoResp = await kintone.api(kintone.api.url('/k/v1/app.json', true), 'GET', { id: kintone.app.getId() });
        const spaceId = appInfoResp.spaceId;
        const spaceInfoResp = await kintone.api(kintone.api.url('/k/v1/space.json', true), 'GET', { id: spaceId });
        const spaceAppList = spaceInfoResp.attachedApps;
        /* アプリ名の配列生成 */
        const appNameAry = [];
        spaceAppList.forEach((app) => {
            appNameAry.push(app.name);
        });
        return appNameAry;
    }

    /**
     * フィールドタイプごとに値を取得
     * @param {Object} field フィールド(値)
     * @param {Object} field_info フィールド情報（各種設定値）
     * @return {Object} フィールド値
     * {
     *  "value": 値
     *  "type": "DateAndTime" or "DATE" or "Array"。それ以外はプロパティ無し。
     *  "molding": boolean。値の成形（改行したり区切ったり）が必要かどうか
     * }
     */
    function getFieldValue(field, field_info) {
        var value = {};

        if (!field.value) {
            value.value = '';
            return value;
        }

        switch (field.type) {
            case 'CREATOR':
            case 'MODIFIER':
                value.value = field.value.name;
                break;

            case 'RECORD_NUMBER':
            case '__ID__':
            case '__REVISION__':
            case 'SINGLE_LINE_TEXT':
            case 'NUMBER':
            case 'MULTI_LINE_TEXT':
            case 'RICH_TEXT':
            // case 'CHECK_BOX':
            case 'RADIO_BUTTON':
            case 'DROP_DOWN':
            // case 'MULTI_SELECT':
            case 'LINK':
            case 'TIME':
            case 'CATEGORY':
            case 'STATUS':
                value.value = field.value;
                break;

            //2022-10-18 追記
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                value.value = field.value;
                value.type = 'Array';
                value.molding = true;
                break;

            case 'CREATED_TIME':
            case 'UPDATED_TIME':
            case 'DATETIME':
                value.value = new Date(field.value);
                value.type = 'DateAndTime';
                value.molding = true;
                break;

            case 'DATE':
                value.value = new Date(field.value);
                value.type = 'DATE';
                value.molding = true;
                break;

            case 'CALC':
                switch (field_info.format) {
                    case 'DATE': //日付
                        value.value = field.value;
                        value.type = 'DATE';
                        value.molding = true;
                        break;

                    case 'DATETIME': //日時
                        value.value = field.value;
                        value.type = 'DateAndTime';
                        value.molding = true;
                        break;

                    case 'DAY_HOUR_MINUTE': //時間（日、時、分）
                        let hour_d = Number(field.value.substring(0, field.value.indexOf(':')));
                        let minute_d = field.value.substring(field.value.indexOf(':') + 1);
                        let c_date = Math.floor(hour_d / 24);
                        let c_hour = hour_d % 24;
                        value.value = c_date + '日' + c_hour + '時間' + minute_d + '分';
                        break;

                    case 'HOUR_MINUTE': //時間（時、分）
                        let hour_h = field.value.substring(0, field.value.indexOf(':'));
                        let minute_h = field.value.substring(field.value.indexOf(':') + 1);
                        value.value = hour_h + '時間' + minute_h + '分';
                        break;

                    default:
                        value.value = field.value;
                        break;
                }
                break;

            case 'FILE':
            case 'USER_SELECT':
            case 'STATUS_ASSIGNEE':
            case 'ORGANIZATION_SELECT':
            case 'GROUP_SELECT':
                var arr = [];
                field.value.forEach(function (val) {
                    arr.push(val.name);
                });
                value.value = arr;
                value.type = 'Array';
                value.molding = value.value.length <= 1 ? false : true;
                break;

            /*対応の必要無
            case "GROUP":
            case "SUBTABLE":
            case "REFERENCE_TABLE":
            case "LABEL":
            case "SPACER":
            case "HR":
            */
        }
        return value;
    }

    /**
     * 元号を取得
     * @param {Date} 日付（日時）
     * @return {String} 元号
     */
    function getWareki(value) {
        var gengoFull = Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
            era: 'short',
        }).format(value);
        var gengo = gengoFull.indexOf('年') === -1 ? gengoFull.slice(0, gengoFull.indexOf(SYMBOL_CALENDAR)) : gengoFull.slice(0, gengoFull.indexOf('年'));
        return gengo;
    }

    /**
     * 値を帳票出力用に成形
     * @param {String} key 外部出力キー
     * @param {Object} valueObj 成形前値
     * @return 成形後の値
     */
    function valuesMolding(key, valueObj) {
        var delimiter = getOptionIndex(key, SYMBOL_SEPARATION); //区切り文字
        if (!delimiter) {
            //区切り文字見付けられない時はデフォルトに。
            delimiter = SYMBOL_CALENDAR;
        }

        var moldValue = '';

        switch (valueObj.type) {
            case 'Array': //配列（値が複数あるパターン）
                if (!valueObj.value) {
                    break;
                }
                if (valueObj.value.length === 1) {
                    moldValue = valueObj.value[0];
                    break;
                }
                delimiter = delimiter === '改行' ? '\n' : delimiter;
                valueObj.value.forEach(function (val, index) {
                    if (index >= valueObj.value.length - 1) {
                        moldValue += val;
                    } else {
                        moldValue += val + delimiter;
                    }
                });
                break;

            case 'DateAndTime': //日時
                if (!valueObj.value) {
                    break;
                }

                var y = moment(valueObj.value).format('YYYY');
                var m = moment(valueObj.value).format('M');
                var d = moment(valueObj.value).format('D');
                var h = moment(valueObj.value).format('H');
                var m_m = moment(valueObj.value).format('m');
                var breakYear = getOptionIndex(key, SYMBOL_CALENDAR);
                if (breakYear !== '和暦') breakYear = '西暦'; //暦指定が和暦以外はデフォルト（西暦）に。

                if (breakYear === '和暦') {
                    var gengo = getWareki(valueObj.value);

                    if (delimiter === '漢字') {
                        moldValue = gengo + '年' + m + '月' + d + '日' + h + '時' + m_m + '分';
                    } else {
                        moldValue = gengo + delimiter + m + delimiter + d + delimiter + h + ':' + m_m;
                    }
                } else {
                    if (delimiter === '漢字') {
                        moldValue = y + '年' + m + '月' + d + '日' + h + '時' + m_m + '分';
                    } else {
                        moldValue = y + delimiter + m + delimiter + d + delimiter + h + ':' + m_m;
                    }
                }
                break;

            case 'DATE': //日付
                if (!valueObj.value) {
                    break;
                }

                var y = moment(valueObj.value).format('YYYY');
                var m = moment(valueObj.value).format('M');
                var d = moment(valueObj.value).format('D');
                var breakYear = getOptionIndex(key, SYMBOL_CALENDAR);
                if (breakYear !== '和暦') breakYear = '西暦'; //暦指定が和暦以外はデフォルト（西暦）に。

                if (breakYear === '和暦') {
                    var gengo = getWareki(valueObj.value);

                    if (delimiter === '漢字') {
                        moldValue = gengo + '年' + m + '月' + d + '日';
                    } else {
                        moldValue = gengo + delimiter + m + delimiter + d;
                    }
                } else {
                    if (delimiter === '漢字') {
                        moldValue = y + '年' + m + '月' + d + '日';
                    } else {
                        moldValue = y + delimiter + m + delimiter + d;
                    }
                }
                break;
        }

        return moldValue;
    }

    /**
     * セルに元々入っていた値と合わせる
     * @param {XlsxPopulate.workbook.cell} cell ワークブックのセル
     * @param {String} moldValue 値
     * @return {String} セルに入っていたキー以外の値と連結させた転記値
     */
    function mergeValue(cell, moldValue) {
        var del_firstIndex = cell._value.indexOf('"'); //先頭囲み記号
        var del_lastIndex = cell._value.indexOf('"', del_firstIndex + 1); //末尾囲み記号

        var before_value = cell._value.substring(0, del_firstIndex); //キー前値
        var after_value = cell._value.substring(del_lastIndex + 1); //キー後値

        moldValue = before_value + moldValue + after_value;
        return moldValue;
    }

    /**
     * 値をワークブックへ転記
     * @param {Object} exportValue ワークブックに転記する値
     * @param {String} exportKey 外部開放用フィールド名
     * @param {XlsxPopulate.workbook.cell} cell サブテーブル内フィールドとつながるワークブックセル
     */
    function valuesPosting(exportValue, cell) {
        //セルに元々入っていた値と合わせる
        const richText = new XlsxPopulate.RichText();
        richText.add(mergeValue(cell, exportValue));
        //処理前セルの状態を保持
        saveOriginCell(cell);
        //転記
        cell.value(richText);
    }

    /**
     * セルの値からキーのみを取得
     * @param {Object} cell セル
     * @returns 文字列
     */
    function getKeyFromCell(cell) {
        // let before_firstIndex = cell._value.match('{') ? cell._value.split('{') : cell._value;
        // // var circle_firstIndex = before_firstIndex[1].indexOf(SYMBOL_ENCIRCLE); //先頭囲み記号
        // var circle_lastIndex = before_firstIndex[1].indexOf(SYMBOL_ENCIRCLE, circle_firstIndex + 1); //末尾囲み記号
        var circle_firstIndex = cell._value.indexOf(SYMBOL_ENCIRCLE); //先頭囲み記号
        var circle_lastIndex = cell._value.indexOf(SYMBOL_ENCIRCLE, circle_firstIndex + 1); //末尾囲み記号
        //囲み記号（""）に囲まれていない場合、キー入力無しと判断
        if (circle_firstIndex === -1 || circle_lastIndex === -1) {
            return '';
        }
        var allCellKey = cell._value.substring(circle_firstIndex + 1, circle_lastIndex); //セル内のキー（オプション含む）
        return allCellKey;
    }

    /**
     * セル内のキーをチェック
     * @param {XlsxPopulate.workbook.cell} cell Excelのセル情報
     * @param {Array} arrProcessedCell 処理済セル
     * @return {Boolean} true=異常なし　false=異常あり
     */
    function checkCellKey(cell, arrProcessedCell) {
        //処理済セル
        var cellNumber = cell.columnName() + cell._row.rowNumber();
        if (arrProcessedCell[cell.sheet().name()] && arrProcessedCell[cell.sheet().name()].indexOf(cellNumber) !== -1) return false;

        var allCellKey = getKeyFromCell(cell); //セル内のキー（オプション含む）
        if (!allCellKey) return false;

        var cellKey = allCellKey; //セル内のキー（オプション除く）
        arr_reportSymbol.forEach(function (symbol) {
            let index = cellKey.indexOf(symbol);
            if (index !== -1) {
                cellKey = allCellKey.substring(0, index);
            }
        });

        return true;
    }

    /**
     * オプションの値を取得（値区切り文字、サブテーブルの行番号等）
     * @param {XlsxPopulate.workbook.cell} cell Excelのセル情報
     * @param {String} target_symbol 取得したいオプションの記号
     * @return {String} オプション値
     */
    function getOptionIndex(key, target_symbol) {
        var index = key.indexOf(target_symbol); //取得オプション先頭インデックス

        //対象オプション指定が無い場合、空文字列を返却
        if (index === -1) return '';

        var option_next = 0;
        arr_reportSymbol.forEach(function (symbol, i) {
            if (symbol === target_symbol) return;

            let symbol_index = key.indexOf(symbol, index + 1);
            if (i === 0 && symbol_index !== -1) {
                option_next = symbol_index;
                return;
            } else if (symbol_index !== -1 && (option_next === 0 || option_next > symbol_index)) {
                option_next = symbol_index;
            }
        });

        // 次のオプション指定が無い場合、キーの最後までをオプション値として取得
        var option = '';
        if (option_next === 0) {
            option = key.substring(index + 1);
        } else {
            option = key.substring(index + 1, option_next);
        }
        return option;
    }

    /**
     * 外部出力キーより、アプリ名とフィールドコードを抽出
     * @param {String} key セルに記載されていた外部出力キー（オプション付）
     * @returns "appName": appName, "fieldCode": fieldCode
     */
    function extractAppInfoInTheKey(key) {
        var appName = key.substring(0, key.indexOf(':')); //フィールドのアプリ名
        var fieldCode = key.substring(key.indexOf(':') + 1); //フィールドコード
        //フィールドコードからオプション文字列を除外
        arr_reportSymbol.forEach(function (symbol) {
            let index = fieldCode.indexOf(symbol);
            if (index !== -1) {
                fieldCode = fieldCode.substring(0, index);
            }
        });
        return { appName: appName, fieldCode: fieldCode };
    }

    /**
     * 条件構文不正情報セット
     * @param {Object} returnObj
     * @param {Object} cell
     * @param {Object} type
     * @return 不正内容
     */
    function statementErr(returnObj, cell, type) {
        returnObj.result = false;
        returnObj.type = type;
        returnObj.detail = cell.columnName() + cell._row.rowNumber();
        return returnObj;
    }

    /**
     * 条件文チェック
     * @param {Object} cell セル
     * @param {String} exportRecords 外部出力キー
     * @param {Object} subTableCode サブテーブルコード
     * @return チェック結果
     */
    function checkIfStatement(cell, exportRecords, exportFormFields, subTableCode) {
        /**
         * 比較するフィールドタイプと演算子が合っているか確認
         * @param {Array} arrOkFieldType
         * @param {Object} returnObj
         * @param {Object} cell
         * @param {Object} ifTargetField
         * @return 確認結果
         */
        function checkOperator(arrOkFieldType, returnObj, cell, ifTargetField) {
            if (arrOkFieldType.indexOf(ifTargetField.type) === -1) {
                returnObj.result = false;
                returnObj.type = 'warn_ifStatementOperator';
                returnObj.detail = cell.columnName() + cell._row.rowNumber();
            }
            return returnObj;
        }

        /**
         * 条件式を満たしているか確認
         * @param {Object} ifTargetField
         * @return true/false
         */
        function ifCheck(ifTargetField) {
            var checkResult;
            var arrOkFieldType = [];
            //条件チェック
            switch (isOperator) {
                case '=':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'SINGLE_LINE_TEXT', 'LINK', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME', 'STATUS'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value === isResult;
                    break;

                case '!=':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'SINGLE_LINE_TEXT', 'LINK', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME', 'STATUS'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value !== isResult;
                    break;

                case '>':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value > isResult;
                    break;

                case '<':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value < isResult;
                    break;

                case '>=':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value >= isResult;
                    break;

                case '<=':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'UPDATED_TIME', 'NUMBER', 'CALC', 'DATE', 'TIME', 'DATETIME'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    checkResult = ifTargetField.value <= isResult;
                    break;

                case 'in':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATOR', 'MODIFIER', 'LINK', 'MULTI_LINE_TEXT', 'RICH_TEXT', 'CHECK_BOX', 'RADIO_BUTTON', 'DROP_DOWN', 'MULTI_SELECT', 'USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT', 'STATUS'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    //複数検索キー取得
                    var arrKey = isResult.split(SYMBOL_INMULTIPLE);
                    var checkResult;
                    if (!ifTargetField.value.length) {
                        checkResult = false;
                    } else {
                        checkResult = ifTargetField.value.some(function (val) {
                            if (arrKey.indexOf(val) !== -1) return true;
                        });
                    }
                    break;

                case 'not in':
                    arrOkFieldType = ['RECORD_NUMBER', '__ID__', 'CREATOR', 'MODIFIER', 'LINK', 'MULTI_LINE_TEXT', 'RICH_TEXT', 'CHECK_BOX', 'RADIO_BUTTON', 'DROP_DOWN', 'MULTI_SELECT', 'USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT', 'STATUS'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    //複数検索キー取得
                    var arrKey = isResult.split(SYMBOL_INMULTIPLE);
                    var checkResult;
                    if (!ifTargetField.value.length) {
                        checkResult = false;
                    } else {
                        checkResult = ifTargetField.value.some(function (val) {
                            if (arrKey.indexOf(val) !== -1) return true;
                        });
                        checkResult = !checkResult;
                    }
                    break;

                case 'like':
                    arrOkFieldType = ['SINGLE_LINE_TEXT', 'LINK', 'MULTI_LINE_TEXT', 'RICH_TEXT', 'FILE'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    if (!ifTargetField.value) {
                        checkResult = false;
                    } else {
                        checkResult = ifTargetField.value.indexOf(isResult) !== -1;
                    }
                    break;

                case 'not like':
                    arrOkFieldType = ['SINGLE_LINE_TEXT', 'LINK', 'MULTI_LINE_TEXT', 'RICH_TEXT', 'FILE'];
                    var checkOperatorResult = checkOperator(arrOkFieldType, returnObj, cell, ifTargetField);
                    if (!checkOperatorResult.result) return checkOperatorResult;

                    if (!ifTargetField.value) {
                        checkResult = false;
                    } else {
                        checkResult = ifTargetField.value.indexOf(isResult) === -1;
                    }
                    break;

                /*case "or":
                    break;

                case "and":
                    break;*/

                default:
                    return false;
            }

            return checkResult;
        }

        var exportValue = '';
        var returnObj = { result: true, detail: '' };
        var circle_firstIndex = cell._value.indexOf(SYMBOL_IF_START); //先頭囲み記号
        var circle_lastIndex = cell._value.indexOf(SYMBOL_IF_END, circle_firstIndex + 1); //末尾囲み記号

        if (circle_firstIndex === -1 || circle_lastIndex === -1) {
            //条件文記載無しの場合
            returnObj['result'] = false;
            return returnObj;
        }

        var ifStatement = cell._value.substring(circle_firstIndex + 1, circle_lastIndex); //条件文

        var indexIsField = circle_firstIndex; //フィールド開始
        var indexIsOperator = ifStatement.indexOf(SYMBOL_IF_SEPARATION, indexIsField + 1); //演算子開始
        var indexIsResult = ifStatement.indexOf(SYMBOL_IF_SEPARATION, indexIsOperator + 1); //比較結果開始
        var indexIsTrue = ifStatement.indexOf(SYMBOL_IF_SEPARATION, indexIsResult + 1); //trueの場合開始
        var indexIsFalse = ifStatement.indexOf(SYMBOL_IF_SEPARATION, indexIsTrue + 1); //falseの場合開始

        if (!indexIsField || !indexIsOperator || !indexIsResult || !indexIsTrue || !indexIsFalse) {
            //条件文構成異常の場合
            return statementErr(returnObj, cell, 'warn_ifStatementErr');
        }

        var isField = ifStatement.substring(0, indexIsOperator); //フィールド
        var isOperator = ifStatement.substring(indexIsOperator + 1, indexIsResult); //演算子
        var isResult = ifStatement.substring(indexIsResult + 1, indexIsTrue) === '' ? null : ifStatement.substring(indexIsResult + 1, indexIsTrue); //比較結果
        var isTrue = ifStatement.substring(indexIsTrue + 1, indexIsFalse); //true時出力する値
        var isFalse = ifStatement.substring(indexIsFalse + 1, circle_lastIndex); //false時出力する値

        if (!isField || !isOperator || (!isTrue && !isFalse)) {
            //条件文構成異常の場合
            return statementErr(returnObj, cell, 'warn_ifStatementErr');
        }

        var objIfAppInfo = extractAppInfoInTheKey(isField); //比較対象1アプリ名・フィールドコード

        if (!objIfAppInfo.appName || !objIfAppInfo.fieldCode || !exportRecords[objIfAppInfo.appName]) {
            //条件文構成異常の場合
            return statementErr(returnObj, cell, 'warn_statementErr');
        }
        if (subTableCode) {
            //サブテーブル内フィールドの場合
            //自分が何番目か
            //（同じ出力条件が縦セルに連続で記載されている場合、条件にヒットした行の値を順繰りに出力する）
            var index = 0;
            while (true) {
                var cellIndex = cell.columnName() + (cell._row.rowNumber() - (index + 1));
                var beforeCell = cell.sheet().cell(cellIndex);

                if (!beforeCell._value) {
                    //一つ上のセルに記入無し
                    break;
                } else if (processedCells[cell.sheet().name()] && processedCells[cell.sheet().name()][cellIndex]) {
                    //転記済みセルだった場合、保持してある転記前セルの方を参照
                    beforeCell = processedCells[cell.sheet().name()][cellIndex];
                } else {
                    beforeCell = beforeCell._value;
                }

                var beforeCircle_firstIndex = beforeCell.indexOf(SYMBOL_IF_START); //先頭囲み記号
                var beforeCircle_lastIndex = beforeCell.indexOf(SYMBOL_IF_END, beforeCircle_firstIndex + 1); //末尾囲み記号

                if (beforeCircle_firstIndex === -1 || beforeCircle_lastIndex === -1) break;

                var beforeIfStatement = beforeCell.substring(beforeCircle_firstIndex + 1, beforeCircle_lastIndex); //条件文
                var beforeIndexIsField = beforeCircle_firstIndex; //フィールド開始
                var beforeIndexIsOperator = beforeIfStatement.indexOf(SYMBOL_IF_SEPARATION, beforeIndexIsField + 1); //演算子開始
                var beforeIndexIsResult = beforeIfStatement.indexOf(SYMBOL_IF_SEPARATION, beforeIndexIsOperator + 1); //比較結果開始
                var beforeIndexIsTrue = beforeIfStatement.indexOf(SYMBOL_IF_SEPARATION, indexIsResult + 1); //trueの場合開始

                if (!beforeIndexIsField || !beforeIndexIsOperator || !beforeIndexIsResult || !beforeIndexIsTrue) break;

                var beforeIsField = beforeIfStatement.substring(0, beforeIndexIsOperator); //フィールド
                var beforeIsOperator = beforeIfStatement.substring(beforeIndexIsOperator + 1, beforeIndexIsResult); //演算子
                var beforeIsResult = beforeIfStatement.substring(beforeIndexIsResult + 1, beforeIndexIsTrue) === '' ? null : beforeIfStatement.substring(beforeIndexIsResult + 1, beforeIndexIsTrue); //比較結果

                if (isField === beforeIsField && isOperator === beforeIsOperator && isResult === beforeIsResult) {
                    index++;
                } else {
                    break;
                }
            }

            //条件にヒットするサブテーブル行を抽出
            var arrResultRow = exportRecords[objIfAppInfo.appName][subTableCode]['value'].filter(function (row) {
                return ifCheck(row['value'][objIfAppInfo.fieldCode]);
            });
            //ヒット行のうち何行目を出力するか
            if (arrResultRow[index]) {
                var arrKey = isTrue.split(SYMBOL_JOIN);
                exportValue = getValue(arrKey, returnObj, exportRecords, exportFormFields, cell, arrResultRow[index], subTableCode); //出力する値を取得
            } else {
                valuesPosting('', cell);
                //処理結果返却
                returnObj.result = true;
                return returnObj;
            }
        } else {
            //単体フィールド
            if (!exportRecords[objIfAppInfo.appName][objIfAppInfo.fieldCode]) {
                //条件文構成異常の場合
                return statementErr(returnObj, cell, 'warn_ifStatementErr');
            }
            var checkResult = ifCheck(exportRecords[objIfAppInfo.appName][objIfAppInfo.fieldCode]);

            if (checkResult) {
                //true値出力
                var arrKey = isTrue.split(SYMBOL_JOIN);
            } else {
                var arrKey = isFalse.split(SYMBOL_JOIN);
            }

            exportValue = getValue(arrKey, returnObj, exportRecords, exportFormFields, cell); //出力する値を取得
        }

        if (exportValue.detail) return exportValue; //構文異常

        //転記
        valuesPosting(exportValue, cell);
        //処理結果返却
        returnObj.result = true;
        return returnObj;
    }

    /**
     * 出力する値を取得
     * @param {Object} arrKey オプション付キー群（外部出力キーもしくは固定値）
     * @param {Object} returnObj 処理結果
     * @param {Object} exportRecords 出力用レコード群
     * @param {Object} exportFormFields 出力フォーム情報
     * @param {Object} cell セル
     * @param {Object} subtableRow 出力するサブテーブル行 ※サブテーブル内項目出力の場合
     * @param {String} subTableCode 出力するサブテーブルコード　※サブテーブル内項目出力の場合
     * @return 出力値
     */
    function getValue(arrKey, returnObj, exportRecords, exportFormFields, cell, subtableRow, subTableCode) {
        var exportValue = '';
        if (!returnObj) returnObj = { result: true, detail: '' };

        arrKey.forEach(function (key) {
            //出力する値を取得
            var firstString = key.substring(0, 1);
            switch (firstString) {
                case SYMBOL_FIXED: //固定文字列
                    exportValue += key.substring(1);
                    break;

                default:
                    if (key.indexOf(SYMBOL_DATE) !== -1) {
                        //今日の日付を出力
                        var dt = new Date();
                        var y = dt.getFullYear();
                        var m = dt.getMonth() + 1;
                        var d = dt.getDate();

                        //年月日区切り文字の取得（指定無い場合はデフォルト）
                        var strBreak = getOptionIndex(key, SYMBOL_SEPARATION);
                        if (!strBreak) strBreak = SYMBOL_CALENDAR;

                        //西暦もしくは和暦表示指定の取得（指定無い場合は西暦）
                        var strCalendar = getOptionIndex(key, SYMBOL_CALENDAR);
                        switch (strCalendar) {
                            case '和暦':
                                var gengo = getWareki(new Date());
                                if (strBreak === '漢字') {
                                    exportValue += gengo + '年' + m + '月' + d + '日';
                                } else {
                                    exportValue += gengo + strBreak + m + strBreak + d;
                                }
                                break;

                            default: //和暦指定以外は全て西暦
                                if (strBreak === '漢字') {
                                    exportValue += y + '年' + m + '月' + d + '日';
                                } else {
                                    exportValue += y + strBreak + m + strBreak + d;
                                }
                                break;
                        }
                    } else if (key.indexOf(SYMBOL_LIST) !== -1) {
                        //帳票リストを出力
                        var valueObj = {
                            value: [],
                            type: 'Array',
                        };
                        var arr_exportList = $(kintone.app.record.getSpaceElement(config.exportMenu[0].spaceId)).find('.menu_outPut_tbody > tr');
                        Array.prototype.forEach.call(arr_exportList, function (list) {
                            valueObj.value.push($(list).find("td[class='td_reportName']").text());
                        });
                        valueObj.molding = valueObj.value.length <= 1 ? false : true;
                        exportValue += valuesMolding(key, valueObj); //値を出力用に成形
                    } else {
                        //フィールドの値を出力
                        var objExportAppInfo = extractAppInfoInTheKey(key);
                        if (!objExportAppInfo.appName || !objExportAppInfo.fieldCode) {
                            returnObj = statementErr(returnObj, cell, 'warn_statementErr');
                            break;
                        }

                        var objExportField;
                        if (subtableRow) {
                            //対象サブテーブル行出力
                            //アプリ名・フィールド名に誤りある場合
                            if (!exportFormFields[objExportAppInfo.appName] || !exportFormFields[objExportAppInfo.appName][subTableCode] || !exportFormFields[objExportAppInfo.appName][subTableCode]['fields'][objExportAppInfo.fieldCode]) {
                                returnObj = statementErr(returnObj, cell, 'warn_fieldCode_no');
                                break;
                            }
                            objExportField = getFieldValue(subtableRow['value'][objExportAppInfo.fieldCode], exportFormFields[objExportAppInfo.appName][subTableCode][objExportAppInfo.fieldCode]);
                        } else {
                            //フィールド出力
                            //アプリ名・フィールド名に誤りある場合
                            if (!exportRecords[objExportAppInfo.appName] || !exportRecords[objExportAppInfo.appName][objExportAppInfo.fieldCode]) {
                                returnObj = statementErr(returnObj, cell, 'warn_fieldCode_no');
                                break;
                            }
                            objExportField = getFieldValue(exportRecords[objExportAppInfo.appName][objExportAppInfo.fieldCode], exportFormFields[objExportAppInfo.appName][objExportAppInfo.fieldCode]);
                        }

                        //!"!"必要
                        if (!objExportField.molding) {
                            //出力値成形の必要なし
                            exportValue += objExportField.value;
                        } else {
                            //成形の必要あり
                            exportValue += valuesMolding(key, objExportField);
                        }
                    }
            }
        });
        if (returnObj.detail) {
            return returnObj;
        } else {
            return exportValue;
        }
    }

    /**
     * 読み込んだワークブックの編集
     * @param {XlsxPopulate.workbook} workbook ワークブック
     * @param {String} fileName テンプレートファイル名
     * @param {Object} exportRecords 出力用レコード
     * @param {Object} reportKeyRecords 外部開放用キーレコード
     * @param {Object} exportFormFields 出力用レコードのアプリのフォーム情報一覧
     * @param {Object} config
     */
    async function modifyWorkbook(workbook, fileName, exportRecords, exportFormFields, config) {
        /**
         * 条件式が記入されたセルを処理
         * @param {Object} cell セル
         * @param {String} subTableCode サブテーブルコード（サブテーブル内フィールドの場合）
         * @returns true(セルに条件式が記入されており、処理済)/false(条件式未記入セルだった)
         */
        function processingIfStatement(cell, subTableCode) {
            //条件文が存在するか確認
            var objIfCheckResult = checkIfStatement(cell, exportRecords, exportFormFields, subTableCode);

            if (objIfCheckResult.result || objIfCheckResult.detail) {
                //処理済セルとして登録
                if (arrProcessedCell[cell.sheet().name()]) {
                    arrProcessedCell[cell.sheet().name()].push(cell.columnName() + cell._row.rowNumber());
                } else {
                    arrProcessedCell[cell.sheet().name()] = [cell.columnName() + cell._row.rowNumber()];
                }

                if (objIfCheckResult.detail) {
                    //条件構文異常が有った場合
                    getErrorObject(objIfCheckResult, cell.sheet().name()); //エラー文を生成
                }
                return true;
            }

            return false;
        }

        /**
         * 条件文記載以外のセルを処理
         * @param {Object} cell セル
         * @param {Object} targetRow 出力行 ※サブテーブルの場合
         * @param {Object} subTableCode サブテーブルコード※サブテーブルの場合
         */
        function processingCell(cell, targetRow, subTableCode) {
            var arrKey = getKeyFromCell(cell).split(SYMBOL_JOIN); //結合文字列ある場合
            var exportValue = getValue(arrKey, null, exportRecords, exportFormFields, cell, targetRow, subTableCode); //出力する値を取得

            if (exportValue.detail) {
                //構文異常
                getErrorObject(exportValue, cell.sheet().name());
                return;
            }
            //値転記
            valuesPosting(exportValue, cell);
        }

        /**
         * テンプレート記入エラー情報を生成
         * （帳票出力時にまとめてアラート表示する）
         * @param {Object} errDetail {type: エラータイプ, detail: 対象セル}
         * @param {Object} sheetName シート名
         */
        function getErrorObject(errDetail, sheetName) {
            if (!errObj[fileName]) {
                //ファイル名
                errObj[fileName] = {
                    [sheetName]: {
                        [errDetail.type]: message[errDetail.type] + '　対象セル：' + errDetail.detail,
                    },
                };
            } else if (!errObj[fileName][sheetName]) {
                //ファイル名・シート名
                errObj[fileName][sheetName] = {
                    [errDetail.type]: message[errDetail.type] + '　対象セル：' + errDetail.detail,
                };
            } else if (!errObj[fileName][sheetName][errDetail.type]) {
                //ファイル名・シート名・エラータイプ
                errObj[fileName][sheetName][errDetail.type] = message[errDetail.type] + '　対象セル：' + errDetail.detail;
            } else {
                errObj[fileName][sheetName][errDetail.type] += '・' + errDetail.detail;
            }
        }

        // var conf_reportKey = config.app_reportKey.fieldCode;
        var errMsg = '';
        var errObj = {};
        var arrProcessedCell = {};

        // アプリコードの配列を作成
        function workbookCellsValues(workbookCells) {
            let fileCell;
            // ':'で分割
            let cellValue = workbookCells._value.match(SYMBOL_SPLIT) ? workbookCells._value.split(SYMBOL_SPLIT) : false;
            if (!cellValue) {
                fileCell = '';
            } else {
                let splitCellCode = cellValue[0].match(SYMBOL_IF_START) ? cellValue[0].split(SYMBOL_IF_START)[1] : cellValue[0];
                fileCell = splitCellCode.match(SYMBOL_ENCIRCLE) ? splitCellCode.split(SYMBOL_ENCIRCLE)[1] : splitCellCode;
            }
            return fileCell;
        }

        //ワークブック全体を、外部出力キーで検索→置換
        // reportKeyRecords.forEach(function (keyRecord) {
        //     var getFormFields = exportFormFields[keyRecord[conf_reportKey.appName].value];//出力(レコード)アプリのフォーム情報一覧
        //     var getAppRecord = exportRecords[keyRecord[conf_reportKey.appName].value];//出力レコード
        //     var outputClass = keyRecord[conf_reportKey.outputClass].value;//出力キー/出力分類
        //     var keyFieldCode = keyRecord[conf_reportKey.kintoneFieldCode].value;//出力キー/フィールドコード
        //     var exportKey = keyRecord[conf_reportKey.outsidefieldname].value;//出力キー

        //     if (!getAppRecord && workbook.find(exportKey).length && (outputClass === "メタ情報" || outputClass === "フィールド")) {
        //         getErrorObject({ "type": "warn_record_no", "detail": "" }, "―");
        //         return;
        //     } else if (!getAppRecord && ["メタ情報", "フィールド"].indexOf(outputClass) >= 0) {
        //         return;
        //     }

        // SYMBOL_DATE　と　SYMBOL_LIST　があった場合セルを配列に追加
        function pushWorkbookCells(dateCells, listCells, workbookCells) {
            // SYMBOL_DATE
            for (let i = 0; i < dateCells.length; i++) {
                workbookCells.push(dateCells[i]);
            }
            // SYMBOL_LIST
            for (let j = 0; j < listCells.length; j++) {
                workbookCells.push(listCells[j]);
            }
            return workbookCells;
        }

        // workbook内の条件文記述セルを取得
        //2022-10-12 改修
        const appNameAry = await createAppAry();
        //「アプリ名:~」の形式を含むセルの取得
        let allCells = [];
        appNameAry.forEach((appName) => {
            const reg = new RegExp(`^(?=.*${appName}:).*$`);
            allCells.push(workbook.find(reg));
        });
        //対象セルの成形
        let targetAllCells = [];
        allCells.forEach((cells) => {
            if (cells.length) {
                cells.forEach((cell) => {
                    targetAllCells.push(cell);
                });
            }
        });
        //セルのアドレスを保持した形式に変換
        let formatTargetAllCells = [];
        targetAllCells.forEach((cell) => {
            formatTargetAllCells.push({
                cell: cell,
                address: cell.address(),
            });
        });
        //セルのアドレスを基準に重複削除
        const targetCells = formatTargetAllCells.filter((cell, index, array) => {
            const addressAry = array.map((cell) => cell.address);
            if (addressAry.indexOf(cell.address) === index) {
                return cell;
            }
        });
        //セルのみの配列形式に変換
        let workbookCells = [];
        targetCells.forEach((cell) => {
            workbookCells.push(cell.cell);
        });

        // let workbookCells = workbook.find(/[a-z]+/g); //!ここ見直しの必要あり→英語始まりのとこだけ取得するようにしてるけど今後はアプリ名に置き換わる想定なので
        workbookCells = pushWorkbookCells(workbook.find(SYMBOL_DATE), workbook.find(SYMBOL_LIST), workbookCells);

        // フィールドコードを作成するためのindexを判定
        function comparisonIndex(SEPARATION_lastIndex, CALENDAR_lastIndex, FIXED_lastIndex, JOIN_lastIndex, ENCIRCLE_lastIndex, IF_SEPARATION_lastIndex, ROW_INDEX_lastIndex) {
            let fieldCodeLast = SEPARATION_lastIndex;
            let fieldCodesList = [CALENDAR_lastIndex, FIXED_lastIndex, JOIN_lastIndex, ENCIRCLE_lastIndex, IF_SEPARATION_lastIndex, ROW_INDEX_lastIndex];
            for (let k = 0; k < fieldCodesList.length; k++) {
                if (fieldCodeLast > fieldCodesList[k]) {
                    fieldCodeLast = fieldCodesList[k];
                }
            }
            return fieldCodeLast;
        }

        //外部出力キーで検索し、ヒットしたセルを取得
        workbookCells.forEach(function (cell) {
            let firstIndex = cell._value.indexOf(SYMBOL_SPLIT); //対象セル内に「:」が含まれるか判断→含まれる場合、「:」の位置を取得
            let SEPARATION_lastIndex = cell._value.indexOf(SYMBOL_SEPARATION, firstIndex + 1);

            if (SEPARATION_lastIndex === -1) {
                SEPARATION_lastIndex = cell._value.length;
            }

            let CALENDAR_lastIndex = cell._value.indexOf(SYMBOL_CALENDAR, firstIndex + 1);
            if (CALENDAR_lastIndex === -1) {
                CALENDAR_lastIndex = cell._value.length;
            }

            let FIXED_lastIndex = cell._value.indexOf(SYMBOL_FIXED, firstIndex + 1);
            if (FIXED_lastIndex === -1) {
                FIXED_lastIndex = cell._value.length;
            }

            let JOIN_lastIndex = cell._value.indexOf(SYMBOL_JOIN, firstIndex + 1);
            if (JOIN_lastIndex === -1) {
                JOIN_lastIndex = cell._value.length;
            }

            let ENCIRCLE_lastIndex = cell._value.indexOf(SYMBOL_ENCIRCLE, firstIndex + 1);
            if (ENCIRCLE_lastIndex === -1) {
                ENCIRCLE_lastIndex = cell._value.length;
            }

            let ROW_INDEX_lastIndex = cell._value.indexOf(SYMBOL_ROW_INDEX, firstIndex + 1);
            if (ROW_INDEX_lastIndex === -1) {
                ROW_INDEX_lastIndex = cell._value.length;
            }

            let IF_SEPARATION_lastIndex = cell._value.indexOf(SYMBOL_IF_SEPARATION, firstIndex + 1);
            if (IF_SEPARATION_lastIndex === -1) {
                IF_SEPARATION_lastIndex = cell._value.length;
            }

            let lastIndex = comparisonIndex(SEPARATION_lastIndex, CALENDAR_lastIndex, FIXED_lastIndex, JOIN_lastIndex, ENCIRCLE_lastIndex, IF_SEPARATION_lastIndex, ROW_INDEX_lastIndex);
            let subtablelastIndex = comparisonIndex(SEPARATION_lastIndex, CALENDAR_lastIndex, FIXED_lastIndex, JOIN_lastIndex, ENCIRCLE_lastIndex, IF_SEPARATION_lastIndex);

            let currentCode = workbookCellsValues(cell);

            var keyFieldCode = cell._value.substring(firstIndex + 1, lastIndex);
            let subtableKeyFieldCode = cell._value.substring(firstIndex + 1, subtablelastIndex);
            let exportKey = currentCode + ':' + keyFieldCode;
            let exportKeySubtable = currentCode + ':' + subtableKeyFieldCode;
            let getAppRecord = exportRecords[currentCode];
            let getFormFields = exportFormFields[currentCode];

            switch (exportKey) {
                case SYMBOL_DATE: //今日日付・帳票リスト出力の場合
                case SYMBOL_LIST:
                    //セル内表記のチェック
                    if (!checkCellKey(cell, arrProcessedCell)) {
                        return;
                    }
                    //条件構文として処理済のためリターン
                    if (processingIfStatement(cell)) return;

                    //条件文ではなかった場合
                    processingCell(cell);
                    break;

                default: //その他（フィールド出力の場合）
                    if (!getAppRecord) return;

                    if (!getAppRecord[keyFieldCode]) {
                        //サブテーブル内フィールドの場合
                        Object.keys(getAppRecord).some(function (fieldCode) {
                            if (getAppRecord[fieldCode].type === 'SUBTABLE') {
                                let subtableField = keyFieldCode.split('!')[0];

                                if (getFormFields[fieldCode]['fields'][subtableField]) {
                                    //サブテーブル内に出力対象が存在
                                    //セルチェック
                                    if (!checkCellKey(cell, arrProcessedCell)) return;

                                    //条件構文として処理済のためリターン
                                    if (processingIfStatement(cell, fieldCode)) return;

                                    //条件文ではなかった場合
                                    //★サブテーブル出力用構文チェック開始
                                    var circle_firstIndex = cell._value.indexOf(SYMBOL_ENCIRCLE); //先頭囲み記号
                                    var circle_lastIndex = cell._value.indexOf(SYMBOL_ENCIRCLE, circle_firstIndex + 1); //末尾囲み記号
                                    var allKey = cell._value.substring(circle_firstIndex + 1, circle_lastIndex); //転記キー（オプション含む）
                                    var key_lastIndex = allKey.indexOf(exportKeySubtable) + exportKey.length; //（オプション省いた）キーの最後インデックス
                                    var cellNumber = cell.columnName() + cell._row.rowNumber(); //セル番号(例：A1)

                                    // var indexExclamation = allKey.indexOf(SYMBOL_ROW_INDEX, key_lastIndex);//　サブテーブル行指定番号が無い場合、エラー
                                    var indexExclamation = allKey.indexOf(SYMBOL_ROW_INDEX, key_lastIndex);
                                    if (indexExclamation === -1) {
                                        getErrorObject({ type: 'warn_index_no', detail: cellNumber }, cell.sheet().name());
                                        return;
                                    }
                                    //　サブテーブルの指定行番号を取得
                                    var tableIndex = getOptionIndex(allKey, SYMBOL_ROW_INDEX);

                                    if (tableIndex === 'first') {
                                        //先頭行
                                        tableIndex = 0;
                                    } else if (tableIndex === 'last') {
                                        //最後の行
                                        tableIndex = getAppRecord[fieldCode]['value'].length - 1;
                                    } else if (!isNaN(tableIndex) && tableIndex) {
                                        //index指定行
                                        tableIndex = tableIndex - 1;
                                    } else if (!tableIndex) {
                                        //指定行無しエラー
                                        getErrorObject({ type: 'warn_index_no', detail: cellNumber }, cell.sheet().name());
                                        return;
                                    } else if (isNaN(Number(tableIndex))) {
                                        //サブテーブル行数指定文字が数字でないエラー
                                        getErrorObject({ type: 'warn_index_no_number', detail: cellNumber }, cell.sheet().name());
                                        return;
                                    }
                                    //★サブテーブル出力用構文チェック終了

                                    //(出力サブテーブルが0行＆サブテーブル内に出力対象が存在する) or
                                    //指定行が存在しない
                                    //　""を出力
                                    var targetRow = getAppRecord[fieldCode]['value'][tableIndex];
                                    if ((!getAppRecord[fieldCode].value.length && getFormFields[fieldCode]['fields'][keyFieldCode]) || !targetRow) {
                                        saveOriginCell(cell);
                                        //転記
                                        cell.value('');
                                    } else {
                                        //値出力
                                        processingCell(cell, targetRow, fieldCode);
                                    }
                                    return true;
                                }
                            }
                        });
                    } else {
                        //単体フィールドの場合
                        //セルチェック
                        if (!checkCellKey(cell, arrProcessedCell)) {
                            return;
                        }

                        //条件構文として処理済のためリターン
                        if (processingIfStatement(cell)) return;

                        //条件文ではなかった場合
                        processingCell(cell);
                    }
                    break;
            }
        });
        // })

        // 注意アラート
        if (Object.keys(errObj).length) {
            Object.keys(errObj).forEach(function (fileName) {
                errMsg += '\n■対象テンプレート名：' + fileName;
                Object.keys(errObj[fileName]).forEach(function (sheetName) {
                    errMsg += '\n対象シート名：' + sheetName;
                    Object.keys(errObj[fileName][sheetName]).forEach(function (errDetail) {
                        errMsg += errObj[fileName][sheetName][errDetail];
                    });
                });
            });
            alert(errMsg);
        }

        return workbook;
    }

    /**
     * 転記前のセルの値を保持
     * @param {Object} cell セル
     */
    function saveOriginCell(cell) {
        const richText = new XlsxPopulate.RichText();
        if (!processedCells[cell.sheet().name()]) {
            processedCells[cell.sheet().name()] = {
                [cell.columnName() + cell._row.rowNumber()]: cell._value,
            };
        } else {
            //処理前セルの状態を保持
            processedCells[cell.sheet().name()][cell.columnName() + cell._row.rowNumber()] = cell._value;
        }
    }

    /**
     * 添付ファイルダウンロード
     * @param {String} fileKey ファイルキー
     * @return {Object} workbook
     */
    function downloadTempfile(fileKey) {
        var d = new $.Deferred();

        var apiurl = '/k/v1/file.json?fileKey=' + fileKey;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', apiurl);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';

        xhr.onload = function (e) {
            var blob = xhr.response;

            XlsxPopulate.fromDataAsync(blob).then(function (workbook) {
                d.resolve(workbook);
            });
        };

        xhr.onerror = function (e) {
            alert('帳票の出力に失敗しました。システム管理者に問い合わせて下さい。');
            console.log(e);
            d.reject();
        };
        xhr.send();
        return d.promise();
    }

    /**
     * 帳票に出力するレコードを取得
     * @param {Object} myRecord 表示中レコード
     * @param {Object} respParam 取得中一時パラメータ
     */
    function getExportRecords(myRecord, respParam) {
        var nowAppId = kintone.app.getId();
        var getApps = config.app_reportKey.getAppsId;
        var respParam = respParam || {};
        var d = respParam.deferred || new $.Deferred();
        var records = respParam.records || {};
        var arr_appName = respParam.arr_appName && respParam.arr_appName.length ? respParam.arr_appName : Object.keys(getApps);
        var arr_appName = respParam.arr_appName || Object.keys(getApps);
        var appName = arr_appName[0];
        let appCode = getApps[appName].appCode;
        //抽出条件作成
        var query = '';
        if (getApps[appName]['conditions']) {
            //条件設定済みの場合
            var querySymbol = getApps[appName]['conditions']['symbol'];
            switch (querySymbol) {
                case '=':
                    query = getApps[appName].keyFieldCode + ' = "' + getApps[appName]['conditions']['keyValue'] + '"';
                    break;

                case 'in':
                    query = getApps[appName].keyFieldCode + ' in ("' + getApps[appName]['conditions']['keyValue'] + '")';
                    break;
            }
        } else {
            //条件設定無しの場合、出力アプリ.キーフィールド = 実装アプリ.キーフィールド
            query = getApps[appName].keyFieldCode + ' = "' + myRecord[config.primaryKey].value + '"';
        }

        var getBody = {
            app: getApps[appName].appId,
            query: query,
        };
        kintone.api(
            kintone.api.url('/k/v1/records', true),
            'GET',
            getBody,
            function (resp) {
                records[appCode] = Number(getApps[appName].appId) === nowAppId ? [myRecord] : resp['records']; //!ここアプリコードからアプリ名への変更必要
                arr_appName.shift();
                if (arr_appName.length >= 1) {
                    respParam.deferred = d;
                    respParam.records = records;
                    respParam.arr_appName = arr_appName;
                    getExportRecords(myRecord, respParam);
                } else {
                    d.resolve(records);
                }
            },
            function (error) {
                console.log(error);
                alert('帳票出力レコードの取得に失敗しました。システム管理者に問い合わせて下さい。');
                d.reject();
            }
        );
        return d.promise();
    }

    /**
     * 帳票に出力するアプリのフォーム情報を取得
     * @param {Object} respParam 取得中一時パラメータ
     * @return {Object} 各アプリのフォーム情報一覧
     */
    function getExportFormFields(respParam) {
        var getApps = config.app_reportKey.getAppsId;
        var respParam = respParam || {};
        var d = respParam.deferred || new $.Deferred();
        var forms = respParam.forms || {};
        var arr_appName = respParam.arr_appName && respParam.arr_appName.length ? respParam.arr_appName : Object.keys(getApps);
        var appName = arr_appName[0];
        let appCode = getApps[appName].appCode;

        var thenable = new $.KintoneThenable();
        thenable
            .getFormFields(getApps[appName].appId)
            .then(function (resp) {
                forms[appCode] = resp['properties'];
                arr_appName.shift();
                if (arr_appName.length >= 1) {
                    respParam.deferred = d;
                    respParam.forms = forms;
                    respParam.arr_appName = arr_appName;
                    getExportFormFields(config, respParam);
                } else {
                    d.resolve(forms);
                }
            })
            .fail(function (error) {
                d.reject(error);
            });

        return d.promise();
    }

    /**
     * 帳票出力メニュー作成
     * @param {Object} conf プラグイン設定値
     * @param {Object} records 帳票格納レコード
     * @param {bool} exportFlg 出力可・不可
     */
    function createOutputMenu(conf, records, exportFlg) {
        var table = $(`
        <div class="menu_parent">
        <div class="menu_header">
            <span class="menu_title">出力リスト</span>
            <span class="menu_runbtn menu_outPutBtn emc_exe_sub2"> 出力 </span>
        </div>
        <table class="table_menu">
            <thead class="head_menu">
            <tr>
                <th style="min-width:50px;">出力済</th>
                <th style="min-width:50px;">出力</th>
                <th style="min-width:50px;">No</th>
                <th style="min-width:150px;">帳票名</th>
                <th style="min-width:150px;">EXCELテンプレート名</th>
            </tr>
            </thead>
        <tbody class="menu_outPut_tbody">
            <tr>
                <td class="td_checkReq_alreadyOutput">
                    <input class="menu_checkBox_alreadyOutput" type="checkbox" disabled="disabled">
                </td>
                <td class="td_checkReq">
                    <input class="menu_checkBox" type="checkbox">
                </td>
                <td name="order" class="td_No">1</td>
                <td class="td_reportName"></td>
                <td class="td_excelTempName"></td>
            </tr>
        </tbody>
        </table>
        </div>
        `);

        table.find('.menu_checkBox_alreadyOutput').css('content', 'none');

        if (!exportFlg) {
            //詳細画面の場合、出力機能は削除
            table.find('.menu_outPutBtn').remove();
        }

        var templateCode = conf.app_templateFile.fieldCode;
        records.forEach(function (record, count) {
            //xlsx形式の場合 & 添付テンプレファイルが1つの場合、メニューに追加
            if (record[templateCode.templateFile].value[0].contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && record[templateCode.templateFile].value.length === 1) {
                //雛形行コピー
                var _clone = $(table).find('.menu_outPut_tbody > tr:first').clone(true);
                _clone.attr('id', 'tempRecordId_' + record['$id'].value);
                _clone.find("td[class='td_No']").text(count + 1);
                _clone.find("td[class='td_reportName']").text(record[templateCode.reportName].value);
                _clone.find("td[class='td_excelTempName']").text(record[templateCode.templateFile].value[0].name);
                _clone.find("td[class='td_excelTempName']").attr('data-fileKey', record[templateCode.templateFile].value[0].fileKey);
                $(table).find('.menu_outPut_tbody').append(_clone);
            }
        });
        $(table).find('.menu_outPut_tbody > tr:first').remove(); //ひな形行削除

        return table;
    }

    /**
     * 出力チェックボックスのチェック状態を復元（セッション値使用）
     * @param {Element} menu 出力メニュー
     */
    function sessionSetCheckBox(menu) {
        // 出力チェックボックスのチェック状態を引継ぎ
        var session_obj = SESSION.get() ? JSON.parse(SESSION.get()) : {};
        var url_reg = new RegExp('^https://' + document.domain + '/k/' + kintone.app.getId() + '/show+.*record=' + kintone.app.record.getId() + '+');
        var before_url = session_obj['before_url'] ? session_obj['before_url'] : '';
        var menuId = $(menu).closest('.menu_parent').attr('id'); //チェックボックスのメニューID取得
        if (before_url.match(url_reg) && session_obj[menuId]) {
            session_obj[menuId]['index'].forEach(function (index) {
                if ($(menu).find(".td_No:contains('" + index + "')")) {
                    $(menu)
                        .find(".td_No:contains('" + index + "')")
                        .parent()
                        .find('.menu_checkBox')
                        .prop('checked', true);
                }
            });
        }
    }

    /**
     * 非活性チェックボックスのチェック状態を復元
     * @param {Object} config 帳票出力メニュー設定
     * @param {Element} menu 出力メニュー
     * @param {Object} record 表示中のレコード
     */
    function restoreCheckState(config, menu, record) {
        var arr_recId = record[config.saveFieldCode].value ? record[config.saveFieldCode].value.split(',') : [];
        var searchStr = 'tempRecordId_';
        Array.prototype.some.call($(menu).find("tbody[class='menu_outPut_tbody'] > tr"), function (tr) {
            var id = $(tr).attr('id');
            var recId = id.slice(id.indexOf(searchStr) + searchStr.length);
            if (arr_recId.indexOf(recId) >= 0) $(tr).find('input.menu_checkBox_alreadyOutput').prop('checked', true);
        });

        save_alreadyOutput[$(menu).attr('id')] = arr_recId;
    }

    /**
     * チェックボックスのチェック状態を保存
     * @param {Object} saveFieldCode 保存先フィールドコード
     * @param {Object} record 保存先レコード
     * @param {Array} arr_check チェック状態リスト
     * @param {String} menuId 出力メニューID
     * @param {boolean} exportFunc 出力機能
     * @param {boolean} putFlg 保存フラグ
     */
    function saveExportList(saveFieldCode, record, arr_check, menuId, exportFunc, putFlg) {
        /**
         * 出力状態一時保存
         */
        function temporarilySaved(arr_check, menuId) {
            var arr_recId = [];
            Array.prototype.forEach.call(arr_check, function (checkbox) {
                var searchStr = 'tempRecordId_';
                var id = $(checkbox).closest('tr').attr('id');
                var recId = id.slice(id.indexOf(searchStr) + searchStr.length);
                arr_recId.push(recId);
            });
            save_alreadyOutput[menuId] = arr_recId;
        }

        if (putFlg) {
            if (!exportFunc) {
                temporarilySaved(arr_check, menuId);
            } else {
                if (!record[saveFieldCode].value) {
                    var arr_record = [];
                } else if (record[saveFieldCode].value.indexOf(SYMBOL_SEPARATION) >= 0) {
                    var arr_record = record[saveFieldCode].value.split(SYMBOL_SEPARATION);
                } else {
                    var arr_record = [record[saveFieldCode].value];
                }
                var arr_record = record[saveFieldCode].value ? record[saveFieldCode].value.split(SYMBOL_SEPARATION) : [];
                var arr_temp = save_alreadyOutput[menuId].length ? save_alreadyOutput[menuId] : [];
                var marge_arr = arr_record.concat(arr_temp);
                if (marge_arr.length === 1) {
                    save_alreadyOutput[menuId] = Array.from(new Set(marge_arr));
                } else if (marge_arr.length >= 2) {
                    save_alreadyOutput[menuId] = Array.from(new Set(marge_arr)).join(',');
                }
            }
            record[saveFieldCode].value = save_alreadyOutput[menuId];
            save_alreadyOutput[menuId] = '';
        } else {
            temporarilySaved(arr_check, menuId);
        }
    }

    /**
     * メニューを編集
     * @param {DOMObject} menuClone メニュー
     * @param {String} event_type 発火中イベント
     */
    function editOutputMenu(menuClone, event_type) {
        menuClone.find('.head_menu th').eq(0).text('チェック');
        menuClone.find('.head_menu th').eq(1).remove();
        Array.prototype.forEach.call(menuClone.find('.menu_outPut_tbody tr'), function (tr) {
            $(tr).find('.td_checkReq').remove();
            if (event_type === 'app.record.edit.show') $(tr).find('.menu_checkBox_alreadyOutput').prop('disabled', false);
        });
        menuClone.find('span.menu_outPutBtn').remove();
    }

    /**
     * フィールド非表示処理
     */
    function fieldShown() {
        config.exportMenu.forEach(function (menuInfo) {
            kintone.app.record.setFieldShown(menuInfo.saveFieldCode, false);
        });
    }

    /**
     * DOMイベント
     */
    function setEvent() {
        try {
            // 出力ボタン
            $('.menu_outPutBtn').on('click', function (event) {
                if (!confirm('チェックされた帳票を全て出力します。')) {
                    return;
                }
                if (kintone.app.record.get().record[config.primaryKey].value === '') {
                    alert('レコードの関連キー ' + config.primaryKey + ' が未入力です。');
                    return;
                }

                var thenable = new $.KintoneThenable();
                var app_reportKey = config.app_reportKey;

                $.when(
                    getExportRecords(kintone.app.record.get().record), //帳票出力レコード取得
                    // thenable.getRecords({ app: app_reportKey.appId, condition: app_reportKey.fieldCode.outsidefieldname + " != \"\"" }),//外部解放キー取得,
                    getExportFormFields(config)
                )
                    .then(function (exportRecords, exportFormFields) {
                        //出力対象レコードが1アプリにつき2件以上の場合、出力中止
                        var uniqueErrFlg = false;
                        var arr_errAppName = [];
                        Object.keys(exportRecords).forEach(function (appName) {
                            if (exportRecords[appName].length >= 2) {
                                arr_errAppName.push(appName);
                                uniqueErrFlg = true;
                            }
                        });
                        if (uniqueErrFlg) {
                            var msg = `以下アプリのレコードが複数取得できるため、帳票を出力できません。\n帳票に出力するレコードは、1アプリにつき1件のみである必要があります。\n`;
                            arr_errAppName.forEach(function (appName) {
                                msg += '・' + appName + '\n';
                            });
                            alert(msg);
                            return;
                        }
                        //出力対象レコード構成調整
                        Object.keys(exportRecords).forEach(function (appName) {
                            exportRecords[appName] = exportRecords[appName][0];
                        });

                        //出力対象の帳票を出力
                        var arr_check = $(event.target).parent().parent().find("input[class='menu_checkBox']:checked");
                        if (!arr_check.length) {
                            alert('出力物がありません。');
                        } else {
                            Array.prototype.forEach.call(arr_check, function (checkbox) {
                                var fileKey = $(checkbox).parent().parent().find('td.td_excelTempName').attr('data-fileKey');
                                var fileName = $(checkbox).closest('tr').find('.td_excelTempName').text();

                                $.when(
                                    downloadTempfile(fileKey) // アプリからテンプレートDL
                                )
                                    .then(function (workbook) {
                                        // テンプレート編集
                                        return modifyWorkbook(workbook, fileName, exportRecords, exportFormFields, config);
                                    })
                                    //2022-10-19 改修
                                    .then(function (editWorkBook) {
                                        return editWorkBook.outputAsync();
                                    })
                                    .then(function (blob) {
                                        // const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                        // 出力
                                        saveAs(blob, `${$(checkbox).parent().parent().find('td.td_reportName').text()}.xlsx`);
                                    })
                                    .done(function () {
                                        // 帳票出力状態保存
                                        var saveFieldCode = $(event.target).closest('.menu_parent').data('saveFieldCode');
                                        var menuId = $(event.target).closest('.menu_parent').attr('id');
                                        saveExportList(saveFieldCode, kintone.app.record.get().record, arr_check, menuId, true, false);
                                    })
                                    .fail(function (err) {
                                        window.emxas_logmanager.handleError(err);
                                    });
                            });
                        }
                    })
                    .fail(function (err) {
                        window.emxas_logmanager.handleError(err);
                    });
            });

            // 出力チェックボックス
            $('.menu_checkBox').on('change', function (event) {
                var checkStatusHold = config.checkStatusHold;

                if (checkStatusHold) {
                    //編集画面⇔詳細画面　遷移時用に出力チェックボックスのチェック状態を保持
                    var checkFlg = $(event.target).prop('checked');
                    var No = $(event.target).parent().parent().find('.td_No').text();
                    var session_obj = SESSION.get() ? JSON.parse(SESSION.get()) : {};
                    var menuId = $(event.target).closest('.menu_parent').attr('id'); //チェックボックスのメニューID取得
                    session_obj[menuId] ? '' : (session_obj[menuId] = { index: [] });

                    if (session_obj[menuId]['index'].indexOf(No) === -1) {
                        checkFlg ? session_obj[menuId]['index'].push(No) : '';
                    } else {
                        checkFlg ? '' : session_obj[menuId]['index'].splice(session_obj[menuId]['index'].indexOf(No), 1);
                    }
                    SESSION.set(JSON.stringify(session_obj));
                }
            });
        } catch (error) {
            window.emxas_logmanager.handleError(error);
        }
    }

    /**
     * kintoneイベント
     * 詳細表示・編集表示
     */
    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function (e) {
        try {
            excelReport.EMCloud_spinner.showSpinner();

            return EMCloud_licenseChecker.check('plugin', PRODUCT_CODE)
                .then(function (err_obj) {
                    if (err_obj.emc_error === true) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    } else {
                        // セッション
                        var session_obj = SESSION.get() ? JSON.parse(SESSION.get()) : {};
                        session_obj['before_url'] = document.location.href;
                        SESSION.set(JSON.stringify(session_obj));

                        var event_type = e.type;
                        if (!getConfig() || !config.pluginUse) {
                            excelReport.EMCloud_spinner.hideSpinner();
                            return e;
                        }

                        /*
                    main関数
                    */
                        (function (config) {
                            var thenable = new $.KintoneThenable(); //API用
                            var temp_appId = config.app_templateFile.appId;
                            var temp_reportName = config.app_templateFile.fieldCode.reportName;
                            var temp_templateFile = config.app_templateFile.fieldCode.templateFile;
                            var temp_recordIds = config.dispTemplateList;
                            var tempGetBody = {
                                app: temp_appId,
                                condition: temp_reportName + ' != "" and テンプレートID in ("' + temp_recordIds.join('", "') + '")',
                                fields: ['$id', temp_reportName, temp_templateFile],
                            };

                            $.when(thenable.getRecords(tempGetBody))
                                .then(function (resp_tempRecords) {
                                    fieldShown(config); //特定フィールド非表示
                                    var exportFlg = event_type === 'app.record.edit.show' ? true : false;
                                    var menu = createOutputMenu(config, resp_tempRecords, exportFlg);
                                    //指定スペースフィールドにメニュー追加
                                    config.exportMenu.forEach(function (menuInfo, count) {
                                        var menuClone = menu.clone(true);
                                        menuClone.attr('id', 'menu_outPut_' + count);
                                        menuClone.find('.menu_title').text(menuInfo.menuTitle);
                                        if (menuInfo.saveFieldCode) menuClone.data('saveFieldCode', menuInfo.saveFieldCode);
                                        if (!menuInfo.exportBtn_dispFlg) editOutputMenu(menuClone, event_type);

                                        restoreCheckState(menuInfo, menuClone, e.record); //非活性チェックボックスのチェック状態復元
                                        sessionSetCheckBox(menuClone); //活性チェックボックス(出力物選択)のチェック状態復元
                                        $(kintone.app.record.getSpaceElement(menuInfo.spaceId)).append(menuClone);
                                    });
                                    setEvent(config); //DOMイベント設定
                                    return e;
                                })
                                .fail(function (err) {
                                    excelReport.EMCloud_spinner.hideSpinner();
                                    window.emxas_logmanager.handleError(err);
                                });
                        })(config);
                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    }
                })
                .catch(function (error) {
                    excelReport.EMCloud_spinner.hideSpinner();
                    window.emxas_logmanager.handleError(error);
                });
        } catch (error) {
            excelReport.EMCloud_spinner.hideSpinner();
            window.emxas_logmanager.handleError(error);
        }
    });

    /**
     * kintoneイベント
     * 保存実行前
     */
    kintone.events.on(['app.record.edit.submit'], function (e) {
        try {
            excelReport.EMCloud_spinner.showSpinner();

            return EMCloud_licenseChecker.check('plugin', PRODUCT_CODE)
                .then(function (err_obj) {
                    if (err_obj.emc_error === true) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    } else {
                        const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
                        config = { conf: {} };
                        if (CONFIG && CONFIG.conf) {
                            config = JSON.parse(CONFIG.conf);
                        }
                        if (!CONFIG || !config.pluginUse) {
                            excelReport.EMCloud_spinner.hideSpinner();
                            return e;
                        }
                        config.exportMenu.forEach(function (menuInfo) {
                            var menu = $(kintone.app.record.getSpaceElement(menuInfo.spaceId)).find('.menu_parent');
                            var saveFieldCode = menu.data('saveFieldCode');
                            var exportFunc = !$(menu).find('.menu_outPutBtn').length ? false : true;
                            if (exportFunc) {
                                var arr_check = $(menu).find('.menu_outPut_tbody').find("input[class='menu_checkBox']:checked");
                            } else {
                                var arr_check = $(menu).find('.menu_outPut_tbody').find("input[class='menu_checkBox_alreadyOutput']:checked");
                            }
                            saveExportList(saveFieldCode, e.record, arr_check, $(menu).attr('id'), exportFunc, true);
                        });
                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    }
                })
                .catch(function (error) {
                    excelReport.EMCloud_spinner.hideSpinner();
                    window.emxas_logmanager.handleError(error);
                    return false;
                });
        } catch (error) {
            excelReport.EMCloud_spinner.hideSpinner();
            window.emxas_logmanager.handleError(error);
            return false;
        }
    });

    /**
     * 設定値をグローバル変数にセット
     * @return false=設定値未登録
     */
    function getConfig() {
        const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!CONFIG || !CONFIG.conf) return false;

        config = { conf: {} };
        config = JSON.parse(CONFIG.conf);
        return true;
    }

    /**
     * kintoneイベント
     * 追加画面表示
     */
    kintone.events.on(['app.record.create.show'], function (e) {
        try {
            excelReport.EMCloud_spinner.showSpinner();

            return EMCloud_licenseChecker.check('plugin', PRODUCT_CODE)
                .then(function (err_obj) {
                    if (err_obj.emc_error === true) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    } else {
                        if (!getConfig() || !config.pluginUse) {
                            excelReport.EMCloud_spinner.hideSpinner();
                            return e;
                        }
                        fieldShown(config); //特定フィールド非表示

                        if (e.reuse) {
                            config.exportMenu.forEach(function (menuInfo) {
                                e.record[menuInfo.saveFieldCode].value = '';
                            });
                        }

                        excelReport.EMCloud_spinner.hideSpinner();
                        return e;
                    }
                })
                .catch(function (error) {
                    excelReport.EMCloud_spinner.hideSpinner();
                    window.emxas_logmanager.handleError(error);
                });
        } catch (error) {
            excelReport.EMCloud_spinner.hideSpinner();
            window.emxas_logmanager.handleError(error);
        }
    });

    // 一覧画面「帳票出力メニュー」ポップアップ
    function createIndexPopup(conf, records) {
        let popup = $(`
            <div class="popup">
                <div class="content">
                <div class="menu_parent">
                <table class="table_menu">
                    <thead class="head_menu">
                    <tr>
                        <th style="min-width:50px;">出力</th>
                        <th style="min-width:50px;">No</th>
                        <th style="min-width:150px;">帳票名</th>
                        <th style="min-width:150px;">EXCELテンプレート名</th>
                    </tr>
                    </thead>
                <tbody class="menu_outPut_tbody">
                    <tr>
                        <td class="td_checkReq">
                            <input class="menu_checkBox" type="checkbox">
                        </td>
                        <td name="order" class="td_No">1</td>
                        <td class="td_reportName"></td>
                        <td class="td_excelTempName"></td>
                    </tr>
                </tbody>
                </table>
                <div class="dialog-buttons">
                    <button class="kintoneplugin-button-dialog-cancel" id="close">閉じる</button>
                    <button class="kintoneplugin-button-dialog-ok menu_outPutBtn">出力</button>
                </div>
                </div>

                </div>
            </div>
        `);

        var templateCode = conf.app_templateFile.fieldCode;
        records.forEach(function (record, count) {
            //xlsx形式の場合 & 添付テンプレファイルが1つの場合、メニューに追加
            if (record[templateCode.templateFile].value[0].contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && record[templateCode.templateFile].value.length === 1) {
                //雛形行コピー
                var _clone = $(popup).find('.menu_outPut_tbody > tr:first').clone(true);
                _clone.attr('id', 'tempRecordId_' + record['$id'].value);
                _clone.find("td[class='td_No']").text(count + 1);
                _clone.find("td[class='td_reportName']").text(record[templateCode.reportName].value);
                _clone.find("td[class='td_excelTempName']").text(record[templateCode.templateFile].value[0].name);
                _clone.find("td[class='td_excelTempName']").attr('data-fileKey', record[templateCode.templateFile].value[0].fileKey);
                $(popup).find('.menu_outPut_tbody').append(_clone);
            }
        });
        $(popup).find('.menu_outPut_tbody > tr:first').remove(); //ひな形行削除

        return popup;
    }

    function createParam(currentRecord, arr_check) {
        let param;
        let updateRecordfields = {};
        var arr_recId = [];
        Array.prototype.forEach.call(arr_check, function (checkbox) {
            var searchStr = 'tempRecordId_';
            var id = $(checkbox).closest('tr').attr('id');
            var recId = id.slice(id.indexOf(searchStr) + searchStr.length);
            arr_recId.push(recId);
        });

        for (let setValue = 0; setValue < config.exportMenu.length; setValue++) {
            if (!config.exportMenu[setValue].exportBtn_dispFlg) {
                continue;
            }

            let saveFieldCode = config.exportMenu[setValue].saveFieldCode;
            let alreadyValue = currentRecord[saveFieldCode].value;
            let result = alreadyValue;

            if (alreadyValue) {
                let splitValue = alreadyValue.split(',');

                for (let i = 0; i < arr_recId.length; i++) {
                    let flg = true;
                    for (let j = 0; j < splitValue.length; j++) {
                        if (arr_recId[i] === splitValue[j]) {
                            flg = false;
                            continue;
                        }
                    }
                    if (flg) {
                        result += ',' + arr_recId[i];
                    }
                }
            } else {
                for (let l = 0; l < arr_recId.length; l++) {
                    if (result) {
                        result += ',' + arr_recId[l];
                    } else {
                        result = arr_recId[l];
                    }
                }
            }

            updateRecordfields[saveFieldCode] = {
                value: result,
            };
        }
        param = {
            app: kintone.app.getId(),
            id: currentRecord['$id'].value,
            record: updateRecordfields,
        };
        return param;
    }

    function indexOutput(thisAppGetBody) {
        try {
            // 出力ボタン
            $('.menu_outPutBtn').on('click', function (event) {
                if (!confirm('チェックされた帳票を全て出力します。')) {
                    return;
                }
                excelReport.EMCloud_spinner.showSpinner();
                var thenable = new $.KintoneThenable();
                $.when(thenable.getRecords(thisAppGetBody)).then(function (appRecords) {
                    let zip = new JSZip();
                    for (let rIndex = 0; rIndex < appRecords.length; rIndex++) {
                        let currentRecord = appRecords[rIndex];
                        // let zip = new JSZip();

                        if (currentRecord[config.primaryKey].value === '') {
                            alert('レコードの関連キー ' + config.primaryKey + ' が未入力です。');
                            return;
                        }

                        $.when(
                            getExportRecords(currentRecord), //帳票出力レコード取得
                            getExportFormFields(config)
                        )
                            .then(function (exportRecords, exportFormFields) {
                                //出力対象レコードが1アプリにつき2件以上の場合、出力中止
                                var uniqueErrFlg = false;
                                var arr_errAppName = [];
                                Object.keys(exportRecords).forEach(function (appName) {
                                    if (exportRecords[appName].length >= 2) {
                                        arr_errAppName.push(appName);
                                        uniqueErrFlg = true;
                                    }
                                });
                                if (uniqueErrFlg) {
                                    var msg = `以下アプリのレコードが複数取得できるため、帳票を出力できません。\n帳票に出力するレコードは、1アプリにつき1件のみである必要があります。\n`;
                                    arr_errAppName.forEach(function (appName) {
                                        msg += '・' + appName + '\n';
                                    });
                                    alert(msg);
                                    return;
                                }
                                //出力対象レコード構成調整
                                Object.keys(exportRecords).forEach(function (appName) {
                                    exportRecords[appName] = exportRecords[appName][0];
                                });

                                //出力対象の帳票を出力
                                var arr_check = $(event.target).parent().parent().find("input[class='menu_checkBox']:checked");
                                if (!arr_check.length) {
                                    alert('出力物がありません。');
                                } else {
                                    let zipArray = [];
                                    Array.prototype.forEach.call(arr_check, function (checkbox, index) {
                                        var fileKey = $(checkbox).parent().parent().find('td.td_excelTempName').attr('data-fileKey');
                                        var fileName = $(checkbox).closest('tr').find('.td_excelTempName').text();

                                        $.when(
                                            downloadTempfile(fileKey) // アプリからテンプレートDL
                                        )
                                            .then(function (workbook) {
                                                // テンプレート編集
                                                return modifyWorkbook(workbook, fileName, exportRecords, exportFormFields, config);
                                            })
                                            //2022-10-19 改修
                                            .then(function (editWorkBook) {
                                                return editWorkBook.outputAsync();
                                            })
                                            .then(function (blob) {
                                                zip.folder(currentRecord['社員番号'].value + '_' + currentRecord['氏名'].value + '_出力帳票').file($(checkbox).parent().parent().find('td.td_reportName').text() + '.xlsx', blob);
                                                return zip.generateAsync({ type: 'blob' });
                                            })
                                            .then(function (content) {
                                                zipArray.push(index);
                                                // レコード毎に出力帳票が揃ったら出力
                                                if (arr_check.length === zipArray.length) {
                                                    if (appRecords.length === rIndex + 1) {
                                                        let today = new Date();
                                                        let year = String(today.getFullYear());
                                                        let month = ('00' + String(today.getMonth() + 1)).slice(-2);
                                                        let date = ('00' + String(today.getDate())).slice(-2);
                                                        let hour = ('00' + String(today.getHours())).slice(-2);
                                                        let minute = ('00' + String(today.getMinutes())).slice(-2);
                                                        let seconds = ('00' + String(today.getSeconds())).slice(-2);
                                                        // 出力
                                                        let zipFileName = year + '_' + month + '_' + date + '_' + hour + '_' + minute + '_' + seconds + '.zip';
                                                        saveAs(content, zipFileName);
                                                    }
                                                }
                                                // }).done(function () {
                                            })
                                            .then(function () {
                                                // 帳票出力状態保存
                                                $.when(createParam(currentRecord, arr_check)).then(function (body) {
                                                    thenable.putRecord(body);
                                                });
                                            })
                                            .done(function () {
                                                $('.popup').css('display', 'none');
                                                excelReport.EMCloud_spinner.hideSpinner();
                                            })
                                            .fail(function (err) {
                                                excelReport.EMCloud_spinner.hideSpinner();
                                                window.emxas_logmanager.handleError(err);
                                            });
                                    });
                                }
                            })
                            .fail(function (err) {
                                excelReport.EMCloud_spinner.hideSpinner();
                                window.emxas_logmanager.handleError(err);
                            });
                    }
                });
            });
        } catch (error) {
            window.emxas_logmanager.handleError(error);
        }
    }

    /**
     * kintoneイベント
     * 一覧画面表示
     */
    kintone.events.on(['app.record.index.show'], function (e) {
        try {
            excelReport.EMCloud_spinner.showSpinner();
            let thisQuery = kintone.app.getQueryCondition();

            const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
            // config = { conf: {} };
            config = JSON.parse(CONFIG.conf);

            // 帳票出力ボタン表示制御
            if (e.viewId === Number(config.displayList) || e.viewName === config.displayList) {
                // 帳票出力ボタン作成・配置
                let outputButton = document.createElement('button');
                $(outputButton).prop({
                    id: 'outputButton',
                    class: 'kintoneplugin-button-dialog-ok',
                    textContent: '帳票出力',
                });
                kintone.app.getHeaderMenuSpaceElement().appendChild(outputButton);
            }

            var thenable = new $.KintoneThenable(); //API用
            var temp_appId = config.app_templateFile.appId;
            var temp_reportName = config.app_templateFile.fieldCode.reportName;
            var temp_templateFile = config.app_templateFile.fieldCode.templateFile;
            var temp_recordIds = config.dispTemplateList;
            let temp_recordQuery;
            for (let i = 0; i < temp_recordIds.length; i++) {
                if (!temp_recordQuery) {
                    temp_recordQuery = 'テンプレートID =' + '"' + temp_recordIds[i] + '"';
                } else {
                    temp_recordQuery += ' or テンプレートID =' + '"' + temp_recordIds[i] + '"';
                }
            }

            let tempGetBody = {
                app: temp_appId,
                condition: temp_reportName + ' != "" and (' + temp_recordQuery + ')',
                fields: ['$id', temp_reportName, temp_templateFile],
            };

            let thisAppGetBody = {
                app: kintone.app.getId(),
                condition: thisQuery,
            };

            $.when(thenable.getRecords(tempGetBody), thenable.getRecords(thisAppGetBody))
                .then(function (resp_tempRecords, resp_appRecords) {
                    var menu = createIndexPopup(config, resp_tempRecords, resp_appRecords);
                    $('.body-top').append(menu);

                    $('#outputButton').on('click', function () {
                        $('.popup').css('display', 'block');

                        $('#close').on('click', function () {
                            $('.popup').css('display', 'none');
                        });
                    });

                    indexOutput(thisAppGetBody, config); //DOMイベント設定
                    return e;
                })
                .fail(function (err) {
                    excelReport.EMCloud_spinner.hideSpinner();
                    window.emxas_logmanager.handleError(err);
                });
        } catch (error) {
            excelReport.EMCloud_spinner.hideSpinner();
            window.emxas_logmanager.handleError(error);
        }
        excelReport.EMCloud_spinner.hideSpinner();
    });

    /**
     * セッション用イベント
     */
    window.onbeforeunload = function () {
        SESSION.get() ? SESSION.remove() : '';
    };
})(kintone.$PLUGIN_ID, jQuery);
