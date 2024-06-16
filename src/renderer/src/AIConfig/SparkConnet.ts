import CryptoJS from 'crypto-js';
let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain = "generalv3.5"; // V3.5

export function getWebsocketUrl(apiKey, apiSecret) {
    return new Promise((resolve) => {
        var url = 'wss://' + httpUrl.host + httpUrl.pathname
        var host = location.host
        //@ts-ignore
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

export class SparkRecorder {
    private spark_appId;
    private spark_apiSecret
    private spark_apiKey
    private ttsWS = null;
    public onOpen: Function;
    public onEnd: Function;
    public onResult: Function;
    private total_res = '';
    private status = '';
    constructor({
        spark_appId,
        spark_apiSecret,
        spark_apiKey
    } = { spark_appId: '', spark_apiSecret: '', spark_apiKey: '' }) {
        this.spark_appId = spark_appId;
        this.spark_apiSecret = spark_apiSecret;
        this.spark_apiKey = spark_apiKey;
    }

    // 修改状态
    public setStatus(status) {
        this.status = status
    }
    // 修改状态
    public getStatus() {
        return this.status
    }
    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl(this.spark_apiKey, this.spark_apiSecret).then((url: string) => {
            let ttsWS = new WebSocket(url)
            this.ttsWS = ttsWS
            ttsWS.onopen = e => {
                this.setStatus('ready')
                this.onOpen && this.onOpen(e)
            }
            ttsWS.onmessage = e => {
                this.result(e.data)
            }
            ttsWS.onerror = () => {

                this.setStatus('error')
            }
            ttsWS.onclose = () => {
                this.ttsWS = null;
                this.setStatus('notReady')
            }
        })
    }


    // websocket发送数据
    webSocketSend(promtText) {
        this.total_res = ''
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
                            `以下是关于Excel的问题，主要是一些操作或者公式。如果与Excel无关，你可以不回答。` + `${promtText}`
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
            this.total_res += tmp;
            this.onResult && this.onResult(this.total_res);
        }
        // 提问失败
        if (jsonData.header.code !== 0) {
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
            this.onEnd && this.onEnd(this.total_res)
        }
    }
}