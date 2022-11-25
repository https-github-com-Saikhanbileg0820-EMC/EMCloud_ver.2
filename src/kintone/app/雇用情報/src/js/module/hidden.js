(function() {
  'use strict';
  kintone.events.on(['app.record.index.show','app.record.detail.show'], function(event) {
    function toggle(className, displayState){
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++){
        elements[i].style.display = displayState;
    }
}
toggle('recordlist-edit-gaia', 'none'); // hides
toggle('recordlist-remove-gaia', 'none');
toggle('gaia-argoui-app-menu-add', 'none');
toggle('gaia-argoui-app-menu-edit', 'none');
toggle('gaia-argoui-optionmenubutton', 'none');
toggle('gaia-argoui-app-menu-copy', 'none');




    
  });
})();
