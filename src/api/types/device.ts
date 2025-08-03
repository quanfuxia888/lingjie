export declare interface DeviceCategory {
  title: string;
  body: string;
  img: string;
  style: string;
  type: number;
}

export declare interface Device {
  device_id: number;
  sn: string;
  product_type: number;
  character_img: string;
  character_name: string;
  character_desc: string;
  image: string;
  icon: string;
}

export interface DeviceInfo {
  sn: string;
  name: string;
}