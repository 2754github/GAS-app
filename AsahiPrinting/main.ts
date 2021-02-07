type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const SS = SpreadsheetApp.getActiveSpreadsheet();
const ENV_SHEET = SS.getSheetByName('環境変数') as Sheet;

const TOKEN: string = ENV_SHEET.getRange(1, 2, 1, 1).getValue();
const SHARE_LINK: string = ENV_SHEET.getRange(2, 2, 1, 1).getValue();
const MAIL1: string = ENV_SHEET.getRange(3, 2, 1, 1).getValue();
const MAIL2: string = ENV_SHEET.getRange(4, 2, 1, 1).getValue();
const PHRASE: string = ENV_SHEET.getRange(5, 2, 1, 1).getValue();

const doPost = (e) => {
  const json = JSON.parse(e.postData.contents) as { type: '開始' | '終了'; token: string };
  if (json.token !== TOKEN) return;

  const formatedDate = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMM');
  const ps =
    json.type === '終了'
      ? `今月の業務遂行表はこちら\n${SHARE_LINK}\nの「${formatedDate}」のシートからご確認いただけます。`
      : '';

  const to = MAIL1;
  const subject = `業務${json.type}のご連絡`;
  const body = `${PHRASE}\n本日の業務を${json.type}します。\n\n${ps}`;
  const cc = MAIL2;

  MailApp.sendEmail(to, subject, body, { cc });
};
