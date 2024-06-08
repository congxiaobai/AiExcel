import CryptoJS from 'crypto-js';
let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain = "generalv3.5"; // V3.5

export function getWebsocketUrl(apiKey,apiSecret) {

    return new Promise((resolve, reject) => {

        var url = 'wss://' + httpUrl.host + httpUrl.pathname
        var host = location.host
        var date = new Date().toGMTString()
        var algorithm = 'hmac-sha256'
        var headers = 'host date request-line'
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(signatureSha)
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        var authorization = btoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
        resolve(url)
    })
}

export class SparkTTSRecorder {
    constructor({
        spark_appId,
        spark_apiSecret,
        spark_apiKey
    } = {}) {
        this.spark_appId = spark_appId;
        this.spark_apiSecret = spark_apiSecret;
        this.spark_apiKey = spark_apiKey;
    }

    // 修改状态
    setStatus(status) {
        this.status = status
    }

    //s
    setActiveTabID(activeTabId){
        this.activeTabId = activeTabId
    }
    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl(this.spark_apiKey,this.spark_apiSecret).then(url => {
            let ttsWS = new WebSocket(url)
            this.ttsWS = ttsWS
            ttsWS.onopen = e => {
                this.setStatus('ready')
                this.onOpen && this.onOpen(e)
            }
            ttsWS.onmessage = e => {
                this.result(e.data)
            }
            ttsWS.onerror = e => {
                clearTimeout(this.playTimeout)
                this.setStatus('error')
            }
            ttsWS.onclose = e => {
                this.ttsWS = null;
                this.setStatus('notReady')
            }
        })
    }


    // websocket发送数据
    webSocketSend(items, promtText) {
        this.total_res = []
        var params = {
            "header": {
                "app_id": this.spark_appId, "uid": "fd3f47e4-d"
            }, "parameter": {
                "chat": {
                    "domain": modelDomain, "temperature": 0.5, "max_tokens": 8191
                }
            }, "payload": {
                "message": {
                    "text": [{
                        "role": "user", "content":
                            `下面是一个数组,包含了id和text两个字段。
                        请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                        保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                        这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promtText ? '注意，本文由以下特质，可以参考：' + promtText : ''}` + JSON.stringify(items)
                    }]
                }
            }
        }
        this.ttsWS.send(JSON.stringify(params))
    }

    start() {
        this.connectWebSocket()
    }

    // websocket接收数据的处理
    result(resultData) {
        let jsonData = JSON.parse(resultData);
        if (jsonData?.payload?.choices?.text[0]?.content) {
            let tmp = jsonData?.payload?.choices?.text[0]?.content;
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i] === '{' && this.total_res.length === 0) {
                    this.total_res.push('{')
                    continue;
                }
                if (this.total_res[0] === '{' && tmp[i] !== '}') {
                    this.total_res.push(tmp[i]);
                    continue;
                }
                if (tmp[i] === '}' && this.total_res[0] === '{') {
                    this.total_res.push('}')
                    this.onResult && this.onResult(this.total_res.join(''));
                    this.total_res = [];
                    continue;
                }
            }
        }
        // 提问失败
        if (jsonData.header.code !== 0) {
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
            this.onEnd && this.onEnd()
        }
    }
}