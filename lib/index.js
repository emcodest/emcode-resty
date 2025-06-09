//!++++++++++++++++++++++++++++++++++++++++++++
// | @Author: Emcode
// | @Desc: HTTP client using got with exponential backoff & full method support
//++++++++++++++++++++++++++++++++++++++++++++
const got = require('got');

const _obj = {};
// default configuration
const Configs = {
  method: "POST", // POST - default
  timeout: 30, // seconds
  retries: 3,
  exponential_delay: 2 // 2 seconds delay in an exponential order
};

/** Helper to make HTTP request with retries and exponential backoff */
_obj.MakeRequest = async (url, data, headers = {}, configs = {}) => {
  const newConfig = { ...Configs, ...configs };
  const retries = newConfig.retries;
  const timeoutMs = (newConfig.timeout || 30) * 1000;
  const expDelay = newConfig.exponential_delay;

  let failedCount = 0;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const options = {
        method: newConfig.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: { request: timeoutMs },
        responseType: 'json',
        throwHttpErrors: false,
        json: data,
      };

      const response = await got(url, options);

      // Handle HTTP errors you want to reject on:
      if ([404, 422].includes(response.statusCode) || response.statusCode >= 500) {
        throw response.body;
      }

      return response.body;
    } catch (error) {
      failedCount++;
      lastError = error;
      if (failedCount > retries) break;

      const delaySeconds = Math.pow(expDelay, failedCount);
      await new Promise(r => setTimeout(r, delaySeconds * 1000));
    }
  }

  // If all retries failed, throw the last error
  throw lastError;
};

_obj.MakePOST = async (url, data, moreOpts = {}) => {
  const getConfig = await NodeRestyConfig("POST", 30, 3, 2);
  return _obj.MakeRequest(url, data, moreOpts.headers || {}, getConfig);
};

_obj.MakeGET = async (url, data, moreHeaders = {}) => {
  const getConfig = await NodeRestyConfig("GET", 30, 3, 2);
  return _obj.MakeRequest(url, data, moreHeaders.headers || {}, getConfig);
};

_obj.MakePUT = async (url, data, moreOpts = {}) => {
  const getConfig = await NodeRestyConfig("PUT", 30, 3, 2);
  return _obj.MakeRequest(url, data, moreOpts.headers || {}, getConfig);
};

_obj.MakePATCH = async (url, data, moreOpts = {}) => {
  const getConfig = await NodeRestyConfig("PATCH", 30, 3, 2);
  return _obj.MakeRequest(url, data, moreOpts.headers || {}, getConfig);
};

_obj.MakeDELETE = async (url, data, moreOpts = {}) => {
  const getConfig = await NodeRestyConfig("DELETE", 30, 3, 2);
  return _obj.MakeRequest(url, data, moreOpts.headers || {}, getConfig);
};

async function NodeRestyConfig(method = "POST", timeout_seconds = 30, retries = 3, back_off_delay = 2) {
  return {
    method,
    timeout: timeout_seconds,
    retries,
    exponential_delay: back_off_delay
  };
}

module.exports = _obj;
