const title = 'GH Admin'

export default function getPageTitle(pageTitle) {
	if (pageTitle) {
		return `${pageTitle} - ${title}`
	}
	return `${title}`
}
