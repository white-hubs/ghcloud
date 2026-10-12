/**
 * 下载文件
 * @param {value} 
 */
export function downloadExcel(value, title) {
	const link = document.createElement("a");
	let blob = new Blob([value], {
		type: "application/vnd.ms-excel",
	});
	link.style.display = "none";
	link.href = URL.createObjectURL(blob);
	link.setAttribute("download", `${title}.xlsx`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}