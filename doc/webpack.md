<a id="tableOfContents"></a>

# webpack でのバンドル手順

-   [index.js の記述方法](#indexWriting)
-   [ライブラリの使用方法](#libraryHowToUse)
-   [バンドルの手順](#bundleProcedure)
-   [その他注意事項等](#others)

---

</br>
<a id="indexWriting"></a>

## --- index.js の記述方法 ---

```
import '../css/style.css';
import './module/config.js';
import './module/common.js';
import './module/fieldchange';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCpaymentDeduction', true);
})();
```

`import "実行したいソースファイルのパス"`

上記の形式で記述して下さい

上からファイルが読み込まれるので「設定関連ファイル → 処理実行ファイル」の順で上から記述してください

※開発用の indexDev.js にはライセンキーチェックの処理は不要です

<a id="libraryHowToUse"></a>

[目次に戻る](#tableOfContents)

</br>

## --- ライブラリの使用方法 ---

各ソースファイル内でライブラリを使用する場合は基本的には npm でパッケージのインストールを行い使用するようにしてください

**_利用手順_**

1. 使用したいライブラリがパッケージとして登録されているか確認する
2. src フォルダに移動し `npm i パッケージ名` でパッケージのインストールを行う
3. 実際にライブラリを使用したいソースファイル内の最初でインポートする<br>
   例: jQuery の場合<br>
   `import $ from 'jquery'`<br>
   ※必ず最初の行でインポートしてください<br>
   &emsp;即時関数を利用している場合は関数外でかならずインポートをしてください

※ライブラリがパッケージとして登録されていなかった場合<br>
ライブラリをローカルファイルでダウンロードし、module 内に配置した上で index.js に import で読み込ませて下さい

<a id="bundleProcedure"></a>

[目次に戻る](#tableOfContents)

</br>

## --- バンドルの手順 ---

-   バンドル対象を指定して行う方法
    1. src フォルダに移動
    1. 開発用ファイルを作成する場合は<br>
       `npm run dev-バンドル対象フォルダ名`<br>
       本番用ファイルを作成する場合は<br>
       `npm run prd-バンドル対象フォルダ名`<br>
       を実行
    1. 対象フォルダの dist フォルダ内にバンドルされたファイルが出力されます
        - 開発用は `dist/dev` に出力
        - 本番用は `dist/prd` に出力
-   バンドル対象の指定を行わない方法
    1. バンドル対象のフォルダに移動
    1. 開発用ファイルを作成する場合は<br>
       `npm run dev`<br>
       本番用ファイルを作成する場合は<br>
       `npm run prd`<br>
       を実行
    1. 対象フォルダの dist フォルダ内にバンドルされたファイルが出力されます
    -   開発用は `dist/dev` に出力
    -   本番用は `dist/prd` に出力

<a id="others"></a>

[目次に戻る](#tableOfContents)

</br>

## --- その他注意事項等 ---

-   index.js について<br>
    本番用の index.js と開発用の indexDev.js が存在します<br>
    本番用にはライセンキーのチェックが組み込まれていますが、開発時にはチェックが不要となるので開発用にはライセンキーのチェックが組み込まれていません<br>
    バンドル時には本番と開発で別の index.js を起点にバンドルするので<span style="color: #ff0000">必ず本番用のファイルをバンドルする前に</span> index.js と indexDev.js の import 部分が同様のものになっている確認してください

-   アプリの増減が発生した場合<br>

    1. `/EMCloud_ver.2/src/app` の階層に "\_アプリ追加時用テンプレート"のフォルダがあるので、このフォルダをコピーしてフォルダ名をアプリ名に変更してください
    2. 作成フォルダ内の "package-lock.json","package.json" の name をアプリ名の英語名に変更してください<br>（大文字が使えないのでアンダーバー（"\_"）で繋いで命名してください）
    3. `/EMCloud_ver.2/src`の階層の "package.json"の scripts に追加したアプリのバンドル用のコマンドを追加します<br>

    ```
    [開発用のバンドルコマンド]
    "dev-追加したアプリ名": "webpack --config kintone/app/追加したアプリ名/webpack.config.js --env mode=development --env name=追加したアプリコード",
    [本番用のバンドルコマンド]
    "prd-追加したアプリ名": "webpack --config kintone/app/追加したアプリ名/webpack.config.js --env mode=production --env name=追加したアプリコード",

    ```

    ※アプリの削除があった場合は、対象のフォルダの削除と`/EMCloud_ver.2/src`の階層の "package.json"の対象コマンドの削除を行ってください

[目次に戻る](#tableOfContents)
