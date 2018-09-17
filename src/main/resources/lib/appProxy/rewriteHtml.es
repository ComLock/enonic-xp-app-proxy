import {toStr} from '/lib/enonic/util';

import replaceAttr from './replaceAttr.es';
import rewriteCss from './rewriteCss.es';


const MATCH_ALL_CARRIAGE_RETURNS = /\/r/g;
const REPLACE_STYLE = /<style([^>]*?)>([^]*?)<\/style>/gm;

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

	str = replaceAttr({
		str,
		tagName: 'img',
		attrName: 'src',
		oldBaseUrl: baseUri,
		//refLookupTable,
		refTasks,
		serviceUrl
	});

	str = str.replace(REPLACE_STYLE, (match, attr, css) => {
		log.info(toStr({match, attr, css}));
		const newCss = rewriteCss({
			css,
			baseUri,
			//refLookupTable,
			refTasks,
			serviceUrl
		});
		return `<style${attr}>${newCss}</style>`;
	});

	return str;
}
