import { LocaleType, SheetTypes } from '@univerjs/core';

export const generateData = (data) => {
    const workBook = {
        id: 'workbook-01',
        locale: LocaleType.ZH_CN,
        name: 'universheet',
        appVersion: '3.0.0-alpha',
        sheets: {},
        styles: {}
    }
    const sheets = {};
    data.forEach(item => {
        if (!item.id) {
            return;
        }
        sheets[item.id] = {
            type: SheetTypes.GRID,
            id: item.id + '',
            name: item.name,
            cellData: item.data,
        }
    })
    workBook.sheets = sheets
    console.log({ workBook })
    return workBook;
}
