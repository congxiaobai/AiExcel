import UniverSheet from "./univer"
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_WORKBOOK_DATA, generateData } from './workbook-data';
import { Button, Modal, useDisclosure, Textarea, ModalBody, ModalContent } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import Logo from '../public/logo.png'
import SetIcon from '../public/setting.svg'
import { FUniver } from "@univerjs/facade";

import './App.css'
import { IWorkbookData } from "@univerjs/core";
import Spark from "./AIConfig/Spark";
import React from "react";
function App(): JSX.Element {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [promotText, setPromotText] = useState('');
  const univerRef = useRef();
  const [data, setData] = useState<IWorkbookData>(DEFAULT_WORKBOOK_DATA as any);
  const [loading, setLoading] = useState(false);
  const uploadExcel = () => {
    setLoading(true)
    window.electron.ipcRenderer.invoke('uploadExcel').then(res => {
      setLoading(false)

      res && setData(generateData(res)) // 输出接收到的数组: [1, 2, 3, 4, 5]
    });
  }
  const getSheetData = () => {
    const saveData = univerRef.current?.getData()
    console.log({ saveData })
  }


  return (
    <>
      <div className="flex justify-between items-center  shadow-md rounded-md	h-14 pl-2 pr-2" >
        <img src={Logo} className="w-14 h-14"></img>
        <Button isIconOnly className='bg-white w-10 h-10' size='sm' onClick={onOpen}>
          <img src={SetIcon} className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex ">
        <div className="p-2 pt-4  rounded-md	   shadow-md mr-2 ">
          <Button
            color="success"
            onClick={uploadExcel} 
          >
            上传Excel
          </Button>
          <Divider className="my-4" />
        </div>
        <div className="flex-1 p-2 shadow-md ml-2">
          <UniverSheet ref={univerRef} data={data} />
          <div style={{ height: 100 }} className="mt-1 flex gap-2 items-end">  <Textarea
            label="补充描述"
            value={promotText}
            className="w-1/2"
            onChange={(e) => e.target.value.length < 101 && setPromotText(e.target.value)}
            placeholder="输入一些指令，比如 将第2列赋值为1 "
          />
            <Button color="success" onClick={getSheetData}>执行</Button></div>
        </div>

      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody>
            <Spark onClose={onClose}></Spark>
          </ModalBody> </ModalContent>


      </Modal>

    </>
  )
}

export default App
