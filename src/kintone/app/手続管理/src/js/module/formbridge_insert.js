(function() {
  'use strict';
  
     // レコード詳細画面、
     kintone.events.on(["app.record.detail.show"], (event) => {
         console.log(event);
     
     });
    
    
    
     // レコード詳細画面、
     kintone.events.on(["app.record.detail.show"], (event) => {
       let record = event.record;

       // 値が最新だったら更新しない（ここは工夫してね）
       if (record.社員番号.value === record.社員番号_sub.value || !record.社員番号_sub.value) {
         return event;
       }
       
       // レコード更新のパラメータ設定
       const body = {
         app: kintone.app.getId(),
         id: kintone.app.record.getId(),
         record: {
           社員番号: {
             value: record.社員番号_sub.value,
             lookup: true
           }, 寡婦_ひとり親区分: {
             value: record.寡婦_ひとり親区分_sub.value,
             lookup: true
           }, 外国人区分: {
             value: record.外国人区分_sub.value,
             lookup: true
           }, 勤労学生区分: {
             value: record.勤労学生区分_sub.value,
             lookup: true
           }, 災害者区分: {
             value: record.災害者区分_sub.value,
             lookup: true
           }, 居住者区分: {
             value: record.居住者区分_sub.value,
             lookup: true
           }, 課税区分: {
             value: record.課税区分_sub.value,
             lookup: true
           }, 配偶者有無: {
             value: record.配偶者有無_sub.value,
             lookup: true
           }, 性別_配偶者: {
             value: record.性別_配偶者_sub.value,
             lookup: true
           }, 居住者区分_配偶者: {
             value: record.居住者区分_配偶者_sub.value,
             lookup: true
           }, 同居区分_配偶者: {
             value: record.同居区分_配偶者_sub.value,
             lookup: true
           }, 配偶者扶養有無: {
             value: record.配偶者扶養有無_sub.value,
             lookup: true
           }, 健保扶養区分_配偶者: {
             value: record.健保扶養区分_配偶者_sub.value,
             lookup: true
           }, 性別_家族_1: {
             value: record.性別_家族_1_sub.value,
             lookup: true
           }, 続柄_家族_1: {
             value: record.続柄_家族_1_sub.value,
             lookup: true
           }, 居住者区分_家族_1: {
             value: record.居住者区分_家族_1_sub.value,
             lookup: true
           }, 同居区分_家族_1: {
             value: record.同居区分_家族_1_sub.value,
             lookup: true
           }, 扶養区分_家族_1: {
             value: record.扶養区分_家族_1_sub.value,
             lookup: true
           }, 健保扶養区分_家族_1: {
             value: record.健保扶養区分_家族_1_sub.value,
             lookup: true
           }, 性別_家族_2: {
             value: record.性別_家族_2_sub.value,
             lookup: true
           }, 続柄_家族_2: {
             value: record.続柄_家族_2_sub.value,
             lookup: true
           }, 居住者区分_家族_2: {
             value: record.居住者区分_家族_2_sub.value,
             lookup: true
           }, 同居区分_家族_2: {
             value: record.同居区分_家族_2_sub.value,
             lookup: true
           }, 扶養区分_家族_2: {
             value: record.扶養区分_家族_2_sub.value,
             lookup: true
           }, 健保扶養区分_家族_2: {
             value: record.健保扶養区分_家族_2_sub.value,
             lookup: true
           }, 性別_家族_3: {
             value: record.性別_家族_3_sub.value,
             lookup: true
           }, 続柄_家族_3: {
             value: record.続柄_家族_3_sub.value,
             lookup: true
           }, 居住者区分_家族_3: {
             value: record.居住者区分_家族_3_sub.value,
             lookup: true
           }, 同居区分_家族_3: {
             value: record.同居区分_家族_3_sub.value,
             lookup: true
           }, 扶養区分_家族_3: {
             value: record.扶養区分_家族_3_sub.value,
             lookup: true
           }, 健保扶養区分_家族_3: {
             value: record.健保扶養区分_家族_3_sub.value,
             lookup: true
           }, 性別_家族_4: {
             value: record.性別_家族_4_sub.value,
             lookup: true
           }, 続柄_家族_4: {
             value: record.続柄_家族_4_sub.value,
             lookup: true
           }, 居住者区分_家族_4: {
             value: record.居住者区分_家族_4_sub.value,
             lookup: true
           }, 同居区分_家族_4: {
             value: record.同居区分_家族_4_sub.value,
             lookup: true
           }, 扶養区分_家族_4: {
             value: record.扶養区分_家族_4_sub.value,
             lookup: true
           }, 健保扶養区分_家族_4: {
             value: record.健保扶養区分_家族_4_sub.value,
             lookup: true
           }, 性別_家族_5: {
             value: record.性別_家族_5_sub.value,
             lookup: true
           }, 続柄_家族_5: {
             value: record.続柄_家族_5_sub.value,
             lookup: true
           }, 居住者区分_家族_5: {
             value: record.居住者区分_家族_5_sub.value,
             lookup: true
           }, 同居区分_家族_5: {
             value: record.同居区分_家族_5_sub.value,
             lookup: true
           }, 扶養区分_家族_5: {
             value: record.扶養区分_家族_5_sub.value,
             lookup: true
           }, 健保扶養区分_家族_5: {
             value: record.健保扶養区分_家族_5_sub.value,
             lookup: true
           }, 性別_家族_6: {
             value: record.性別_家族_6_sub.value,
             lookup: true
           }, 続柄_家族_6: {
             value: record.続柄_家族_6_sub.value,
             lookup: true
           }, 居住者区分_家族_6: {
             value: record.居住者区分_家族_6_sub.value,
             lookup: true
           }, 同居区分_家族_6: {
             value: record.同居区分_家族_6_sub.value,
             lookup: true
           }, 扶養区分_家族_6: {
             value: record.扶養区分_家族_6_sub.value,
             lookup: true
           }, 健保扶養区分_家族_6: {
             value: record.健保扶養区分_家族_6_sub.value,
             lookup: true
           }, 性別_家族_7: {
             value: record.性別_家族_7_sub.value,
             lookup: true
           }, 続柄_家族_7: {
             value: record.続柄_家族_7_sub.value,
             lookup: true
           }, 居住者区分_家族_7: {
             value: record.居住者区分_家族_7_sub.value,
             lookup: true
           }, 同居区分_家族_7: {
             value: record.同居区分_家族_7_sub.value,
             lookup: true
           }, 扶養区分_家族_7: {
             value: record.扶養区分_家族_7_sub.value,
             lookup: true
           }, 健保扶養区分_家族_7: {
             value: record.健保扶養区分_家族_7_sub.value,
             lookup: true
           }, 性別_家族_8: {
             value: record.性別_家族_8_sub.value,
             lookup: true
           }, 続柄_家族_8: {
             value: record.続柄_家族_8_sub.value,
             lookup: true
           }, 居住者区分_家族_8: {
             value: record.居住者区分_家族_8_sub.value,
             lookup: true
           }, 同居区分_家族_8: {
             value: record.同居区分_家族_8_sub.value,
             lookup: true
           }, 扶養区分_家族_8: {
             value: record.扶養区分_家族_8_sub.value,
             lookup: true
           }, 健保扶養区分_家族_8: {
             value: record.健保扶養区分_家族_8_sub.value,
             lookup: true
           }, 支給間隔1: {
             value: record.支給間隔1_sub.value,
             lookup: true
           }, 支給方法1: {
             value: record.支給方法1_sub.value,
             lookup: true
           }, 支給間隔2: {
             value: record.支給間隔2_sub.value,
             lookup: true
           }, 支給方法2: {
             value: record.支給方法2_sub.value,
             lookup: true
           }, 支給区分_給振1: {
             value: record.支給区分_給振1_sub.value,
             lookup: true
           }, 預金種目_給振1: {
             value: record.預金種目_給振1_sub.value,
             lookup: true
           }, 支給区分_給振2: {
             value: record.支給区分_給振2_sub.value,
             lookup: true
           }, 預金種目_給振2: {
             value: record.預金種目_給振2_sub.value,
             lookup: true
           }, 支給区分_賞振1: {
             value: record.支給区分_賞振1_sub.value,
             lookup: true
           }, 預金種目_賞振1: {
             value: record.預金種目_賞振1_sub.value,
             lookup: true
           }, 支給区分_賞振2: {
             value: record.支給区分_賞振2_sub.value,
             lookup: true
           }, 預金種目_賞振2: {
             value: record.預金種目_賞振2_sub.value,
             lookup: true
           }, 休職事由: {
             value: record.休職事由_sub.value,
             lookup: true
           }, 子_続柄: {
             value: record.子_続柄_sub.value,
             lookup: true
           },
         }, 
       };

       // フィールドの値を更新する
       return kintone.api(
         kintone.api.url("/k/v1/record.json", true), "PUT", body, (resp) => {
           // 更新できたらリロード
           location.reload();
         }
       );
     });
     
     
     kintone.events.on('app.record.create.change.氏名_ヘッダー', (event) => {
         let record = event.record;
         record.社員番号_sub.value = record.社員番号.value
         record.寡婦_ひとり親区分_sub.value = record.寡婦_ひとり親区分.value
         
         return event;
     });
     
     //社員番号をルックアップで取得したら社員番号subにコピー
     kintone.events.on('app.record.edit.change.氏名_ヘッダー', (event) => {
         let record = event.record;
         
         if(!record.社員番号_sub.value){
         record.社員番号_sub.value = record.社員番号.value
         
         return event;
         }
     });
     
})();

