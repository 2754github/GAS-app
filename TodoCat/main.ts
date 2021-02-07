type Sheet = GoogleAppsScript.Spreadsheet.Sheet;
// https://developers.line.biz/ja/reference/messaging-api/#common-properties
// https://developers.line.biz/ja/reference/messaging-api/#message-event
type LINEMessageEvent = {
  replyToken: string;
  type: 'message';
  mode: string;
  timestamp: number;
  source: {
    type: 'user' | 'group' | 'room';
    userId: string;
    groupId?: string;
    roomId?: string;
  };
  message: {
    id: string;
    type: 'text';
    text: string;
    emojis: Object[]; // 今回使わないので省略
    mention: Object; // 今回使わないので省略
  };
};

const SS = SpreadsheetApp.getActiveSpreadsheet();
const ENV_SHEET = SS.getSheetByName('環境変数') as Sheet;
const TODO_SHEET = SS.getSheetByName('todo') as Sheet;
const MEMO_SHEET = SS.getSheetByName('memo') as Sheet;

const LINE_TOKEN: string = ENV_SHEET.getRange(1, 2, 1, 1).getValue();

const doPost = (e) => {
  // 入力処理
  const json = JSON.parse(e.postData.contents) as {
    destination: string;
    events: LINEMessageEvent[];
  };
  const replyToken = json.events[0].replyToken;
  const userMessage = json.events[0].message.text;
  const cmd = userMessage.split(' ')[0];
  const arg = userMessage.split(' ').slice(1).join(' ');

  // メイン処理
  let replyMessage: string;
  switch (cmd) {
    case 'todo':
      TODO_SHEET.getRange(TODO_SHEET.getLastRow() + 1, 1).setValue(arg);
      replyMessage = 'タスクを登録しましたニャ！';
      break;
    case 'done':
      TODO_SHEET.deleteRows(2 + Number(arg), 1);
      replyMessage = 'タスクを削除しましたニャ！';
      break;
    case 'memo':
      MEMO_SHEET.getRange(MEMO_SHEET.getLastRow() + 1, 1).setValue(arg);
      replyMessage = 'メモを登録しましたニャ！';
      break;
    case 'remv':
      MEMO_SHEET.deleteRows(2 + Number(arg), 1);
      replyMessage = 'メモを削除しましたニャ！';
      break;
    case 'list':
      const listSlug = arg == 'todo' ? 'タスク' : 'メモ';
      const dataArray =
        arg == 'todo'
          ? TODO_SHEET.getDataRange().getValues()
          : MEMO_SHEET.getDataRange().getValues();
      const formattedDataArray = dataArray.map((v, i) => {
        if (i < 2) {
          return;
        } else {
          return `${`00${i - 1}`.slice(-2)}. ${v[0]}`;
        }
      });
      replyMessage = `${listSlug}の一覧ですニャ！${formattedDataArray.join('\n')}`;
      break;
    default:
      replyMessage =
        'ニャ？\n\n' +
        'todo <タスク>: タスクの登録\n' +
        'done <タスク番号>: タスクの削除\n' +
        'list todo: タスクの一覧\n\n' +
        'memo <メモ>: メモの登録\n' +
        'remv <メモ番号>: メモの削除\n' +
        'list memo: メモの一覧';
      break;
  }
  sendLINE(replyMessage, replyToken);
  return ContentService.createTextOutput(JSON.stringify({ content: 'post ok' })).setMimeType(
    ContentService.MimeType.JSON,
  );
};

const sendLINE = (replyMessage: string, replyToken: string) => {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Bearer ${LINE_TOKEN}`,
  };
  const data = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: replyMessage }],
  };
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    headers: headers,
    payload: JSON.stringify(data),
  };
  UrlFetchApp.fetch(url, options);
};
