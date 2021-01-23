const TEST_SHEET = SS.getSheetByName('テスト') as Sheet;
const SORTED_TEST_SHEET = SS.getSheetByName('テスト（ソート用）') as Sheet;

const test = () => {
  const sheet = SS.getSheetByName(TODAY);
  if (sheet) SS.deleteSheet(sheet);

  dataCopy(TEST_SHEET, SORTED_TEST_SHEET);
  getDataRange(SORTED_TEST_SHEET).randomize();
  dataCopy(SORTED_TEST_SHEET, RESPONSE_SHEET);
};

const dataCopy = (fromSheet: Sheet, toSheet: Sheet) => {
  const fromSheetData = fromSheet.getDataRange().getValues();
  toSheet
    .getRange(1, 1, fromSheet.getLastRow(), fromSheet.getLastColumn())
    .setValues(fromSheetData);
};
