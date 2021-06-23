export class Properties {
  AWSAccessKey:string;
  AWSSecretAccessKey:string;
  SheetID:string;
  SheetName:string;

  constructor () {
    this.AWSAccessKey = this._getProperty('AWS_ACCESS_KEY');
    this.AWSSecretAccessKey = this._getProperty('AWS_SECRET_ACCESS_KEY');
    this.SheetID = this._getProperty('SHEET_ID');
    this.SheetName = this._getProperty('SHEET_NAME');
  }

  private _getProperty (name:string): string {
    if (!name) throw 'Property name not specified.';
    return PropertiesService.getScriptProperties().getProperty(name);
  }
}
