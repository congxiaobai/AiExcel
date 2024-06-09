import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula/lib/index.css";
import '@univerjs/sheets-filter-ui/lib/index.css';

import './index.css'

import { Univer, LocaleType, UniverInstanceType, Tools, IRange } from '@univerjs/core';
import max from 'lodash/max'
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { FUniver, FWorkbook } from '@univerjs/facade';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import DesignZhCN from '@univerjs/design/locale/zh-CN';
import UIZhCN from '@univerjs/ui/locale/zh-CN';
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN';
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN';
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN';
import SheetsFilterUIZhCN from '@univerjs/sheets-filter-ui/locale/zh-CN';

// eslint-disable-next-line react/display-name
const UniverSheet = forwardRef(({ data }, ref) => {
  const univerRef = useRef(null);
  const workbookRef = useRef(null);
  const containerRef = useRef(null);
  const currentSelection = useRef<IRange[]>(null);
  /** @type {React.RefObject<FUniver>} */
  const fUniverRef = useRef<FUniver>(null);

  useImperativeHandle(ref, () => ({
    getData,
    getFUniverRef() {
      return fUniverRef.current;
    },
    getSelectionData() {
      if (!currentSelection.current) {
        return workbookRef.current.save();
      } else {
        const univerAPI = fUniverRef.current;
        const activeWorkbook = univerAPI.getActiveWorkbook();

        const activeSheet = activeWorkbook.getActiveSheet();
        // const selection = activeSheet.getSelection().getActiveRange();
        const snapshot = activeWorkbook.getSnapshot();
        const sheetId = activeSheet.getSheetId();
        const sheet1 = Object.values(snapshot.sheets).find((sheet) => {
          return sheet.id === sheetId
        })
        const cellData = sheet1.cellData;
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

      }
    },
  }));

  /**
   * Initialize univer instance and workbook instance
   * @param data {IWorkbookData} document see https://univer.work/api/core/interfaces/IWorkbookData.html
   */
  const init = (data = {}) => {
    if (!containerRef.current) {
      throw Error('container not initialized');
    }
    const univer = new Univer({
      theme: defaultTheme,
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: Tools.deepMerge(
          SheetsZhCN,
          DocsUIZhCN,
          SheetsUIZhCN,
          UIZhCN,
          DesignZhCN,
          SheetsFilterUIZhCN
        ),
      },
    });
    univerRef.current = univer;

    // core plugins
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverUIPlugin, {
      container: containerRef.current,
    });

    // doc plugins
    univer.registerPlugin(UniverDocsPlugin, {
      hasScroll: false,
    });
    univer.registerPlugin(UniverDocsUIPlugin);

    // sheet plugins
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(UniverSheetsFilterUIPlugin);
    // create workbook instance
    workbookRef.current = univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);
    const univerAPI = FUniver.newAPI(univer)
    fUniverRef.current = univerAPI;
    const activeWorkbook = univerAPI.getActiveWorkbook();
    activeWorkbook.onSelectionChange((selection) => {
      currentSelection.current = selection;
    });
  };

  /**
   * Destroy univer instance and workbook instance
   */
  const destroyUniver = () => {
    // univerRef.current?.dispose();
    univerRef.current = null;
    workbookRef.current = null;
  };

  /**
   * Get workbook data
   */
  const getData = () => {
    if (!workbookRef.current) {
      throw new Error('Workbook is not initialized');
    }
    return workbookRef.current.save();
  };

  useEffect(() => {
    init(data);
    return () => {
      destroyUniver();
    };
  }, [data]);

  return <div ref={containerRef} className="univer-container" />;
});

export default UniverSheet;
