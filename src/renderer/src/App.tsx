import UniverSheet from "./univer"
import { useRef, useState } from 'react';
import { DEFAULT_WORKBOOK_DATA, generateData } from './workbook-data';
import { Button, Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import Logo from '../public/logo.png'
import './App.css'
import { IWorkbookData } from "@univerjs/core";
function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');
  const [data, setData] = useState<IWorkbookData>(DEFAULT_WORKBOOK_DATA as any);
  const uploadExcel = () => {
    window.electron.ipcRenderer.invoke('uploadExcel').then(res => {
      
      res &&setData(generateData(res)) // 输出接收到的数组: [1, 2, 3, 4, 5]
    });
  }
  const univerRef = useRef();
  return (
    <>
      <div className="flex  shadow-md rounded-md	h-18">
        <Image isZoomed width={60} height={60} src={Logo}></Image>
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
          <div style={{ height: 100 }}>测试AI</div>
        </div>

      </div>
    </>
  )
}

export default App
