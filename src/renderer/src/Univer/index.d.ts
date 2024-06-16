import * as React from 'react';
// TODO: add types
declare module '.' {
  type IProps = {};
  type IApis = {};
  const UniverSheet: React.ForwardRefRenderFunction<IApis, IProps>;

  export default UniverSheet;
}
declare module '@univerjs/ui/locale/zh-CN';
declare module '@univerjs/sheets/locale/zh-CN';
declare module '@univerjs/sheets-ui/locale/zh-CN';
declare module '@univerjs/sheets-filter-ui/locale/zh-CN';