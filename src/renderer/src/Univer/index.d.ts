import * as React from 'react';
// TODO: add types
declare module '.' {
  type IProps = {};
  type IApis = {};
  const UniverSheet: React.ForwardRefRenderFunction<IApis, IProps>;

  export default UniverSheet;
}
