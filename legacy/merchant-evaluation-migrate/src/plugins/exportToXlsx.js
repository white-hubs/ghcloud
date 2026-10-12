import moment from 'moment';

export function exportToXlsx({
  header = ['表头一'],
  rows = [['行1:列1']],
  filetype = 'excel',
  filename = '数据导出',
}) {
  let excel = '<table>';
  // Header
  excel += '<tr>';
  header.forEach((item) => {
    excel += '<th>' + item + '</th>';
  });
  excel += '</tr>';

  // Row
  rows.forEach((row) => {
    excel += '<tr>';
    row.forEach((col) => {
      excel += '<td>' + col + '</td>';
    });
    excel += '</tr>';
  });
  excel += '</table>';

  let excelFile =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
  excelFile += '<head>';
  excelFile += '<!--[if gte mso 9]>';
  excelFile += '<xml>';
  excelFile += '<x:ExcelWorkbook>';
  excelFile += '<x:ExcelWorksheets>';
  excelFile += '<x:ExcelWorksheet>';
  excelFile += '<x:Name>';
  excelFile += '导出数据';
  excelFile += '</x:Name>';
  excelFile += '<x:WorksheetOptions>';
  excelFile += '<x:DisplayGridlines/>';
  excelFile += '</x:WorksheetOptions>';
  excelFile += '</x:ExcelWorksheet>';
  excelFile += '</x:ExcelWorksheets>';
  excelFile += '</x:ExcelWorkbook>';
  excelFile += '</xml>';
  excelFile += '<![endif]-->';
  excelFile += '</head>';
  excelFile += '<body style="font-family: 宋体;">';
  excelFile += excel;
  excelFile += '</body>';
  excelFile += '</html>';

  // var base64data = 'base64,' + btoa(encodeURIComponent(excelFile));
  const blob = new Blob([excelFile], {
    type: 'application/vnd.ms-excel',
  });
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    'download',
    filename + moment().format('YYYYMMDDHHmmss') + '.xls',
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
