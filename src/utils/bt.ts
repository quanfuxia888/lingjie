
export function getRandom1To9(): number {
  return Math.floor(Math.random() * 9) + 1;
}

export interface DeviceInfo {
  deviceId: string,
  name: string

}

export interface CharacterInfo {
  serviceId: string,
  characteristicId: string,
}

