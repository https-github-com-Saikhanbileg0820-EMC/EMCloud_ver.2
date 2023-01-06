
(() => {
  
  window.addEventListener('load', (e) => {
    getProcedure().then(function() {
      return;
    })
  });

  function getProcedure() {
    return new kintone.Promise(() => {
      let param = {
        app: 5713,
        query: 'ステータス = "未申請"'
      };

      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', param, (resp) => {
        let data = {
          app: 5713,
          records: []
        };

        resp.records.forEach((val, idx) => {
          if(val.formbridgeフラグ.value === "編集データ有り") {
            sessionStorage.setItem('reload2', 'no');

            data.records.push({
              id: Number(val.$id.value),
              record: {
                '社員番号': {value: val.社員番号_sub.value},
                '寡婦_ひとり親区分': {value: val.寡婦_ひとり親区分_sub.value, lookup: true},
                '外国人区分': {value: val.外国人区分_sub.value, lookup: true},
                '勤労学生区分': {value: val.勤労学生区分_sub.value, lookup: true},
                '災害者区分': {value: val.災害者区分_sub.value, lookup: true},
                '居住者区分': {value: val.居住者区分_sub.value, lookup: true},
                '課税区分': {value: val.課税区分_sub.value, lookup: true},
                '支給間隔1': {value: val.支給間隔1_sub.value, lookup: true},
                '支給方法1': {value: val.支給方法1_sub.value, lookup: true},
                '支給間隔2': {value: val.支給間隔2_sub.value, lookup: true},
                '支給方法2': {value: val.支給方法2_sub.value, lookup: true},
                '支給区分_給振1': {value: val.支給区分_給振1_sub.value, lookup: true},
                '預金種目_給振1': {value: val.預金種目_給振1_sub.value, lookup: true},
                '支給区分_給振2': {value: val.支給区分_給振2_sub.value, lookup: true},
                '預金種目_給振2': {value: val.預金種目_給振2_sub.value, lookup: true},
                '支給区分_賞振1': {value: val.支給区分_賞振1_sub.value, lookup: true},
                '預金種目_賞振1': {value: val.預金種目_賞振1_sub.value, lookup: true},
                '支給区分_賞振2': {value: val.支給区分_賞振2_sub.value, lookup: true},
                '預金種目_賞振2': {value: val.預金種目_賞振2_sub.value, lookup: true},
                '子_続柄': {value: val.子_続柄_sub.value, lookup: true},
                '休職事由': {value: val.休職事由_sub.value, lookup: true},
                'formbridgeフラグ': {value: ""},
              }
            })
          }
        });

        return kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', data, (resp2) => {
          if(window.sessionStorage.getItem(['reload2']) != "ok"){
            sessionStorage.setItem('reload2', 'ok');
          }
        }, function (error) {
            console.log(error);
        });
      }, (error) => {
        console.log(error);
      });

    });
  }
})();
