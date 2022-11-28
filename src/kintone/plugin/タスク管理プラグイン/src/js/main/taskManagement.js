jQuery.noConflict();
(function ($, PLUGIN_ID) {
    'use strict';
    let config = { conf: {} };
    let jsonConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
    config.conf = JSON.parse(jsonConfig.conf);
    $(document).on('click', '#displayBtn', function () {
        let textFlg = $(this)[0].innerText;
        if (textFlg == '▶') {
            $($('#taskManagement_statusFlow')[0]).css('display', 'block');
            $(this)[0].innerText = '▼';
        } else if (textFlg == '▼') {
            $($('#taskManagement_statusFlow')[0]).css('display', 'none');
            $(this)[0].innerText = '▶';
        }
    });

    // イベント
    kintone.events.on('app.record.detail.show', async function (e) {
        try {
            console.log(config);
            console.log(e);
            const currentStatus = e.record['ステータス'].value;
            if ($('#taskManagement_statusFlow')[0]) {
                $('#taskManagement_statusFlow')[0].remove();
            }
            if ($('#displayBtn')[0]) {
                $('#displayBtn')[0].remove();
            }

            $('.gaia-argoui-app-show-toolbar')[0].append(
                $(`
            <div id="taskManagement_statusFlow">
                <div id="statusFlow">

                </div>
            </div>
            `)[0]
            );

            if (config.conf.branch.value !== '0') {
                let branchValue = e.record[config.conf.branch.field].value;
                if (!branchValue || !config.conf[branchValue]) {
                    $('#taskManagement_statusFlow')[0].remove();
                    return e;
                }
                let currentFlow = [config.conf.start];
                for (let flowObj of config.conf[branchValue]) {
                    currentFlow.push(flowObj);
                }

                let labelColorFlg = true;
                for (let flow of currentFlow) {
                    let cloneElement = $(`
                <div class="statusElement statusElement_odd">
                    <label class="statusLabel">${flow.label ? flow.label : flow.name}</label>
                    <div class="statusFlowElement">
                        <canvas class="line_before"></canvas>
                        <div class="statusPoint statusPoint_odd">
                            <div class="currentStatus Current"></div>
                        </div>
                        <canvas class="line_after"></canvas>
                    </div>
                </div>`)[0];

                    if (flow.label == currentStatus || flow.name == currentStatus) {
                        labelColorFlg = false;
                        for (let current = 0; current < $('.Current').length; current++) {
                            $($('.Current')[0]).removeClass('Current');
                        }
                        $($(cloneElement).find('.currentStatus')[0]).addClass('Current');
                    } else {
                        $($(cloneElement).find('.currentStatus')[0]).removeClass('Current');
                    }

                    if (labelColorFlg) {
                        $($(cloneElement).find('.statusLabel')[0]).css('color', '#d4d7d7');
                    }
                    $('#statusFlow')[0].append($(cloneElement)[0]);
                }

                let lineElement = $('.line_before');
                let lineAfterElement = $('.line_after');
                for (let i = 0; i < lineElement.length; i++) {
                    if (i !== 0) {
                        let context = lineElement[i].getContext('2d');
                        context.beginPath();
                        context.moveTo(0, 80);
                        context.lineTo(300, 80);
                        context.strokeStyle = '#242476';
                        context.lineWidth = 10;
                        context.stroke();
                    }
                    if (i !== Number(lineElement.length - 1)) {
                        let contextAfter = lineAfterElement[i].getContext('2d');
                        contextAfter.beginPath();
                        contextAfter.moveTo(0, 80);
                        contextAfter.lineTo(300, 80);
                        contextAfter.strokeStyle = '#242476';
                        contextAfter.lineWidth = 10;
                        contextAfter.stroke();
                    }
                }

                if (!$('#displayBtn')[0]) {
                    $('.gaia-app-statusbar-actions')[0].append($(`<div id="displayBtn" title="フローの表示／非表示">▼</div>`)[0]);
                    $('.gaia-app-statusbar-actions').css('display', 'flex');
                }
            } else {
                let branchValue = '--';
                if (!config.conf[branchValue]) {
                    $('#taskManagement_statusFlow')[0].remove();
                    return e;
                }
                let currentFlow = [config.conf.start];
                for (let flowObj of config.conf[branchValue]) {
                    currentFlow.push(flowObj);
                }

                let labelColorFlg = true;
                for (let flow of currentFlow) {
                    let cloneElement = $(`
                <div class="statusElement statusElement_odd">
                    <label class="statusLabel">${flow.label ? flow.label : flow.name}</label>
                    <div class="statusFlowElement">
                        <canvas class="line_before"></canvas>
                        <div class="statusPoint statusPoint_odd">
                            <div class="currentStatus Current"></div>
                        </div>
                        <canvas class="line_after"></canvas>
                    </div>
                </div>`)[0];

                    if (flow.label == currentStatus || flow.name == currentStatus) {
                        labelColorFlg = false;
                        for (let current = 0; current < $('.Current').length; current++) {
                            $($('.Current')[0]).removeClass('Current');
                        }
                        $($(cloneElement).find('.currentStatus')[0]).addClass('Current');
                    } else {
                        $($(cloneElement).find('.currentStatus')[0]).removeClass('Current');
                    }

                    if (labelColorFlg) {
                        $($(cloneElement).find('.statusLabel')[0]).css('color', '#d4d7d7');
                    }
                    $('#statusFlow')[0].append($(cloneElement)[0]);
                }

                let lineElement = $('.line_before');
                let lineAfterElement = $('.line_after');
                for (let i = 0; i < lineElement.length; i++) {
                    if (i !== 0) {
                        let context = lineElement[i].getContext('2d');
                        context.beginPath();
                        context.moveTo(0, 80);
                        context.lineTo(300, 80);
                        context.strokeStyle = '#242476';
                        context.lineWidth = 10;
                        context.stroke();
                    }
                    if (i !== Number(lineElement.length - 1)) {
                        let contextAfter = lineAfterElement[i].getContext('2d');
                        contextAfter.beginPath();
                        contextAfter.moveTo(0, 80);
                        contextAfter.lineTo(300, 80);
                        contextAfter.strokeStyle = '#242476';
                        contextAfter.lineWidth = 10;
                        contextAfter.stroke();
                    }
                }

                if (!$('#displayBtn')[0]) {
                    $('.gaia-app-statusbar-actions')[0].append($(`<div id="displayBtn" title="フローの表示／非表示">▼</div>`)[0]);
                    $('.gaia-app-statusbar-actions').css('display', 'flex');
                }
            }

            return e;
        } catch (error) {
            console.log(error);
            alert('タスク表示に失敗しました。\n設定を確認してください。');
            return false;
        }
    });

    kintone.events.on('app.record.detail.process.proceed', function (e) {
        let mustFields;
        let category;

        //2022-11-15 石井追記
        if (!e) return false;

        if (config.conf['branch'].value == '0') {
            category = '--';
        } else {
            category = e.record[config.conf['branch'].field].value;
        }

        for (let i = 0; i < config.conf[category].length; i++) {
            if (e.record['ステータス'].value == config.conf[category][i].label) {
                mustFields = config.conf[category][i].must;
                break;
            }
        }

        let errObj = { flg: false, text: '' };
        if (mustFields) {
            for (let must of mustFields) {
                if (must) {
                    if (!e.record[must].value) {
                        errObj.flg = true;
                        errObj.text = errObj.text + must + '／';
                    }
                }
            }
        }

        if (errObj.flg) {
            Swal.fire({
                icon: 'error',
                title: '以下の必須項目が未入力です',
                html: errObj.text,
                allowOutsideClick: false,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3498db',
            });
            return false;
        }
        return e;
    });
})(jQuery, kintone.$PLUGIN_ID);
