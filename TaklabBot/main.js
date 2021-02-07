// スプレッドシートに情報を記載しておき、そこから読み込む。
const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート1'); // スプレッドシート読み込み
const WEBHOOKS_URL = SHEET.getRange(1, 1, 1, 1).getValues(); // スプレッドシートから値を取得
const VERIFICATION_TOKEN = SHEET.getRange(2, 1, 1, 1).getValues(); // スプレッドシートから値を取得
const SEMINAR_LINK = SHEET.getRange(3, 1, 1, 1).getValues(); // スプレッドシートから値を取得
const GITHUB_ID = SHEET.getRange(4, 1, 1, 1).getValues(); // スプレッドシートから値を取得
const MY_ID = SHEET.getRange(5, 1, 1, 1).getValues(); // スプレッドシートから値を取得

function doPost(e) {
  const json = JSON.parse(e.postData.contents);

  // Slack API側でRequest URLとして検証するために必要
  if (json.type == 'url_verification') {
    const returnData = { challenge: json.challenge };
    return ContentService.createTextOutput(JSON.stringify(returnData)).setMimeType(
      ContentService.MimeType.JSON,
    );
  }

  // 正当なリクエストかどうかのチェック。（※この機能は廃止予定らしい。）
  // https://api.slack.com/authentication/verifying-requests-from-slack#verification_token_deprecation
  // 今後はヘッダー情報でチェック。（postDataにヘッダー情報は含まれないので、書き換えが必要。）
  // https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
  if (json.token != VERIFICATION_TOKEN) {
    return;
  }

  // メイン処理
  if (json.event.user == GITHUB_ID) {
    if (json.event.attachments[0].fallback.includes('new commit')) {
      const author_name = json.event.attachments[0].author_name;
      const [owner_name, repo_name] = json.event.attachments[0].fallback
        .split(' ')[0]
        .replace('[', '')
        .replace(']', '')
        .split('/');
      reply(
        ':warning:*新しいpushがありました*:warning:\n\n' +
          `「${author_name}」さんがリモートの「${owner_name}/${repo_name}」にpushを行いました。\n` +
          `各自ローカルの「${repo_name}」に移動し \`git pull\` を行なってください。\n\n` +
          `※万が一ローカルの「${repo_name}」で作業中だった場合は\n` +
          '順番に `git stash` `git pull` `git stash pop` `git push` を行なってください。',
      );
      return;
    } else {
      return;
    }
  } else if (json.event.text == 'myid') {
    reply('あなたの`member ID` → ' + json.event.user);
  } else if (json.event.text == 'link') {
    reply('ゼミ会場 → ' + SEMINAR_LINK);
  } else {
    return;
  }
}

function reply(text) {
  const url = WEBHOOKS_URL;
  const data = { text: text };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: false,
  };
  UrlFetchApp.fetch(url, options);
  return;
}
