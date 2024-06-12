import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula/lib/index.css";
import '@univerjs/sheets-filter-ui/lib/index.css';
import './index.css'
import { UniverInstanceType, IRange } from '@univerjs/core';
import max from 'lodash/max'

import { UniverUIPlugin } from '@univerjs/ui';
import { FUniver } from '@univerjs/facade';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createUniverInstance } from './utils'
import { PageContext } from '../App'
import React from "react";
import { Action } from "@renderer/reducer";
// eslint-disable-next-line react/display-name
const UniverSheet = forwardRef(({ }, ref) => {
  const univerRef = useRef(null);
  const workbookRef = useRef(null);
  const containerRef = useRef(null);
  const currentSelection = useRef<IRange[]>(null);
  /** @type {React.RefObject<FUniver>} */
  const fUniverRef = useRef<FUniver>(null);
  const { pageState, dispatchPageState } = React.useContext(PageContext)

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
      return sheetData;
    },
    getSelectionData() {
      const univerAPI = fUniverRef.current;
      const activeWorkbook = univerAPI.getActiveWorkbook();
      const activeSheet = activeWorkbook.getActiveSheet();
      const snapshot = activeWorkbook.getSnapshot();
      const sheetId = activeSheet.getSheetId();
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
        return selecrionData;
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


  return <div ref={containerRef} className="univer-container" />;
});

export default UniverSheet;
