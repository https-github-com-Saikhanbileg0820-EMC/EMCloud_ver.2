/**
 * @fileoverview 帳票出力 設定画面用
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
 *             appCode: "",
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
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
jQuery.noConflict();
(function (PLUGIN_ID, $) {
    'use strict';

    /**
     * 設定値復元
     * @param {Object} config 設定値
     */
    function setRestoreConfig(config) {
        $('#plugin_use').prop('checked', config.conf.pluginUse);
        $('#checkStatusHold').prop('checked', config.conf.checkStatusHold);
        $('#primaryKey_select').val(config.conf.primaryKey);
        $('#app_templateFile_select').val(config.conf.app_templateFile.appId).trigger('change', [config]);
        getRestoreConfigAppIds(config);

        //帳票出力メニュー
        let trElements = [];
        config.conf.exportMenu.forEach(function (menu, count) {
            var _clone = $('#tbody_menuConfig > tr:first').clone(true);
            var radioName = uniqueId();
            Array.prototype.forEach.call(_clone.find("input[class='radio_exportBtn_dispFlg']"), function (radio) {
                $(radio).attr('name', 'radio_exportBtn_dispFlg_' + radioName);
            });
            _clone.find("td[class='standard_first_column']").text(count + 1);
            _clone.find('select.spaceId_select').val(menu['spaceId']);
            _clone.find("input[class='input_menuTitle']").val(menu['menuTitle'] ? menu['menuTitle'] : '');
            var checked = menu['exportBtn_dispFlg'] ? 0 : 1;
            _clone.find("input[class='radio_exportBtn_dispFlg']").eq(checked).prop('checked', true);
            _clone
                .find("input[class='radio_exportBtn_dispFlg']")
                .find("[value='" + menu['exportBtn_dispFlg'] + "']")
                .prop('checked', true);
            _clone.find('select.saveFieldCode_select').val(menu['saveFieldCode'] ? menu['saveFieldCode'] : 'default');
            if (count > 0) _clone.find('.standard_delete_row').removeClass('hidden');
            trElements.push(_clone);
        });

        $('#tbody_menuConfig').empty();

        for (let i = 0; i < trElements.length; i++) {
            $('#tbody_menuConfig').append(trElements[i]);
        }

        $('#selectDisplay').val(config.conf.displayList);
    }

    /**
     * アプリID設定子画面　設定値復元
     * @param {Object} config 設定値
     */
    function getRestoreConfigAppIds(config) {
        //アプリID設定子画面
        var flgment = document.createDocumentFragment();
        var conf_apps = config.conf.app_reportKey.getAppsId;

        Object.keys(conf_apps).forEach(async function (appName, indexNum) {
            //雛形行コピー
            var _clone = $('#appId_fix_tbody > tr:first')[0].cloneNode(true);

            //主要項目
            // _clone.querySelector("td[class='td_key_appName']").textContent = appName;

            //2022-10-11 改修
            const appIdOptions = _clone.querySelector("select[class='input_key_appId']").children;
            let optionIndex = 0;
            Array.prototype.forEach.call(appIdOptions, (option, index) => {
                if (option.textContent === appName) {
                    optionIndex = index;
                }
            });
            _clone.querySelector("td[class='standard_first_column']").textContent = indexNum + 1;
            _clone.querySelector("select[class='input_key_appId']").selectedIndex = optionIndex;
            // _clone.querySelector("select[class='input_key_appId']").selectedIndex = conf_apps[appName]['appId']; //2022-10-11 改修
            _clone.querySelector("input[class='inputAppId']").value = conf_apps[appName]['appId'];
            _clone.querySelector("td[class='td_symbol']").textContent = conf_apps[appName]['conditions'] ? conf_apps[appName]['conditions']['symbol'] : '';
            _clone.querySelector("input[class='input_conditions']").value = conf_apps[appName]['conditions'] ? conf_apps[appName]['conditions']['keyValue'] : '';
            flgment.appendChild(_clone);
        });
        $('#appId_fix_tbody').empty().append(flgment);

        //アプリ毎キーフィールド設定
        Array.prototype.forEach.call($('span.btn_fieldGet'), function (btn) {
            $(btn).trigger('click', [config]);
        });
    }

    /**
     * テーブル入力値(アプリ名⇔アプリID⇔関連キー)を行ごとに取得
     * @return {Object} アプリID設定子画面設定値
     */
    function getAppNameIdValue() {
        var setting_obj = {};
        $('#appId_fix_tbody')
            .children('tr')
            .each(async function (i, elm) {
                var appName = $(elm).find("select[class='input_key_appId'] option:selected").text(); //2022-10-12 改修
                //2022-10-11 改修
                setting_obj[appName] = {
                    appId: $(elm).find("select[class='input_key_appId']").val(), //2022-10-11 改修
                    appCode: $(elm).find("select[class='input_key_appId'] option:selected").text(), //2022-10-11 改修
                    keyFieldCode: $(elm).find('select.apps_primaryKey_select').val(),
                };
                if ($(elm).find('input.input_conditions').val().match(/\S/g)) {
                    setting_obj[appName].conditions = {
                        symbol: $(elm).find('td.td_symbol').text(),
                        keyValue: $(elm).find('input.input_conditions').val(),
                    };
                }
            });
        return setting_obj;
    }

    /**
     * 入力チェック
     * @return {Number} errorCount 発生エラー数
     */
    function checkInput() {
        $('.standard_error').remove(); //過去のエラーを削除

        if (!$('#plugin_use').prop('checked')) {
            return 0;
        }

        var errorCount = 0;
        var error_requiredSelect = $('<div class="standard_error">必須選択項目です。</div>');
        var error_requiredInput = $('<div class="standard_error">必須入力項目です。</div>');
        var error_blankAppId = $('<div class="standard_error">アプリIDが未入力のアプリ名があります。</div>');
        var error_requiredSelect_app = $('<div class="standard_error">関連キーが未選択のアプリがあります。</div>');
        var errorFrameTop = $('<div class="standard_error top">エラー。 </div>');

        if ($('#primaryKey_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#primaryKey_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#app_templateFile_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#app_templateFile_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#reportName_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#reportName_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#tempFile_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#tempFile_select').parent().after(errFrame);
            errorCount++;
        }

        if (!$('#template_options').find("input[type='checkbox']:checked").length) {
            var errFrame = $(error_requiredInput).clone();
            $('#template_options').parent().after(errFrame);
            errorCount++;
        }

        if ($('#app_reportKey_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#app_reportKey_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#outputClass_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#outputClass_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#appName_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#appName_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#fieldCode_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#fieldCode_select').parent().after(errFrame);
            errorCount++;
        }

        if ($('#openFieldName_select').val() === 'default') {
            var errFrame = $(error_requiredSelect).clone();
            $('#openFieldName_select').parent().after(errFrame);
            errorCount++;
        }

        //2022-10-19 改修
        // if ($('#selectDisplay').val() === 'default') {
        //     var errFrame = $(error_requiredSelect).clone();
        //     $('#selectDisplay').parent().after(errFrame);
        //     errorCount++;
        // }

        Array.prototype.forEach.call($('#tbody_menuConfig').find('tr'), function (tr) {
            var select = $(tr).find('.saveFieldCode_select');
            if ($(select).val() === 'default') {
                var errFrame = $(error_requiredSelect).clone();
                $(select).parent().parent().after(errFrame);
                errorCount++;
            }
        });

        Array.prototype.forEach.call($('#tbody_menuConfig').find('.spaceId_select'), function (spaceSelect) {
            if ($(spaceSelect).val() === 'default') {
                var errFrame = $(error_requiredSelect).clone();
                $(spaceSelect).parent().parent().after(errFrame);
                errorCount++;
            }
        });

        //アプリID設定子画面
        var appNameBlank = false;
        var primaryKeyBlank = false;
        var trs_appConf = $('#appId_fix_tbody　> tr');
        for (let i = 0; i < Object.keys(trs_appConf).length; i++) {
            if (!appNameBlank && trs_appConf.eq(i).find("select[class='input_key_appId']").val() === '') {
                //2022-10-11 改修
                var errFrame = $(error_blankAppId).clone();
                $('#open_appId_config').after(errFrame);
                errorCount++;
                appNameBlank = true;
            }
            if (!primaryKeyBlank && trs_appConf.eq(i).find('select.apps_primaryKey_select').val() === '') {
                var errFrame = $(error_requiredSelect_app).clone();
                $('#open_appId_config').after(errFrame);
                errorCount++;
                primaryKeyBlank = true;
            }
            if (appNameBlank && primaryKeyBlank) {
                break;
            }
        }

        if (errorCount) {
            $('body').prepend(errorFrameTop);
        }
        return errorCount;
    }

    /**
     * アプリ選択セレクトボックス作成
     * @param {Object} appsResp アプリリスト
     * @return {DocumentFragment} 作成したセレボ選択肢
     */
    function createAppsSelectBox(appsResp) {
        var fragment = document.createDocumentFragment();
        appsResp.forEach(function (app) {
            var option = document.createElement('option');
            var selectName = document.createTextNode(app['name'] + '【' + app['appId'] + '】');
            option.setAttribute('value', app['appId']);
            option.appendChild(selectName);
            fragment.appendChild(option);
        });
        return fragment;
    }

    /**
     * サブテーブル列内セレクトボックス作成
     * @param {Object} formFields アプリのフォームフィールド or レイアウト
     * @param {Array} type 選択肢に加えるフィールドのタイプ
     * @return {DocumentFragment} fragment セレボ選択肢
     */
    function getSelectBox_subtable_column(formFields, type) {
        var fragment = document.createDocumentFragment();
        var option = document.createElement('option');
        var str = document.createTextNode('選択してください。');
        option.appendChild(str);
        option.setAttribute('value', 'default');
        fragment.appendChild(option);

        getField_type(formFields, type).forEach(function (field) {
            var idCode = field.code ? field.code : field.elementId ? field.elementId : '';
            var label = field.label ? field.label : '';
            var option = document.createElement('option');
            var textNode = document.createTextNode(idCode + '【' + label + '】');
            option.setAttribute('value', idCode);
            option.setAttribute('data-type', field.type);
            option.appendChild(textNode);
            fragment.appendChild(option);
        });

        return fragment;
    }

    /**
     * 指定フィールド取得
     * @param {Object} forms アプリの全フォームフィールド or レイアウト
     * @param {Array} type 指定フィールドタイプ
     * @returns {Array} arr_resp 指定フィールド取得
     */
    function getField_type(forms, type) {
        var arr_resp = [];

        if (forms['properties']) {
            for (var key in forms.properties) {
                if (!forms.properties.hasOwnProperty(key)) {
                    continue;
                }
                if (type.indexOf(forms.properties[key].type) >= 0) {
                    arr_resp.push(forms.properties[key]);
                }
            }
        } else if (forms['layout']) {
            forms.layout.forEach(function (form) {
                switch (form.type) {
                    case 'ROW':
                        form.fields.forEach(function (row) {
                            if (row.type === type) {
                                arr_resp.push(row);
                            }
                        });
                        break;
                    case 'GROUP':
                        form.layout.forEach(function (groups) {
                            groups.fields.forEach(function (group) {
                                if (group.type === type) {
                                    arr_resp.push(group);
                                }
                            });
                        });
                        break;
                    //サブテーブルの中は今回見る必要ないので省略
                    default:
                        break;
                }
            });
        }
        return arr_resp;
    }

    /**
     * テンプレート（.xlsx）選択作成
     * @param {Array} fileResp テンプレファイルリスト
     */
    function createTemplateMultiSelect(fileResp) {
        var fragment = document.createDocumentFragment();
        for (let i = 0; i < fileResp.length; i++) {
            var li = document.createElement('li');
            var label = document.createElement('label');
            var check = document.createElement('input');
            check.setAttribute('type', 'checkbox');
            check.setAttribute('value', fileResp[i]['recordId']);
            label.appendChild(document.createTextNode(fileResp[i]['reportName'] + '【' + fileResp[i]['fileName'] + '】'));
            label.appendChild(check);
            li.appendChild(label);
            fragment.appendChild(li);
        }
        $('#template_options').append(fragment);
    }

    /**
     * 配列から重複削除
     * @param {Array} orgArray 配列
     * @return {Array} 重複排除後の配列
     */
    function arr_unique(orgArray) {
        var storage = {};
        var uniqueArray = [];
        var i, value;

        for (i = 0; i < orgArray.length; i++) {
            value = orgArray[i];
            if (!(value in storage)) {
                storage[value] = true;
                uniqueArray.push(value);
            }
        }
        return uniqueArray;
    }
    /**
     * アプリID設定子画面作成
     * @param {Object} config 設定値
     */
    function createAppIdConfPopup(config) {
        var d = new $.Deferred();

        //雛形行コピー
        var clone = $('#appId_fix_tbody > tr:first').clone(true);

        //テーブルリセット
        $('#appId_fix_tbody').empty();
        var flgment = document.createDocumentFragment();
        var reportKeyAppId = $('#app_reportKey_select').val();
        var appNameField = $('#appName_select').val();

        var thenable = new $.KintoneThenable();
        thenable
            .getRecords({ app: reportKeyAppId, fields: [appNameField] })
            .then(function (resp) {
                var arrAppName = [];
                resp.forEach(function (record) {
                    if (record[appNameField].value) {
                        arrAppName.push(record[appNameField].value);
                    }
                });
                arrAppName = arr_unique(arrAppName);

                //アプリ名一覧テーブル作成
                var count = 1;
                arrAppName.forEach(function (name) {
                    //主要項目
                    var _clone = clone.clone(true);
                    _clone.find("td[class='standard_first_column']").text(count);
                    // _clone.find("td[class='td_key_appName']").text(name);
                    _clone.find("select[class='input_key_appId']").val('');
                    $(flgment).append(_clone);
                    count++;
                });
                $('#appId_fix_tbody').append(flgment);
                if (config) {
                    getRestoreConfigAppIds(config);
                } //初期表示の場合、アプリID設定値復元

                d.resolve();
            })
            .fail(function (error) {
                d.reject(error);
            });
        return d.promise();
    }

    /**
     * セレクトボックスの選択肢をデフォルトに設定
     * @param {htmlColection} selector
     */
    function setDefaultSelectBox(selector) {
        $(selector).empty();
        $(selector).append($('<option value="default">選択してください。</option>'));
    }

    /**
     * ユニークIDを生成
     * @param {number} digits 末尾に付与する乱数の桁
     * @return {string} 生成したユニークIDを返す
     */
    var uniqueId = function (digits) {
        var strong = typeof digits !== 'undefined' ? digits : 1000;
        return Date.now().toString(16) + Math.floor(strong * Math.random()).toString(16);
    };

    //2022-10-11追記
    /**
     * 関連キー設定のアプリ選択一覧の項目を生成する関数
     * @returns {string} 選択肢（option）のHTML文字列
     */
    async function createAppOptions() {
        /* スペース内のアプリ一覧取得 */
        const appInfoResp = await kintone.api(kintone.api.url('/k/v1/app.json', true), 'GET', { id: kintone.app.getId() });
        const spaceId = appInfoResp.spaceId;
        const spaceInfoResp = await kintone.api(kintone.api.url('/k/v1/space.json', true), 'GET', { id: spaceId });
        const spaceAppList = spaceInfoResp.attachedApps;
        //扱いやすいように必要情報を成形
        const spaceAppsAry = [];
        spaceAppList.forEach((app) => {
            spaceAppsAry.push({
                id: app.appId,
                name: app.name,
            });
        });

        /* optionの生成 */
        let optionHTML = '';
        spaceAppsAry.forEach((app) => {
            optionHTML += `<option value=${app.id}>${app.name}</option>`;
        });
        return optionHTML;
    }

    /**
     * DOMイベント
     * @param {Object} config プラグイン設定値
     * @param {Object} layout アプリのフォームレイアウト
     * @param {Object} form アプリのフォームフィールド
     */
    function setEvent(config, layout, form, views) {
        try {
            //行番号+ラジオネーム再設定
            var rowNumReOrder = function (elem) {
                $(elem)
                    .find('.standard_first_column')
                    .each(function (i, elm) {
                        elm.textContent = i + 1;
                    });
            };
            /**
             * テンプレ複数選択スペース作成用のデータ生成
             * @param {Object} records テンプレデータ
             * @param {Object} config 設定値
             */
            var pre_templateMultiSelect = function (records, config) {
                var arr_fileInfo = [];
                records.forEach(function (rec) {
                    var tempFile = config ? rec[config.conf.app_templateFile.fieldCode.templateFile] : rec[$('#tempFile_select').val()];

                    if (tempFile.value.length === 1 && tempFile.value[0]['contentType'] === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                        arr_fileInfo.push({
                            recordId: rec['テンプレートID'].value,
                            reportName: config ? rec[config.conf.app_templateFile.fieldCode.reportName].value : rec[$('#reportName_select').val()].value,
                            fileName: config ? tempFile.value[0]['name'] : tempFile.value[0]['name'],
                        });
                    }
                });
                createTemplateMultiSelect(arr_fileInfo);
            };

            /**
             * 設定取得
             * @param {Object} config 旧設定値
             * @return {Object} 新設定値
             */
            function getConfig(config) {
                var conf = {}; //設定全体格納
                conf.dispTemplateList = [];
                //保存処理開始
                conf.pluginUse = $('#plugin_use').prop('checked'); //プラグイン使用有無
                conf.checkStatusHold = $('#checkStatusHold').prop('checked');
                conf.primaryKey = $('#primaryKey_select').val(); //主キー
                conf.app_templateFile = {
                    //テンプレートファイル格納アプリ設定
                    appId: $('#app_templateFile_select').val(),
                    fieldCode: {
                        reportName: $('#reportName_select').val(),
                        templateFile: $('#tempFile_select').val(),
                    },
                };
                conf.app_reportKey = {
                    //帳票出力用キー格納アプリ
                    appId: $('#app_reportKey_select').val(),
                    fieldCode: {
                        outputClass: $('#outputClass_select').val(),
                        appName: $('#appName_select').val(),
                        kintoneFieldCode: $('#fieldCode_select').val(),
                        outsidefieldname: $('#openFieldName_select').val(),
                    },
                    getAppsId: {},
                };
                conf.app_reportKey.getAppsId = getAppNameIdValue(); //アプリ名⇔アプリID⇔関連キー
                //帳票出力リスト選択
                var templates = $('#template_options').find("input[type='checkbox']:checked");
                Array.prototype.forEach.call(templates, function (temp) {
                    conf.dispTemplateList.push(temp.value);
                });
                //帳票出力メニュー設定
                var arr_exportMenu = [];
                Array.prototype.forEach.call($('#tbody_menuConfig > tr'), function (tr) {
                    tr = $(tr);
                    var obj = {};
                    obj.spaceId = tr.find('select.spaceId_select').val();
                    obj.menuTitle = !tr.find("input[class='input_menuTitle']").val() ? '帳票一覧' : tr.find("input[class='input_menuTitle']").val();
                    Array.prototype.some.call(tr.find("input[class='radio_exportBtn_dispFlg']"), function (radio) {
                        if ($(radio).prop('checked')) {
                            obj.exportBtn_dispFlg = $(radio).val() === 'true' ? true : false;
                            return true;
                        }
                    });
                    if (tr.find('select.saveFieldCode_select').val() !== 'default') obj.saveFieldCode = tr.find('select.saveFieldCode_select').val();
                    arr_exportMenu.push(obj);
                });
                conf.exportMenu = arr_exportMenu;
                if ($('#selectDisplay').val() !== 'default') {
                    conf.displayList = $('#selectDisplay').val();
                }

                //設定登録
                config.conf = JSON.stringify(conf);
                return config;
            }

            /**
             * 設定IMPORT/EXPORT
             * @param {Object} 設定値
             */
            (function (config) {
                /**
                 * オリジナルをutfに変換
                 * @param {Array} strArray 設定値の配列
                 * @param {} originalEncoding
                 * @return {}
                 */
                let buttonDisplay = function (views) {
                    console.log(views);
                    let listKeys = Object.keys(views.views);
                    for (const listName of listKeys) {
                        if (views.views[listName].type !== 'LIST') {
                            continue;
                        }
                        $('<option>', {
                            text: listName,
                            id: 'listName_id',
                            value: views.views[listName].id,
                        }).appendTo('#selectDisplay');
                    }
                    $('<option>', {
                        text: '（すべて）',
                        id: 'listName_id',
                        value: '（すべて）',
                    }).appendTo('#selectDisplay');
                };
                buttonDisplay(views);

                var changeToUTF = function (strArray, originalEncoding) {
                    for (var i = 0, len = strArray.length; i < len; i++) {
                        var binaryCode = Encoding.stringToCode(strArray[i]); //空文字が紛れ込む
                        strArray[i] = Encoding.convert(binaryCode, {
                            to: 'UNICODE',
                            from: originalEncoding,
                            type: 'string',
                        });
                    }
                    return strArray;
                };
                /*EXPORT*/
                $(document)
                    .find('#export_settings')
                    .on('click', function () {
                        var text = JSON.stringify(getConfig(config));
                        var a = document.createElement('a');
                        a.textContent = 'export';
                        a.download = 'config_plugin_excelReportOutput.json';
                        a.href = window.URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
                        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
                        a.click();
                    });
                /**
                 * IMPORT
                 * @param {Element} イベント発生要素
                 */
                $(document)
                    .find('#import_settings')
                    .on('change', function (element) {
                        if (!confirm('設定を取込します。\n')) {
                            $('#import_settings').val('');
                            return;
                        }
                        var file = element.target.files[0];
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(file);
                        reader.addEventListener('load', function (e) {
                            var originalBinary = new Uint8Array(e.target.result); //原本バイナリ配列
                            var originalEncoding = Encoding.detect(originalBinary); //原本文字種
                            var originalStr = Encoding.codeToString(originalBinary); //バイナリから原本復元
                            var textUTF = changeToUTF([originalStr], originalEncoding); //UTFに変更
                            var config = {};
                            if (textUTF + '') {
                                config.conf = JSON.parse(JSON.parse(textUTF[0]).conf);
                                setRestoreConfig(config);
                            }

                            $('#import_settings').val('');

                            window.setTimeout(function () {
                                alert('設定の読込が完了しました。');
                            }, 6000);
                        });
                    });
            })(config);

            /*行ADD*/
            $(document).on('click', '.standard_add_row', function () {
                excelReport.EMCloud_spinner.showSpinner();

                var row = $(this).parent().parent().clone(true);
                //行初期化
                row.find('select.spaceId_select').empty().append(getSelectBox_subtable_column(layout, 'SPACER'));
                row.find('select.saveFieldCode_select').empty().append(getSelectBox_subtable_column(form, 'SINGLE_LINE_TEXT'));
                row.find("input[class='input_menuTitle']").val('');

                //ラジオボタンname付け
                var radioName = uniqueId();
                Array.prototype.forEach.call(row.find("input[class='radio_exportBtn_dispFlg']"), function (radio) {
                    $(radio).attr('name', 'radio_exportBtn_dispFlg_' + radioName);
                });
                row.find("input[class='radio_exportBtn_dispFlg']").eq(0).prop('checked', true);
                row.find('.standard_delete_row').removeClass('hidden');
                $('#tbody_menuConfig').append(row);
                rowNumReOrder($('#tbody_menuConfig'));

                excelReport.EMCloud_spinner.hideSpinner();
            });
            /*行DELETE*/
            $(document).on('click', '.standard_delete_row', function () {
                excelReport.EMCloud_spinner.showSpinner();

                var row = $(this).parent().parent();
                row.remove();
                if ($('#tbody_menuConfig').children().length === 1) {
                    //1行しかない場合は、行削除ボタンを表示しない
                    $('#tbody_menuConfig').children().find('.standard_delete_row').addClass('hidden');
                }
                rowNumReOrder($('#tbody_menuConfig'));

                excelReport.EMCloud_spinner.hideSpinner();
            });

            /**
             * テンプレート保存アプリセレボ
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#app_templateFile_select').on('change', function (event, config) {
                excelReport.EMCloud_spinner.showSpinner();

                $('#template_options').empty();

                if ($('#app_templateFile_select').val() === 'default') {
                    setDefaultSelectBox('#reportName_select');
                    setDefaultSelectBox('#tempFile_select');
                    return;
                }

                var thenable = new $.KintoneThenable();

                $.when(thenable.getFormFields($(this).val()))
                    .then(function (formFields) {
                        var colReportName = getSelectBox_subtable_column(formFields, 'SINGLE_LINE_TEXT');
                        var colTempFile = getSelectBox_subtable_column(formFields, 'FILE');
                        $(document).find('#reportName_select').empty().append(colReportName);
                        $(document).find('#tempFile_select').empty().append(colTempFile);
                        // 帳票名、テンプレートファイルセレボ 設定
                        if (config) {
                            $('#reportName_select').val(config.conf.app_templateFile.fieldCode.reportName);
                            $('#tempFile_select').val(config.conf.app_templateFile.fieldCode.templateFile);
                            $('#btn_templateDisplay').trigger('click', config);
                        }
                        excelReport.EMCloud_spinner.hideSpinner();
                    })
                    .fail(function (error) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        window.emxas_logmanager.handleError(error);
                    });
            });

            /**
             * 帳票名フィールドセレボ変更
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#reportName_select').on('change', function (event, config) {
                $('#template_options').empty();
            });

            /**
             * テンプレートファイルフィールドセレボ変更
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#tempFile_select').on('change', function (event, config) {
                $('#template_options').empty();
            });

            /**
             * 全テンプレートを表示ボタン押下
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#btn_templateDisplay').on('click', function (event, config) {
                excelReport.EMCloud_spinner.showSpinner();

                if ($('#reportName_select').val() === 'default' || $('#tempFile_select').val() === 'default') {
                    alert('帳票名フィールドとテンプレートフィールドを選択してください。');
                    excelReport.EMCloud_spinner.hideSpinner();
                    return;
                }

                $('#template_options').empty();

                var thenable = new $.KintoneThenable();
                thenable
                    .getRecords({ app: $('#app_templateFile_select').val(), condition: $('#reportName_select').val() + ' != ""' })
                    .then(function (records) {
                        pre_templateMultiSelect(records);

                        if (!config) {
                            excelReport.EMCloud_spinner.hideSpinner();
                            return;
                        }

                        //設定値復元
                        Array.prototype.forEach.call($('#template_options').find('input'), function (checkBox) {
                            config.conf.dispTemplateList.some(function (val) {
                                if (checkBox.value === val) {
                                    checkBox.checked = true;
                                    return true;
                                }
                            });
                        });
                        excelReport.EMCloud_spinner.hideSpinner();
                    })
                    .fail(function (error) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        window.emxas_logmanager.handleError(error);
                    });
            });

            /**
             * 帳票用キー情報格納アプリセレボ変更
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#app_reportKey_select').on('change', function (event, config) {
                excelReport.EMCloud_spinner.showSpinner();

                if ($('.input_key_appId').length >= 2) {
                    if (!confirm('保存した「アプリID設定情報」は破棄されます。よろしいですか？')) {
                        excelReport.EMCloud_spinner.hideSpinner();
                        return;
                    }
                }
                var _clone = $('#appId_fix_tbody > tr:first').clone(true);
                $('#appId_fix_tbody').empty();
                $('#appId_fix_tbody').append(_clone);

                if ($('#app_reportKey_select').val() === 'default') {
                    setDefaultSelectBox('#outputClass_select');
                    setDefaultSelectBox('#appName_select');
                    setDefaultSelectBox('#fieldCode_select');
                    setDefaultSelectBox('#openFieldName_select');

                    excelReport.EMCloud_spinner.hideSpinner();
                    return;
                }
                var thenable = new $.KintoneThenable();
                thenable
                    .getFormFields($(this).val())
                    .then(function (formFields) {
                        var colOutputClass = getSelectBox_subtable_column(formFields, 'DROP_DOWN');
                        var colAppName = getSelectBox_subtable_column(formFields, 'SINGLE_LINE_TEXT');
                        var colFieldCode = getSelectBox_subtable_column(formFields, 'SINGLE_LINE_TEXT');
                        var colOpenFieldName = getSelectBox_subtable_column(formFields, 'SINGLE_LINE_TEXT');
                        $(document).find('#outputClass_select').empty().append(colOutputClass);
                        $(document).find('#appName_select').empty().append(colAppName);
                        $(document).find('#fieldCode_select').empty().append(colFieldCode);
                        $(document).find('#openFieldName_select').empty().append(colOpenFieldName);
                        //各セレボ値設定
                        if (config) {
                            $('#outputClass_select').val(config.conf.app_reportKey.fieldCode.outputClass);
                            $('#appName_select').val(config.conf.app_reportKey.fieldCode.appName).trigger('change', [config]);
                            $('#fieldCode_select').val(config.conf.app_reportKey.fieldCode.kintoneFieldCode);
                            $('#openFieldName_select').val(config.conf.app_reportKey.fieldCode.outsidefieldname);
                        }
                        excelReport.EMCloud_spinner.hideSpinner();
                    })
                    .fail(function (error) {
                        excelReport.EMCloud_spinner.hideSpinner();
                    });
            });

            /**
             * 帳票用キー情報格納アプリ　アプリ名セレボ変更
             * @param {Object} イベント情報
             * @param {Object} 設定値
             */
            $('#appName_select').on('change', function (event, config) {
                excelReport.EMCloud_spinner.showSpinner();

                if ($('.input_key_appId').length >= 2 && $('.input_key_appId').eq(0).val()) {
                    if (!confirm('保存した「アプリID設定情報」は破棄されます。よろしいですか？')) {
                        return;
                    }
                }
                createAppIdConfPopup(config) //アプリID設定子画面再構成
                    .then(excelReport.EMCloud_spinner.hideSpinner());
            });

            /**
             * アプリID設定子画面
             */
            $('#open_appId_config').on('click', async function () {
                if ($('#appName_select').val() === 'default') {
                    alert('No1.アプリ名を選択して下さい。');
                    return;
                }
                //設定画面表示
                var div_entire = document.createElement('div');
                div_entire.setAttribute('id', 'dialog_entire');
                $('body').append(div_entire);

                $('#dialog1').css('display', 'block');

                if (config.conf.app_reportKey) {
                    Array.prototype.forEach.call($('span.btn_fieldGet'), function (btn) {
                        if ($(btn).parent().parent().find("select[class='input_key_appId']").val() !== '') {
                            $(btn).trigger('click', [config]);
                        }
                    });
                }

                if ($('#appId_fix_tbody').children().length === 1) {
                    //1行しかない場合は、行削除ボタンを表示しない
                    $('#appId_fix_tbody').children().find('.childScreenDelete').addClass('hidden');
                } else {
                    $('#appId_fix_tbody').children().find('.childScreenDelete')[0].className += ' hidden';
                }

                //アプリ名に判別用記号が含まれる場合、アラート表示
                var arr_warn_appName = [];
                //2022-10-11 改修
                Array.prototype.forEach.call($('#appId_fix_tbody').find('.input_key_appId'), function (td) {
                    var appName = $(td).text();
                    var chk = arr_reportSymbol.some(function (symbol) {
                        if (appName && appName.indexOf(symbol) !== -1) return true;
                    });
                    if (chk) arr_warn_appName.push(appName);
                });
                if (arr_warn_appName.length) {
                    alert('以下アプリ名に帳票判別用記号(半角)が含まれているため、帳票が正常に出力されない可能性があります。\n' + arr_warn_appName.join('、'));
                }
            });

            /**
             * フィールド取得ボタン
             * @param {Object} event イベント情報
             * @param {Object} config 設定値
             */
            $(document).on('click', '.btn_fieldGet', function (event, config) {
                excelReport.EMCloud_spinner.showSpinner();

                var appId = $(event.target).parent().prev().find('.input_key_appId').val();
                if (!appId) {
                    alert('アプリを選択して下さい。'); //2022-10-11 改修
                    excelReport.EMCloud_spinner.hideSpinner();
                    return;
                }

                //2022-10-11 追記 ここの取得動作をアプリコード→アプリIDに変更
                // const appInfo = await kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: appId });
                // appId = appId + appInfo.spaceId;
                let thisRecord = $(this).parent().parent();
                // var thenable = new $.KintoneThenable();
                // let appCodeName;
                // let appCodeId;
                $.when(kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', { app: appId }))
                    // .then(function (appCode) {
                    //     appCodeId = appCode.apps[0].appId;
                    //     appCodeName = appCode.apps[0].name;
                    //     return thenable.getFormFields(appCodeId);
                    // })
                    .then(function (fields) {
                        var priFieldsArr = ['SINGLE_LINE_TEXT', 'NUMBER', 'DROP_DOWN'];
                        var priKey = getSelectBox_subtable_column(fields, priFieldsArr);
                        $(event.target).parent().siblings().find('.apps_primaryKey_select').empty().append(priKey);

                        // let appNameField = thisRecord.find('.td_key_appName');
                        // appNameField[0].innerHTML = appCodeName;
                        // let appIdField = thisRecord.find('.inputAppId');
                        // appIdField[0].value = appCodeId;

                        //初期表示の場合、設定値復元
                        if (config) {
                            var appname = $(event.target).parent().parent().find('.input_key_appId option:selected').text(); //2022-10-11 改修
                            var fieldCodes = config.conf.app_reportKey.getAppsId[appname]['keyFieldCode'];
                            $(event.target).parent().siblings().find('.apps_primaryKey_select').val(fieldCodes);
                            $(event.target).parent().siblings().find('.apps_primaryKey_select').trigger('change');
                        }
                        excelReport.EMCloud_spinner.hideSpinner();
                    })
                    .fail(function (err) {
                        console.log(err);
                        alert('フィールドの取得時にエラーが発生しました。選択したアプリを確認して下さい。');
                        excelReport.EMCloud_spinner.hideSpinner();
                    });
            });

            //設定子画面内テーブル
            /*行ADD*/
            $(document).on('click', '.childScreenAdd', function () {
                excelReport.EMCloud_spinner.showSpinner();

                var row = $(this).parent().parent().clone(true);
                row.find('.childScreenDelete').removeClass('hidden');

                //2022-10-11追記
                row.find('.input_key_appId').append(`<option value="default">選択してください。</option>`);

                // row.find('.td_key_appName')[0].innerHTML = '';
                let options = row.find('.apps_primaryKey_select').find('option');
                for (let i = 1; i < options.length; i++) {
                    options[i].remove();
                }

                row.find('.input_conditions')[0].value = '';

                $('#appId_fix_tbody').append(row);
                rowNumReOrder($('#appId_fix_tbody'));

                //2022-10-17 追記
                if ($('#appId_fix_tbody').children().length > 1) {
                    //2行以上の場合は、1行目の行削除ボタンを表示
                    $('#appId_fix_tbody').children().find('.childScreenDelete').removeClass('hidden');
                }

                excelReport.EMCloud_spinner.hideSpinner();
            });
            /*行DELETE*/
            $(document).on('click', '.childScreenDelete', function () {
                excelReport.EMCloud_spinner.showSpinner();

                var row = $(this).parent().parent();
                row.remove();
                if ($('#appId_fix_tbody').children().length === 1) {
                    //1行しかない場合は、行削除ボタンを表示しない
                    $('#appId_fix_tbody').children().find('.childScreenDelete').addClass('hidden');
                }
                rowNumReOrder($('#appId_fix_tbody'));

                excelReport.EMCloud_spinner.hideSpinner();
            });

            /**
             * プラグイン実装アプリの主キー設定セレボ
             * @param {Object} event イベント情報
             */
            $(document).on('change', '.apps_primaryKey_select', function (event) {
                var togo = '';
                switch (event.target.selectedOptions[0].getAttribute('data-type')) {
                    case 'SINGLE_LINE_TEXT':
                        togo = '=';
                        break;
                    case 'DROP_DOWN':
                        togo = 'in';
                        break;
                }
                $(event.target.selectedOptions[0].parentNode.parentNode.parentNode.parentNode).find('td.td_symbol').text(togo);
            });

            /**
             * アプリID設定子画面 保存ボタン
             */
            $('#id_savebtn').on('click', function () {
                var err_appId = Array.prototype.some.call($("select[class='input_key_appId']"), function (input) {
                    if (!input.value || input.value === 'default') {
                        //2022-10-11 改修
                        alert('選択されていないアプリ列があります。'); //2022-10-11 改修
                        return true;
                    }
                });
                var err_reqKey = Array.prototype.some.call($('select.apps_primaryKey_select'), function (select) {
                    if (!select.value || select.value === 'default') {
                        //2022-10-11 改修
                        alert('選択されていない関連キー列があります。');
                        return true;
                    }
                });
                if (!err_appId && !err_reqKey) {
                    //設定画面非表示
                    $('#dialog_entire').remove();
                    $('#dialog1').css('display', 'none');
                }
            });

            /**
             * アプリID設定子画面 破棄ボタン
             */
            $('#id_closebtn').on('click', function () {
                if (confirm('設定情報は破棄されます。よろしいですか？')) {
                    Array.prototype.forEach.call($('.input_key_appId'), function (input) {
                        input.value = '';
                    });
                    // Array.prototype.forEach.call($('.td_key_appName'), function (input) {
                    //     input.innerHTML = '';
                    // });
                    Array.prototype.forEach.call($('.td_symbol'), function (input) {
                        input.textContent = '';
                    });
                    Array.prototype.forEach.call($('.input_conditions'), function (input) {
                        input.value = '';
                    });
                    Array.prototype.forEach.call($('.inputAppId'), function (input) {
                        input.value = '';
                    });
                    Array.prototype.forEach.call($('.apps_primaryKey_select'), function (input) {
                        for (let i = input.length - 1; i > 0; i--) {
                            input[i].remove();
                        }
                    });

                    // //設定画面非表示
                    // $('#dialog_entire').remove();
                    // $('#dialog1').css('display', 'none');
                }
            });

            //2022-10-17 追記
            /**
             * アプリID設定子画面 キャンセルボタン
             */
            $('#id_cancelbtn').on('click', function () {
                //設定画面非表示
                $('#dialog_entire').remove();
                $('#dialog1').css('display', 'none');
            });

            /**
             * ヘルプ表示
             */
            $('#btn_help_1').on('click', function () {
                $('#help_1').dialog({
                    modal: false,
                    width: 400,
                    buttons: {
                        閉じる: function () {
                            $(this).dialog('close');
                        },
                    },
                });
            });
            $('#btn_help_2').on('click', function () {
                $('#help_2').dialog({
                    modal: false,
                    width: 500,
                    buttons: {
                        閉じる: function () {
                            $(this).dialog('close');
                        },
                    },
                });
            });
            $('#btn_help_3').on('click', function () {
                $('#help_3').dialog({
                    modal: false,
                    width: 500,
                    buttons: {
                        閉じる: function () {
                            $(this).dialog('close');
                        },
                    },
                });
            });
            $('#btn_help_4').on('click', function () {
                $('#help_4').dialog({
                    modal: false,
                    width: 500,
                    buttons: {
                        閉じる: function () {
                            $(this).dialog('close');
                        },
                    },
                });
            });

            /**
             * 保存ボタン押下
             */
            $("button[name='save']").on('click', function () {
                //2022-10-18 追記
                let flag1 = true;
                Array.prototype.some.call($("select[class='input_key_appId']"), function (input) {
                    if (flag1 && (!input.value || input.value === 'default')) {
                        //2022-10-11 改修
                        alert('選択されていないアプリ列があります。'); //2022-10-11 改修
                        flag1 = false;
                    }
                });

                let flag2 = true;
                Array.prototype.some.call($('select.apps_primaryKey_select'), function (select) {
                    if (flag2 && (!select.value || select.value === 'default')) {
                        //2022-10-11 改修
                        alert('選択されていない関連キー列があります。');
                        flag2 = false;
                    }
                });

                if (!flag1 || !flag2) {
                    return false;
                }

                if (checkInput(layout.layout)) {
                    return false;
                }
                kintone.plugin.app.setConfig(getConfig(config));
                history.back();
            });
            /**
             * キャンセルボタン押下
             */
            $("button[name='cancel']").on('click', function () {
                history.back();
            });
        } catch (error) {}
    }

    /**
     * メイン関数
     */
    (function () {
        try {
            excelReport.EMCloud_spinner.showSpinner();

            var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
            var config = { conf: {} };
            if (CONFIG && CONFIG.conf) {
                config.conf = JSON.parse(CONFIG.conf);
            }
            window.EMXAS = window.EMXAS || {};

            var spaceApp2, layoutResp2, formResp2, viewsResp2; //2022-10-11 追記
            var thenable = new $.KintoneThenable();
            thenable
                .getAppInfo(kintone.app.getId())
                .then(function (respApp) {
                    return $.when(thenable.getSpaceInfo(respApp['spaceId']), thenable.getFormLayout(kintone.app.getId()), thenable.getFormFields(kintone.app.getId()), thenable.getViews(kintone.app.getId()));
                })
                .then(function (spaceApp, layoutResp, formResp, viewsResp) {
                    //2022-10-11 追記
                    spaceApp2 = spaceApp;
                    layoutResp2 = layoutResp;
                    formResp2 = formResp;
                    viewsResp2 = viewsResp;

                    //主キー選択セレクトボックス作成
                    var priFieldsArr = ['SINGLE_LINE_TEXT', 'NUMBER'];
                    var priKey = getSelectBox_subtable_column(formResp, priFieldsArr);
                    $(document).find('#primaryKey_select').append(priKey);

                    //アプリ選択セレクトボックス作成
                    var appSelect1 = createAppsSelectBox(spaceApp['attachedApps']);
                    var appSelect2 = createAppsSelectBox(spaceApp['attachedApps']);
                    $(document).find('#app_templateFile_select').append(appSelect1);
                    $(document).find('#app_reportKey_select').append(appSelect2);

                    //帳票出力メニュー内のセレクトボックス作成
                    var spacers = getSelectBox_subtable_column(layoutResp, 'SPACER');
                    var saveField = getSelectBox_subtable_column(formResp, 'SINGLE_LINE_TEXT');
                    $('#tbody_menuConfig > tr:last').find('.spaceId_select').append(spacers);
                    $('#tbody_menuConfig > tr:last').find('.saveFieldCode_select').append(saveField);

                    //2022-10-11 追記
                    return createAppOptions();
                })
                .then((appOptions) => {
                    // //テーブルの行追加
                    // const keys = Object.keys(config.conf.app_reportKey.getAppsId);
                    // $('#appId_fix_tbody').children().children();

                    $('.input_key_appId').append(appOptions);
                    // //初期値の設定
                    // keys.forEach((key) => {
                    //     const initialData = config.conf.app_reportKey.getAppsId[key];
                    // });

                    if (config.conf.app_reportKey) {
                        getRestoreConfigAppIds(config);
                    }

                    // createAppIdConfPopup(config);

                    console.log(viewsResp2);
                    //DOMイベント設置
                    setEvent(config, layoutResp2, formResp2, viewsResp2);

                    /*
                    旧バージョン対応
                    ※初版のため無し　20200124
                    */

                    if (Object.keys(config.conf).length !== 0) {
                        setRestoreConfig(config);
                    }
                    excelReport.EMCloud_spinner.hideSpinner();
                })
                .fail(function (error) {
                    excelReport.EMCloud_spinner.hideSpinner();
                });
        } catch (error) {
            excelReport.EMCloud_spinner.hideSpinner();
        }
    })();
})(kintone.$PLUGIN_ID, jQuery);
