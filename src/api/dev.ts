import {getCommonDomain} from "@/api/modules/auth";

let domain = getCommonDomain()
if (domain === "") {
  domain = "https://gw.test.waixingkeji.net"
}
console.log("dev:"+domain)
export default {
  BASE_URL: domain+"/ai-console",
  USER_SERVER_BASE_URL:domain+"/ai-user",
  ORGANIZATION: 10001,
  IMAGE_DOMAIN:domain+'/ai-console'
}