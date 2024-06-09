
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
export const exportExcel = async (data) => {
    try {
        const result = await dialog.showSaveDialog({
            title: '保存文件',
            defaultPath: 'default.xlsx',
            filters: [{ name: 'default', extensions: ['xlsx'] }],
        });

        if (!result.canceled) {
            console.log('保存位置:', result.filePath);
            // 初始化一个新的工作簿
            const workbook = new ExcelJS.Workbook();

            // 添加一个新的工作表
            const worksheet = workbook.addWorksheet('Sheet 1');

            // 添加表头
            worksheet.columns = [
                { header: '姓名', key: 'name', width: 10 },
                { header: '年龄', key: 'age', width: 10 },
                { header: '城市', key: 'city', width: 15 },
            ];

            // 添加数据行
            worksheet.addRow({ name: '张三', age: 25, city: '北京' });
            worksheet.addRow({ name: '李四', age: 30, city: '上海' });
            worksheet.addRow({ name: '王五', age: 28, city: '广州' });

            // 写入文件
            await workbook.xlsx.writeFile(result.filePath);

            console.log(`Excel文件已成功创建并保存至: ${result.filePath}`);


        }
    } catch (err) {
        console.error('选择保存位置时发生错误:', err);
    }
}