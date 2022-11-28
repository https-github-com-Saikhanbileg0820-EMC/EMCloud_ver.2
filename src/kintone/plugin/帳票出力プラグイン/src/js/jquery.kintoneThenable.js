/**
 * @fileoverview jQuery.kintoneThenable
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
(function ($) {
    $.KintoneThenable = function () { };
    /**
     * レコード全件取得
     * @param {Object} param
     *   - app {String}: アプリID（省略時は表示中アプリ）
     *   - condition {String}: 絞り込み条件
     *   - orderBy {String}: ソート条件の配列
     *   - fields {Array}: 取得対象フィールドの配列
     *   - withCursor {Boolean} カーソルAPI利用フラグ
     * @return {Object} response
     *   - records {Array}: 取得レコードの配列 
     */
    $.KintoneThenable.prototype.getRecords = function (param) {
        var d = new $.Deferred();
        // クライアントの作成
		var client = new KintoneRestAPIClient();
		if(!param.withCursor){
			param.withCursor = false;
		}
        client.record.getAllRecords(param).then(function (records) {
            d.resolve(records);
        }).catch(function (err) {
            d.reject(err);
        })
        return d.promise();
    }
    // アプリ情報取得
    $.KintoneThenable.prototype.getAppInfo = function (code) {
        var d = new $.Deferred();
        kintone.api(kintone.api.url('/k/v1/app', true), 'GET', { id: code }, function (r) {
            d.resolve(r);
        }, function (e) {
            window.emxas_logmanager.handleError(e);
            d.reject(e);
        });
        return d.promise();
    };
    // アプリ情報一括取得
    $.KintoneThenable.prototype.getAppsInfo = function (paramApp, paramOffset, paramDef) {
        var d = paramDef || new $.Deferred();
        var app = paramApp || [];
        var offset = paramOffset || 0;

        var body = {
            // offset: offset
            codes: offset
        };

        kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', body, function (resp) {
            app = app.concat(resp['apps']);
            if (resp['apps'].length === 100) {
                $.KintoneThenable.prototype.getAppsInfo(app, offset + resp['apps'].length, d);
            } else {
                var r = { apps: app };
                d.resolve(r);
            }
        }, function (e) {
            window.emxas_logmanager.handleError(e);
            d.reject(e);
        });
        return d.promise();
    };
    // スペース情報取得
    $.KintoneThenable.prototype.getSpaceInfo = function (code) {
        var d = new $.Deferred();
        kintone.api(kintone.api.url('/k/v1/space', true), 'GET', { id: code }, function (resp) {
            d.resolve(resp);
        }, function (err) {
            window.emxas_logmanager.handleError(err);
            d.reject(err);
        });
        return d.promise();
    };
    //組織の所属ユーザー
    $.KintoneThenable.prototype.getOrganizationUsers = function (code) {
        var d = new $.Deferred();
        kintone.api(kintone.api.url('/k/v1/organization/users', true), 'GET', { code: code }, function (resp) {
            d.resolve(resp);
        }, function(error){
            window.emxas_logmanager.handleError(error);
            d.reject(error);
        });
        return d.promise();
    };
    //ユーザー
    $.KintoneThenable.prototype.getUsers = function (_records, _offset, _d) {
        var d = _d || new $.Deferred();
        var records = _records || [];
        var body = {
            offset: _offset || 0,
            size: 100
        };
        kintone.api(kintone.api.url('/v1/users', true), 'GET', body, function (resp) {
            if (resp.users.length === body.size) {
                $.KintoneThenable.prototype.getUsers(records.concat(resp.users), body.offset + body.size, d);
            } else {
                d.resolve({ users: records.concat(resp.users) });
            }
        }, function(error){
            window.emxas_logmanager.handleError(error);
            d.reject(error);
        });
        return d.promise();
    };
    //アプリのレイアウトを取得
    $.KintoneThenable.prototype.getFormLayout = function (appId, isPreview) {
        var d = new $.Deferred();
        var appId = appId || kintone.app.getId();
        var url = (isPreview) ? "/k/v1/preview/app/form/layout" : "/k/v1/app/form/layout";
        kintone.api(kintone.api.url(url, true), "GET", { "app": appId }, function (resp) {
            d.resolve(resp);
        }, function (err) {
            window.emxas_logmanager.handleError(err);
            d.reject(err);
        });
        return d.promise();
    };
    //kintoneの全グループを取得
    $.KintoneThenable.prototype.getGroups = function (allRecords, offset, deferred) {
        var d = deferred || new $.Deferred();
        var _limit = 100;
        var _allRecords = allRecords || [];
        var _offset = offset || 0;
        kintone.api(kintone.api.url('/v1/groups', true), 'GET', {
            limit: _limit,
            offset: _offset
        }, function (resp) {
            var r = resp.groups;
            if (r.length === _limit) {
                $.KintoneThenable.prototype.getGroups(_allRecords.concat(r), _offset + _limit, d);
            } else {
                var obj = { groups: _allRecords.concat(r) }
                d.resolve(obj);
            }
        }, function (err) {
            window.emxas_logmanager.handleError(err);
            d.reject(err);
        });
        return d.promise();
    };
    //アプリの全フィールドを取得
    $.KintoneThenable.prototype.getFormFields = function (appid, lang, isPreview) {
        var deferred = new $.Deferred;
        var lang = lang || "default";
        var url = (isPreview) ? "/k/v1/preview/app/form/fields" : "/k/v1/app/form/fields";
        kintone.api(kintone.api.url(url, true), 'GET', { "app": appid, "lang": lang }, function (resp) {
            deferred.resolve(resp);
        }, function (error) {
            window.emxas_logmanager.handleError(error);
            deferred.reject(error);
        });
        return deferred.promise();
    };
    //アプリ内のスペースフィールドを取得
    $.KintoneThenable.prototype.getSpacers = function (layouts) {
        try {
            var deferred = new $.Deferred();
            var spaces = [];
            for (var ix = 0; ix < layouts.length; ix++) {
                var layout = layouts[ix];
                if (layout.type === 'ROW') {
                    for (var iy = 0; iy < layout.fields.length; iy++) {
                        var field = layout.fields[iy];
                        if (field.type === 'SPACER') {
                            spaces.push(field);
                        }
                    }
                } else if (layout.type === 'GROUP') {
                    var layoutsInGrp = layout.layout;
                    for (var iy = 0; iy < layoutsInGrp.length; iy++) {
                        var layoutInGrp = layoutsInGrp[iy];
                        for (var iz = 0; iz < layoutInGrp.fields.length; iz++) {
                            var fieldInGrp = layoutInGrp.fields[iz];
                            if (fieldInGrp.type === 'SPACER') {
                                spaces.push(fieldInGrp);
                            }
                        }
                    }
                }
            }
            return deferred.resolve(spaces).promise();
        } catch (error) {
            window.emxas_logmanager.handleError(error);
        }
    };
    //レコード更新（1件）
    $.KintoneThenable.prototype.putRecord = function (body) {
        var deferred = new $.Deferred();
        kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function (resp) {
            deferred.resolve(resp);
        }, function (error) {
            window.emxas_logmanager.handleError(error);
            deferred.reject(error);
        });
    };
    // 一覧設定取得
    $.KintoneThenable.prototype.getViews = function (appId) {
        var deferred = new $.Deferred();
        var _appId = appId || kintone.app.getId();
        kintone.api(kintone.api.url("/k/v1/app/views", true), "GET", { "app": _appId }, function (resp) {
            deferred.resolve(resp);
        }, function (e) {
            deferred.reject(e);
        });
        return deferred.promise();
    };

})(jQuery);
