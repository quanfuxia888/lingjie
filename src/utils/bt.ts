/**
 * 将buffer转化成array
 * @param {Object} buffer
 */
function convetBuffer2Array(buffer: Object) {
  if (!buffer) {
    return [];
  }
  if (typeof buffer == 'string') {
    var chars = buffer.split("");
    var _hexArr = [];
    for (var _i = 0; _i < chars.length;) {
      _hexArr.push(parseInt("0x" + chars[_i] + chars[_i + 1]));
      _i += 2;
    }
    ;
    return _hexArr;
  }
  if (buffer instanceof Uint8Array) {
    //  console.info("..Uint8Array..",buffer);
    let hexArr: number[] = [];
    buffer.forEach(function (e) {
      hexArr.push(e);
    });
    return hexArr;
  }
  //debugger;
  if (buffer instanceof Array) {
    return buffer;
  }
  let hexArr: number[] = [];
  if (buffer instanceof ArrayBuffer) {
    var dataView = new DataView(buffer);
    var len = dataView.byteLength;
    for (var i = 0; i < len; i++) {
      hexArr.push(dataView.getUint8(i));
    }
  }
  return hexArr;
}

function readByte(byteArr: number[]): number {
  return byteArr.shift()! & 0xff;
}
export function getRandom1To9(): number {
  return Math.floor(Math.random() * 9) + 1;
}
function readBytes(byteArr: number[], n: number): number[] {
  let retArr: number[] = [];
  for (let i = 0; i < n; i++) {
    const byte = byteArr.shift();
    if (byte !== undefined) {
      retArr.push(byte);
    }
  }
  return retArr;
}

function readShort(byteArr: number[]): number {
  const b = readBytes(byteArr, 2);
  return ((b[1]! & 0xff) << 8) + ((b[0]! & 0xff) << 0);
}

function readBig(byteArr: number[]): number {
  const b = readBytes(byteArr, 2);
  return ((b[1]! & 0xff) << 0) + ((b[0]! & 0xff) << 8);
}

function readInt(byteArr: number[]): number {
  const b = readBytes(byteArr, 4);
  return ((b[3]! & 0xff) << 24) + ((b[2]! & 0xff) << 16) + ((b[1]! & 0xff) << 8) + ((b[0]! & 0xff) << 0);
}

function read3Int(byteArr: number[]): number {
  const b = readBytes(byteArr, 3);
  return ((b[2]! & 0xff) << 16) + ((b[1]! & 0xff) << 8) + ((b[0]! & 0xff) << 0);
}

function readChart(byteArr: number[]): string {
  let n = readByte(byteArr);
  return String.fromCharCode(n);
}

function readStr(byteArr: number[], n: number): string {
  let arr = readBytes(byteArr, n);
  let rarr = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == 0) {
      continue;
    }
    rarr.push(String.fromCharCode(arr[i]))
  }
  return rarr!.join('');
}

export interface DeviceInfo {
  deviceId: string,
  name: string

}

export interface CharacterInfo {
  serviceId: string,
  characteristicId: string,
}


export function readDeviceInfo(deviceInfo: DeviceInfo, buffer: Object) {
  return deviceInfo;
}

