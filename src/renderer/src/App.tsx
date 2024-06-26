import UniverSheet from "./univer"
import React, { useReducer, useRef, useEffect } from 'react';
import { DEFAULT_WORKBOOK_DATA } from './workbook-data';
import { Button, Modal, useDisclosure, ModalBody, ModalContent, } from "@nextui-org/react";
import Logo from '../public/logo.png'
import SetIcon from '../public/setting.svg'
import reducer from './reducer'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import './App.css'
import AIPanel from "./FooterPanel";
import Slider from "./Slider";
import Tongyi from "./AIConfig/Tongyi";
//@ts-ignore
export const PageContext = React.createContext<{ univerRef?: any, pageState?: any, dispatchPageState: (params: { type: string, payload: any }) => any }>();

function App(): JSX.Element {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pageState, dispatchPageState] = useReducer(reducer, {
    loading: false,
    sheets: [],
  })
  const univerRef = useRef();

  useEffect(() => {
    //@ts-ignore
    univerRef.current?.initData(DEFAULT_WORKBOOK_DATA)

 
  }, [])

  return (
    <PageContext.Provider value={{
      univerRef,
      pageState,
      //@ts-ignore
      dispatchPageState,
    }}>


      <div className="flex justify-between items-center  shadow-md rounded-md	h-14 pl-2 pr-2" >
        <img src={Logo} className="w-14 h-14"></img>
        <Button isIconOnly className='bg-white w-10 h-10' size='sm' onClick={onOpen}>
          <img src={SetIcon} className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex ">
        <Slider></Slider>
        <div className="flex-1 p-2 shadow-md ml-2">
          <UniverSheet ref={univerRef} />
          <div style={{ height: 130 }} className="pt-2"> <AIPanel
          ></AIPanel></div>
        </div>

      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody>
            <Tongyi onClose={onClose}></Tongyi>
          </ModalBody> </ModalContent>
      </Modal>
      <ToastContainer position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}

        theme="light"
      />
    </PageContext.Provider>
  )
}

export default App
