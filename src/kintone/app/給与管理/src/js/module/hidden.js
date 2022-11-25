(function() {
  'use strict';
  kintone.events.on('app.record.index.show', function(event) {
    function toggle(className, displayState){
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++){
        elements[i].style.display = displayState;
    }
}
toggle('recordlist-edit-gaia', 'none'); //一覧の編集ボタン
toggle('recordlist-remove-gaia', 'none');//一覧の削除ボタン

    
  });
})();
