import UniverSheet from "./Univer"
import { useRef, useState } from 'react';
import { DEFAULT_WORKBOOK_DATA } from './workbook-data';
function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');
  const [data] = useState(DEFAULT_WORKBOOK_DATA);

  const univerRef = useRef();
  return (

    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="bar">
        <button
          onClick={() => {

          }}
        >
          Get Data
        </button>
      </div>
      <UniverSheet style={{ flex: 1 }} ref={univerRef} data={data} />
    </div>

  )
}

export default App
