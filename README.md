# emcode-resty

> ⚡ Lightweight HTTP client built on `got` with support for exponential backoff, retries, and all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

## ✨ Features

- 🌀 Exponential backoff retry logic  
- 🔁 Retry on network or server errors  
- 🚀 Supports all major HTTP methods  
- ⚙️ Easy to configure per request  
- 🔧 Built with `got` for performance and reliability  

---

## 📦 Installation

```bash
npm install emcode-resty

```
## USAGE
```code
const Resty = require('emcode-resty');

// Simple GET
const result = await Resty.MakeGET('https://api.example.com');

// POST with data
const result = await Resty.MakePOST('https://api.example.com/users', { name: 'Emcode' });

// PUT with headers and custom config
const result = await Resty.MakePUT(
  'https://api.example.com/users/123',
  { email: 'new@example.com' },
  {
    headers: { Authorization: 'Bearer token' },
  }
);


```

## Retry & Backoff Config
```code
const config = {
  method: 'POST',        // HTTP method
  timeout: 20,           // in seconds
  retries: 5,            // retry attempts
  exponential_delay: 3   // backoff factor (seconds)
};

const response = await Resty.MakeRequest(
  'https://api.example.com',
  { key: 'value' },
  { 'Custom-Header': 'yes' },
  config
);

```
## DEFAULT CONFIG
| Key                 | Default |
| ------------------- | ------- |
| `method`            | POST    |
| `timeout` (seconds) | 30      |
| `retries`           | 3       |
| `exponential_delay` | 2       |

## Supported Methods
```
    MakeGET(url, data, headers)

    MakePOST(url, data, headers)

    MakePUT(url, data, headers)

    MakePATCH(url, data, headers)

    MakeDELETE(url, data, headers)

    MakeRequest(url, data, headers, config)
    ```