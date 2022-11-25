(() => {
    "use strict";

    window.EMC = window.EMC || {};

    Object.assign(window.EMC, {
        //最終ステータスを取得する処理
        GET_LAST_STATUS: async() => {
            const resp = await kintone.api(kintone.api.url("/k/v1/app/status.json", true), "GET", { app: kintone.app.getId() });

            const states = resp.states;

            const lastStates = {};
            for (let [state, info] of Object.entries(states)) {
                if (!Object.keys(lastStates).length) {
                    lastStates.state = state;
                    lastStates.index = Number(info.index);
                    continue;
                } else if (Number(info.index) > lastStates.index) {
                    lastStates.state = state;
                    lastStates.index = Number(info.index);
                }
            }

            return lastStates.state;
        },
    });
})();