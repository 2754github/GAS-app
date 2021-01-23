# GAS-app

今まで作った`GAS`アプリの中で公開できるものをまとめています。

### GmailEliminator

毎朝 4-5 時にトリガーして、Gmail 受信箱をお掃除。

### TodoCat

Todo リストを管理してくれる猫。（LINE Bot）
※ 友だち登録のための QR コードは非公開としました。（2020/07/11）

- `todo <タスク>`: タスクの登録
- `done <タスク番号>`: タスクの削除
- `list todo`: タスクの一覧
- `memo <メモ>`: メモの登録
- `remv <メモ番号>`: メモの削除
- `list memo`: メモの一覧

### TaklabBot

自分の所属していた[**研究室(TakLAB)**](http://www.taklab.org/)の Slack に導入した Slack Bot。

リポジトリへの push を検知して通知したり、オンラインゼミの会場 URL を教えてくれる。

### AsahiPrinting

業務開始/終了時のメール送信を API 化。

### ShuffleLunch

シャッフルランチを自動化。

1. Google フォームで回答を集める
1. 回答をスプレッドシートに保存
1. スクリプトを走らせてグループ分け
1. グループ分けの結果をメールで送信
