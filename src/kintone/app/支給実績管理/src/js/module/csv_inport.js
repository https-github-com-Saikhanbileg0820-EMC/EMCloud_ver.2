(function () {
    "use strict";
    kintone.events.on('app.record.index.show', function (event) {
        var tmp = document.getElementsByClassName("gaia-argoui-app-index-toolbar");
        var setid = "insertbtn";
        tmp[0].setAttribute("id", setid);
        var textbox_element = document.getElementById('insertbtn');
        textbox_element.insertAdjacentHTML('beforeend', '<div id="csvtoolbar"><input type="month" id="setmonth"></input><input id="csv_up" type="file"><button id="csvinport">CSV読込</button><div id="messagebox"></div></div>');
 
        const records = event.records;  //全レコード取得
        // console.log(records[0].登録日.value);
        // console.log(records);
        
        function formatDate(dt) { //今の日付を取得
          var y = dt.getFullYear();
          var m = ('00' + (dt.getMonth()+1)).slice(-2);
          var d = ('00' + dt.getDate()).slice(-2);
          return (y + '-' + m + '-' + d);
        }
        
        let clickeve = document.getElementById('csvinport');
        let fileInput = document.getElementById('csv_up');
        let fileReader = new FileReader();
        let mbox = document.getElementById('messagebox');
        // ファイル変更時イベント
        fileInput.onchange = () => {
            let file = fileInput.files[0];
            fileReader.readAsText(file, "Shift_JIS");
        };
        
        // let setmonth = document.getElementById('setmonth');
        // let choicedate = '2022-10';
        // setmonth.onchange = () => {
        //     let choicedate = setmonth.value;
        // };
        // console.log(choicedate);
        
            // ファイル読み込み時
            let items = [];
            let items_a = [];
            fileReader.onload = () => {
                // ファイル読み込み
                let fileResult = fileReader.result.split('\r\n');
                // 先頭行をヘッダとして格納
                let header = fileResult[1].split(',') //ヘッダーカラムを取得
                // 先頭行の削除
                // fileResult.shift();
                fileResult.splice(0, 2);
                // CSVから情報を取得
                items_a = fileResult.map(item => {
                    let datas = item.split(',');
                    let result = {};
                    for (const index in datas) {
                        let key = header[index];
                        let key2 = key.replace(/"/g, '')
                        let datas2 = datas[index].replace(/"/g, '')
                        if (datas2 != "") {
                            result[key2] = datas2;
                        }
                    }
                    return result;
                });
                for (let i = 0; i < items_a.length; i++) {
                    if(items_a[i].HM3010001 != undefined){
                        items[i] = items_a[i];
                    }
                }
                for (let i2 = 0; i2 < items.length; i2++) {
                    let setmonth = document.getElementById('setmonth');
                    let choicedate = setmonth.value;
                    for (let s = 0; s < records.length; s++) {
                        let cutdate = records[s].登録日.value;
                        let shainsum = records[s].社員番号.value;
                        let cutdate2 = cutdate.slice( 0, -3 );
                        let recnum = records[s].レコード番号.value;
                        if(cutdate2 == choicedate && items[i2].HM3010001 == shainsum){
                            const body2 = {
                                'app': kintone.app.getId(),
                                'ids': [recnum]
                            };
                        clickeve.addEventListener('click',function(){
                             kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', body2, (resp2) => {
                               // success
                               console.log(resp2);
                             }, (error) => {
                               // error
                               console.log(error);
                             });
                         });
                        }
                    }
                }
                
                for (let i = 0; i < items.length; i++) {
                    let setmonth2 = document.getElementById('setmonth');
                    let choicedate2 = setmonth2.value + "-01";
                    const body = {
                        'app': kintone.app.getId(),
                        'records': [{
                            '社員番号': {
                                "type": "NUMBER",
                                'value': items[i].HM3010001 //社員番号
                            },
                            '勤務日数1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110001 //出勤日数
                            },
                            '勤怠日数2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110002 //休出日数
                            },
                            '勤務日数3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110003 //特休日数
                            },
                            '有休1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110004 //有休日数
                            },
                            '有休1_1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110005 //時間有休
                            },
                            '代替休1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110006 //代替休日数
                            },
                            '代替休1_1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110007 //時間代替休
                            },
                            '勤務日数4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110008 //欠勤日数
                            },
                            '有休2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110009 //有休残
                            },
                            '有休2_1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110010 //有休残時間
                            },
                            '有休2_2': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110011 //時間有休残
                            },
                            '代替休2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110012 //代替休残
                            },
                            '代替休2_1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110013 //代替休残時間
                            },
                            '代替休3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110014 //代替振替日数
                            },
                            '代替休3_1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110015 //代替振替時間
                            },
                            '勤務時間1': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110030 //出勤時間
                            },
                            '勤務時間2': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110031 //遅早時間
                            },
                            '勤務時間3': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110032 //普通残業時間
                            },
                            '時間手当4': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110033 //深夜残業時間
                            },
                            '時間手当5': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110034 //休出残業時間
                            },
                            '時間手当6': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110035 //法定休日時間
                            },
                            '時間手当7': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110036 //残業予備１
                            },
                            '時間手当8': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110037 //残業予備２
                            },
                            '時間手当9': {
                                "type": "SINGLE_LINE_TEXT",
                                'value': items[i].HM5110038 //60時間超残業
                            },
                            '時間手当3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110132 //普通残業
                            },
                            '時間手当4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110133 //深夜残業
                            },
                            '時間手当5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110134 //休出残業
                            },
                            '時間手当6': {
                                "type": "NUMBER",
                                'value': items[i].HM5110135 //法定休日
                            },
                            '時間手当7': {
                                "type": "NUMBER",
                                'value': items[i].HM5110136 //残業予備１
                            },
                            '時間手当8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110137 //残業予備２
                            },
                            '時間手当9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110138 //60時間超残業
                            },
                            '支給1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110201 //基本給
                            },
                            '支給2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110202 //職能給
                            },
                            '支給3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110203 //役職手当
                            },
                            '支給4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110204 //家族手当
                            },
                            '支給5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110205 //住宅手当
                            },
                            '支給6': {
                                "type": "NUMBER",
                                'value': items[i].HM5110206 //技能手当
                            },
                            '支給7': {
                                "type": "NUMBER",
                                'value': items[i].HM5110207 //作業手当
                            },
                            '支給8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110208 //指導手当
                            },
                            '支給9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110209 //実績手当
                            },
                            '支給10': {
                                "type": "NUMBER",
                                'value': items[i].HM5110210 //固定残業代
                            },
                            '支給11': {
                                "type": "NUMBER",
                                'value': items[i].HM5110211 //皆勤手当
                            },
                            '支給12': {
                                "type": "NUMBER",
                                'value': items[i].HM5110212 //精勤手当
                            },
                            '支給13': {
                                "type": "NUMBER",
                                'value': items[i].HM5110213 //会議手当
                            },
                            '支給14': {
                                "type": "NUMBER",
                                'value': items[i].HM5110214 //手当Ａ
                            },
                            '支給15': {
                                "type": "NUMBER",
                                'value': items[i].HM5110215 //ｸﾘｰﾆﾝｸﾞ手当
                            },
                            '支給16': {
                                "type": "NUMBER",
                                'value': items[i].HM5110216 //宿日直手当
                            },
                            '支給17': {
                                "type": "NUMBER",
                                'value': items[i].HM5110217 //食事手当
                            },
                            '支給18': {
                                "type": "NUMBER",
                                'value': items[i].HM5110228 //通勤手当
                            },
                            '支給18_1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110229 //課税通勤手当
                            },
                            '支給19': {
                                "type": "NUMBER",
                                'value': items[i].HM5110230 //残業手当
                            },
                            '支給20': {
                                "type": "NUMBER",
                                'value': items[i].HM5110231 //減額金
                            },
                            '支給内訳0': {
                                "type": "NUMBER",
                                'value': items[i].HM5110301 //その他減額金
                            },
                            '支給内訳1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110302 //売上額
                            },
                            '支給内訳2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110303 //支給内訳２
                            },
                            '支給内訳3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110304 //支給内訳3
                            },
                            '支給内訳4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110305 //支給内訳４
                            },
                            '支給内訳5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110306 //支給内訳５
                            },
                            '支給内訳6': {
                                "type": "NUMBER",
                                'value': items[i].HM5110307 //支給内訳６
                            },
                            '支給内訳7': {
                                "type": "NUMBER",
                                'value': items[i].HM5110308 //支給内訳７
                            },
                            '支給内訳8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110309 //支給内訳８
                            },
                            '支給内訳9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110310 //支給内訳９
                            },
                            '支給内訳10': {
                                "type": "NUMBER",
                                'value': items[i].HM5110311 //支給内訳１０
                            },
                            '控除1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110401 //健康保険料
                            },
                            '控除1_1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110402 //介護保険料
                            },
                            '控除2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110403 //厚生年金保険
                            },
                            '控除3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110404 //厚生年金基金
                            },
                            '控除4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110405 //雇用保険料
                            },
                            '控除5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110406 //所得税
                            },
                            '控除6': {
                                "type": "NUMBER",
                                'value': items[i].HM5110407 //住民税
                            },
                            '控除7': {
                                "type": "NUMBER",
                                'value': items[i].HM5110408 //親善会費
                            },
                            '控除8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110409 //生命保険
                            },
                            '控除9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110410 //財形貯蓄
                            },
                            '控除10': {
                                "type": "NUMBER",
                                'value': items[i].HM5110411 //施設利用料
                            },
                            '控除11': {
                                "type": "NUMBER",
                                'value': items[i].HM5110412 //組合会費
                            },
                            '控除12': {
                                "type": "NUMBER",
                                'value': items[i].HM5110413 //共済会費
                            },
                            '控除13': {
                                "type": "NUMBER",
                                'value': items[i].HM5110414 //共同購入費
                            },
                            '控除14': {
                                "type": "NUMBER",
                                'value': items[i].HM5110415 //食事控除
                            },
                            '控除15': {
                                "type": "NUMBER",
                                'value': items[i].HM5110416 //家賃
                            },
                            '控除16': {
                                "type": "NUMBER",
                                'value': items[i].HM5110417 //預り金
                            },
                            '控除17': {
                                "type": "NUMBER",
                                'value': items[i].HM5110418 //共済借入金
                            },
                            '控除18': {
                                "type": "NUMBER",
                                'value': items[i].HM5110419 //前貸金
                            },
                            '控除19': {
                                "type": "NUMBER",
                                'value': items[i].HM5110420 //控除１９
                            },
                            '控除20': {
                                "type": "NUMBER",
                                'value': items[i].HM5110421 //通勤費現物
                            },
                            '基本保険料': {
                                "type": "NUMBER",
                                'value': items[i].HM5110501 //基本保険料
                            },
                            '特定保険料': {
                                "type": "NUMBER",
                                'value': items[i].HM5110502 //特定保険料
                            },
                            '控除内訳1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110504 //財形UFJ
                            },
                            '控除内訳2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110505 //財形三井住友
                            },
                            '控除内訳3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110506 //生保第一生命
                            },
                            '控除内訳4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110507 //生保日本生命
                            },
                            '控除内訳5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110508 //控除内訳５
                            },
                            '控除内訳6': {
                                "type": "NUMBER",
                                'value': items[i].HM5110509 //控除内訳６
                            },
                            '控除内訳7': {
                                "type": "NUMBER",
                                'value': items[i].HM5110510 //控除内訳７
                            },
                            '控除内訳8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110511 //控除内訳８
                            },
                            '控除内訳9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110512 //控除内訳９
                            },
                            '控除内訳10': {
                                "type": "NUMBER",
                                'value': items[i].HM5110513 //控除内訳１０
                            },
                            '計算1': {
                                "type": "NUMBER",
                                'value': items[i].HM5110601 //総支給金額
                            },
                            '計算2': {
                                "type": "NUMBER",
                                'value': items[i].HM5110602 //控除合計額
                            },
                            '計算3': {
                                "type": "NUMBER",
                                'value': items[i].HM5110603 //差引支給額
                            },
                            '計算4': {
                                "type": "NUMBER",
                                'value': items[i].HM5110604 //銀行１振込額
                            },
                            '計算5': {
                                "type": "NUMBER",
                                'value': items[i].HM5110605 //銀行２振込額
                            },
                            '計算8': {
                                "type": "NUMBER",
                                'value': items[i].HM5110608 //現金支給額
                            },
                            '計算9': {
                                "type": "NUMBER",
                                'value': items[i].HM5110609 //翌月繰越額
                            },
                            '計算10': {
                                "type": "NUMBER",
                                'value': items[i].HM5110610 //前月繰越額
                            },
                            '支給2回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111002 //職能給
                            },
                            '支給3回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111003 //役職手当
                            },
                            '支給4回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111004 //家族手当
                            },
                            '支給5回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111005 //住宅手当
                            },
                            '支給6回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111006 //技能手当
                            },
                            '支給7回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111007 //作業手当
                            },
                            '支給8回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111008 //指導手当
                            },
                            '支給9回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111009 //実績手当
                            },
                            '支給10回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111010 //固定残業代
                            },
                            '支給11回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111011 //皆勤手当
                            },
                            '支給12回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111012 //精勤手当
                            },
                            '支給13回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111013 //会議手当
                            },
                            '支給14回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111014 //手当Ａ
                            },
                            '支給15回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111015 //ｸﾘｰﾆﾝｸﾞ手当
                            },
                            '支給16回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111016 //宿日直手当
                            },
                            '支給17回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111017 //食事手当
                            },
                            '支給内訳1回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111101 //売上額
                            },
                            '支給内訳2回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111102 //支給内訳２
                            },
                            '支給内訳3回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111103 //支給内訳3
                            },
                            '支給内訳4回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111104 //支給内訳４
                            },
                            '支給内訳5回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111105 //支給内訳５
                            },
                            '支給内訳6回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111106 //支給内訳６
                            },
                            '支給内訳7回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111107 //支給内訳７
                            },
                            '支給内訳8回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111108 //支給内訳８
                            },
                            '支給内訳9回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111109 //支給内訳９
                            },
                            '支給内訳10回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111110 //支給内訳１０
                            },
                            '控除7回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111207 //親善会費
                            },
                            '控除8回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111208 //生命保険
                            },
                            '控除9回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111209 //財形貯蓄
                            },
                            '控除10回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111210 //施設利用料
                            },
                            '控除11回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111211 //組合会費
                            },
                            '控除12回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111212 //共済会費
                            },
                            '控除13回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111213 //共同購入費
                            },
                            '控除14回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111214 //食事控除
                            },
                            '控除15回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111215 //家賃
                            },
                            '控除16回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111216 //預り金
                            },
                            '控除17回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111217 //共済借入金
                            },
                            '控除18回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111218 //前貸金
                            },
                            '控除19回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111219 //控除１９
                            },
                            '控除20回数・時間': {
                                "type": "NUMBER",
                                'value': items[i].HM5111220 //通勤費現物
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111301 //財形UFJ
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111302 //財形三井住友
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111303 //生保第一生命
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111304 //生保日本生命
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111305 //控除内訳５
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111306 //控除内訳６
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111307 //控除内訳７
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111308 //控除内訳８
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111309 //控除内訳９
                            },
                            '出勤日数': {
                                "type": "NUMBER",
                                'value': items[i].HM5111310 //控除内訳１０
                            },
                            '登録日': {
                                "type": "DATE",
                                'value': choicedate2
                            }
                        }]
                    };
                    clickeve.addEventListener('click',function(){
                    kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', body, (resp) => {
                        // success
                        console.log(resp);
                        mbox.innerText = items.length + "件のデータを読み込みました。"
                    }, (error) => {
                        // error
                        console.log(error);
                    });
                    });
                }
            }
            fileReader.onerror = () => {
                items = [];
                mbox.innerHTML = "ファイル読み取りに失敗しました。"
            }
    });
})();