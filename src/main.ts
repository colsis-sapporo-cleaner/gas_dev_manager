import { Properties } from "./Properties";
import { EC2 } from "./EC2";
import { Sheet } from "./Sheet";


export function scheduleStart () {
  const prop = new Properties();
  const ec2 = new EC2(prop.AWSAccessKey, prop.AWSSecretAccessKey);
  const sheet = new Sheet({sheetId: prop.SheetID, instancesSheetName: prop.SheetName});
  const instances = sheet.getInstances();
  const filtered = instances.filter(v => !v.ignore);

  ec2.startInstances(filtered.map(v => v.id));
}

export function scheduleStop () {
  const prop = new Properties();
  const ec2 = new EC2(prop.AWSAccessKey, prop.AWSSecretAccessKey);
  const sheet = new Sheet({sheetId: prop.SheetID, instancesSheetName: prop.SheetName});
  const instances = sheet.getInstances();
  const filtered = instances.filter(v => !v.ignore);

  ec2.stopInstances(filtered.map(v => v.id));
}

export function onOpen () {
  SpreadsheetApp
    .getActiveSpreadsheet()
    .addMenu('AWS', [
      {name: 'インスタンスリスト更新', functionName: 'updateInstances'},
      {name: '選択セルのインスタンスを今すぐ起動', functionName: 'startInstance'},
      {name: '選択セルのインスタンスを今すぐ停止', functionName: 'stopInstance'},
    ]);
}

export function updateInstances () {
  const prop = new Properties();
  const ec2 = new EC2(prop.AWSAccessKey, prop.AWSSecretAccessKey);
  const sheet = new Sheet({sheetId: prop.SheetID, instancesSheetName: prop.SheetName}); 
  const instances = ec2.describeInstances();
  sheet.setInstances(instances);
}

export function startInstance () {
  const prop = new Properties();
  const ec2 = new EC2(prop.AWSAccessKey, prop.AWSSecretAccessKey);

  const sheet = SpreadsheetApp.getActiveSheet();
  const activeCell = sheet.getActiveCell();
  const row = activeCell.getRow();

  const id = sheet.getRange(`A${row}`).getValue();
  ec2.startInstance(id);
}

export function stopInstance () {
  const prop = new Properties();
  const ec2 = new EC2(prop.AWSAccessKey, prop.AWSSecretAccessKey);

  const sheet = SpreadsheetApp.getActiveSheet();
  const activeCell = sheet.getActiveCell();
  const row = activeCell.getRow();

  const id = sheet.getRange(`A${row}`).getValue();
  ec2.stopInstance(id);
}
