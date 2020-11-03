function doPost(e) {
  const json = JSON.parse(e.postData.contents);

  if (json.token !== "xxxxx") {
    return false;
  }

  const ssLink = "xxxxx";
  const date = new Date();
  const formatedDate = Utilities.formatDate(date, "Asia/Tokyo", "yyyyMM");
  const ps =
    json.type === "終了"
      ? `今月の作業遂行表はこちら\n${ssLink}\nの「${formatedDate}」のシートから確認できます。`
      : "";

  const toUser1 = "xxxxx";
  const toUser2 = "xxxxx";

  // json.type: "開始" | "終了";
  const subject = `業務${json.type}のご連絡`;
  const body = `xxxxx xxxxx様 xxxxx様\n\nお疲れ様です。xxxxxです。\n本日の業務を${json.type}します。\n\n${ps}`;

  MailApp.sendEmail(toUser1, subject, body);
  MailApp.sendEmail(toUser2, subject, body);
  return;
}
