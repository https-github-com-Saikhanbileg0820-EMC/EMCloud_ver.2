jQuery.noConflict();
(function ($, PLUGIN_ID) {
  "use strict";
  let config = {};
  let statuses = {};
  let startStatus = "";
  let appFields;
  let savedConfig;

  const SETTING_ELEMENT = `<div class="setting_record">
    <div class="setting_number">--</div>
    <div class="setting_details">
        <div class="setting_columns">
            <div class="setting_column first_column">
                <div class="first_status">
                    <label class="first_status_label">初期ステータス：</label>
                    <label class="first_status_text">未処理</label>
                </div>
            </div>
            <div id="column_1_1" class="setting_column">
                <div class="setting_column_inner">
                    <label class="arrow_label">＞＞＞</label>
                    <select class="setting_status">
                        <option value="0">選択してください</option>
                    </select>
                </div>
                <label class="must_label">必須項目設定</label>
            </div>
        </div>
        <button class="setting_column_addBtn">
            <label class="column_addBtn_label">追加</label>
            <div class="column_addBtn_elm">+</div>
        </button>
    </div>
    <div class="record_btns_column">
        <div class="record_btns">
            <button class="record_addBtn">+</button>
            <button class="record_delBtn">-</button>
        </div>
    </div>
</div>`;

  // キャンセルボタン
  $("#cancel").on("click", function () {
    history.back();
  });

  //保存ボタン
  $("#save").on("click", function () {
    let conf = {
      start: startStatus,
      branch: {
        field: $("#myselfFieldSelect")[0].selectedOptions[0].label,
        value: $("#myselfFieldSelect")[0].value,
      },
      flg: false,
    };

    let saveRecord = $(".main_content").find(".setting_record");
    for (let i = 0; i < saveRecord.length; i++) {
      let saveColumn = $(saveRecord[i]).find(".setting_status");
      let saveChoice = $(saveRecord[i]).find(".fieldsMultichoice");
      if ($(saveColumn[0]).val() == "0") {
        continue;
      } else {
        conf.flg = true;
      }
      conf[$(saveRecord[i]).find(".setting_number")[0].innerText] = [];

      for (let j = 0; j < saveColumn.length; j++) {
        conf[$(saveRecord[i]).find(".setting_number")[0].innerText].push({ label: $(saveColumn[j])[0].selectedOptions[0].label, value: $(saveColumn[j]).val(), must: $(saveChoice[j]).val() });
      }
    }

    console.log(conf);
    config["conf"] = JSON.stringify(conf);
    kintone.plugin.app.setConfig(config);
    history.back();
  });

  // ▼レコード追加
  $(document).on("click", ".record_addBtn", function () {
    console.log($(this));
    let cloneRecord = $(this).parent().parent().parent().clone();
    console.log(cloneRecord);
    // カラム
    let cloneRecord_column = $(cloneRecord).find(".setting_columns").find(".setting_column");
    let columnCount = 0;
    for (let column of cloneRecord_column) {
      console.log(column);
      console.log(cloneRecord_column.length);
      if (columnCount > 1) {
        $(column)[0].remove();
      } else if (columnCount === 1) {
        let lastColumn = cloneRecord_column[cloneRecord_column.length - 1];
        let splitColumnId = $(lastColumn)[0].id.split("_");
        $(column)[0].id = splitColumnId[0] + `_${cloneRecord_column.length + 1}` + `_${splitColumnId[2]}`;
      }
      columnCount += 1;
    }
    // メインコンテンツへの追加
    $(".main_content")[0].append($(cloneRecord)[0]);
  });

  // ▼レコード削除
  $(document).on("click", ".record_delBtn", function () {
    console.log($(this));
    $(this).parent().parent().parent().remove();
  });

  $(document).on("click", "#clearBtn", async function () {
    $("#myselfFieldSelect")[0].disabled = false;
    $("#clearBtn").css("display", "none");
    let recordIndex = $(".setting_record").length;
    for (let index = 0; index < recordIndex; index++) {
      $(".setting_record")[0].remove();
    }
    let removeOptions = $("#myselfFieldSelect")[0].children.length;
    for (let i = 1; i < removeOptions; i++) {
      $("#myselfFieldSelect")[0].children[1].remove();
    }
    $(".main_content").append($(SETTING_ELEMENT)[0]);
    await createFieldOptions(appFields);
    await moldingStatus(statuses);
    await createKUIcoponent($(".setting_column")[1]);
  });

  // ▼カラム追加
  $(document).on("click", ".setting_column_addBtn", async function () {
    console.log($(this));
    let findColumn = $($(this).parent()).find(".setting_column");
    let cloneColumn = $(findColumn[findColumn.length - 1]).clone();
    console.log(cloneColumn);
    let splitId = cloneColumn[0].id.split("_");
    cloneColumn[0].id = splitId[0] + `_${splitId[1]}` + `_${[findColumn.length]}`;

    let currentSelected = $(cloneColumn).find(".setting_status")[0].children;
    let currentSelectedLength = currentSelected.length;
    for (let i = 0; i < currentSelectedLength; i++) {
      $(currentSelected[1]).remove();
    }

    $($(this).parent()).find(".setting_columns")[0].append($(cloneColumn)[0]);
  });

  // ▼カラム削除
  $(document).on("click", ".setting_column_deleteBtn", function () {
    console.log($(this));
    let currentColumns = $(this).parent().parent().find(".setting_column");
    let delNum = $(this).parent()[0].id.split("_")[2];
    if (Number(delNum) === Number(1)) {
      delNum = Number(delNum) + 1;
    }
    for (let i = delNum; i < currentColumns.length; i++) {
      $(currentColumns[i])[0].remove();
    }
  });

  // option作成・追加
  async function createOptionValues(status, frontStatus, thisElement) {
    thisElement = thisElement ? thisElement : $(".setting_columns");
    let firstOptionValue = [];
    for (let sObj of status.actions) {
      if (sObj.from === frontStatus.name) {
        firstOptionValue.push(sObj.to);
      }
    }

    for (let myselfStatus of firstOptionValue) {
      let nextStatus = [];
      for (let stObj of status.actions) {
        if (stObj.from === myselfStatus) {
          nextStatus.push(JSON.stringify(stObj));
        }
      }
      $(thisElement)
        .find(".setting_status")
        [$(thisElement).find(".setting_status").length - 1].append($(`<option value=${JSON.stringify({ next: nextStatus })}>${myselfStatus}</option>`)[0]);
    }
  }

  // 初期ステータス・ドロップダウンの初期表示
  async function moldingStatus(status) {
    let firstStatus;
    for (let sName in status.states) {
      if (status.states[sName].index == 0) {
        $(".first_status_text")[0].innerText = status.states[sName].name;
        firstStatus = status.states[sName];
      }
    }
    startStatus = firstStatus;

    await createOptionValues(status, firstStatus, null);
  }

  // 上部ドロップダウンのoption
  async function createFieldOptions(fields) {
    for (let fieldName in fields) {
      if (fields[fieldName].type === "DROP_DOWN") {
        $("#myselfFieldSelect")[0].append($(`<option value=${JSON.stringify(fields[fieldName].options)}>${fieldName}</option>`)[0]);
      }
    }
  }

  async function createKUIcoponent(addElement, values) {
    let multiValue = values ? values : [""];

    let multiChoiceItems = [];
    for (let fieldCode in appFields) {
      if (
        appFields[fieldCode].type !== "CATEGORY" &&
        appFields[fieldCode].type !== "STATUS" &&
        appFields[fieldCode].type !== "RECORD_NUMBER" &&
        appFields[fieldCode].type !== "CREATED_TIME" &&
        appFields[fieldCode].type !== "CREATOR" &&
        appFields[fieldCode].type !== "STATUS_ASSIGNEE" &&
        appFields[fieldCode].type !== "UPDATED_TIME" &&
        appFields[fieldCode].type !== "MODIFIER"
      ) {
        multiChoiceItems.push({
          label: appFields[fieldCode].label,
          value: fieldCode,
        });
      }
    }

    multiChoiceItems = multiChoiceItems.sort();

    let fieldsMultiChoice = await new Kuc.MultiChoice({
      items: multiChoiceItems,
      value: multiValue,
      className: "fieldsMultichoice",
      visible: true,
      disabled: false,
    });

    $(addElement)[0].append($(fieldsMultiChoice)[0]);
    // $(".kuc-multi-choice-1-6-0__group").css("max-width", "200px");
  }

  // 上部ドロップダウンのchangeイベント
  $(document).on("change", "#myselfFieldSelect", async function () {
    let selectValue = JSON.parse($("#myselfFieldSelect").val());
    $("#myselfFieldSelect")[0].disabled = true;
    $("#clearBtn").css("display", "block");
    console.log(selectValue);
    let count = 0;
    for (let option in selectValue) {
      if (count !== 0) {
        // await
        $($(".record_addBtn")[0]).trigger("click");
      }
      let recordNumber = $($(".main_content").find(".setting_record")[count]).find(".setting_number")[0];
      $($($(".main_content").find(".setting_record")[count]).find(".fieldsMultichoice")[0]).remove();
      // await
      let savedConfigElement = savedConfig[option] ? savedConfig[option][0].must : null;
      createKUIcoponent($($(".main_content").find(".setting_record")[count]).find(".setting_column")[1], savedConfigElement);

      $(recordNumber)[0].innerText = selectValue[option].label;
      count += 1;
    }
  });

  // カラム内の設定ドロップダウンのchangeイベント
  $(document).on("change", ".setting_status", async function () {
    console.log($(this));
    let currentColumns = $(this).parent().parent().parent().find(".setting_column");
    let delNum = Number($(this).parent().parent()[0].id.split("_")[2]) + 1;
    for (let i = delNum; i < currentColumns.length; i++) {
      $(currentColumns[i])[0].remove();
    }
    let selectedValue = JSON.parse($(this).val());
    console.log(selectedValue);
    if (!JSON.parse($(this).val()).next.length) {
      return false;
    }
    let currentDetails = $(this).parent().parent().parent().parent()[0];
    let currentColumnAdd = $(currentDetails).find(".setting_column_addBtn")[0];
    // await
    $($(currentColumnAdd)[0]).trigger("click");

    // await
    createOptionValues(statuses, statuses.states[$(this)[0].selectedOptions[0].label], $(this).parent().parent().parent());

    let currentLabel = $(this).parent().parent().parent().parent().parent().find(".setting_number")[0].innerText;
    let newCreateColumn = $(currentDetails).find(".setting_column")[$(currentDetails).find(".setting_column").length - 1];
    $($(newCreateColumn).find(".fieldsMultichoice")[0]).remove();
    let savedConfElement = savedConfig[currentLabel] ? savedConfig[currentLabel][delNum - 1].must : null;
    await createKUIcoponent($(newCreateColumn)[0], savedConfElement);
    $($(this).parent().parent().parent()[0])[0].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
  });

  // 既設定値の表示
  async function setDefaultValue(savedConfig) {
    $("#myselfFieldSelect")[0].value = savedConfig.branch.value;
    // await
    $($("#myselfFieldSelect")[0]).trigger("change");

    let displayRecord = $(".main_content").find(".setting_record");
    for (let i = 0; i < displayRecord.length; i++) {
      let displayColumn = savedConfig[$(displayRecord[i]).find(".setting_number")[0].innerText];
      for (let j = 0; j < displayColumn.length; j++) {
        $($(displayRecord[i]).find(".setting_status")[j]).val(displayColumn[j].value);
        // await
        $($(displayRecord[i]).find(".setting_status")[j]).trigger("change");
      }
    }
  }

  //-----------------------------------------------------------------------------------------------------------------
  //main処理
  //-----------------------------------------------------------------------------------------------------------------
  let body = {
    app: kintone.app.getId(),
  };

  $.when(kintone.api(kintone.api.url("/k/v1/app/status.json", true), "GET", body), kintone.api(kintone.api.url("/k/v1/app/form/fields.json", true), "GET", body)).then(async function (status, fields) {
    try {
      // 既設定値を取得
      let getSavedConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
      savedConfig = getSavedConfig.conf ? JSON.parse(getSavedConfig.conf) : { flg: false };
      appFields = fields.properties;

      await createFieldOptions(appFields);

      statuses = status;
      if (status.actions) {
        let statusObj = await moldingStatus(status);
        console.log(statusObj);
      } else {
        throw "プロセス管理を有効にしてください<br>［アプリの設定 ＞ 設定 ＞ プロセス管理］<br>から設定を行ってください";
      }
      await createKUIcoponent($(".setting_column")[1]);

      // 既設定値があった場合、行追加＋表示
      if (savedConfig.flg) {
        await setDefaultValue(savedConfig);
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        html: err,
        allowOutsideClick: false,
        confirmButtonText: "OK",
        confirmButtonColor: "#3498db",
      }).then(function (result) {
        history.back();
      });
      return false;
    }
  });
  //-----------------------------------------------------------------------------------------------------------------
})(jQuery, kintone.$PLUGIN_ID);
