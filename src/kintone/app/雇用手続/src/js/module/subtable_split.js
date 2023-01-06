import $ from 'jquery';
(function() {
  'use strict';
  const SubtableCode = "6358271"
  const SubtableName = "t_家族"
  kintone.events.on(['app.record.detail.show','app.record.create.show','app.record.edit.show',`app.record.edit.change.${SubtableName}`, `app.record.create.change.${SubtableName}`], function(event) {
    Remove(SubtableCode);
    let a = $(`.subtable-${SubtableCode}`)
    if(a.children("tbody").children().length===0){
      setTimeout(function(){
     split(SubtableCode)
},2000);
    }
split(SubtableCode)
});



})();

const split = (SubtableCode)=>{

    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).addClass("subtable-split-each")
    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).width(1000)
    let a = $(`.subtable-${SubtableCode}`)
    let b = a.children("thead").children()
    const Waring = 900
    let bodyTop = 40
    let headTop = 0
    let left =0
    let d = a.children("tbody").children()
    for (let i =1;i <d.length;i++){
      let copy =b.clone().addClass("copy");
    $(`.subtable-${SubtableCode} thead`).append(copy)
    }
    let c = a.children("thead").children().children()
    let f =a.children("thead").children()
    for (let j = 0; j<d.length;j++){
      let test = d[j]
      let box = test.children
      left = 0
        for (let i =0;i<box.length;i++){
          if(left===0){
            $(box[i]).css({
            'border-left':'solid 1px #e3e7e8',
          })
          }
          $(box[i]).css({
            'box-sizing':'border-box',
            'top':`${bodyTop}px`,
            'left':`${left}px`,
          })
          $(box[i]).width($(c[i]).width())
          let add = $(box[i]).width()
          left+=add
          if(left>Waring){
            left = 0;
            bodyTop +=121;
          }
        }
        bodyTop+=181;
    }
    for (let j = 0; j<f.length;j++){
      let test = f[j]
      let box = test.children
      left = 0
        for (let i =0;i<box.length;i++){
              $(box[i]).css({
              'box-sizing':'border-box',
              'top':`${headTop}px`,
              'left':`${left}px`
              })
              let add = $(box[i]).width()
              left+=add
              if(left>Waring){
                left = 0;
                headTop +=121;
              }
        }
        headTop+=181;
    }
    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).height(bodyTop+60)
}
const Remove = (SubtableCode)=>{
    $(".copy").remove()
    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).addClass("subtable-split-each")
    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).width(1000)
    let a = $(`.subtable-${SubtableCode}`)
    const Waring = 1000
    let bodyTop = 40
    let headTop = 0
    let left =0
    let d = a.children("tbody").children()
    let c = a.children("thead").children().children()
    let f =a.children("thead").children()
    for (let j = 0; j<d.length;j++){
      let test = d[j]
      let box = test.children
      left = 0
        for (let i =0;i<box.length;i++){
          if(left===0){
            $(box[i]).css({
            'border-left':'',
          })
          }
          $(box[i]).css({
            'box-sizing':'',
            'top':``,
            'left':``,
          })
          $(box[i]).width($(c[i]).width())
          let add = $(box[i]).width()
          left+=add
          if(left>Waring){
            left = 0;
            bodyTop +=121;
          }
        }
        bodyTop+=181;
    }
    for (let j = 0; j<f.length;j++){
      let test = f[j]
      let box = test.children
      left = 0
        for (let i =0;i<box.length;i++){
              $(box[i]).css({
              'box-sizing':'',
              'top':``,
              'left':``
              })
              let add = $(box[i]).width()
              left+=add
              if(left>Waring){
                left = 0;
                headTop +=121;
              }
        }
        headTop+=181;
    }
    $(`.subtable-row-gaia.subtable-row-${SubtableCode}`).height(bodyTop+60)
}
