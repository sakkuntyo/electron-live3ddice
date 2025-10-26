![Animation3](https://github.com/user-attachments/assets/84d8eba1-48be-480e-91c3-0c53bc754194)

# this is 何

リクエストを受け取るとサイコロが振られます。

ライブ配信視聴者のチャットをトリガーにサイコロを振ったりできます。(streamer.bot 等併用)

# セットアップ方法や使い方

1. github の release から zip をダウンロード・展開し、exe を実行します。
2. streamer.bot では、サブアクション(Fetch URL)で http://localhost:14456/roll を呼びます。例えばトリガーは YouTube への チャットとします。

* デモで使用した streamer.bot のサンプルは samples に含まれています。そちらをインポートしてテストする事も可能です。

# 動作確認環境
- nodejs 18.15 (exe実行する場合は不要)
- streamer.bot 1.0.1

# 開発メモ
- npm install したパッケージは npx で使用する必要があります。
- テスト起動
  - ```npx electron .```
- パッケージング
  - ```npx electron-packager . live3ddice --platform=win32 --arch=x64 --icon=icon.ico --overwrite```
