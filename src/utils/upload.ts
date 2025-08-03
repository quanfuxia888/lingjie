// utils/upload.ts
import COS from 'cos-wx-sdk-v5';
import {userServerRequest} from "./request";


// 获取临时密钥（需替换为你的服务器接口）
const getOSSConfig = async () => {
  const res = await userServerRequest.request({
    url: '/api/oss/config',
    method: 'POST',
    data: {
      "type": "avatar",
      "ext": "jpg"
    }
  })
  console.log(res);
  return res;
};

// 上传图片到腾讯云 COS
export const uploadToCOS = async (file) => {
  // 获取临时密钥
  const ossConfig = await getOSSConfig();
  const credentials = ossConfig.credentials;
  // 初始化 COS 实例
  const cos = new COS({
    getAuthorization: (options, callback) => {
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: ossConfig.startTime, // 可选
        ExpiredTime: ossConfig.expiredTime, // 可选
      });
    },
  });


  // 执行上传
  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: ossConfig.bucket, // 替换为你的 Bucket
        Region: ossConfig.cosRegion, // 替换为你的 Region
        Key: ossConfig.file,
        FilePath: file.path,
        FileSize: file.size,
        onProgress: (progress) => {
          console.log(progress);

          console.log('上传进度:', progress);
        },
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(`https://${data.Location}`);
      }
    );
  });
};
