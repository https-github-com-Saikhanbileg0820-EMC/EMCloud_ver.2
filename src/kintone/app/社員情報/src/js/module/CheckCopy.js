(function() {
    "use strict";
    var events = [
        // レコード編集時の処理
        'app.record.edit.change.賞与口座有無',
        'app.record.create.change.賞与口座有無'
        ]

    kintone.events.on(events,function(event) {
      
    if(event.record["賞与口座有無"].value.length===0){
      event.record["支給区分_賞振1"].value="";
      event.record["固定金額_賞振1"].value="";
      event.record["支給率_賞振1"].value="";
      event.record["振込先銀行_賞振1"].value="";
      event.record["振込先銀行名_賞振1"].value="";
      event.record["振込先支店_賞振1"].value="";
      event.record["振込先支店名_賞振1"].value="";
      event.record["預金種目_賞振1"].value="";
      event.record["口座番号_賞振1"].value="";
      event.record["フリガナ_賞振1"].value="";
      event.record["口座名義_賞振1"].value="";
      event.record["支給区分_賞振2"].value="";
      event.record["固定金額_賞振2"].value="";
      event.record["支給率_賞振2"].value="";
      event.record["振込先銀行_賞振2"].value="";
      event.record["振込先銀行名_賞振2"].value="";
      event.record["振込先支店_賞振2"].value="";
      event.record["振込先支店名_賞振2"].value="";
      event.record["預金種目_賞振2"].value="";
      event.record["口座番号_賞振2"].value="";
      event.record["フリガナ_賞振2"].value="";
      event.record["口座名義_賞振2"].value="";
      event.record["支給区分_賞振1"].lookup=true;
      event.record["預金種目_賞振1"].lookup=true;
      event.record["支給区分_賞振2"].lookup=true;
      event.record["預金種目_賞振2"].lookup=true;
    }else{
      event.record["支給区分_賞振1"].value=event.record["支給区分_給振1"].value;
      event.record["固定金額_賞振1"].value=event.record["固定金額_給振1"].value;
      event.record["支給率_賞振1"].value=event.record["支給率_給振1"].value;
      event.record["振込先銀行_賞振1"].value=event.record["振込先銀行_給振1"].value;
      event.record["振込先銀行名_賞振1"].value=event.record["振込先銀行名_給振1"].value;
      event.record["振込先支店_賞振1"].value=event.record["振込先支店_給振1"].value;
      event.record["振込先支店名_賞振1"].value=event.record["振込先支店名_給振1"].value;
      event.record["預金種目_賞振1"].value=event.record["預金種目_給振1"].value;
      event.record["口座番号_賞振1"].value=event.record["口座番号_給振1"].value;
      event.record["フリガナ_賞振1"].value=event.record["フリガナ_給振1"].value;
      event.record["口座名義_賞振1"].value=event.record["口座名義_給振1"].value;
      event.record["支給区分_賞振2"].value=event.record["支給区分_給振2"].value;
      event.record["固定金額_賞振2"].value=event.record["固定金額_給振2"].value;
      event.record["支給率_賞振2"].value=event.record["支給率_給振2"].value;
      event.record["振込先銀行_賞振2"].value=event.record["振込先銀行_給振2"].value;
      event.record["振込先銀行名_賞振2"].value=event.record["振込先銀行名_給振2"].value;
      event.record["振込先支店_賞振2"].value=event.record["振込先支店_給振2"].value;
      event.record["振込先支店名_賞振2"].value=event.record["振込先支店名_給振2"].value;
      event.record["預金種目_賞振2"].value=event.record["預金種目_給振2"].value;
      event.record["口座番号_賞振2"].value=event.record["口座番号_給振2"].value;
      event.record["フリガナ_賞振2"].value=event.record["フリガナ_給振2"].value;
      event.record["口座名義_賞振2"].value=event.record["口座名義_給振2"].value;
      event.record["支給区分_賞振1"].lookup=true;
      event.record["預金種目_賞振1"].lookup=true;
      event.record["支給区分_賞振2"].lookup=true;
      event.record["預金種目_賞振2"].lookup=true;
    }
    return event;
    });
    events = [
        // レコード編集時の処理
        'app.record.edit.change.現住所有無',
        'app.record.create.change.現住所有無'
        ]
    kintone.events.on(events,function(event) {
      
    if(event.record["現住所有無"].value.length===0){
      event.record["現住所_郵便番号"].value="";
      event.record["現住所_都道府県"].value="";
      event.record["現住所_市区町村"].value="";
      event.record["現住所_番地"].value="";
      event.record["現住所_建物名"].value="";
      event.record["現住所_都道府県_カナ"].value="";
      event.record["現住所_市区町村_カナ"].value="";
      event.record["現住所_建物名_カナ"].value="";
      event.record["現住所"].value="";
      event.record["現住所カナ"].value="";
    }else{
      event.record["現住所_郵便番号"].value=event.record["住民票_郵便番号"].value;
      event.record["現住所_都道府県"].value=event.record["住民票_都道府県"].value;
      event.record["現住所_市区町村"].value=event.record["住民票_市区町村"].value;
      event.record["現住所_番地"].value=event.record["住民票_番地"].value;
      event.record["現住所_建物名"].value=event.record["住民票_建物名"].value;
      event.record["現住所_都道府県_カナ"].value=event.record["住民票_都道府県_カナ"].value;
      event.record["現住所_市区町村_カナ"].value=event.record["住民票_市区町村_カナ"].value;
      event.record["現住所_建物名_カナ"].value=event.record["住民票_建物名_カナ"].value;
      event.record["現住所"].value=event.record["住民票"].value;
      event.record["現住所カナ"].value=event.record["住民票カナ"].value;
    }
    return event;
    });
})();

