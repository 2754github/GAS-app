// スプレッドシートに情報を記載しておき、そこから読み込む。
const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1"); // スプレッドシート読み込み
const LINE_URL = SHEET.getRange(1, 1, 1, 1).getValues(); // スプレッドシートから値を取得
const LINE_TOKEN = SHEET.getRange(2, 1, 1, 1).getValues(); // スプレッドシートから値を取得

// 各シート読み込み
const TODO_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("todo"); // スプレッドシート読み込み
const MEMO_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("memo"); // スプレッドシート読み込み

function doPost(e) {
  // 入力処理
  const json = JSON.parse(e.postData.contents);
  const replyToken = json.events[0].replyToken;
  const userMessage = json.events[0].message.text;
  const cmd = userMessage.split(" ")[0];
  const arg = userMessage.split(" ").slice(1).join(" ");

  // メイン処理
  let replyMessage;
  switch (cmd) {
    case "todo":
      TODO_SHEET.getRange(TODO_SHEET.getLastRow() + 1, 1).setValue(arg); // スプレッドシートに書き込み
      replyMessage = ["タスクを登録しましたニャ！"];
      break;
    case "done":
      TODO_SHEET.deleteRows(2 + Number(arg)); // スプレッドシートから削除
      replyMessage = ["タスクを削除しましたニャ！"];
      break;
    case "memo":
      MEMO_SHEET.getRange(MEMO_SHEET.getLastRow() + 1, 1).setValue(arg); // スプレッドシートに書き込み
      replyMessage = ["メモを登録しましたニャ！"];
      break;
    case "remv":
      MEMO_SHEET.deleteRows(2 + Number(arg));
      replyMessage = ["メモを削除しましたニャ！"]; // スプレッドシートから削除
      break;
    case "list":
      const list = arg == "todo" ? "タスク" : "メモ";
      const dataArray =
        arg == "todo"
          ? TODO_SHEET.getDataRange().getValues() // スプレッドシートから全データを取得
          : MEMO_SHEET.getDataRange().getValues(); // スプレッドシートから全データを取得
      const formattedDataArray = dataArray.map(function (v, i) {
        if (i < 2) {
          return;
        } else {
          return ("00" + (i - 1)).slice(-2) + ". " + v[0];
        }
      });
      replyMessage = [
        list + "の一覧ですニャ！" + formattedDataArray.join("\n"),
      ];
      break;
    default:
      replyMessage = [
        "ニャ？\n\n" +
          "todo <タスク>: タスクの登録\n" +
          "done <タスク番号>: タスクの削除\n" +
          "list todo: タスクの一覧\n\n" +
          "memo <メモ>: メモの登録\n" +
          "remv <メモ番号>: メモの削除\n" +
          "list memo: メモの一覧",
      ];
      break;
  }
  reply(replyMessage, replyToken);
  return ContentService.createTextOutput(
    JSON.stringify({ content: "post ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function reply(replyMessage, replyToken) {
  const url = LINE_URL;
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + LINE_TOKEN,
  };
  const data = {
    replyToken: replyToken,
    messages: replyMessage.map(function (v) {
      return { type: "text", text: v };
    }),
  };
  const options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(data),
  };
  UrlFetchApp.fetch(url, options);
  return;
}
