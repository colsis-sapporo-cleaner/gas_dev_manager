import { AWS } from "./AWS";

type Instance = {
  name:string
  instanceId:string
  status:string
};

export class EC2 {
  aws:any;
  ns:GoogleAppsScript.XML_Service.Namespace;

  constructor (private accessKey:string, private secretAccessKey:string) {
    this.aws = new AWS(this.accessKey, this.secretAccessKey);
    this.ns = XmlService.getNamespace('http://ec2.amazonaws.com/doc/2015-10-01/');
  }

  describeInstances ():Instance[] {
    const res:GoogleAppsScript.URL_Fetch.HTTPResponse = this.aws.request('ec2', 'ap-northeast-1', 'DescribeInstances', {"Version": "2015-10-01"});
    const xml = XmlService.parse(res.getContentText());
    const reservations = xml.getRootElement().getChild('reservationSet', this.ns).getChildren('item', this.ns);
    return reservations.map((item) => {
      const instance = item.getChild('instancesSet', this.ns).getChild('item', this.ns);
      const tags = instance.getChild('tagSet', this.ns).getChildren('item', this.ns);
      const nameTags = tags.filter(tag => tag.getChildText('key', this.ns) === 'Name');
      return {
        name: nameTags[0].getChildText('value', this.ns),
        instanceId: instance.getChildText('instanceId', this.ns),
        status: instance.getChild('instanceState', this.ns).getChildText('name', this.ns),
      };
    });
  }

  startInstance (instanceId) {
    this.request('ec2', 'ap-northeast-1', 'StartInstances', {"InstanceId": instanceId, "Version": "2016-11-15"});
  }

  startInstances (instanceIds:string[]) {
    const targets = instanceIds.map((v, i) => { return {[`InstanceId.${i + 1}`]: v}});
    const params = Object.assign({}, ...targets);
    params["Version"] = "2016-11-15";
    this.request('ec2', 'ap-northeast-1', 'StartInstances', params);
  }

  stopInstances (instanceIds:string[]) {
    const targets = instanceIds.map((v, i) => { return {[`InstanceId.${i + 1}`]: v}});
    const params = Object.assign({}, ...targets);
    params["Version"] = "2016-11-15";
    this.request('ec2', 'ap-northeast-1', 'StopInstances', params);
  }

  stopInstance (instanceId) {
    this.request('ec2', 'ap-northeast-1', 'StopInstances', {InstanceId: instanceId, "Version": "2016-11-15"});
  }

  private request (service:string, region:string, method:string, params:any):GoogleAppsScript.URL_Fetch.HTTPResponse {
    return this.aws.request(service, region, method, params);
  }
};
