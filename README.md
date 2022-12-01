<a id="tableOfContents"></a>

# EMCloud_ver.2

-   [はじめに](#introduction)
-   [フォルダ構成](#folderConfiguration)
    -   [各フォルダの概要](#folderOverview)
-   [初回動作](#firstOperation)
    1. [リポジトリのクローン](#repositoryClone)
    1. [パッケージのインストール](#packageInstall)
-   [運用ルール](#operationRule)
-   [バンドル・パッケージング手順](#bundlePackagingProcedure)

---

</br>
<a id="introduction"></a>

## --- はじめに ---

-   Node.js の実行環境が必須です<br>
    インストールがされていない場合は以下からインストールを行ってください（推奨版で問題ありません）<br>
    https://nodejs.org/ja/
-   shell の実行環境が必須です<br>
    window の場合、用意が必要になります<br>
    Git がインストールされている場合は Git Bash から実行を行えます

<a id="folderConfiguration"></a>

[目次に戻る](#tableOfContents)

</br>

## --- フォルダ構成 ---

<details>
<summary>構成図</summary>

```
├─doc
├─resource
└─src
    ├─formbridge
    │  ├─dist
    │  │  ├─dev
    │  │  └─prd
    │  └─src
    │      ├─css
    │      └─js
    │          └─modules
    ├─kintone
    │  ├─app
    │  │  ├─_アプリ追加時用テンプレート
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─テンプレートファイル
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─基本情報
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─奉行項目変換
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─家族情報
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─手続管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─採用管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─支給実績管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─支給控除管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─環境マスタ
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─社員情報
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─給与管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─賞与管理
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─通勤情報
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─連携情報マスタ
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─雇用情報
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  ├─雇用手続
    │  │  │  ├─dist
    │  │  │  │  ├─dev
    │  │  │  │  └─prd
    │  │  │  └─src
    │  │  │      ├─css
    │  │  │      └─js
    │  │  │          └─module
    │  │  └─雇用手続マスタアプリ
    │  │      ├─dist
    │  │      │  ├─dev
    │  │      │  └─prd
    │  │      └─src
    │  │          ├─css
    │  │          └─js
    │  │              └─module
    │  ├─entire
    │  │  ├─dist
    │  │  │  ├─dev
    │  │  │  └─prd
    │  │  └─src
    │  │      ├─css
    │  │      ├─img
    │  │      └─js
    │  │          ├─constants
    │  │          └─modules
    │  │              ├─appsId
    │  │              ├─comment
    │  │              ├─license
    │  │              ├─logger
    │  │              └─spinner
    │  └─plugin
    │      ├─タスク管理プラグイン
    │      │  ├─bk
    │      │  └─src
    │      │      ├─css
    │      │      ├─html
    │      │      ├─image
    │      │      └─js
    │      │          ├─config
    │      │          └─main
    │      └─帳票出力プラグイン
    │          ├─bk
    │          └─src
    │              ├─css
    │              ├─html
    │              ├─image
    │              └─js
    └─kviewer
        ├─dist
        │  ├─dev
        │  └─prd
        └─src
            ├─css
            └─js
                └─modules
```

</details>

<a id="folderOverview"></a>

[目次に戻る](#tableOfContents)

</br>

### <各フォルダの概要>

-   ルートフォルダ直下
    -   doc … ドキュメント類を管理
    -   resource … マスタ系アプリのレコード情報やテンプレートファイルを管理
    -   src … カスタイズファイルを管理
-   src フォルダ直下
    -   formbridge … formbridge のソースを管理
    -   kintone … kintone のソースを管理
    -   kviewer … kviewer のソースを管理
-   kintone フォルダ直下
    -   app … 各アプリのソースを管理(当フォルダ直下には各アプリごとのフォルダ)
    -   entire … 環境に反映する全体のソースを管理
    -   plugin … kintone プラグインのソースを管理（当フォルダ直下には各プラグインごとのフォルダ）
-   カスタマイズファイルの構成フォルダ
    -   dist … バンドルされたファイルの出力先
    -   src … ソースを管理するフォルダ
-   dist フォルダ直下
    -   dev … 開発用カスタマイズファイルの出力先
    -   prd … 本番（配布）用カスタイズファイルの出力先
-   src フォルダ直下
    -   css … css ファイルのソースを管理
    -   js … js ファイルのソースを管理
    -   js/module … index.js にバンドルを行う各 js ファイルを管理（基本的に js ファイルはここに配置）

<a id="firstOperation"></a>

[目次に戻る](#tableOfContents)

</br>

## --- 初回動作 ---

以下の手順を初回時に必ず実行してください

<a id="repositoryClone"></a>

1. リポジトリのクローン

    `git clone https://github.com/https-github-com-Saikhanbileg0820-EMC/EMCloud_ver.2.git`

    上記を複製を作成したいディレクトリで実行してください

    ※GitHub Desktop 等の GUI 操作を行えるツールを利用する場合はそちらからのクローン実行でも可です

    参考: GitHub Desktop でのクローン実行参考サイト<br>
    https://mebee.info/2021/08/13/post-30940/

<a id="packageInstall"></a>

2. パッケージのインストール

    `ローカルの配置パス/EMCloud_ver.2/src`

    上記の階層に移動（cd コマンド）してください

    `npm i`

    上記コマンドを実行してください

<a id="operationRule"></a>

[目次に戻る](#tableOfContents)

</br>

## --- 運用ルール ---

-   リモートリポジトリへのプッシュまでの手順

1. ソースの改修
1. 改修ソースの配置
1. バンドルを実行し開発用ファイルを出力
1. 開発用ファイルを開発環境に反映し動作確認
1. 動作に問題がなかった場合、本番用ファイルをバンドルし出力
1. コミット → プッシュを実行

-   開発用ファイル（dev フォルダ直下のファイル）を開発環境に反映させて動作確認を行ってください<br>
    ⇒ ソースファイルを直接反映しての動作確認は原則行わないようにしてください

-   本番用のファイルも必ずプッシュ前にバンドルし出力してください<br>
    ⇒ 配布時に誤ったファイルが反映されてしまうとデバッグでの確認も不可になるので、原因の発見が難しくなってしまいます

-   コミットメッセージには修正内容を明記してください

<a id="bundlePackagingProcedure"></a>

[目次に戻る](#tableOfContents)

</br>

## --- バンドル・パッケージング手順 ---

webpack でのソースのバンドル関連の内容は<span style="color: #4169e1">[こちら](/doc/webpack.md)</span>から

kintone プラグインのパッケージング関連の内容は<span style="color: #4169e1">[こちら](/doc/kintonePlugin.md)</span>から

[目次に戻る](#tableOfContents)
