import { useEffect, useState } from 'react'
import { Input, Button } from "@nextui-org/react";
import { useToast } from 'tw-noti';

export default (props: { onClose: Function }) => {
    const { enqueueToast } = useToast();
    const [value, setValue] = useState({
        spark_appId: '',
        spark_apiSecret: '',
        spark_apiKey: ''
    })
    const [canSubmit, setCanSubmit] = useState(false)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        try {
            window.electron.ipcRenderer.invoke('getSparkConfig').then(data => {
                if (data) {
                    enqueueToast({ content: '保存成功', type: 'success' })
                    setValue(data)
                } else {
                    enqueueToast({ content: '保存失败', type: 'error' })
                }
            })

        } catch (error) {
            console.error('Error getting data:', error);
        }
    }, [])
    useEffect(() => {
        if (value.spark_apiKey && value.spark_apiSecret && value.spark_appId) {
            setCanSubmit(true)
        } else {
            setCanSubmit(false)
        }
    }, [value])
    const submit = () => {
        setLoading(true)
        const sparkConfig = {
            spark_appId: value.spark_appId,
            spark_apiSecret: value.spark_apiSecret,
            spark_apiKey: value.spark_apiKey
        }
        window.electron.ipcRenderer.invoke('setSparkConfig', sparkConfig).then(data => {
            setLoading(false)
            data&& enqueueToast({ content: '保存成功', type: 'success' })
        })
    }
    return <div className="flex flex-col gap-6 p-2">
        <Input
            label="APPID" isRequired
            placeholder="请在官网获取"
            className="max-w-xs" isClearable={true}
            value={value.spark_appId}
            onClear={() => setValue({ ...value, spark_appId: '' })}

            onChange={(e) => setValue({ ...value, spark_appId: e.target.value })}
        />
        <Input
            label="API_SECRET" isRequired
            placeholder="请在官网获取" isClearable={true}
            className="max-w-xs" value={value.spark_apiSecret}
            onClear={() => setValue({ ...value, spark_apiSecret: '' })}

            onChange={(e) => setValue({ ...value, spark_apiSecret: e.target.value })}

        />
        <Input
            label="API_KEY" isRequired
            placeholder="请在官网获取" isClearable={true}
            className="max-w-xs" value={value.spark_apiKey}
            onClear={() => setValue({ ...value, spark_apiKey: '' })}
            onChange={(e) => setValue({ ...value, spark_apiKey: e.target.value })}

        />
        <div className='flex justify-end gap-2' >
            <Button onClick={props.onClose}>关闭</Button>
            <Button isLoading={loading} color="success" isDisabled={!canSubmit} onClick={submit}>保存</Button>
        </div>

    </div>
}