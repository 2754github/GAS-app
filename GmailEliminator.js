function myFunction() {
  const addressList = DriveApp.getRootFolder()// 「.getFolderById('hoge')」でも良い。
    .getFilesByName('DeleteAddressList.json')
    .next().getBlob().getDataAsString('utf-8').replace(/\r?\n/g, '');
  const addressJson = JSON.parse(addressList);
  const addressArray = Object.values(addressJson);
  const deleteAddress = addressArray.join(' from:');
  deleteThreads = GmailApp.search('{ from:' + deleteAddress + ' }' + ' newer_than:7d' + ' is:read' + ' -is:starred');
  for (let i = 0; i < deleteThreads.length; i++) {
    deleteThreads[i].moveToTrash();
    // // デバッグ用
    // deleteThreads[i].markUnread();
    // Logger.log('test')
  }
}
