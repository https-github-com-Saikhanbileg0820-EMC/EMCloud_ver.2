(function () {
    "use strict";
    kintone.events.on(['app.record.edit.show', 'app.record.detail.show', 'app.record.edit.change.雇用区分', 'app.record.edit.change.雇用区分コピー', 'app.record.create.change.雇用区分', 'app.record.create.change.雇用区分コピー', 'app.record.create.show'], function(event){
      
      const setcolmun = ['給与支給1','給与支給2','給与支給3','給与支給4','給与支給5','給与支給6','給与支給7','給与支給8','給与支給9','給与支給10','給与支給11','給与支給12','給与支給13','給与支給14','給与支給15','給与支給16','給与支給17','給与支内1','給与支内2','給与支内3','給与支内4','給与支内5','給与支内6','給与支内7','給与支内8','給与支内9','給与支内10','給与控除7','給与控除8','給与控除9','給与控除10','給与控除11','給与控除12','給与控除13','給与控除14','給与控除15','給与控除16','給与控除17','給与控除18','給与控除19','給与控除20','給与控内1','給与控内2','給与控内3','給与控内4','給与控内5','給与控内6','給与控内7','給与控内8','給与控内9','給与控内10']
      
      var kubun = event.record.雇用区分.value;
      
      let classsearch = document.querySelectorAll(".targetform");
      
      if(classsearch.length > 0 && kubun === undefined) {
          for(let y = 0; y < classsearch.length; y++) {
              classsearch[y].innerHTML = setcolmun[y];
          }
      }
      
      let matches = document.querySelectorAll(".control-label-gaia .control-label-text-gaia");
      
      console.log(matches);
      
        //paramsに環境マスタ-区分マスタの値を格納
        var params = {
            'app': window.EMC.APPID.environmentMaster,
            'fields':['雇用区分','給与支給1_c','給与支給2_c','給与支給3_c','給与支給4_c','給与支給5_c','給与支給6_c','給与支給7_c','給与支給8_c','給与支給9_c','給与支給10_c','給与支給11_c','給与支給12_c','給与支給13_c','給与支給14_c','給与支給15_c','給与支給16_c','給与支給17_c','給与支内1_c','給与支内2_c','給与支内3_c','給与支内4_c','給与支内5_c','給与支内6_c','給与支内7_c','給与支内8_c','給与支内9_c','給与支内10_c','給与控除7_c','給与控除8_c','給与控除9_c','給与控除10_c','給与控除11_c','給与控除12_c','給与控除13_c','給与控除14_c','給与控除15_c','給与控除16_c','給与控除17_c','給与控除18_c','給与控除19_c','給与控除20_c','給与控内1_c','給与控内2_c','給与控内3_c','給与控内4_c','給与控内5_c','給与控内6_c','給与控内7_c','給与控内8_c','給与控内9_c','給与控内10_c'],
            'query': 'マスタ区分 in ("雇用区分")'
        };
        
        kintone.api(
          kintone.api.url('/k/v1/records', true),
          'GET',
          params
        )
        .then(function(resp) {
            let setfields = params.fields;
            
            setfields = setfields.map(function(a){
              return a.replace('_c', '');
            });
            
            for(let i = 0; i < resp.records.length; i++) {
                if(resp.records[i].雇用区分.value == kubun){
                    for(let s = 0; s < matches.length; s++) {
                        for(let p = 1; p <= setfields.length; p++) {
                            let setvals = setfields[p] + '_c';
                             if(matches[s].innerHTML == setfields[p] && resp['records'][i][setvals].value != ""){matches[s].innerHTML = resp['records'][i][setvals].value; matches[s].classList.add("targetform");}
                        }
                    }
                }
            }
        })
    });
})();