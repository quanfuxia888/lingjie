let config
if (process.env.NODE_ENV !== "production") {
  config = require('./prod').default
} else {
  config = require('./dev').default
}
export const BASE_CONFIG = {
  baseURL: config.BASE_URL,
  userServerBaseURL: config.USER_SERVER_BASE_URL,
  timeout: 15000,
  contentType: "application/json",
  ORGANIZATION: config.ORGANIZATION,
  IMAGE_DOMAIN: config.IMAGE_DOMAIN,
}