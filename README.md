# GAS-app

今まで作った`GAS`アプリの中で公開できるものをまとめています。

### GmailEliminator

毎朝 4-5 時にトリガーして、Gmail 受信箱をお掃除。

### TodoCat

Todo リストを管理してくれる猫（LINE Bot）
※ QR コードは非公開としました（2020/07/11）

- `todo <タスク>`: タスクの登録
- `done <タスク番号>`: タスクの削除
- `list todo`: タスクの一覧
- `memo <メモ>`: メモの登録
- `remv <メモ番号>`: メモの削除
- `list memo`: メモの一覧

next scope => バリデーション

### TaklabBot

自分の所属していた[研究室(TakLAB)](http://www.taklab.org/)の Slack に導入した、
GitHub の push を検知して Slack のチャンネルに流す Slack Bot。
（単に GitHub と Slack を連携させるだけでも同様のことができるけど、通知の文面が分かりにくいため、この Bot が分かりやすく言い換える。）
