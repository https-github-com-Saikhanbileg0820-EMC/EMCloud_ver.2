import $ from 'jquery';
import Swal from 'sweetalert2';

(function(){
    'use strict';
    const VIEW_NAME = 'フィールド名変更';
    const skipFieldType = ['CATEGORY','CREATED_TIME','CREATOR','MODIFIER','RECORD_NUMBER','STATUS','STATUS_ASSIGNEE','UPDATED_TIME'];
  
    kintone.events.on('app.record.index.show',async (e) => {
      // 設定バーを作成（アプリ選択／変更開始ボタン）
      const createSelects = async () => {
        // 自アプリの所属スペースを取得
        const body_app = {
          'id': kintone.app.getId()
        };
        const appInfo = await kintone.api(kintone.api.url('/k/v1/app.json', true), 'GET', body_app);
        // 自アプリが所属するスペース内の全アプリを取得
        const body_apps = {
          'spaceIds':[appInfo.spaceId]
        }
        const spaceApps = await kintone.api(kintone.api.url('/k/v1/apps.json', true), 'GET', body_apps);
        console.log(spaceApps);
        // ドロップダウンの選択肢を作成
        let appOptions = ``;
        for(let appObj of spaceApps.apps){
          appOptions +=`<option value="${appObj.appId}">[${appObj.appId}]:${appObj.name}</option>`;
        }
        // ヘッダースペースに配置する変更設定バー
        return`
        <div id="selectHeader" style="margin-left: 20px;margin-top: 20px;height: 60px;width: 555px;background-color: #3498db;line-height: 60px;border-radius: 5px;margin-bottom: 30px;">
          <select id="appSelect" style="height: 45px;width: 400px;color: #3498db;border: solid 1px #e3e7e8;padding-left: 10px;margin-left: 10px;">
            <option value="default">アプリを選択してください</option>
            ${appOptions}
          </select>
          <button id="startChangeBtn" style="height: 45px;width: 120px;color: #fff;margin-left: 8px;background-color: #3498db;border: 1px solid #fff;">変更開始</button>
        </div>`;
      }
  
      // 変更フィールド一覧作成
      const createChangeFields = (targetArray,index,type) => {
        if(targetArray[index+1]){
          $(`#${type}_main`)[0].append($(`<div style='display:flex;border-bottom: 1px solid #eeeeee;'>
            <div class='recordColumn' style='width: 50%;display: flex;height: 50px;line-height: 50px;font-size: 12px;margin-left: 50px;'><div class='fieldName' style="width: 380px;font-size: 14px;">${targetArray[index].label} [${targetArray[index].code}]</div><div class='yajirusi' style="width: 50px;color: #3498db;">▶▶▶</div><input class='changeText' type='text' name='{"type":"${targetArray[index].type}","code":"${targetArray[index].code}"}' style="height: 30px;margin-top: 7px;width: 200px;margin-left: 50px;border: 2px solid #3498db;font-size:12px;padding-left:5px;"></div>
            <div class='recordColumn' style='width: 50%;display: flex;height: 50px;line-height: 50px;font-size: 12px;margin-left: 50px;'><div class='fieldName' style="width: 380px;font-size: 14px;">${targetArray[index+1].label} [${targetArray[index+1].code}]</div><div class='yajirusi' style="width: 50px;color: #3498db;">▶▶▶</div><input class='changeText' type='text' name='{"type":"${targetArray[index+1].type}","code":"${targetArray[index+1].code}"}' style="height: 30px;margin-top: 7px;width: 200px;margin-left: 50px;border: 2px solid #3498db;font-size:12px;padding-left:5px;"></div>
          </div>
        `)[0])
        }else{
          $(`#${type}_main`)[0].append($(`<div style='display:flex;border-bottom: 1px solid #eeeeee;'>
            <div class='recordColumn' style='width: 50%;display: flex;height: 50px;line-height: 50px;font-size: 12px;margin-left: 50px;'><div class='fieldName' style="width: 380px;font-size: 14px;">${targetArray[index].label} [${targetArray[index].code}]</div><div class='yajirusi' style="width: 50px;color: #3498db;">▶▶▶</div><input class='changeText' type='text' name='{"type":"${targetArray[index].type}","code":"${targetArray[index].code}"}' style="height: 30px;margin-top: 7px;width: 200px;margin-left: 50px;border: 2px solid #3498db;font-size:12px;padding-left:5px;"></div>
          </div>
          `)[0]);
        }
        return index+2;
      }
  
      // アプリフィールド表示（メイン画面）
      const getShowFields = async (id,FIELD_CHANGE_MAIN,targetAppId) => {
        // 対象アプリの全フィールドを取得
        const targetFields = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {app:id});
        // タイプごとに連想配列化
        let eachOtherType = {};
        for(let field in targetFields.properties){
          if(eachOtherType[targetFields.properties[field].type]){
            eachOtherType[targetFields.properties[field].type].push(targetFields.properties[field]);
          }else{
            eachOtherType[targetFields.properties[field].type] = [targetFields.properties[field]];
          }
        }
  
        // 「変更反映」「キャンセル」ボタン作成
        $(FIELD_CHANGE_MAIN)[0].append($(`<div id="saveCancelBar" style="height: 70px;width: 100%;line-height: 70px;"><div id="btns" style="height:70px;width:400px;"><button id="saveBtn" style="height:45px;width:130px;margin-left:20px;background-color:#3498db;color:#fff;border:solid 1px #e3e7e8;">変更反映</button><button id="cancelBtn" style="height: 45px;width: 140px;margin-left: 20px;background-color: #fff;color: #3498db;border: solid 1px #e3e8e5;">キャンセル</button></div></div>`)[0]);
        for(let type in eachOtherType){
          // 変更対象に入れないフィールドタイプを省く
          if(skipFieldType.indexOf(`${type}`) === -1){
            // タイプ別バーと中身のメインコンテンツを作成
            $(FIELD_CHANGE_MAIN)[0].append($(`<div id="${type}" class="fieldsRecord_bar" style="background-color: #3498db;cursor:pointer;height:40px;width:100%;line-height:40px;font-weight:bold;color:#fff;display:flex;border:solid 1px #fff;";><div class='clickPoint' style="width: 50px;text-align: center;">▶</div>${type}</div>`)[0]);
            $(FIELD_CHANGE_MAIN)[0].append($(`<div id="${type}_main" class="fieldsRecord_main" style="height:auto;width:100%;display:none;padding-top:25px;padding-bottom:25px;" ></div>`)[0]);
            // タイプ別にメインコンテンツにフィールドを２列で表示
            let index = eachOtherType[type].length / 2;
            let a = eachOtherType[type]
            let b = eachOtherType[type]
            function compare(a,b){
                let index = 0
                let a_num = parseInt(a.label)
                let b_num = parseInt(b.label)
            
                if (a_num > b_num) {
                    index = 1
                }else if (a_num < b_num) {
                    index = -1
                }
                return index
            }
            
            a.sort((i,c)=>i.label.localeCompare(c.label))
            a.sort(compare)
            console.log(a)
            let counter = 0;
            for(let i = 0;i < index;i++){
              counter = createChangeFields(eachOtherType[type],counter,type);
            }
          }
        }
  
        // タイプ別バー押下時
        $('.fieldsRecord_bar').on('click', (clickElement)=>{
          console.log(clickElement.target.id);
          let shownFlg = $($(clickElement.target).find('.clickPoint')).html();
          if(shownFlg === '▶'){
            $($(clickElement.target).find('.clickPoint')).html('▼');
            $(`#${clickElement.target.id}_main`).css('display','block');
          }else{
            $($(clickElement.target).find('.clickPoint')).html('▶')
            $(`#${clickElement.target.id}_main`).css('display','none');
          }
        })
  
        // 「キャンセル」ボタン押下時の処理
        $('#cancelBtn').on('click',()=>{
          Swal.fire({
            icon:'warning',
            title:'変更を破棄しますか？',
            html:'設定値は反映されません',
            confirmButtonColor: "#3498db",
            showCancelButton: true,
            cancelButtonText: "キャンセル",
            allowOutsideClick: false,
          }).then((result)=>{
            if(result.isConfirmed){
              location.reload();
            }
          })
        })
  
        // 「変更反映」ボタン押下時の処理
        $('#saveBtn').on('click',()=>{
          Swal.fire({
            icon:'question',
            title:'変更をアプリに反映しますか？',
            html:'反映して問題ないか確認してください',
            confirmButtonColor: "#3498db",
            showCancelButton: true,
            cancelButtonText: "キャンセル",
            allowOutsideClick: false,
          }).then(async (result)=>{
            if(result.isConfirmed){
              let changes = $('.changeText');
              let changesObj = {};
              for(let change of changes){
                if(change.value){
                  let changeInfo = JSON.parse(change.name);
                  changesObj[changeInfo.code] = {type: changeInfo.type,label:change.value};
                }
              }
  
              let changeBody = {
                "app":targetAppId,
                "properties":changesObj
              }
              let deployBody = {
                "apps":[{"app":targetAppId}]
              }
              try{
                await kintone.api(kintone.api.url('/k/v1/preview/app/form/fields.json', true), 'PUT', changeBody);
                await kintone.api(kintone.api.url('/k/v1/preview/app/deploy.json', true), 'POST', deployBody);
                return true;
              }catch(error){
                console.log(error);
                return false;
              }
            }
          }).then((changeResult)=>{
            if(changeResult){
              Swal.fire({
                icon:"success",
                title:"フィールド名の変更が完了しました",
                html:`<a href="${location.protocol}//${location.host}/k/${targetAppId}/">変更したアプリを確認する</a>`,
                confirmButtonColor: "#3498db",
                allowOutsideClick: false
              }).then(()=>{
                location.reload();
              })
            }
          })
        })
      }
  
      // -----------------------------------------------------------------
      // メイン処理
      // -----------------------------------------------------------------
      try{
        console.log(e);
        if(e.viewName !== VIEW_NAME || e.viewType !== 'custom' ){
          return e;
        }
  
        const FIELD_CHANGE_MAIN = $(`#fieldNameChangeMain`)[0];
        const HEADER_SPACE = kintone.app.getHeaderSpaceElement();
        $(HEADER_SPACE)[0].append($(await createSelects())[0]);
        $('#startChangeBtn').on('click',async function(){
          let targetSelect = $('#appSelect');
          let targetAppID = $(targetSelect[0]).val();
          if(targetAppID !== 'default'){
            await Swal.fire({
              icon:"question",
              title:"フィールド名の変更を行いますか？",
              confirmButtonColor: "#3498db",
              showCancelButton: true,
              cancelButtonText: "キャンセル",
              allowOutsideClick: false,
            }).then(async(result)=>{
              if(result.isConfirmed){
                $(targetSelect[0])[0].disabled = true;
                $('#startChangeBtn')[0].disabled = true;
                $($('#startChangeBtn')[0]).css('color','#c2e0f4');
                await getShowFields(targetAppID,FIELD_CHANGE_MAIN,targetAppID);
              }
            })
          }else{
            await Swal.fire({
              icon:"error",
              title:"アプリを選択してください",
              html:"左側のドロップダウンから<br>フィールド名の変更を行うアプリを選択してください",
              confirmButtonColor: "#3498db",
              allowOutsideClick: false,
            });
          }
        })
        return e;
      }catch(error){
        console.log(error);
      }
    });
  })();
  