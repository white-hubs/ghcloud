export const downloadExcelFile = (value: BlobPart, title: string): void => {
  const link = document.createElement('a')
  const blob = new Blob([value], {
    type: 'application/vnd.ms-excel',
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `${title}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
