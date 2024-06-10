import { Univer, LocaleType, UniverInstanceType, Tools, IRange } from '@univerjs/core';
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
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import DesignZhCN from '@univerjs/design/locale/zh-CN';
import UIZhCN from '@univerjs/ui/locale/zh-CN';
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN';
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN';
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN';
import SheetsFilterUIZhCN from '@univerjs/sheets-filter-ui/locale/zh-CN';
export const createUniverInstance = () => {
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
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin);
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

      return univer
}