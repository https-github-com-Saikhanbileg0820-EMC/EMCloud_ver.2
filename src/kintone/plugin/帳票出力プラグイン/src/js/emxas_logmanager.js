/**
 * @fileoverview ログマネージャー
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
jQuery.noConflict();
(function ($) {
    "use strict";
    function handleError(e) {
        var errMsg = "【エラーが発生しました】\n";
        var log_post_body = {
            "app": "",
            "record": {
                "アプリID": {
                    "value": kintone.app.getId()
                }
            }
        }

        if (kintone.app.record.getId()) {
            log_post_body["record"]["レコードID"] = { "value": kintone.app.record.getId() }
        }

        if (e.target && e.target.response) {
            errMsg += "メッセージ：" + e.target.response + "\n";
            if (e.target.status && e.target.statusText) {
                var response = "レスポンス：【" + e.target.status + "】" + e.target.statusText + "\n";
                log_post_body["record"]["レスポンスステータス"] = { "value": response };
            }
        } else if (e.message) {
            errMsg += "メッセージ：" + e.message + "\n";
            if (e.errors) {
                var messages = "";
                Object.keys(e.errors).forEach(function (key) {
                    if (e.errors[key]["messages"]) {
                        e.errors[key]["messages"].forEach(function (message) {
                            messages += "{コード：" + key + "\nメッセージ：" + message + "}\n";
                        })
                    }
                })
                errMsg += messages;
            }
        } else if (e.results) {
            e.results.forEach(function (err, index) {
                if (Object.keys(err).length && err.message) {
                    errMsg += index + "." + err.message + "\n";
                }
            });
        } else {
            errMsg += e;
        }
        log_post_body["record"]["出力メッセージ"] = { "value": errMsg };

        if (e.type) {
            errMsg += "イベント：" + e.type + "\n";
            log_post_body["record"]["イベント"] = { "value": e.type };
        }

        if (e.name) {
            errMsg += "エラータイプ：" + e.name + "\n";
            log_post_body["record"]["エラータイプ"] = { "value": e.name };
        }

        if (e.fileName && e.lineNumber) {
            errMsg += "ファイル名：" + e.fileName + "、 行番号：" + e.lineNumber + "\n";
            log_post_body["record"]["ファイル名"] = { "value": e.fileName };
            log_post_body["record"]["行番号"] = { "value": e.lineNumber }
        }
        if (e.stack) {
            errMsg += "---- スタックトレース： ----\n";
            errMsg += e.stack + "\n";
            errMsg += "---------------------------\n";
            log_post_body["record"]["スタックトレース"] = { "value": e.stack };
        } else {
            var trace = (new Error('Trace')).stack;
            errMsg += "---- スタックトレース： ----\n";
            errMsg += trace + "\n";
            errMsg += "---------------------------\n";
            log_post_body["record"]["スタックトレース"] = { "value": trace };
        }

        // エラーログをログ保存アプリに登録
        kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { "id": kintone.app.getId() })
            .then(function (resp) {
                return window.EMCloud_const.getAppsID(resp.spaceId) //EMクラウドの各アプリID取得
            }).then(function (appIds) {
                log_post_body["app"] = appIds["EMCsaveLog"];
                return kintone.api(kintone.api.url('/k/v1/record', true), 'POST', log_post_body)
            }).then(function (resp) {
                console.error(errMsg);
                console.log("エラーログを出力しました。\n出力先アプリID：" + log_post_body["app"]);
                alert("エラーが発生しました。アプリ管理者に問い合わせて下さい。");
            }).catch(function (error) {
                console.error(errMsg);
                console.log(error);
                alert("エラーが発生しました。アプリ管理者に問い合わせて下さい。\nエラーログの出力に失敗しました。");
            })
    }
    
    window.emxas_logmanager = window.emxas_logmanager || {};
    window.emxas_logmanager.handleError = handleError;
})(jQuery);
