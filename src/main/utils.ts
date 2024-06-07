
const { dialog } = require('electron')
const ExcelJS = require('exceljs');

export const uploadExcel = async () => {
    let result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        // 发送到渲染进程
        // win.webContents.send('selected-file', result.filePaths[0]);
        // 假设result.filePaths[0]是你获取到的文件路径
        const filePath = result.filePaths[0];

        // 创建一个新的工作簿实例
        const workbook = new ExcelJS.Workbook();

        const excelData = [];
        // 读取Excel文件
        await workbook.xlsx.readFile(filePath)
        workbook.eachSheet((worksheet, sheetId) => {
            console.log(`Sheet Name: ${worksheet.name}`);
            let sheetData = {
                id: sheetId,
                name: worksheet.name,
                data: {}
            }
            excelData.push(sheetData)
            // 遍历工作表中的行
            worksheet.eachRow((row, rowNumber) => {
                let rowdata = {}
                sheetData.data[rowNumber] = rowdata;
                console.log(`Row Number: ${rowNumber}`);

                row.eachCell((cell, colNumber) => {
                    rowdata[colNumber] = { v: cell.value };
                    console.log(`Column Number: ${colNumber}, Value: ${cell.value}`);
                });
            });
        });
        return excelData;
    }
    return false
}