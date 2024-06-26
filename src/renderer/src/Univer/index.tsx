import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula/lib/index.css";
import '@univerjs/sheets-filter-ui/lib/index.css';
import './index.css'
import { UniverInstanceType, IRange } from '@univerjs/core';
import max from 'lodash/max'
import uniqueId from 'lodash/uniqueId'

import { UniverUIPlugin } from '@univerjs/ui';
import { FUniver } from '@univerjs/facade';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { createUniverInstance } from './utils'
import { PageContext } from '../App'
import React from "react";
import { Action } from "@renderer/reducer";
import { SetWorksheetColWidthMutation } from "@univerjs/sheets";



// eslint-disable-next-line react/display-name
const UniverSheet = forwardRef(({ }, ref) => {
  const univerRef = useRef(null);
  const workbookRef = useRef(null);
  const containerRef = useRef(null);
  const currentSelection = useRef<IRange[]>(null);
  /** @type {React.RefObject<FUniver>} */
  const fUniverRef = useRef<FUniver>(null);
  const { dispatchPageState } = React.useContext(PageContext)
  useImperativeHandle(ref, () => ({
    getFUniverRef() {
      return fUniverRef.current;
    },
    initData(data) {
      destroyUniver();
      init(data);
      const sheets = Object.keys(data.sheets).map(s => {
        const tmp = data.sheets[s];
        return {
          label: tmp.id,
          value: tmp.name
        }
      })
      dispatchPageState({ type: Action.UpdateSheets, payload: sheets })
    },
    addResSheet(workdata) {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      Object.keys(workdata).forEach(s => {
        const cellData = workdata[s].cellData;
        const maxRow = max(Object.keys(cellData).map(s => +s));
        const maxCol = max(Object.keys(cellData).map((row) => {
          return max(Object.keys(cellData[row]).map(s => +s))
        }))
        const newSheet = activeWorkbook.create(uniqueId('结果页-'), maxRow < 99 ? 99 : maxRow, maxCol < 99 ? 99 : maxCol);
        const sheetId = newSheet.getSheetId();
        const workbookId = activeWorkbook.getId();
        univerAPI.executeCommand('sheet.command.active-sheet', { unitId: workbookId, subUnitId: sheetId });
        fillData(cellData, sheetId)
      })
    },
    updateCurrentData(cellData) {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const activeSheet = activeWorkbook.getActiveSheet();
      fillData(cellData, activeSheet.getSheetId())
    },
    getAllSheet() {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const sheets = activeWorkbook.getSheets();
      return sheets.map(s => ({
        value: s.getSheetId(),
        label: s.getSheetName()
      }))
    },
    getDocData() {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const snapshot = activeWorkbook.getSnapshot();
      return snapshot.sheets;
    },
    getActivePageData() {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const activeSheet = activeWorkbook.getActiveSheet();
      const snapshot = activeWorkbook.getSnapshot();
      const sheetId = activeSheet.getSheetId();
      const sheetData = Object.values(snapshot.sheets).find((sheet) => {
        return sheet.id === sheetId
      })
      return { [sheetData.name]: sheetData };
    },
    getSelectionData() {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const activeSheet = activeWorkbook.getActiveSheet();
      const snapshot = activeWorkbook.getSnapshot();
      const sheetId = activeSheet.getSheetId();
      const sheetName = activeSheet.getSheetName();
      const sheetData = Object.values(snapshot.sheets).find((sheet) => {
        return sheet.id === sheetId
      })
      const cellData = sheetData.cellData;
      if (!currentSelection.current) {
        return cellData;
      } else {
        //找出最大行最大列，避免传入太多的值给后端
        const maxRow = max(Object.keys(cellData).map(s => +s));
        const maxCol = max(Object.keys(cellData).map((row) => {
          return max(Object.keys(cellData[row]).map(s => +s))
        }))
        const selecrionData = {};

        const selection = currentSelection.current;
        selection.forEach(item => {
          const selectRange = activeSheet.getRange(item.startRow, item.startColumn, item.endRow - item.startRow + 1, item.endColumn - item.startColumn + 1);
          selectRange.forEach((row: number, col: number, cell) => {
            if (row > maxRow || col > maxCol) {
              return;
            }
            if (!selecrionData[row]) {
              selecrionData[row] = {}
            }
            if (!selecrionData[row][col]) {
              selecrionData[row][col] = { v: cell.v }
            }
          });
        })
        console.log({ selecrionData })
        return {
          [sheetName]: {
            cellData: selecrionData
          }
        }
      }
    },
  }));

  const init = (data = {}) => {
    if (!containerRef.current) {
      throw Error('container not initialized');
    }
    const univer = createUniverInstance()
    univerRef.current = univer;

    univer.registerPlugin(UniverUIPlugin, {
      container: containerRef.current,
    });
    // create workbook instance
    workbookRef.current = univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);
    const univerAPI = FUniver.newAPI(univer)
    fUniverRef.current = univerAPI;
    const activeWorkbook = univerAPI.getActiveWorkbook();
    activeWorkbook.onSelectionChange((selection) => {
      currentSelection.current = selection;
    });
    univerAPI.onBeforeCommandExecute((command) => {
      const { id, type, params } = command;
      console.log({ id, type, params });
      if (['sheet.mutation.insert-sheet', 'sheet.mutation.remove-sheet', 'sheet.mutation.set-worksheet-name', ''].includes(id)) {
        const sheets = activeWorkbook.getSheets();
        const sheetsInfo = sheets.map(s => ({
          value: s.getSheetId(),
          label: s.getSheetName()
        }))
        dispatchPageState({
          type: Action.UpdateSheets,
          payload: sheetsInfo
        })
      }
    })
  
  };

  const destroyUniver = () => {

    univerRef.current = null;
    workbookRef.current = null;
    currentSelection.current = null;
    fUniverRef.current = null;
  };

  const fillData = (data, id) => {
    const univerAPI = fUniverRef.current;
    const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId(id);
    Object.keys(data).forEach(rowIndex => {
      Object.keys(data[rowIndex]).forEach(colIndex => {
        const range = sheet.getRange(+rowIndex, +colIndex);
        range.setValue(data[rowIndex][colIndex].v);
      })
    })
  };


  return <div ref={containerRef} className="univer-container" />;
});

export default UniverSheet;
