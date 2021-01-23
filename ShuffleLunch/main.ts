type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const SS = SpreadsheetApp.getActiveSpreadsheet();
const ENV_SHEET = SS.getSheetByName('環境変数') as Sheet;
const RESPONSE_SHEET = SS.getSheetByName('フォームの回答') as Sheet;

const ADMIN_MAIL: string = ENV_SHEET.getRange(1, 2, 1, 1).getValue();
const REPO_URL: string = ENV_SHEET.getRange(2, 2, 1, 1).getValue();
const FORM_ID: string = ENV_SHEET.getRange(3, 2, 1, 1).getValue();
const FORM_URL: string = ENV_SHEET.getRange(4, 2, 1, 1).getValue();
const SLACK_WEBHOOK_URL: string = ENV_SHEET.getRange(5, 2, 1, 1).getValue();

const MAIL_COLUMN = 2;
const NAME_COLUMN = 3;
const JOB_COLUMN = 4;
const PLACE_COLUMN = 5;
const CONTACT_COLUMN = 6;
const GROUP_COLUMN = 7;

const PEOPLE_PER_GROUP = 4; // 1 グループ 4〜7人
const FORM = FormApp.openById(FORM_ID);
const TODAY = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');

// ========== 開催日の am 09:00 に Slack で通知 ===========================================================
const sendForm = () => {
  FORM.setAcceptingResponses(true);

  const text =
    '<!here>\n' +
    `シャッフルランチ（${TODAY}）を開催します！\n` +
    `参加される方は\n${FORM_URL}\nからご回答ください！（am 11:00 〆切）\n` +
    '（不参加の場合、回答の必要はありません。）';

  sendSlack(text);
};

// ========== Quota に合わせて回答を締め切る ==================================================================
// [Quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas)
const sendClosedMassage = () => {
  const quotaMargin = 10; // Quota から 10 件分の余裕を持たせる
  const quotaRemain = MailApp.getRemainingDailyQuota();
  const numResponses = RESPONSE_SHEET.getLastRow();
  if (numResponses <= quotaRemain - quotaMargin) return;

  FORM.setAcceptingResponses(false);

  const text =
    '<!here>\n' +
    `シャッフルランチ（${TODAY}）は参加者多数につき、回答を締め切りました 🙇‍♂️\n` +
    'たくさんの参加希望をいただき、ありがとうございました！';

  sendSlack(text);
};

// ========== グループ分けの結果を am 11:30 に Mail で通知 ======================================================
const setShuffleLunch = () => {
  FORM.setAcceptingResponses(false);

  // 回答を今日のシートに移す
  const sheet = RESPONSE_SHEET.copyTo(SS).setName(TODAY);
  getDataRange(RESPONSE_SHEET).clear();

  // 「本システムへのご意見・ご要望・バグ報告」があれば管理者に送信
  sendContactToAdmin(sheet);

  // 「希望参加場所 > 職種」となるようにソート
  getDataRange(sheet).randomize().sort(JOB_COLUMN).sort(PLACE_COLUMN).getValues();

  // ソートしたデータに 1,2,3,1,2,3,... のように番号を振ることでグループ分けをする。
  const groupData = makeGroupData(sheet); // 1,2,3,1,2,3,... のようなデータを生成
  getDataRange(sheet, GROUP_COLUMN).setValues(groupData); // グループ分けのデータをシートに追加

  // グループ分けの結果を送信
  const data: string[][] = getDataRange(sheet).getValues(); // グループ分けのデータが追加された後のデータを取得
  removeDuplicateOf(groupData).forEach((group) => sendResult(data, group)); // グループ毎にメールを送信
};
