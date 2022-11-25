(function() {
  'use strict';
  const CONFIG = window.EMC;
  kintone.events.on('app.record.detail.delete.submit', async(event)=> {
    if (event.record.ステータス && event.record.ステータス.value === (await CONFIG.GET_LAST_STATUS())) {
           event.error ="承認されているレコードです。　削除できません。";
        }
        return event
  });
})();
