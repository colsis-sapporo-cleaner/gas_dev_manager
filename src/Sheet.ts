// スプレッドシート1行目のタイトルを入れとく。これを元に書き込む列とかを得るので
const INSTANCE_ID_TITLE:string = 'インスタンスID';
const INSTANCE_NAME_TITLE:string = 'インスタンス名';
const STATUS_TITLE:string = '状態';
const IGNORE_TITLE:string = 'スケジュール対象外';

type SetInstancesParam = {
  instanceId:string,
  name:string,
  status:string
};

type GetInstancesValue = {
  id:string,
  name:string,
  status:string,
  ignore:string
};

export class Sheet {

  book:GoogleAppsScript.Spreadsheet.Spreadsheet;
  instancesSheet:GoogleAppsScript.Spreadsheet.Sheet;
  instances:GetInstancesValue[];
  instanceIdColumn:string;
  instanceNameColumn:string;
  statusColumn:string;
  ignoreColumn:string;

  constructor(private params) {
    if (!params.sheetId) {
      throw new Error('Required property was not specified.');
    }
    this.book = SpreadsheetApp.openById(params.sheetId);
    if (!params.instancesSheetName) {
      throw new Error('Required property was not specified.');
    }
    this.instancesSheet = this.book.getSheetByName(params.instancesSheetName);

    // @NOTE: 列番号探して保管しとく
    this.instanceIdColumn = this._findColumnColLetter(INSTANCE_ID_TITLE);
    this.instanceNameColumn = this._findColumnColLetter(INSTANCE_NAME_TITLE);
    this.statusColumn = this._findColumnColLetter(STATUS_TITLE);
    this.ignoreColumn = this._findColumnColLetter(IGNORE_TITLE);
  }

  /** シートへインスタンスを記入 */
  public setInstances(instances:SetInstancesParam[]) {
    const firstRow = 2;
    const lastRow = instances.length + 1;
    this.instancesSheet.getRange(`A${firstRow}:C${lastRow}`).setValues(
      instances.map(v => {return [v.instanceId, v.name, v.status]})
    );
  }

  /** シートからインスタンス一覧を得る */
  public getInstances ():GetInstancesValue[] {
    const lastRow = this.instancesSheet.getLastRow();
    this.instances = this.instancesSheet
      .getRange(`${this.instanceIdColumn}1:${this.ignoreColumn}${lastRow}`)
      .getValues()
      .filter(value => { return value[0] != INSTANCE_ID_TITLE })
      .map(v => { return {id: v[0], name: v[1], status: v[2], ignore: v[3]}; });
    return this.instances;
  }

  /**
  * 指定インスタンスの指定列のrangeを得る
  * @param article 列指定 name | status | ignore
  * @param instanceId
  * @return Range
  */
  private _getTargetRangeFromInstanceId(article: string, instanceId: string):GoogleAppsScript.Spreadsheet.Range {
    const row = this._findColumnRowNumber(instanceId);
    let range: GoogleAppsScript.Spreadsheet.Range;
    switch(article) {
      case 'name':
        range = this.instancesSheet.getRange(`${this.instanceNameColumn}${row}`);
        break;
      case 'status':
        range = this.instancesSheet.getRange(`${this.statusColumn}${row}`);
        break;
      case 'ignore':
        range = this.instancesSheet.getRange(`${this.ignoreColumn}${row}`);
        break;
    }
    return range;
  }

  /** 指定ワードのカラムを検索しA1形式アドレスを得る */
  private _findColumnAddress(word:string):string {
    const finder = this.instancesSheet.createTextFinder(word);
    const results = finder.findAll();
    return results[0].getA1Notation();
  }

  /** 指定ワードのカラムの列名アルファベットを得る */
  // @FIXME: 1桁列にしか対応していません。AA,AB... とかは今の所使う予定もないので。
  private _findColumnColLetter(word:string):string {
    return this._findColumnAddress(word).split('').shift();
  }

  /** 指定ワードのカラムの行番号を得る */
  private _findColumnRowNumber(word:string):number {
    return Number(this._findColumnAddress(word).split('').pop());
  }

  /** 列名アルファベットを数値に変換する */
  // @FIXME: 1桁列にしか対応していません。AA,AB... とかは今の所使う予定もないので。
  private _columnLetterToNumber(letter:string):number {
    if (letter.length <= 0 && letter.length > 1)
      throw new Error('argument must be one character.');
    return (letter.toUpperCase().charCodeAt(0) - 65);
  }

};
