(function() {
  'use strict';
  kintone.events.on(['app.record.create.show','app.record.index.show'], function(event) {
        //非表示
    function toggle(className, displayState){
    let elements = document.getElementsByClassName(className)

    for (let i = 0; i < elements.length; i++){
        elements[i].style.display = displayState;
    }
}
    toggle('input-constraints-cybozu', 'none'); // 数字の制限
    toggle('recordlist-edit-gaia', 'none'); //一覧の編集ボタン
    toggle('recordlist-remove-gaia', 'none');//一覧の削除ボタン
    
    
  });
})();
