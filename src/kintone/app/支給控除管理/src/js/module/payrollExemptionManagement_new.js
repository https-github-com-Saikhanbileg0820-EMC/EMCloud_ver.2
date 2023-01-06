import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import $ from 'jquery';
import JSZip from 'jszip';
import { DateTime } from 'luxon'
(function () {
    ('use strict');

    const EMC = window.EMC;
    const client = new KintoneRestAPIClient();

    //===============================削除時、締日処理フラグを下す====================================
    kintone.events.on(['app.record.index.delete.submit','app.record.detail.delete.submit'], async (e) => {
        console.log(e);
        let exeDate = e.record['実行日'].value;
        let closingDate 
        if(e.record['給与締日'].value===""){
          closingDate = "月末"
        }else{
          closingDate = e.record['給与締日'].value
          closingDate = Number(closingDate)
        }
        
        let employeeNum = e.record['社員番号'].value;
        let category = e.record['雇用区分'].value;

        let closingMonth = Number(exeDate.split('-')[1]);
        if(Number(exeDate.split('-')[2]) > Number(closingDate)){
            if(closingMonth == 12){
                closingMonth = 1;
            }else{
                closingMonth = Number(closingMonth) + 1;
            }
        }

        let targetGetQuery = await EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY(Number(exeDate.split('-')[0]),Number(closingMonth),closingDate);

        let targets = {
            salary: await EMC.RESTAPI.GET_RECORDS(EMC.APPID.salaryManagement,`社員番号 = "${employeeNum}" and 雇用区分 = "${category}" and ` + targetGetQuery),
            procedure: await EMC.RESTAPI.GET_RECORDS(EMC.APPID.procedureManagement,`社員番号 = "${employeeNum}" and 雇用区分 = "${category}" and ` + targetGetQuery)
        };

        let requests = [];
        for(let target in targets){
            let request = {
                method: "PUT",
                api: "/k/v1/records.json",
                payload: {
                    app: target == "procedure"? EMC.APPID.procedureManagement:EMC.APPID.salaryManagement,
                    records:[]
                }
            }
            for(let targetAppRecord of targets[target]){
                request.payload.records.push({
                    id: targetAppRecord['$id'].value,
                    record:{
                        '締日処理':{
                            value: []
                        }
                    }
                });
            }
            requests.push(request);
        }
        
        try{
            if(requests.length){
                await client.bulkRequest({requests:requests});
            }
        }catch(error){
            console.log(error);
            return false;
        }

        return e;
    })
    //=============================================================================================

    //*============================== 一覧表示時メイン処理（締日処理） ==============================
    kintone.events.on('app.record.index.show', async (e) => {
        try {
            // 一覧画面のヘッダーに給与処理ヘッダーを作成
            const headerElement = kintone.app.getHeaderSpaceElement();
            if ($(headerElement).find(`#${EMC.DOM.closingBtn}`).length === 0) {
                // ヘッダー作成（年入力／月選択／締日処理ボタン／奉行CSV出力ボタン）
                $(headerElement).append(EMC.MAKE_ELEM.HEADER(EMC.DOM.yearId, EMC.DOM.monthId, EMC.DOM.employmentArea, EMC.DOM.closingBtn, EMC.DOM.csvBtn));
                // 雇用形態選択作成・追加
                $(`#${EMC.DOM.employmentArea}`).append(await EMC.MAKE_ELEM.EMPLOYMENT_STATUS(EMC.APPID.environmentMaster, EMC.DOM.employmentListId));
            }

            // 「締日処理」ボタン押下時
            $(`#${EMC.DOM.closingBtn}`).on('click', async () => {
                await onclickClosing();
            });
            //「奉行CSV出力」ボタン押下時
            $(`#${EMC.DOM.csvBtn}`).on('click', async () => {
                await outputCsv();
            });

            //既存の選択年月情報がある場合は反映
            if (sessionStorage.getItem(`${EMC.STORAGE.SESSION.selectYearMonth}`) !== null) {
                const info = EMC.JSON_PARSE(sessionStorage.getItem(`${EMC.STORAGE.SESSION.selectYearMonth}`));
                const year = info.year;
                const month = info.month;
                //反映処理
                $(`#${EMC.DOM.yearId}`).val(year);
                $(`#${EMC.DOM.monthId}`).val(month);
            }

            return e;
        } catch (error) {
            EMC.SPIN.HIDE();
            console.log(error);
        }
    });

    //*============================== フィールド制御処理 ==============================
    kintone.events.on(['app.record.edit.show','app.record.create.show'], (event) => {
        const record = event.record;
        // 固定データフィールドを編集不可にする
        EMC.FIELD.DISABLED.forEach((field) => {
          record[field].disabled = true;
        });
        let kazoku = record["t_家族"].value
        for (let i in kazoku){
          Object.keys(kazoku[i].value).forEach((key)=>{
            kazoku[i].value[`${key}`].disabled=true;
          });
        }
        $(".add-row-image-gaia").hide();
        $(".remove-row-image-gaia").hide();
        //非表示
        EMC.FIELD.HIDDEN.forEach((field) => {
            kintone.app.record.setFieldShown(field, false);
        });
        return event;
    });

    //社員番号のルックアップから値がコピーされるルックアップフィールドは編集不可にしておく
    kintone.events.on('app.record.create.show', (event) => {
        const record = event.record;
        // 固定データフィールドを編集不可にする
        EMC.FIELD.DISABLED.forEach((field) => {
          record[field].disabled = true;
        });
        if('app.record.create.show'===event.type){
          record["社員番号"].disabled=false
        }
        record.性別.disabled = true;
        record.雇用区分.disabled = true;

        return event;
    });

    //*============================== ルックアップの制御処理 ==============================
    kintone.events.on('app.record.create.change.氏名', (event) => {
        const record = event.record;
        //社員番号がクリアされた場合は対象フィールド全クリア
        if (!record.社員番号.value) {
            record.雇用区分.value = '';
            record.性別.value = '';
            record.雇用区分_奉行.value = '';
            record.性別_奉行.value = '';
            record.締日選択.value = '';
            record.給与締日.value = '';
            return event;
        }
    });
    const cevents = ['app.record.create.change.実行日'];
    kintone.events.on(cevents, async (event) => {
        const record = event.record;
        let date = record.実行日.value
        if(date===undefined){
            record.実行日.error="実行日入力してください。"
            return event
        }
        let floatingDataInfo = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.employManagement, `社員番号="${record.社員番号.value}" and 実行日<="${date}"`, `実行日 desc, $id desc`);
        //社員番号がクリアされた場合は対象フィールド全クリア
        if (!record.社員番号.value) {
            record.雇用区分.value = '';
            record.性別.value = '';
            record.雇用区分_奉行.value = '';
            record.性別_奉行.value = '';
            record.締日選択.value = '';
            record.給与締日.value = '';
        }

        //社員番号のルックアップのコピー先のフィールド情報を各ルックアップフィールドに反映
        let a=record.雇用区分コピー.value
        if(floatingDataInfo[0]){
            a=floatingDataInfo[0].雇用区分.value
        }
        let b = record.性別コピー.value
         putFields(a,b)
    });   
    const putFields = async(value,sex)=>{
        const setRecord = kintone.app.record.get();
        setRecord.record["性別"].value = sex;
        setRecord.record["性別"].lookup = true;
        setRecord.record["雇用区分"].value = value
        setRecord.record["雇用区分"].lookup = true;
        kintone.app.record.set(setRecord);
       }
    const cevents2 = ['app.record.create.change.雇用区分_奉行', 'app.record.edit.change.雇用区分_奉行', 'app.record.create.change.性別_奉行', 'app.record.edit.change.性別_奉行'];
    kintone.events.on(cevents2, (event) => {
        const record = event.record;

        //社員番号のルックアップのコピー先のフィールド情報を各ルックアップフィールドの値に更新
        record.雇用区分コピー.value = record.雇用区分.value;
        record.性別コピー.value = record.性別.value;

        return event;
    });
    //*============================== 入力制御処理 ==============================
    const changeEvents = ['app.record.create.change.締日選択', 'app.record.create.change.給与締日', 'app.record.create.change.実行日', 'app.record.edit.change.締日選択', 'app.record.edit.change.給与締日', 'app.record.edit.change.実行日'];
    kintone.events.on(changeEvents, (event) => {
        const record = event.record;

        const name = record.氏名.value; //氏名
        const employmentClassification = record.雇用区分.value; //雇用区分

        const employeeNumber = record.社員番号.value; //社員番号
        const executionDate = record.実行日.value; //実行日
        const saveBtn = document.getElementsByClassName('gaia-ui-actionmenu-save')[0]; //保存ボタン
        let closing = record.給与締日.value; //締日情報
        //給与締日に値がない場合は締日選択を締日情報とする
        if (!closing) {
            closing = record.締日選択.value;
            if (closing === '日付指定') {
                return;
            }
        }

        //いずれのフィールドにも値が設定されている場合にのみ入力確認実行
        if (employeeNumber && executionDate && closing && employmentClassification) {
            EMC.VALIDATION.DUPLICATION_CHECK(employeeNumber, executionDate, closing, EMC.RESTAPI.GET_RECORDS, EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY).then((resp) => {
                if (resp) {
                    EMC.ERROR(
                        `[社員番号] ${employeeNumber}（${name}）<br>[締日] ${resp.year}年${resp.month}月${resp.closing}締め<br>のレコードは既に作成されています<br><a href="${EMC.URL}${kintone.app.getId()}/show#record=${
                            resp.id
                        }" target="_blank">対象レコード</a>`
                    );
                    //保存ボタンの非表示
                    saveBtn.style.display = 'none';
                    return;
                } else {
                    saveBtn.style.display = 'inline-block';
                    return event;
                }
            });
        }
    });

    //*============================== ステータス制御処理 ==============================
    // //第一承認の承認者選択処理
    // const saveEvents = ["app.record.create.submit", "app.record.edit.submit"];
    // kintone.events.on(saveEvents, async(event) => {
    //     const record = event.record;
    //     //変動データ情報の取得
    //     const floatingDataInfo = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.corporationMaster, `奉行コード != "" and 項目区分 in ("変動")`);
    //     let floatingDataCodes = [];
    //     floatingDataInfo.forEach((date) => {
    //         floatingDataCodes.push(date.EMCloudフィールドコード.value);
    //     });
    //     let processFlag;
    //     floatingDataCodes.forEach((code) => {
    //         if (record[code].value) {
    //             processFlag = true;
    //         }
    //     });
    //     if (processFlag && !record.承認者.value.length) {
    //         EMC.ERROR(`承認者の設定が必要です`);
    //         record.承認者.error = "設定を行ってください";
    //         return event;
    //     }
    //     return event;
    // });

    //ステータスの更新
    const sucessSaveEvents = ['app.record.create.submit.success', 'app.record.edit.submit.success'];
    kintone.events.on(sucessSaveEvents, async (event) => {
        const record = event.record;
        //現在ステータスの確認
        const firstStatus = await EMC.STATUS.GET_FIRST();
        if (record.ステータス.value !== firstStatus) {
            return;
        }
        //変動データ情報の取得
        const floatingDataInfo = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.corporationMaster, `奉行コード != "" and 項目区分 in ("変動")`);
        let floatingDataCodes = [];
        floatingDataInfo.forEach((date) => {
            floatingDataCodes.push(date.EMCloudフィールドコード.value);
        });
        let processFlag;
        floatingDataCodes.forEach((code) => {
            if (record[code].value) {
                processFlag = true;
            }
        });
        if (processFlag) {
            sessionStorage.setItem('reload', 'reload');
            EMC.RESTAPI.PUT_STATUS(kintone.app.getId(), kintone.app.record.getId(), EMC.ACTION.approvalApplication);
        }
        return event;
    });
    //画面の更新（ステータス更新が画面上では即座に反映されないため）
    kintone.events.on('app.record.detail.show', (event) => {
        if (sessionStorage.getItem('reload')) {
            sessionStorage.removeItem('reload');
            location.reload();
        }
        return event;
    });

    //第一承認時のアクションボタン非表示制御(CSSも作成する必要あり)
    kintone.events.on('app.record.detail.show', (event) => {
        return event;
    });

    //第二承認以降の承認者選択処理
    kintone.events.on('app.record.detail.process.proceed', (event) => {
        return event;
    });

    //%========== 以下ボタン押下処理関数 ==========
    /**
     * 締日処理を行う関数
     */
    async function onclickClosing() {
        // 給与処理ヘッダーの設定値を取得
        const closingYear = $(`#${EMC.DOM.yearId}`).val(); // 対象年
        const closingMonth = $(`#${EMC.DOM.monthId}`).val(); // 対象月
        const selectEmployments = $(`#${EMC.DOM.employmentListId}`).val(); // 雇用区分

        // 未入力・未選択チェック
        if (EMC.VALIDATION.TARGET_CLASSIFICATION([closingYear, closingMonth, selectEmployments], EMC.ERROR)) {
            return false;
        }

        // 雇用形態選択のvalueをparseする
        let settingEmployments = [];
        for (let setting of selectEmployments) {
            settingEmployments.push(EMC.JSON_PARSE(setting));
        }

        //開始のアラート表示
        const result = await EMC.ALERT.START(`${closingYear}月${closingMonth}月`, '上記対象月の給与に関する対象申請を取得します');
        if (!result.isConfirmed) {
            return;
        }
        EMC.SPIN.SHOW();

        let COOP_FIELDS, appId, subjectRecords;
        try {
            // 給与管理・手続管理から連携するフィールドを取得する。
            COOP_FIELDS = await EMC.CLOSING_DATE_PROCESS.GET_CORPORATION_ITEM(EMC.APPID.corporationMaster, EMC.RESTAPI.GET_RECORDS);
            // 区分マスタ・給与管理・手続管理から必要な情報を取得する（GET）
            appId = {
                salary: EMC.APPID.salaryManagement,
                procedure: EMC.APPID.procedureManagement,
                deduction: EMC.APPID.paymentDeduction,
            };
            subjectRecords = await EMC.CLOSING_DATE_PROCESS.GET_RECORDS(closingYear, closingMonth, settingEmployments, appId, EMC.RESTAPI.GET_RECORDS, EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY);
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }

        // ----◆締日処理済フラグ-----------------------------------------------------------------
        let clothingFlg = {};
        let joiningCompany = [];
        for(let subjectRecord of subjectRecords){
            for(let subject in subjectRecord){
                if(subject == 'deduction')continue;
                for(let subRecord of subjectRecord[subject]){
                    if(subRecord['申請区分'].value == '入社' || subRecord['申請区分'].value == '入社手続'){
                        if(joiningCompany.indexOf(subRecord['社員番号'].value) == -1){
                            joiningCompany.push(subRecord['社員番号'].value);
                        }
                    }
                }
                if(clothingFlg[subject]){
                    if(subjectRecord[subject].length){
                        clothingFlg[subject] = clothingFlg[subject].concat(subjectRecord[subject]);
                    }
                }else{
                    if(subjectRecord[subject].length){
                        clothingFlg[subject] = subjectRecord[subject];
                    }
                }
            }
        }
        console.log(joiningCompany);

        let flgRequest = [];
        for(let flgApp in clothingFlg){
            let params = {
                method: "PUT",
                api: "/k/v1/records.json",
                payload: {
                    app: flgApp == "procedure"? EMC.APPID.procedureManagement:EMC.APPID.salaryManagement,
                    records:[]
                }
            }
            for(let clothing of clothingFlg[flgApp]){
                params.payload.records.push({
                    id: clothing["$id"].value,
                    record:{
                        "締日処理":{
                            value: ["済"]
                        }
                    }
                });
            }
            flgRequest.push(params);
        }

        let joiningEmployee;
        let employeeJoining = {};
        if(joiningCompany.length!==0){
            try{
            let joiningCondition = '';
            for(let joining of joiningCompany){
                if(joiningCondition == ''){
                    joiningCondition = `"${joining}"`;
                }else{
                    joiningCondition = joiningCondition + `,"${joining}"`;
                }
            }
            joiningEmployee = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.employment,`社員番号 in (${joiningCondition})`);
            
        }catch(error){
            EMC.ERROR('処理に失敗しました');
            EMC.SPIN.HIDE();
            return false;
        }
    
        
        // ---------------------------------------------------------------------------
        console.log(joiningEmployee);
        for(let joinEmploy of joiningEmployee){
            employeeJoining[joinEmploy['社員番号'].value] = joinEmploy;
        }
        console.log(employeeJoining);
    }
        // ---------------------------------------------------------------------------

        //対象レコード0件の確認
        let stopFlag = true;
        subjectRecords.forEach((subjectRecord) => {
            for (const [key, record] of Object.entries(subjectRecord)) {
                if (key !== 'deduction' && record.length > 0) {
                    stopFlag = false;
                    break;
                }
            }
        });
        if (stopFlag) {
            EMC.ERROR('対象のレコードが存在しません');
            EMC.SPIN.HIDE();
            return false;
        }

        let moldingRecords, coopRecords;
        try {
            // 社員番号ごとにデータを統合する
            moldingRecords = await EMC.CLOSING_DATE_PROCESS.DATA_FORMATTING(subjectRecords);
            // POSTとPUTの情報を作成する
            coopRecords = await EMC.CLOSING_DATE_PROCESS.JOIN_RECORD(moldingRecords, COOP_FIELDS, EMC.CLOSING_DATE_PROCESS.UNIFICATION_RECORDS,employeeJoining);
            // 支給控除管理アプリにレコード追加・更新
            await EMC.RESTAPI.POST_RECORDS(EMC.APPID.paymentDeduction, coopRecords.POST);
            await EMC.RESTAPI.PUT_RECORDS(EMC.APPID.paymentDeduction, coopRecords.PUT);
            if(flgRequest.length){
                await client.bulkRequest({requests:flgRequest});
            }

            //終了アラート
            await EMC.ALERT.FINISH(`${closingYear}月${closingMonth}月分の<br>締日処理が完了しました`, '対象のレコードを追加・更新しました');
            EMC.SPIN.HIDE();
            EMC.SAVE_SELECTINFO(closingYear, closingMonth);
            // 追加・更新成功後、画面リロード
            location.reload();
        } catch (e) {
            EMC.ERROR(e);
            console.log("end")
            EMC.SPIN.HIDE();
            return;
        }
    }

    /**
     * CSV出力処理を行う関数
     */
    async function outputCsv() {
        // 給与処理ヘッダーの設定値を取得
        const year = $(`#${EMC.DOM.yearId}`).val(); // 対象年
        const month = $(`#${EMC.DOM.monthId}`).val(); // 対象月
        const employmentList = $(`#${EMC.DOM.employmentListId}`).val(); // 雇用区分

        // 未入力・未選択チェック
        if (EMC.VALIDATION.TARGET_CLASSIFICATION([year, month, employmentList], EMC.ERROR)) {
            return false;
        }

        //JSON型からオブジェクト型に変換
        employmentList.forEach((employment, index, array) => {
            array[index] = EMC.JSON_PARSE(employment);
        });

        //開始のアラート表示
        const result = await EMC.ALERT.START(`${year}月${month}月`, '上記対象月のCSVを出力します');
        if (!result.isConfirmed) {
            return;
        }
        EMC.SPIN.SHOW();

        let closingList, promiseAry;
        try {
            //締日単位でまとめた配列を作成
            closingList = EMC.EMPLOYMENT_CLOSING.MAKE_CLOSING_LIST(employmentList);

            //各締日の対象年月の支給控除管理情報取得
            promiseAry = [];
            closingList.forEach((closing) => {
                promiseAry.push(EMC.RESTAPI.GET_RECORDS(EMC.APPID.paymentDeduction, `(${EMC.EMPLOYMENT_CLOSING.MAKE_EMPLOYMENT_QUERY(closing.employment)}) and ${EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY(year, month, closing.closing)}`));
              
            });
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }
        let  eachClosingRecordsList
        let targetObjs = [];
        try {
            eachClosingRecordsList = await Promise.all(promiseAry);
            //対象レコード全件が最初のステータス（出力対象のステータス）か確認→1件でも対象外のものがあったらエラー＆処理中断
            if (!EMC.CSV.CHECK_STATUS(eachClosingRecordsList, await EMC.STATUS.GET_FIRST())) {
              let close = closingList[0].employment.split(",")
              let list = `雇用区分 = "${close.shift()}"`
              close.forEach((c)=>{  list =list.concat(` or 雇用区分 = "${c}"`)})
              let error = `ステータス != "承認済" and ${EMC.EMPLOYMENT_CLOSING.MAKE_DATE_QUERY(year, month,30)} and (${list})`
              let ab8 = encodeURIComponent(error);
                EMC.ERROR(`承認が完了していないレコードが存在します<br><a href="${EMC.URL}${kintone.app.getId()}/?query=${ab8}" target="_blank">対象レコードを確認する</a>`);
                EMC.SPIN.HIDE();
                return;
            }
            //締日数だけCSVファイルデータの作成を行う
            const convertOBCRecords = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.convertOBCItem);
            eachClosingRecordsList.forEach( async (eachClosingRecords) => {
                if (eachClosingRecords.length > 0) {
                  let objs = []
                  for(let i in eachClosingRecords){
                    let value = eachClosingRecords[i]
                    let obj = {"$id":value.$id.value}
                    let cont = 1
                    for(let j in value["t_家族"].value){
                      let subtable = value["t_家族"].value[j].value
                      Object.keys(subtable).forEach((keys)=>{
                        let check = `${keys}_${cont}_奉行`
                        let aru =`${keys}_${cont}`
                        if(!Object.hasOwn(value,check)){
                          value[`${aru}`]=subtable[keys]
                          
                        }else{
                          obj[`${aru}`]=subtable[keys].value
                        }
                        
                      })
                      cont++
                    }
                    let methodFixed = false;
                    convertOBCRecords.forEach((OBCRecord) => {
                        if (!methodFixed && OBCRecord.起票元アプリID.value == kintone.app.getId() && OBCRecord.起票元レコードID.value == value.$id.value) {
                            objs.push({
                                record: obj,
                                method: 'PUT',
                                id: OBCRecord.$id.value,
                            });
                            methodFixed = true;
                        }
                    });
                    if (!methodFixed) {
                        objs.push({
                            record: obj,
                            method: 'POST',
                            id: '',
                        });
                    }
                  }
                   targetObjs.push(objs);
                }else{
                throw new Error('対象のレコードが存在しません');
                }
            });
            
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }
        try{
            await EMC.CONVERT_APP_COOP.BULK( EMC.APPID.convertOBCItem, targetObjs, EMC.RESTAPI.PUT_RECORDS, EMC.RESTAPI.POST_RECORDS);
          
        }catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }
        let convertOBCRecord =  await EMC.RESTAPI.GET_RECORDS(EMC.APPID.convertOBCItem);
          console.log(convertOBCRecord)
            eachClosingRecordsList.forEach((eachClosingRecords) => {
                  eachClosingRecords.forEach((record) => {
                    let targetRecord = {}
                    convertOBCRecord.forEach((OBCRecord) => {
                          if (OBCRecord.起票元アプリID.value == kintone.app.getId() && OBCRecord.起票元レコードID.value == record.$id.value) {
                            Object.keys(OBCRecord).forEach((key)=>{
                              if(OBCRecord[key].value!==""){
                              targetRecord[`${key}`]=OBCRecord[key]
                              }
                            })
                          }
                    });
                    console.log(targetRecord)
                       record =(Object.assign(record,targetRecord))
                  });
                  console.log(eachClosingRecordsList)
            });
        let OBCRecords, eachClosingRecordsLists
        const zip = new JSZip();
        try {
          eachClosingRecordsLists=await Promise.all(eachClosingRecordsList);
            //奉行コードマスタアプリのレコード情報取得
            OBCRecords = await EMC.RESTAPI.GET_RECORDS(EMC.APPID.corporationMaster, `奉行コード != "" and 項目区分 not in ("賞与")`, `奉行コード asc`);
            console.log(eachClosingRecordsLists)
            //締日数だけCSVファイルデータの作成を行う
            let processContinuousFlag;
            eachClosingRecordsLists.forEach((eachClosingRecords) => {
                if (eachClosingRecords.length > 0) {
                  console.log(eachClosingRecords)
                    EMC.CSV.MAKE_FILE(eachClosingRecords, OBCRecords, employmentList, year, month, EMC.CSV.MAKE_DATA, zip);
                    processContinuousFlag = true;
                }
            });
            //対象レコードがない場合は処理終了
            if (!processContinuousFlag) {
                throw new Error('対象のレコードが存在しません');
            }
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }

        try {
            //ZIPファイル出力処理
            EMC.DOWNLOAD_ZIP(zip, year, month);
            EMC.ALERT.FINISH('CSV出力完了', 'ダウンロードされていることを確認してください');
            EMC.SPIN.HIDE();
            EMC.SAVE_SELECTINFO(year, month);
        } catch (e) {
            EMC.ERROR(e);
            EMC.SPIN.HIDE();
            return;
        }
    }
})();
