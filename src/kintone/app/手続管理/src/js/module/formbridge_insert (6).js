(function() {
  'use strict';
  
     // レコード詳細画面、
kintone.events.on(["app.record.index.show"], (event) => {
    let records = event.records;
    let recNum = records.length;
    let appId = kintone.app.getId();
    let recs;

    let body = {
        app: appId,
        records: []
    };

    for (let i = 0; i < recNum; i++) {
    if(records[i].社員番号.value === ""){
        recs = records[i].$id.value;
        body.records.push(
            {
                id: Number(recs),
                record: {
                    社員番号: {
                        value: records[i].社員番号_sub.value,
                        lookup: true
                    },
                    '寡婦_ひとり親区分': {
                      'value': records[i].寡婦_ひとり親区分_sub.value,
                      lookup: true
                    },
                    '外国人区分': {
                      'value': records[i].外国人区分_sub.value,
                      lookup: true
                    },
                    '勤労学生区分': {
                      'value': records[i].勤労学生区分_sub.value,
                      lookup: true
                    },
                    '災害者区分': {
                      'value': records[i].災害者区分_sub.value,
                      lookup: true
                    },
                    '居住者区分': {
                      'value': records[i].居住者区分_sub.value,
                      lookup: true
                    },
                    '課税区分': {
                      'value': records[i].課税区分_sub.value,
                      lookup: true
                    },
                    '支給間隔1': {
                      'value': records[i].支給間隔1_sub.value,
                      lookup: true
                    },
                    '支給方法1': {
                      'value': records[i].支給方法1_sub.value,
                      lookup: true
                    },
                    '支給間隔2': {
                      'value': records[i].支給間隔2_sub.value,
                      lookup: true
                    },
                    '支給方法2': {
                      'value': records[i].支給方法2_sub.value,
                      lookup: true
                    },
                    '支給区分_給振1': {
                      'value': records[i].支給区分_給振1_sub.value,
                      lookup: true
                    },
                    '預金種目_給振1': {
                      'value': records[i].預金種目_給振1_sub.value,
                      lookup: true
                    },
                    '支給区分_給振2': {
                      'value': records[i].支給区分_給振2_sub.value,
                      lookup: true
                    },
                    '預金種目_給振2': {
                      'value': records[i].預金種目_給振2_sub.value,
                      lookup: true
                    },
                    '支給区分_賞振1': {
                      'value': records[i].支給区分_賞振1_sub.value,
                      lookup: true
                    },
                    '預金種目_賞振1': {
                      'value': records[i].預金種目_賞振1_sub.value,
                      lookup: true
                    },
                    '支給区分_賞振2': {
                      'value': records[i].支給区分_賞振2_sub.value,
                      lookup: true
                    },
                    '預金種目_賞振2': {
                      'value': records[i].預金種目_賞振2_sub.value,
                      lookup: true
                    },
                    '子_続柄': {
                      'value': records[i].子_続柄_sub.value,
                      lookup: true
                    },
                },
            }
        )
    }
    }//for

    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', body, function (resp) {
        // success
        console.log(resp);
        if(window.sessionStorage.getItem(['reload']) != "ok"){
          sessionStorage.setItem('reload', 'ok');
          location.reload();
        }
    }, function (error) {
        // error
        console.log(body);
        console.log(error);
    });
});
     
     
     kintone.events.on('app.record.create.submit', (event) => {
         let record = event.record;
         record.社員番号_sub.value = record.社員番号.value
         record.寡婦_ひとり親区分_sub.value = record.寡婦_ひとり親区分.value
         record.外国人区分_sub.value = record.外国人区分.value
         record.勤労学生区分_sub.value = record.勤労学生区分.value
         record.災害者区分_sub.value = record.災害者区分.value
         record.居住者区分_sub.value = record.居住者区分.value
         record.課税区分_sub.value = record.課税区分.value
         record.配偶者有無_sub.value = record.配偶者有無.value
         record.性別_配偶者_sub.value = record.性別_配偶者.value
         record.居住者区分_配偶者_sub.value = record.居住者区分_配偶者.value
         record.同居区分_配偶者_sub.value = record.同居区分_配偶者.value
         record.配偶者扶養有無_sub.value = record.配偶者扶養有無.value
         record.障害者区分_配偶者_sub.value = record.障害者区分_配偶者.value
         record.健保扶養区分_配偶者_sub.value = record.健保扶養区分_配偶者.value
         record.支給間隔1_sub.value = record.支給間隔1.value
         record.支給方法1_sub.value = record.支給方法1.value
         record.支給間隔2_sub.value = record.支給間隔2.value
         record.支給方法2_sub.value = record.支給方法2.value
         record.支給区分_給振1_sub.value = record.支給区分_給振1.value
         record.預金種目_給振1_sub.value = record.預金種目_給振1.value
         record.支給区分_給振2_sub.value = record.支給区分_給振2.value
         record.預金種目_給振2_sub.value = record.預金種目_給振2.value
         record.支給区分_賞振1_sub.value = record.支給区分_賞振1.value
         record.預金種目_賞振1_sub.value = record.預金種目_賞振1.value
         record.支給区分_賞振2_sub.value = record.支給区分_賞振2.value
         record.預金種目_賞振2_sub.value = record.預金種目_賞振2.value
         record.休職事由_sub.value = record.休職事由.value
         record.子_続柄_sub.value = record.子_続柄.value
         
         return event;
     });
     
     //社員番号をルックアップで取得したら社員番号subにコピー
     kintone.events.on('app.record.edit.submit', (event) => {
         let record = event.record;
         
         if(!record.社員番号_sub.value){
         record.社員番号_sub.value = record.社員番号.value
         record.寡婦_ひとり親区分_sub.value = record.寡婦_ひとり親区分.value
         record.外国人区分_sub.value = record.外国人区分.value
         record.勤労学生区分_sub.value = record.勤労学生区分.value
         record.災害者区分_sub.value = record.災害者区分.value
         record.居住者区分_sub.value = record.居住者区分.value
         record.課税区分_sub.value = record.課税区分.value
         record.配偶者有無_sub.value = record.配偶者有無.value
         record.性別_配偶者_sub.value = record.性別_配偶者.value
         record.居住者区分_配偶者_sub.value = record.居住者区分_配偶者.value
         record.同居区分_配偶者_sub.value = record.同居区分_配偶者.value
         record.配偶者扶養有無_sub.value = record.配偶者扶養有無.value
         record.障害者区分_配偶者_sub.value = record.障害者区分_配偶者.value
         record.健保扶養区分_配偶者_sub.value = record.健保扶養区分_配偶者.value
         record.支給間隔1_sub.value = record.支給間隔1.value
         record.支給方法1_sub.value = record.支給方法1.value
         record.支給間隔2_sub.value = record.支給間隔2.value
         record.支給方法2_sub.value = record.支給方法2.value
         record.支給区分_給振1_sub.value = record.支給区分_給振1.value
         record.預金種目_給振1_sub.value = record.預金種目_給振1.value
         record.支給区分_給振2_sub.value = record.支給区分_給振2.value
         record.預金種目_給振2_sub.value = record.預金種目_給振2.value
         record.支給区分_賞振1_sub.value = record.支給区分_賞振1.value
         record.預金種目_賞振1_sub.value = record.預金種目_賞振1.value
         record.支給区分_賞振2_sub.value = record.支給区分_賞振2.value
         record.預金種目_賞振2_sub.value = record.預金種目_賞振2.value
         record.休職事由_sub.value = record.休職事由.value
         record.子_続柄_sub.value = record.子_続柄.value
         
         return event;
         }
     });
     
})();

