import {toStr} from '/lib/enonic/util';

import replaceAttr from './replaceAttr.es';


const MATCH_ALL_CARRIAGE_RETURNS = /\/r/g;


export default function rewriteHtml({
	html, baseUri, serviceUrl, refTasks//, refLookupTable
}) {
	log.info(toStr({html, baseUri}));
	let str = html;
	str = str.replace(MATCH_ALL_CARRIAGE_RETURNS, '');
	str = replaceAttr({
		str,
		tagName: 'link',
		attrName: 'href',
		oldBaseUrl: baseUri,
		//refLookupTable,
		refTasks,
		serviceUrl
	});
	//log.info(toStr({str, linkHref: 'replaced'}));

	str = replaceAttr({
		str,
		tagName: 'script',
		attrName: 'src',
		oldBaseUrl: baseUri,
		//refLookupTable,
		refTasks,
		serviceUrl
	});
	//log.info(toStr({str, scriptSrc: 'replaced'}));

	return str;
}
