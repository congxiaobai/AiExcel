
const { dialog } = require('electron')
const ExcelJS = require('exceljs');
import max from 'lodash/max'

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
            let firsRow = true;
            let firsRowIndex = 0;
            worksheet.eachRow((row, rowNumber) => {
                let rowdata = {};
                let rowNumerFix = rowNumber;
                if (firsRow) {
                    firsRowIndex = rowNumber;
                    firsRow = false
                }
                if (firsRowIndex > 0) {
                    rowNumerFix -= firsRowIndex;
                }
                sheetData.data[rowNumerFix] = rowdata;
                console.log(`Row Number: ${rowNumerFix}`);
                let firsCol = true;
                let firsColIndex = 0;

                row.eachCell((cell, colNumber) => {
                    let colNumberFix = colNumber;
                    if (firsCol) {
                        firsColIndex = colNumber
                        firsCol = false
                    }
                    if (firsColIndex > 0) {
                        colNumberFix -= firsColIndex;
                    }

                    rowdata[colNumberFix] = { v: cell.value };
                    console.log(`Column Number: ${colNumberFix}, Value: ${cell.value}`);
                });
            });
        });
        return excelData;
    }
    return false
}
export const exportExcel = async (data, defaultPath) => {
    try {
        const result = await dialog.showSaveDialog({
            title: '保存为 Excel 文件',
            defaultPath, // 默认路径为桌面
            filters: [ // 定义文件类型过滤器
                {
                    name: 'Excel Files',
                    extensions: ['xlsx']
                },
                // 可以添加更多过滤器或包含一个接受所有文件的过滤器
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled) {
            console.log('保存位置:', result.filePath);
            // 初始化一个新的工作簿
            const workbook = new ExcelJS.Workbook();
            Object.keys(data).forEach((key) => {
                const sheetData = data[key];
                const worksheet = workbook.addWorksheet(key);
                const cellData = sheetData.cellData;
                let maxRow = max(Object.keys(cellData).map(s => +s));
                while (max > -1) {
                    worksheet.addRow([]);
                    maxRow--;
                }
                Object.keys(cellData).forEach((rowIndex) => {
                    Object.keys(cellData[rowIndex]).forEach(colIndex => {
                        worksheet.getCell(+rowIndex+1, +colIndex+1).value = cellData[rowIndex][colIndex].v;
                    })
                })
            })


            // 写入文件
            await workbook.xlsx.writeFile(result.filePath);

            console.log(`Excel文件已成功创建并保存至: ${result.filePath}`);


        }
    } catch (err) {
        console.error('选择保存位置时发生错误:', err);
    }
}