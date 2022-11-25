import CryptoJS from 'crypto-js';
import jQuery from 'jquery';
('use strict');
/**
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
const $ = jQuery.noConflict();
const cookieKey_authResult = 'emc_AuthResult';
const cookie_authPass = 'MxyGuW6-UpPKF5rZtnywwSQ2PUNhXdPTn4UpkXG2';
const MESSAGE = {
    no_keyRecord: 'ライセンスキーが未登録です。システム管理者に問い合わせて下さい。',
    multi_keyRecord: 'ライセンス情報が複数登録されています。システム管理者に問い合わせて下さい。',
    invalid_key: '無効なライセンスキーです。システム管理者に問い合わせて下さい。',
    before_key: 'ライセンスの有効期間前です。',
    expired_key: 'ライセンスの有効期限が切れています。',
    fail_connection: 'HTTP通信に失敗しました。',
};
/**
 * @param {String} pCode
 * @param {String} CheckTarget
 * @param {Boolean} checkFlg
 */
const licenseCheck = function (CheckTarget, pCode, checkFlg) {
    var err_Flg = false;
    var err_obj = {
        emc_error: false,
        message: '',
    };
    var cookieKey = pCode;

    return new kintone.Promise(function (resolve, reject) {
        if (typeof checkFlg === 'undefined' || !checkFlg) {
            return resolve(err_obj);
        }

        var result_cookie = checkCookie(cookieKey);
        // ライセンス認証済み、エラー無しであれば終了
        if (result_cookie['isExist'] && !result_cookie['authError']) {
            return resolve(err_obj);
        } else {
            kintone
                .api(kintone.api.url('/k/v1/app', true), 'GET', { id: kintone.app.getId() })
                .then(function (appInfo) {
                    return EMCloud.modules.getAppsId(appInfo.spaceId);
                })
                .then(function (appIds) {
                    var getKeyBody = {
                        app: appIds['EMCenvironmentMaster'],
                        query: 'licenseKey != ""',
                    };
                    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getKeyBody);
                })
                .then(function (licenseRec) {
                    if (!licenseRec.records.length) {
                        err_Flg = true;
                        return handleLicenseError(CheckTarget, 'no_keyRecord', err_obj);
                    } else if (licenseRec.records.length >= 2) {
                        err_Flg = true;
                        return handleLicenseError(CheckTarget, 'multi_keyRecord', err_obj);
                    }

                    var licenseKey = ecbEncryption(licenseRec.records[0]['licenseKey'].value, licenseRec.records[0]['systemUsage'].value);
                    console.log(licenseKey);
                    var query = 'productCd in ("' + pCode + '")' + ' and licenseKey = "' + licenseKey + '"';

                    return kintone.proxy('https://emxas.cybozu.com/k/v1/records.json?app=912&query=' + encodeURIComponent(query), 'GET', { 'X-Cybozu-API-Token': 'zPbhutoLAYX1pJV1QTBuj7AekXJo0i1iMQEgBYuV' }, {});
                })
                .then(function (args) {
                    if (err_Flg) return resolve(args);
                    if (args[1] !== 200) return resolve(handleLicenseError(CheckTarget, 'fail_connection', err_obj));
                    console.log(args);
                    var jsonedBody = JSON.parse(args[0]);
                    var records = jsonedBody.records;

                    if (records.length === 0) {
                        entryCookie({ authError: true, errId: 'invalid_key' }, cookieKey);
                        return resolve(handleLicenseError(CheckTarget, 'invalid_key', err_obj));
                    }

                    var validStartDateStr = records[0].validStartDate.value;
                    var validEndDateStr = records[0].validEndDate.value;

                    var today = new Date();
                    var validStartDate = new Date(validStartDateStr);
                    var validEndDate = new Date(validEndDateStr);
                    validEndDate.setDate(validEndDate.getDate() + 1);

                    today.setHours(0);
                    today.setMinutes(0);
                    today.setSeconds(0);
                    today.setMilliseconds(0);
                    validStartDate.setHours(0);
                    validStartDate.setMinutes(0);
                    validStartDate.setSeconds(0);
                    validStartDate.setMilliseconds(0);
                    validEndDate.setHours(0);
                    validEndDate.setMinutes(0);
                    validEndDate.setSeconds(0);
                    validEndDate.setMilliseconds(0);

                    if (today.getTime() < validStartDate.getTime()) {
                        entryCookie({ authError: true, errId: 'before_key' }, cookieKey);
                        return resolve(handleLicenseError(CheckTarget, 'before_key', err_obj));
                    }

                    if (validEndDateStr !== null) {
                        var validEndDate = new Date(validEndDateStr);
                        if (today.getTime() > validEndDate.getTime()) {
                            entryCookie({ authError: true, errId: 'expired_key' }, cookieKey);
                            return resolve(handleLicenseError(CheckTarget, 'expired_key', err_obj));
                        }
                    }

                    entryCookie({ authError: false }, cookieKey);
                    return resolve(err_obj);
                })
                .catch(function (error) {
                    return reject(error);
                });
        }
    });
};

/**
 * @param {String} str
 * @param {String} pass
 * @param {boolean} isDecrypt
 * @return {String}
 */
