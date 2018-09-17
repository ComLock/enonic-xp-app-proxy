import {resolve} from 'uri-js';
import fnv1a from '@sindresorhus/fnv1a';

import {serviceUrl} from '/lib/xp/portal';


// https://developer.mozilla.org/en-US/docs/Web/CSS/url
const CSS_REPLACE_ALL_URL = /url\(['"]?([^)]+)['"]?\)/gm;


export default function rewriteCss({
	css,
	baseUri,
	refLookupTable
}) {
	return css.replace(CSS_REPLACE_ALL_URL, (match, url/*, string*/) => {
		const absoluteUrl = resolve(baseUri, url);
		//log.info(toStr({string, url, absoluteUrl}));
		const path = '/';
		const name = `${fnv1a(absoluteUrl)}`;
		const key = `${path}${name}`;
		refLookupTable[key] = absoluteUrl; // eslint-disable-line no-param-reassign
		//log.info(toStr({hashToUrl}));
		return `url(${serviceUrl({
			service: 'onDemand',
			params: {key}
		})})`;
	});
}
