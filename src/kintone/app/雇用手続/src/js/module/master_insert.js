(function () {
    'use strict';
    kintone.events.on(['app.record.edit.change.雇用手続区分', 'app.record.create.change.雇用手続区分'], function (event) {
        //paramsに環境マスタ-区分マスタの値を格納
        var params = {
            app: window.EMC.APPID.employProcedureMaster, //雇用手続マスタのアプリコードが決確定次第、更新
        };

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function (resp) {
            let allRec = resp.records.length;

            //テーブル削除を実行
            initRow('必要書類一覧');
            initRow('手続事務一覧案内事項');
            initRow('交付配布貸与物一覧');
            initRow('手続事務一覧');
            initRow('書類送付');
            initRow('対応事項');
            initRow('回収書類');
            initRow('回収物');
            initRow('退職後処理');

            //テーブルの最初のレコードをリセット
            const setReset = kintone.app.record.get();
            setReset.record.必要書類一覧.value[0].value.必要書類一覧_手続種別.value = '';
            setReset.record.必要書類一覧.value[0].value.必要書類一覧_タスク内容.value = '';
            setReset.record.手続事務一覧案内事項.value[0].value.手続事務一覧案内事項_手続種別.value = '';
            setReset.record.手続事務一覧案内事項.value[0].value.手続事務一覧案内事項_タスク内容.value = '';
            setReset.record.交付配布貸与物一覧.value[0].value.交付配布貸与物一覧_手続種別.value = '';
            setReset.record.交付配布貸与物一覧.value[0].value.交付配布貸与物一覧_タスク内容.value = '';
            setReset.record.手続事務一覧.value[0].value.手続事務一覧_手続種別.value = '';
            setReset.record.手続事務一覧.value[0].value.手続事務一覧_タスク内容.value = '';
            setReset.record.書類送付.value[0].value.書類送付_手続種別.value = '';
            setReset.record.書類送付.value[0].value.書類送付_タスク内容.value = '';
            setReset.record.対応事項.value[0].value.対応事項_手続種別.value = '';
            setReset.record.対応事項.value[0].value.対応事項_タスク内容.value = '';
            setReset.record.回収書類.value[0].value.回収書類_手続種別.value = '';
            setReset.record.回収書類.value[0].value.回収書類_タスク内容.value = '';
            setReset.record.回収物.value[0].value.回収物_手続種別.value = '';
            setReset.record.回収物.value[0].value.回収物_タスク内容.value = '';
            setReset.record.退職後処理.value[0].value.退職後処理_手続種別.value = '';
            setReset.record.退職後処理.value[0].value.退職後処理_タスク内容.value = '';
            kintone.app.record.set(setReset);

            const obj = kintone.app.record.get();

            //雇用区分の選択値を取得
            let set_category = obj.record.雇用手続区分.value;

            //レコードを取り出す。
            for (let i = 0; i < allRec; i++) {
                let kubun = resp.records[i].雇用手続_雇用手続種別.value;
                let catname = resp.records[i].雇用手続_タスク名.value;
                if (kubun === set_category) {
                    if (catname === '必要書類一覧') {
                        if (typeof obj.record.必要書類一覧.value[0].value.必要書類一覧_手続種別.value === 'undefined' || obj.record.必要書類一覧.value[0].value.必要書類一覧_手続種別.value === '') {
                            obj.record.必要書類一覧.value[0].value.必要書類一覧_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.必要書類一覧.value[0].value.必要書類一覧_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    必要書類一覧_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    必要書類一覧_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    必要書類一覧_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '手続事務一覧案内事項') {
                        if (typeof obj.record.手続事務一覧案内事項.value[0].value.手続事務一覧案内事項_手続種別.value === 'undefined') {
                            obj.record.手続事務一覧案内事項.value[0].value.手続事務一覧案内事項_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.手続事務一覧案内事項.value[0].value.手続事務一覧案内事項_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    手続事務一覧案内事項_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    手続事務一覧案内事項_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    手続事務一覧案内事項_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '交付配布貸与物一覧') {
                        if (typeof obj.record.交付配布貸与物一覧.value[0].value.交付配布貸与物一覧_手続種別.value === 'undefined') {
                            obj.record.交付配布貸与物一覧.value[0].value.交付配布貸与物一覧_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.交付配布貸与物一覧.value[0].value.交付配布貸与物一覧_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    交付配布貸与物一覧_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    交付配布貸与物一覧_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    交付配布貸与物一覧_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '手続事務一覧') {
                        if (typeof obj.record.手続事務一覧.value[0].value.手続事務一覧_手続種別.value === 'undefined') {
                            obj.record.手続事務一覧.value[0].value.手続事務一覧_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.手続事務一覧.value[0].value.手続事務一覧_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    手続事務一覧_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    手続事務一覧_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    手続事務一覧_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '書類送付') {
                        if (typeof obj.record.書類送付.value[0].value.書類送付_手続種別.value === 'undefined') {
                            obj.record.書類送付.value[0].value.書類送付_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.書類送付.value[0].value.書類送付_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    書類送付_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    書類送付_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    書類送付_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '対応事項') {
                        if (typeof obj.record.対応事項.value[0].value.対応事項_手続種別.value === 'undefined') {
                            obj.record.対応事項.value[0].value.対応事項_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.対応事項.value[0].value.対応事項_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    対応事項_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    対応事項_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    対応事項_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '回収書類') {
                        if (typeof obj.record.回収書類.value[0].value.回収書類_手続種別.value === 'undefined') {
                            obj.record.回収書類.value[0].value.回収書類_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.回収書類.value[0].value.回収書類_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    回収書類_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    回収書類_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    回収書類_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '回収物') {
                        if (typeof obj.record.回収物.value[0].value.回収物_手続種別.value === 'undefined') {
                            obj.record.回収物.value[0].value.回収物_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.回収物.value[0].value.回収物_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    回収物_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    回収物_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    回収物_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    } else if (catname === '退職後処理') {
                        if (typeof obj.record.退職後処理.value[0].value.退職後処理_手続種別.value === 'undefined') {
                            obj.record.退職後処理.value[0].value.退職後処理_手続種別.value = resp.records[i].雇用手続_雇用手続種別.value;
                            obj.record.退職後処理.value[0].value.退職後処理_タスク内容.value = resp.records[i].雇用手続_タスク内容.value;
                        } else {
                            obj['record'][catname].value.push({
                                value: {
                                    退職後処理_タスク完了日: {
                                        type: 'DATE',
                                        value: '',
                                    },
                                    退職後処理_手続種別: {
                                        type: 'SINGLE_LINE_TEXT',
                                        value: resp.records[i].雇用手続_雇用手続種別.value,
                                    },
                                    退職後処理_タスク内容: {
                                        type: 'MULTI_LINE_TEXT',
                                        value: resp.records[i].雇用手続_タスク内容.value,
                                    },
                                },
                            });
                        }
                    }
                }
            }
            kintone.app.record.set(obj);
        });

        //テーブル削除ロジック
        function initRow(table_name) {
            let record = kintone.app.record.get().record;
            console.log(record);
            for (let i = record[table_name].value.length; i >= 0; i--) {
                record[table_name].value.splice(i, 1);
            }
            kintone.app.record.set({ record: record });
            console.log('reset');
        }
    });
})();
