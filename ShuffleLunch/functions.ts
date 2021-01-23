const getDataRange = (sheet: Sheet, column?: number) => {
  const numOmit = 1;
  const row = 1 + numOmit;
  const numRows = sheet.getLastRow() - numOmit;

  if (column) {
    return sheet.getRange(row, column, numRows, 1);
  }
  return sheet.getRange(row, 1, numRows, sheet.getLastColumn());
};

const removeDuplicateOf = (data: string[][]) => Array.from(new Set(data.flat()));

const sendContactToAdmin = (sheet: Sheet) => {
  const contactArr: string[] = getDataRange(sheet, CONTACT_COLUMN)
    .getValues()
    .flat()
    .filter((x) => x);

  if (contactArr.length) {
    const to = ADMIN_MAIL;
    const subject = 'ご意見・ご要望・バグ報告';
    const body = `・${contactArr.join('\n・')}`;
    sendEmail(to, subject, body);
  }
};

const makeGroupData = (sheet: Sheet) => {
  const placeData: string[][] = getDataRange(sheet, PLACE_COLUMN).getValues();
  const placeArr = removeDuplicateOf(placeData);
  return placeArr
    .flatMap((place) => {
      const numPeople = placeData.filter((x) => x[0] === place).length;
      // numGroup が 0 になる場合でも、ひとまず 1 とする。（sendResult 側でキャッチする）
      const numGroup = Math.max(Math.floor(numPeople / PEOPLE_PER_GROUP), 1);
      const groupUnit = Array.from({ length: numGroup }, (_, i) => i).map(
        (x) => `${place}【${x + 1}】`,
      );
      // const groupUnit = [...Array(numGroup).keys()].map((x) => `${place}【${x + 1}】`);
      let groupIter: string[] = [];
      for (let i = 0; i <= PEOPLE_PER_GROUP; i++) {
        groupIter = groupIter.concat(groupUnit);
      }
      return groupIter.slice(0, numPeople);
    })
    .map((x) => [x]);
};

const sendResult = (data: string[][], group: string) => {
  const members = data.filter((x) => x[GROUP_COLUMN - 1] === group);
  const mails = members.map((x) => x[MAIL_COLUMN - 1]);
  const names = members.map((x) => x[NAME_COLUMN - 1]);

  if (members.length < PEOPLE_PER_GROUP) {
    const place = members[0][PLACE_COLUMN - 1];
    const subject = '十分な人数が集まりませんでした 😢';
    const body =
      'シャッフルランチに参加いただき、誠にありがとうございます 🙇‍♂️\n' +
      `「希望参加場所：${place}」を選ばれた方が一定数に満たなかったため、グループを作れませんでした 😢\n\n` +
      'またのご参加をお待ちしております 🙇‍♂️';

    mails.forEach((to) => Logger.log(to + '\n\n' + subject + '\n\n' + body));
    // mails.forEach((to) => sendEmail(to, subject, body));
  } else {
    const to = mails.shift();
    const subject = 'グループ分けが完了しました！';
    const body =
      'シャッフルランチに参加いただき、誠にありがとうございます 🙇‍♂️\n' +
      `このメールは「グループ：${group}」になった方々にお送りしています！\n\n` +
      `【参加メンバー】\n*${names.join(' さん\n・')} さん\n\n` +
      'お名前の左に「*」がついている方が本日のリーダーです！\n' +
      'リーダーを中心に時間や場所について話し合いましょう！\n\n' +
      'それでは、よいランチを 👋';
    const cc = mails.join(', ');

    Logger.log(to + '\n\n' + cc + '\n\n' + subject + '\n\n' + body);
    // sendEmail(to, subject, body, cc);
  }
};

const sendSlack = (text: string) => {
  const username = 'シャッフルランチBot';
  const icon_emoji = ':bento:';

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ username, icon_emoji, text }),
  };

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
};

const sendEmail = (to: string, subject: string, body: string, cc?: string) => {
  const decoratedSubject = `【シャッフルランチ】${subject}【${TODAY}】`;
  const decoratedBody =
    `${body}\n\n` +
    '====\n' +
    `・管理者: 2754（${ADMIN_MAIL}）\n` +
    `・ソースコード: ${encodeURI(REPO_URL)}\n` +
    '====';

  if (cc) {
    MailApp.sendEmail(to, decoratedSubject, decoratedBody, { cc });
    return;
  }
  MailApp.sendEmail(to, decoratedSubject, decoratedBody);
};
