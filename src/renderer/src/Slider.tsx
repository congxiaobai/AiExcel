import React, { useEffect, useState } from "react"
import { Button, Divider, Textarea, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { PageContext } from './App'
import { Action } from './reducer'
import { generateData } from './utils'
import { useToast } from 'tw-noti';
import TongyiConnect from '../../main/TongyiConnect'
import { Resizable } from "re-resizable";

export default () => {
    const [questionText, setQuestionText] = React.useState('');
    const [answerText, setanswerText] = useState('');
    const { univerRef, dispatchPageState, pageState } = React.useContext(PageContext)
    const { enqueueToast } = useToast();

    const uploadExcel = () => {
        dispatchPageState({ type: Action.Loading, payload: true })
        window.electron.ipcRenderer.invoke('uploadExcel').then(res => {
            dispatchPageState({ type: Action.Loading, payload: false })
            const docData = generateData(res)
            univerRef?.current?.initData(docData)

        });
    }
    useEffect(() => {
        window.api.receive('queryExcelQuestionReponese', (message) => {
             console.log(message); // 在控制台打印从主进程接收到的消息
             setanswerText(message)
        });
        window.api.receive('queryExcelQuestionEnd', () => {
            dispatchPageState({ type: Action.Loading, payload: false }) // 在控制台打印从主进程接收到的消息
        });

    }, [])
    const exportCurrPage = () => {
        const pageData = univerRef.current?.getCurrentSheetData()
    }
    const exportDoc = () => {
        const docData = univerRef.current?.getAllSheetsData()
    }
    const requestQuestion = () => {
        try {
            dispatchPageState({ type: Action.Loading, payload: true })
            window.electron.ipcRenderer.invoke('queryExcelQuestion', questionText).then(() => {

            })
        } catch (error) {
            console.error('Error parsing the translated text:', error);

        }
    }

    return <Resizable enable={{ top: false, right: true, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }} defaultSize={{ width: 300, height: 'calc(100vh - 60px)' }} minWidth={120} maxWidth={'80%'}>
        <div className="p-2 pt-4   rounded-md flex flex-col	 gap-2   shadow-md  h-full" >
            <Button
                color="success"
                onClick={uploadExcel}
            >
                上传Excel
            </Button>
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="bordered"
                    >
                        导出Excel
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem onClick={exportCurrPage} key="new">导出当前页</DropdownItem>
                    <DropdownItem onClick={exportDoc} key="copy">导出所有页</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Divider className="my-4" />
            <div className="flex-1">
                <Textarea maxRows={20} placeholder="向AI提问后，答案会显示在这里。如果觉得太窄，可以尝试拖动宽度" value={answerText} readOnly style={{ height: '100%' }} ></Textarea>
            </div>
            <Divider className="my-4" />

            <Textarea label='Excel助手' labelPlacement="outside" value={questionText} onChange={(e) => e.target.value.length < 201 && setQuestionText(e.target.value)} className="h-48" placeholder="可以向我提问一些关于Excel的操作和公式。如:将A列和B列相加的公式。限200字。"></Textarea>
            <Button isLoading={pageState.loading} isDisabled={questionText.length < 1} color="success" onClick={requestQuestion}>提问</Button>
        </div></Resizable>
}