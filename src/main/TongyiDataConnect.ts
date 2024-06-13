// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const jsonPattern = /```json\n([\s\S]*?)\n```/;

export default async (config, request) => {
    const { promotText, data } = request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiKey}`, // 使用process.env访问环境变量
    };
    const body = {
        model: "qwen-turbo",
        input: {
            messages: [
                {
                    role: "system",
                    content: `你是一个数据高手。以下对象是一个二维表格的结构化表示，括号内为注释。{
                        行号（从0开始,0表示第一行，1表第二行，依此类推）:{
                            列号（从0开始,0表示第一列，1表第二列，依此类推）:{
                                v:(单元格的值)
                            }
                        }
                    }。
                    比如：
                    {
                        '0': {
                            '0': {
                                'v': 'hello'
                            },
                        }
                    }表示的是第一行第一列的值为'hello'。请理解这个逻辑。`
                },
                {
                    role: "user",
                    content: `请处理一段数据：${promotText}。数据的内容为：${JSON.stringify(data)}。 
                    请保持正确的行列索引，并将结果返回给我，不要代码，只传回JSON化的结果。当用户说A列的时候，表示的是索引为0的列，用户说B列的时候，表示的是索引为1的列。以此类推。`
                }
            ]
        },
        parameters: {
            result_format: "message"
        }
    };
    const response = await axios.post(url, body, { headers });
    let choices = response.data.output?.choices || [];
    let res = choices.map(s => s.message.content).join('')
    const match = jsonPattern.exec(res);
    if (match) {
        // 提取并解析JSON字符串
        const jsonString = match[1];
        const jsonData = JSON.parse(jsonString.replace(/'/g, '"'));
        return jsonData;
    }
    return false
}
