//!++++++++++++++++++++++++++++++++++++++++++++
// | @Author: Emcode
// | @Desc: HTTP client using got with exponential backoff & full method support
//++++++++++++++++++++++++++++++++++++++++++++
const got = require("got")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function createGotWithCustomRetry({ retries = 3, exponentialDelay = 2, timeout = 30_000 }) {
    return got.extend({
        timeout: {
            request: timeout
        },
        retry: {
            limit: retries,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            statusCodes: [408, 500, 502, 503, 504],
            errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'],
            calculateDelay: ({ attemptCount }) => Math.pow(exponentialDelay, attemptCount) * 1000
        },
        hooks: {
            beforeRetry: [
                async (options, error, retryCount) => {
                    const delay = Math.pow(exponentialDelay, retryCount) * 1000
                    console.log(`\x1b[41m[Retry ${retryCount}] Waiting ${delay}ms before retrying ${options.method} ${options.url}\x1b[0m`)
                    await sleep(delay)
                }
            ]
        },
        responseType: 'json'
    })
}

const _obj = {}

_obj.requestWithMethod = async (method, url, data = {}, headers = {}, customConfig = {}) => {
    const config = {
        method: method.toUpperCase(),
        url,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        json: data,
        ...customConfig
    }

    const client = createGotWithCustomRetry({
        retries: customConfig.retries ?? 3,
        exponentialDelay: customConfig.exponential_delay ?? 2,
        timeout: (customConfig.timeout ?? 30) * 1000
    })

    try {
        const res = await client(config)
        return res.body
    } catch (err) {
        console.log('\x1b[41m%s\x1b[0m', `❌ Request failed: ${err.message}`)
        throw err.response?.body || err.message
    }
}

_obj.MakeRequest = async (url, data, headers = {}, config = {}) => {
    const method = config.method || 'POST'
    return await _obj.requestWithMethod(method, url, data, headers, config)
}

_obj.MakePOST = async (url, data, more_opts = {}) => {
    return _obj.MakeRequest(url, data, more_opts.headers || {}, await NodeRestyConfig("POST"))
}

_obj.MakeGET = async (url, data, more_headers = {}) => {
    return _obj.MakeRequest(url, data, more_headers.headers || {}, await NodeRestyConfig("GET"))
}

_obj.MakePUT = async (url, data, more_headers = {}) => {
    return _obj.MakeRequest(url, data, more_headers.headers || {}, await NodeRestyConfig("PUT"))
}

_obj.MakePATCH = async (url, data, more_headers = {}) => {
    return _obj.MakeRequest(url, data, more_headers.headers || {}, await NodeRestyConfig("PATCH"))
}

_obj.MakeDELETE = async (url, data, more_headers = {}) => {
    return _obj.MakeRequest(url, data, more_headers.headers || {}, await NodeRestyConfig("DELETE"))
}

async function NodeRestyConfig(method = "POST", timeout_seconds = 30, retries = 3, back_off_delay = 2) {
    return {
        method,
        timeout: timeout_seconds,
        retries,
        exponential_delay: back_off_delay
    }
}

module.exports = _obj
