import React from "react"
import { Button, Divider, Textarea, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { PageContext } from './App'
import { Action } from './reducer'
import { generateData } from './utils'
export default () => {
    const { univerRef, pageState, dispatchPageState } = React.useContext(PageContext)

    const uploadExcel = () => {
        dispatchPageState({ type: Action.Loading, payload: true })
        window.electron.ipcRenderer.invoke('uploadExcel').then(res => {
            dispatchPageState({ type: Action.Loading, payload: false })
            const docData = generateData(res)
            univerRef?.current?.initData(docData)

        });
    }
    const exportCurrPage = () => {
        const pageData = univerRef.current?.getCurrentSheetData()
    }
    const exportDoc = () => {
        const docData = univerRef.current?.getAllSheetsData()
    }

    return <div className="p-2 pt-4  rounded-md flex flex-col	 gap-2   shadow-md mr-2 ">
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
        </div>
        <Divider className="my-4" />

        <Textarea className="h-48" placeholder="可以向我提问一些关于Excel的操作和公式。如:将A列和B列相加的公式。"></Textarea>
        <Button color="success">提问</Button>
    </div>
}