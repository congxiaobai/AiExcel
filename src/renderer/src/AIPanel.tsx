import { Button, Card, CardBody, Select, SelectItem, Tab, Tabs, Textarea } from "@nextui-org/react";
import React, { useState } from "react";


export default () => {
    const [promotText, setPromotText] = useState('');

    return <Tabs aria-label="Options" isVertical={true}>
        <Tab key="current" title="操作选择区数据">
            <Card>
                <CardBody>
                    <div style={{ height: 100 }} className="mt-1 flex gap-2 items-end">  <Textarea
                        label="输入指令"
                        value={promotText}
                        className="w-1/2"
                        onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                        placeholder="该模式适合对行或者列的数据进行更新，耗费token较少。需要在执行前先选择好数据。比如:将第C列的内容统一加上'---四川'的后缀"
                    />
                        <Button color="success" >执行</Button></div>
                </CardBody>
            </Card>
        </Tab>
        <Tab key="current" title="操作当前页">
            <Card>
                <CardBody>
                    <div style={{ height: 100 }} className="mt-1 flex gap-2 items-end">  <Textarea
                        label="输入指令"
                        value={promotText}
                        className="w-1/2"
                        onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                        placeholder="该模式适合对行列有删减或者新增的场景，产生的结果会存放在一张新的sheet页中。比如:新增一行，将B列所有的值相加"
                    />
                        <Button color="success" >执行</Button></div>
                </CardBody>
            </Card>
        </Tab>
        <Tab key="pages" title="操作多页数据">
            <Card>
                <CardBody>
                    <Select
                        label="Favorite Animal"
                        placeholder="Select an animal"
                        selectionMode="multiple"
                        className="max-w-xs"
                    >
                        {animals.map((animal) => (
                            <SelectItem key={animal.key}>
                                {animal.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <div style={{ height: 100 }} className="mt-1 flex gap-2 items-end">
                        <Textarea
                            label="输入指令"
                            value={promotText}
                            className="w-1/2"
                            onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
                            placeholder="改模式适用于跨页面的数据操作，比如将A表和B表联合，生成一张新表，要求A表的C列与B表的D列匹配"
                        />
                        <Button color="success" >执行</Button></div>
                </CardBody>
            </Card>
        </Tab>
    </Tabs>
}