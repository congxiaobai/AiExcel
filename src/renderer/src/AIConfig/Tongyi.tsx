import { useEffect, useState } from 'react'
import { Input, Button, Divider } from "@nextui-org/react";
import { useToast } from 'tw-noti';
import React from 'react';

export default (props: { onClose: Function }) => {
    const { enqueueToast } = useToast();
    const [value, setValue] = useState({
        tongyi_apiKey: '',

    })
    const [canSubmit, setCanSubmit] = useState(false)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        try {
            window.electron.ipcRenderer.invoke('getTongyiConfig').then(data => {
                if (data) {
                    setValue(data)
                }
            })

        } catch (error) {
            console.error('Error getting data:', error);
        }
    }, [])
    useEffect(() => {
        if (value.tongyi_apiKey) {
            setCanSubmit(true)
        } else {
            setCanSubmit(false)
        }
    }, [value])
    const submit = () => {
        setLoading(true)
        const sparkConfig = {
            tongyi_apiKey: value.tongyi_apiKey,
        }
        window.electron.ipcRenderer.invoke('setTongyiConfig', sparkConfig).then(data => {
            setLoading(false)
            enqueueToast({ content: '保存成功', type: 'success' })
            props.onClose()
        })
    }
    return <div>

        <div className="flex flex-col gap-2">
            <h4 className="text-md">阿里巴巴出品</h4>
            <p className="text-small text-default-500">新用户可免费获取400万token</p>

        </div>

        <Divider className="mt-2 mb-2" />

        <div className="flex flex-col gap-6 p-2">
            <Input
                label="APPID" isRequired
                placeholder="请在官网获取"
                className="max-w-xs" isClearable={true}
                value={value.tongyi_apiKey}
                onClear={() => setValue({ tongyi_apiKey: '' })}

                onChange={(e) => setValue({ tongyi_apiKey: e.target.value })}
            />
            <div className='flex justify-end gap-2' >
                <Button onClick={props.onClose}>关闭</Button>
                <Button isLoading={loading} color="success" isDisabled={!canSubmit} onClick={submit}>保存</Button>
            </div>

        </div>
    </div>
}