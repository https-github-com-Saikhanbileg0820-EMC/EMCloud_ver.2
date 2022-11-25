(function () {
    'use strict';
    kintone.events.on('space.portal.show', (event) => {
        window.alert('スペースのポータル画面を開きました');
        return event;
    });
})();
