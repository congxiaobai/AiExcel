import { Button, Select, SelectItem, Tab, Tabs, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { PageContext } from './App'
import { Action } from "./reducer";


export default () => {
    const { pageState, dispatchPageState, univerRef } = React.useContext(PageContext)

    const [promotText, setPromotText] = useState('');
    const [activeKey, setActiveKey] = useState('selection');
    const handlerData = () => {
        let data = null;
        if (activeKey === 'selection') {
            data = univerRef.current?.getSelectionData()
        } else if (activeKey === 'currentPage') {
            data = univerRef.current?.getActivePageData()

        } else if (activeKey === 'currentDoc') {
            data = univerRef.current?.getDocData()
        }
        dispatchPageState({ type: Action.Loading, payload: true }) // 在控制台打印从主进程接收到的消息
        data && window.electron.ipcRenderer.invoke('handlerData', {
            promotText,
            data
        }).then(() => {

        })
    }
    return <Tabs aria-label="Options" isVertical={true} className="p-2" onSelectionChange={(key: string) => setActiveKey(key)}>
        <Tab key="selection" title="操作选择区数据" className="flex-1 ">
            <div className="flex gap-2 items-end">  <Textarea
                label="输入指令"
                value={promotText}
                className="w-1/2 h-full"

                onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                placeholder="该模式适合对行或者列的数据进行更新，耗费token较少。需要在执行前先选择好数据。比如:将第C列的内容统一加上'---四川'的后缀。限100字以内"
            />
                <Button isDisabled={promotText.length < 1} color="success" isLoading={pageState.loading} onClick={handlerData}>执行</Button>
            </div>
        </Tab>
        <Tab key="currentPage" title="操作当前页" className="flex-1">
            <div className="flex gap-2 items-end">  <Textarea
                label="输入指令"
                value={promotText}
                className="w-1/2"
                onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                placeholder="该模式适合对行列有删减或者新增的场景，产生的结果会存放在一张新的sheet页中。比如:新增一行，将B列所有的值相加。限100字以内"
            />
                <Button isDisabled={promotText.length < 1} color="success" isLoading={pageState.loading} onClick={handlerData}>执行</Button>            </div>


        </Tab>
        <Tab key="currentDoc" title="操作多页数据" className="flex-1">
            <div className="flex gap-2 items-end">
                <Textarea
                    label="输入指令"
                    value={promotText}
                    className="w-1/2"
                    onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                    placeholder="改模式适用于跨页面的数据操作，比如将A表和B表联合，生成一张新表，要求A表的C列与B表的D列匹配。限100字以内"
                />
                <div style={{ width: 200 }} className="flex flex-col content-end gap-1" >
                    <Select
                        label="选择要操作的sheet页"
                        selectionMode="multiple"

                    >
                        {pageState.sheets.map((animal) => (
                            <SelectItem key={animal.value}>
                                {animal.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Button isDisabled={promotText.length < 1} color="success" isLoading={pageState.loading} onClick={handlerData}>执行</Button>
                </div>
            </div>

        </Tab>
    </Tabs>
}