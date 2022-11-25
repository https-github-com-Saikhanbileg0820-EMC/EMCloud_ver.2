(function() {
  'use strict';
  kintone.events.on('app.record.create.show', function(event) {
        //非表示
    function toggle(className, displayState){
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++){
        elements[i].style.display = displayState;
    }
}
    toggle('input-constraints-cybozu', 'none'); // hides
  });
})();
