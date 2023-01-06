import Swal from 'sweetalert2';
import $ from 'jquery';
(() => {
    ("use strict");

    const CONFIG = window.EMC;

    //============================== 実行日の入力処理 ==============================
    kintone.events.on("app.record.detail.process.proceed", async(event) => {
        const record = event.record;
        //次ステータスが最終ステータスの時にのみ処理実行
        const nextStatus = event.nextStatus.value;
        const lastStatus = await CONFIG.GET_LAST_STATUS();
        if (nextStatus !== lastStatus) {
            return;
        }

        //実行日の入力を求めるアラートの表示
        return Swal.fire({
            title: "実行日の入力を行ってください",
            html: `<input type="date" id="date_test" value=${record.実行日.value} style="border: inset; height: 50px; width: 175px; padding-right: 35px; padding-left:20px; text-align: center; font-size: 18px; border-radius: 10px; font-weight: bold;"></input>`,
            confirmButtonText: "確定",
            cancelButtonText: "中断",
            showCancelButton: true,
            preConfirm: (result) => {
                const date = $("#date_test").val();
                if (!date) {
                    Swal.showValidationMessage("実行日が入力されていません");
                }
            },
        }).then(async(result) => {
            if (result.isConfirmed) {
                const date = $("#date_test").val();
                record.実行日.value = date;
                let requestCategory = record.申請区分.value;

                let attendant = await CONFIG.APPLICATION_CATEGORIES(requestCategory,CONFIG.APPID.employment,CONFIG.APPID.basicInfomation,CONFIG.APPID.commuteInfo,CONFIG.APPID.dependentExemption,CONFIG.APPID.employManagement);
                
                console.log(attendant);
                let employManagementRecords = await CONFIG.GET_ALL_RECORDS({'app': CONFIG.APPID.employManagement,'orderBy':"実行日 desc, $id desc", 'condition': `社員番号 = "${record['社員番号'].value}" and 実行日 <= "${record['実行日'].value}"`} );
                console.log(employManagementRecords)
                const COOP_FIELDS = await CONFIG.GET_ALL_RECORDS({'app': CONFIG.APPID.corporationMaster,'condition': `該当申請 in ("${record['申請区分'].value}")`});
                let employeeRequestBody = [];
                for(let attend of attendant){
                    if(attend == CONFIG.APPID.employment){
                        employeeRequestBody.push(await CONFIG.UPDATE_EMPLOYEE_BODY(record,COOP_FIELDS,attend));
                    }else{
                        employeeRequestBody.push(await CONFIG.HISTORY_EMPLOYEE_BODY(record,COOP_FIELDS,attend,employManagementRecords[0]));
                    }
                    
                }
                console.log(employeeRequestBody);

                await CONFIG.BULKREQUEST({requests: employeeRequestBody});
            } else {
                return false;
            }
        });
    });

    //============================== 実行日の入力制御 ==============================
    const showEvents = ["app.record.create.show", "app.record.edit.show","app.record.detail.show"];
    kintone.events.on(showEvents, async(event) => {
        //最終ステータスの場合は入力制御は行わない
        const record = event.record;
        record.入社年月日.disabled = true;
        record.退職年月日.disabled = true;
        if (event.record.ステータス && event.record.ステータス.value === (await CONFIG.GET_LAST_STATUS())) {
           $(".gaia-argoui-app-menu-edit").hide()
        }
        return event;
    });
})();