function ecbEncryption(str, pass) {
    var key128Bits500Iterations = CryptoJS.enc.Hex.parse(pass);
    var iv = CryptoJS.lib.WordArray.random(128 / 8);
    var options = { iv: iv, mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 };
    var licenseKey = CryptoJS.enc.Utf8.parse(str);

    //----------------------------------------------------------------------
    var encrypted = CryptoJS.AES.encrypt(licenseKey, key128Bits500Iterations, options);
    //----------------------------------------------------------------------

    var binary_data = CryptoJS.enc.Hex.stringify('');
    binary_data += ',' + CryptoJS.enc.Hex.stringify(iv);
    binary_data += ',' + encrypted;

    var array_rawData = binary_data.split(',');
    var a = array_rawData[0];
    var b = array_rawData[1];
    var c = array_rawData[2];
    return c;
}

/**
 * @param {String} str
 * @param {String} pass
 * @return {String}
 */
function cbcEncryption(str, pass) {
    var secret_passphrase = CryptoJS.enc.Utf8.parse(pass);
    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var key128Bits500Iterations = CryptoJS.PBKDF2(secret_passphrase, salt, { keySize: 128 / 8, iterations: 500 });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);
    var options = { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
    var enc_str = CryptoJS.enc.Utf8.parse(str);

    //----------------------------------------------------------------------
    var encrypted = CryptoJS.AES.encrypt(enc_str, key128Bits500Iterations, options);
    //----------------------------------------------------------------------

    var binary_data = CryptoJS.enc.Hex.stringify(salt);
    binary_data += ',' + CryptoJS.enc.Hex.stringify(iv);
    binary_data += ',' + encrypted;
    return binary_data;
}

/**
 * @param {String} str
 * @param {String} pass
 * @return {String}
 */
function cbcDecrypt(str, pass) {
    var arr = str.split(',');
    var salt = CryptoJS.enc.Hex.parse(arr[0]);
    var iv = CryptoJS.enc.Hex.parse(arr[1]);
    var encrypted_data = CryptoJS.enc.Base64.parse(arr[2]);

    var secret_passphrase = CryptoJS.enc.Utf8.parse(pass);
    var key128Bits500Iterations = CryptoJS.PBKDF2(secret_passphrase, salt, { keySize: 128 / 8, iterations: 500 });
    var options = { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };

    var decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted_data }, key128Bits500Iterations, options);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * @return {Object}
 */
function checkCookie(appId) {
    var result_obj = {
        isExist: false,
    };
    document.cookie.split(';').some(function (item) {
        if (item.indexOf(cookieKey_authResult) >= 0) {
            item = cbcDecrypt(item.replace(cookieKey_authResult + '=', ''), cookie_authPass);
            var json_item = JSON.parse(item);
            if (json_item[appId]) {
                result_obj['isExist'] = true;
                result_obj['authError'] = json_item[appId]['authError'];
                result_obj['errId'] = json_item[appId]['errId'];
                return true;
            }
        }
    });
    return result_obj;
}

/**
 * @param {Object} entryObj
 * @param {String} pCode
 */
function entryCookie(entryObj, appId) {
    var json_cookie = {};
    document.cookie.split(';').some(function (item) {
        if (item.indexOf(cookieKey_authResult) >= 0) {
            item = item.replace(cookieKey_authResult + '=', '');
            const decrypt = cbcDecrypt(item.replace(cookieKey_authResult + '=', ''), cookie_authPass);
            json_cookie = JSON.parse(decrypt);
            return true;
        }
    });

    var now = new Date();
    //2022-10-26 改修 → 日付+1 ⇒ 時間+24
    var limit = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 24);
    now.setTime(now.getTime() + (limit - now));
    json_cookie[appId] = entryObj;
    var auth_cookie = cbcEncryption(JSON.stringify(json_cookie), cookie_authPass);
    document.cookie = cookieKey_authResult + '=' + auth_cookie + '; expires=' + now.toUTCString();
}

/**
 * @param {String} CheckTarget
 * @param {String} errId
 * @param {Object} err_obj
 */
function handleLicenseError(CheckTarget, errId, err_obj) {
    alert(MESSAGE[errId]);
    if (CheckTarget === 'app') createErrorDisp(MESSAGE[errId]);
    err_obj.emc_error = true;
    err_obj.message = MESSAGE[errId];
    return err_obj;
}

/**
 * @param {String} message
 */
var createErrorDisp = function (message) {
    $('body').remove();
    var body = $('<body></body>');
    var div_container = $('<div></div>');
    var h4 = $('<h4></h4>');
    var div_company = $('<div></div>');
    var back = $("<div><span onclick='javascript:window.history.back(-1)'>前の画面に戻る</span></div>");
    body.css({
        background: '#6F7577',
        color: '#fff',
        'text-align': 'center',
        'font-size': '62.5%',
        'line-height': '1.5',
        'text-shadow': '0 3px 5px rgba(0, 0, 0, 0.3)',
    });
    div_container.css({
        width: '80%',
        margin: '80px auto 0',
    });
    h4.css({
        margin: '0 0 10px',
        'font-size': '2em',
    });
    div_company.css({
        color: '#fff',
        'margin-bottom': '1em',
    });
    back.css({
        'text-decoration': 'underline',
        'font-size': '1.5em',
        cursor: 'pointer',
    });
    h4.text(message);
    div_company.text('アプリ提供元：エムザス株式会社');
    div_container.append(h4);
    div_container.append(div_company);
    div_container.append(back);
    body.append(div_container);
    $('html').append(body);
};
export { licenseCheck };
