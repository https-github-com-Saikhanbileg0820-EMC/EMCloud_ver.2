import $ from 'jquery';
import jQuery from 'jquery';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import Swal from 'sweetalert2';

jQuery.noConflict();
(function ($) {
    'use strict';

    const EMC = window.EMC;
    let client = new KintoneRestAPIClient();

    // sweetAlert発動
    const doSweetAlert = (icon, title, html, cancelBtn, cancelText) => {
        return Swal.fire({
            icon: icon,
            title: title,
            html: html,
            showCancelButton: cancelBtn,
            cancelButtonText: cancelText,
            confirmButtonColor: '#3498db',
            allowOutsideClick: false,
        });
    };

    // 連携情報マスタから連携フィールドの一覧を取得
    const getRelationFields = async (appName) => {
        let relationFields = await client.record.getAllRecords({ app: EMC.APPID.corporationMaster, condition: `連携元アプリ in (${appName})` });
        let fieldsArray = [];
        for (let field of relationFields) {
            fieldsArray.push(field['EMCloudフィールドコード'].value);
        }
        return fieldsArray;
    };

    // 雇用管理へ連携する際のリクエストパラメーターを作成
    const createRelationParam = async (relationFieldsArray) => {
        let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
        let param = {
            app: EMC.APPID.employManagement,
            record: {},
        };
        for (let relation of relationFieldsArray) {
            param.record[relation] = { value: selfRecords.record[relation].value ? selfRecords.record[relation].value : '' };
        }
        return param;
    };

    // 扶養控除アプリへ連携する際のリクエストパラメーターを作成
    const createFamilyParam = async (familyInfo, selfRecords) => {
        let rowObj = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let family of familyInfo) {
            rowObj[family] = { value: selfRecords.record[family].value };
        }

        console.log(rowObj);
        return { app: EMC.APPID.dependentExemption, record: rowObj };
    };

    // 通勤管理アプリへ連携する際のリクエストパラメーターを作成
    const createGotoParam = async (gotoInfo, selfRecords) => {
        let paramGoto = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let goto of gotoInfo) {
            paramGoto[goto] = { value: selfRecords.record[goto].value };
        }
        return { app: EMC.APPID.commuteInfo, record: paramGoto };
    };

    //2022-11-25 石井 追記
    // 基本情報アプリへ連携する際のリクエストパラメーターを作成
    const createbasicParam = async (basicInfo, selfRecords) => {
        let parambasic = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        for (let basic of basicInfo) {
            parambasic[basic] = { value: selfRecords.record[basic].value };
        }
        return { app: EMC.APPID.basicInfomation, record: parambasic };
    };

    // 社員情報アプリへ連携する際のリクエストパラメーターを作成
    const createEmployeeParam = async (employeeInfo, selfRecords, familyInfo, gotoInfo) => {
        let paramEmployee = { 社員番号: { value: selfRecords.record['社員番号'].value } };
        let subjectEmployee = await client.record.getRecords({ app: EMC.APPID.employee, query: `社員番号 = "${selfRecords.record['社員番号'].value}"` });
        console.log(subjectEmployee);
        let subjectId = subjectEmployee.records[0].$id.value;
        for (let employee of employeeInfo) {
            paramEmployee[employee] = { value: selfRecords.record[employee].value };
        }
        for (let goto of gotoInfo) {
            paramEmployee[goto] = { value: selfRecords.record[goto].value };
        }
        for (let family of familyInfo) {
            paramEmployee[family] = { value: selfRecords.record[family].value };
        }

        return { app: EMC.APPID.employee, id: subjectId, record: paramEmployee };
    };

    //2022-11-15 石井追記
    kintone.events.on('app.record.detail.process.proceed', async (event) => {
        const nextStatus = event.nextStatus.value;
        if (nextStatus !== '情報入力完了') {
            return;
        }

        //雇用管理への連携
        // 連携情報マスタから連携フィールドを取得
        let relationFieldsArray = await getRelationFields('"雇用手続"');
        // リクエストパラメーターを作成
        let relationParam = await createRelationParam(relationFieldsArray);
        try {
            // 雇用管理へ連携（レコード作成）
            let addResp = await client.record.addRecord(relationParam);
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '雇用管理への連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }

        //社員情報への連携
        // 連携情報マスタから連携フィールドを取得
        let familyInfoArray = await getRelationFields('"雇用手続①"'); // 扶養控除連携フィールド
        let gotoArray = await getRelationFields('"雇用手続②"'); // 通勤情報連携フィールド
        let employeeArray = await getRelationFields('"雇用手続③"'); // 社員情報連携フィールド
        //2022-11-25 石井 追記
        let basicArray = await getRelationFields('"雇用手続④"'); //基本情報フィールド

        // 自レコード取得
        let selfRecords = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });

        let familyParam = await createFamilyParam(familyInfoArray, selfRecords); // 扶養控除リクエストパラメーター作成
        let gotoParam = await createGotoParam(gotoArray, selfRecords); // 通勤管理リクエストパラメーター作成
        let employeeParam = await createEmployeeParam(employeeArray, selfRecords, familyInfoArray, gotoArray); // 社員情報リクエストパラメーター作成
        //2022-11-25 石井 追記
        let basicParam = await createbasicParam(basicArray, selfRecords); //基本情報リクエストパラメータ作成
        const bulkParams = {
            requests: [
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: familyParam,
                },
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: gotoParam,
                },
                {
                    method: 'PUT',
                    api: '/k/v1/record.json',
                    payload: employeeParam,
                },
                //2022-11-25 石井 追記
                {
                    method: 'POST',
                    api: '/k/v1/record.json',
                    payload: basicParam,
                },
            ],
        };
        try {
            // 社員情報へ連携（レコード作成）
            const bulkResp = await client.bulkRequest(bulkParams);
            console.log(bulkResp);
        } catch (error) {
            console.log(error);
            doSweetAlert('error', 'エラー', '社員情報の連携に失敗しました<br>手続内容を確認してください', false, '');
            return false;
        }

        return event;
    });
})(jQuery);
