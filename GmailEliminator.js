// const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");
// const DATA = SHEET.getDataRange().getValues();

function myFunction() {
  // const addressArray = DATA.map((v) => (v[1]))
  // const deleteThreads = GmailApp.search(`{ from: ${addressArray.join(" from:")} } newer_than:7d is:read -is:starred`);
  const deleteThreads = GmailApp.search('in:inbox is:read -is:starred');
  for (let i = 0; i < deleteThreads.length; i++) {
    deleteThreads[i].moveToTrash();
    // // デバッグ用
    // deleteThreads[i].markUnread();
    // Logger.log('test')
  }
}
