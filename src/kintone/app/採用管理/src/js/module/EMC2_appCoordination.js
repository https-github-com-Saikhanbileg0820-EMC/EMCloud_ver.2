import $ from 'jquery';
import Swal from 'sweetalert2';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

(function () {
    'use strict';

    const EMC = window.EMC;
    const client = new KintoneRestAPIClient();

    // const appCoordinationBtn = `<button id="appCoordinationBtn" style="height: 30px;width: 200px;background-color: #061283;color: #fff;border: none;border-radius: 5px;margin-right:1%;">内定情報連携</button>`;

    // kintone.events.on('app.record.detail.show', (e) => {
    //     const client = new KintoneRestAPIClient();

    //     if (e.record.ステータス.value === '内定案内') {
    //         if (!$('#appCoordinationBtn')[0]) {
    //             // const headerMenu = kintone.app.record.getHeaderMenuSpaceElement();
    //             // $(headerMenu)[0].append($(appCoordinationBtn)[0]);
    //             $('.gaia-argoui-app-toolbar-menu')[0].prepend($(appCoordinationBtn)[0]);
    //         }
    //     } else {
    //         if ($('#appCoordinationBtn')[0]) {
    //             $('#appCoordinationBtn')[0].remove();
    //         }
    //     }

    // パラメーター作成
    const createParamObj = async (paramObj, fields) => {
        let selfRecord = await client.record.getRecord({ app: kintone.app.getId(), id: kintone.app.record.getId() });
        console.log(selfRecord);
        for (let field of fields) {
          if (selfRecord.record[field].value) {
            paramObj[field] = { value: selfRecord.record[field].value };
          }
        }
        paramObj["実行日"] = { value: selfRecord.record["入社年月日"].value };
        paramObj["雇用手続区分"] = { value: "入社手続" };
        return paramObj;
    };

    // SweetAlert
    const doSweetAlert = async (icon, title, html, cancelBtn, cancelText) => {
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

    // 社員番号の存在確認
    const checkEmployeeNumber = async () => {
        const employeeNumber = $('#employeeNumberField').val();
        let param = {
            app: EMC.APPID['employee'],
            condition: `社員番号 = "${employeeNumber}"`,
        };
        let duplicateConfirmation = await client.record.getAllRecords(param);
        if (duplicateConfirmation.length) {
            return false;
        } else {
            return true;
        }
    };

    // 連携情報を取得
    const getRelationData = async () => {
        let getInfo = await client.record.getAllRecords({ app: EMC.APPID.relationDataMaster, condition: '連携元アプリ in ("採用管理")', fields: ['EMCloudフィールドコード'] });
        console.log(getInfo);
        let infoArray = [];
        for (let info of getInfo) {
            infoArray.push(info['EMCloudフィールドコード'].value);
        }
        return infoArray;
    };

    //最終ステータス到達時
    kintone.events.on('app.record.detail.process.proceed', async (event) => {
        const nextStatus = event.nextStatus.value;
        const lastStatus = await EMC.GET_LAST_STATUS();
        if (nextStatus !== lastStatus) {
            return;
        }

        return doSweetAlert('info', `当志願者の採用を確定しますか？`, '採用を確定すると<br>雇用手続・社員情報アプリにデータ連携されます', true, 'キャンセル').then(async (result) => {
            if (result.isConfirmed) {
                return doSweetAlert(
                    'info',
                    `社員番号を付与してください`,
                    `<div><label>社員番号を入力してください<br><span style="color: red;">※既存社員との重複禁止<span></label>
              <input id="employeeNumberField" type="text" style="height: 40px;width: 300px;margin-top: 15px;
              border: 1px solid #999;padding: 0px 10px 0px 10px;color: #3498db;"></div>`,
                    true,
                    'キャンセル'
                ).then(async (result) => {
                    if (result.isConfirmed) {
                        const employeeNumber = $('#employeeNumberField').val();
                        let checkResult = await checkEmployeeNumber(employeeNumber);
                        if (!checkResult) {
                            doSweetAlert('error', `${employeeNumber}`, 'この社員番号は既に存在します。<br>重複しない社員番号を入力してください。', '', '');
                            event.error = null;
                            return false;
                        } else {
                            return doSweetAlert('info', `${employeeNumber}`, '当志願者を上記の社員番号で登録を行います', true, 'キャンセル').then(async (result) => {
                                if (result.isConfirmed) {
                                    let RelationData = await getRelationData();
                                    console.log(RelationData);
                                    // 社員情報アプリへレコード作成Param
                                    let paramObj = await createParamObj({ 社員番号: { value: employeeNumber } }, RelationData);
                                    let employeeParam = {
                                        app: EMC.APPID.employee,
                                        record: paramObj,
                                    };
                                    // 雇用手続アプリへレコード作成Param
                                    let employProcedureParamObj = await createParamObj({ 社員番号: { value: employeeNumber } }, RelationData);
                                    let employProcedureParam = {
                                        app: EMC.APPID.employProcedure,
                                        record: employProcedureParamObj,
                                    };

                                    try {
                                        await client.record.addRecord(employeeParam);
                                        let recordResp = await client.record.addRecord(employProcedureParam);

                                        if (recordResp) {
                                            doSweetAlert('success', '社員登録が完了しました', '雇用手続アプリで入社手続を開始してください', '', '');
                                        }
                                    } catch (error) {
                                        console.log(error);
                                        return false;
                                    }
                                } else {
                                    doSweetAlert('error', `キャンセルしました`, '採用の確定をキャンセルしました', '', '');
                                    return false;
                                }
                            });
                        }
                    } else {
                        doSweetAlert('error', `キャンセルしました`, '採用の確定をキャンセルしました', '', '');
                        return false;
                    }
                });
            } else {
                doSweetAlert('error', `キャンセルしました`, '採用の確定をキャンセルしました', '', '');
                return false;
            }
        });
    });

    // //以下の動作をボタン押下時から最終ステータスへの移行時に変更
    // $('#appCoordinationBtn').on('click', async () => {
    //     doSweetAlert('info', `当志願者の採用を確定しますか？`, '採用を確定すると<br>雇用手続・社員情報アプリにデータ連携されます', true, 'キャンセル').then(async (result) => {
    //         if (result.isConfirmed) {
    //             doSweetAlert(
    //                 'info',
    //                 `社員番号を付与してください`,
    //                 `<div><label>社員番号を入力してください<br><span style="color: red;">※既存社員との重複禁止<span></label>
    //       <input id="employeeNumberField" type="text" style="height: 40px;width: 300px;margin-top: 15px;
    //       border: 1px solid #999;padding: 0px 10px 0px 10px;color: #3498db;"></div>`,
    //                 true,
    //                 'キャンセル'
    //             ).then(async (result) => {
    //                 if (result.isConfirmed) {
    //                     const employeeNumber = $('#employeeNumberField').val();
    //                     let checkResult = await checkEmployeeNumber(employeeNumber);
    //                     if (!checkResult) {
    //                         doSweetAlert('error', `${employeeNumber}`, 'この社員番号は既に存在します。<br>重複しない社員番号を入力してください。', '', '');
    //                     } else {
    //                         doSweetAlert('info', `${employeeNumber}`, '当志願者を上記の社員番号で登録を行います', true, 'キャンセル').then(async (result) => {
    //                             if (result.isConfirmed) {
    //                                 let RelationData = await getRelationData();
    //                                 console.log(RelationData);
    //                                 // 社員情報アプリへレコード作成Param
    //                                 let paramObj = await createParamObj({ 社員番号: { value: employeeNumber } }, RelationData);
    //                                 let employeeParam = {
    //                                     app: EMC.APPID.employee,
    //                                     record: paramObj,
    //                                 };
    //                                 // 雇用手続アプリへレコード作成Param
    //                                 let employProcedureParamObj = await createParamObj({ 社員番号: { value: employeeNumber } }, RelationData);
    //                                 let employProcedureParam = {
    //                                     app: EMC.APPID.employProcedure,
    //                                     record: employProcedureParamObj,
    //                                 };

    //                                 try {
    //                                     await client.record.addRecord(employeeParam);
    //                                     let recordResp = await client.record.addRecord(employProcedureParam);

    //                                     if (recordResp) {
    //                                         doSweetAlert('success', '社員登録が完了しました', '雇用手続アプリで入社手続を開始してください', '', '');
    //                                     }
    //                                 } catch (error) {
    //                                     console.log(error);
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 }
    //             });
    //         } else {
    //             doSweetAlert('error', `キャンセルしました`, '採用の確定をキャンセルしました', '', '');
    //         }
    //     });
    // });
    //     return e;
    // });
})();
