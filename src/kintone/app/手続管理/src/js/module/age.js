(function() {
    "use strict";
    var events = [
        // レコード編集時の処理
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.create.change.生年月日',
        'app.record.edit.change.生年月日',
        'app.record.detail.change.生年月日'
        ]

    kintone.events.on(events,function(event) {
        // 生年月日情報を取得
        var date = new Date(event.record['生年月日'].value);
        var today = new Date();
        event.record['年齢'].disabled=true;
        // 年齢フィールドに年齢を登録
        if(!event.record['生年月日'].value){
           return event;
        }
        event.record['年齢'].value = calcAge(date,today)
        return event;;
    });

    // 年齢を計算する関数
    function calcAge(birthdate, targetdate) {
        var age = targetdate.getFullYear() - birthdate.getFullYear();
        var birthday = new Date(targetdate.getFullYear(), birthdate.getMonth(), birthdate.getDate());
        if (targetdate < birthday) {
            age--;
        }
        return age;
    }
  })();