import {resolve} from 'uri-js';
import fnv1a from '@sindresorhus/fnv1a';

//import {toStr} from '/lib/enonic/util';
import {submitNamed} from '/lib/xp/task';


// https://developer.mozilla.org/en-US/docs/Web/CSS/url
const CSS_REPLACE_ALL_URL = /url\(['"]?([^)]+)['"]?\)/gm;


export default function rewriteCss({
	css,
	baseUri,
	//refLookupTable,
	serviceUrl,
	refTasks
}) {
	//log.info(toStr({css, baseUri}));
	const replacedCss = css.replace(CSS_REPLACE_ALL_URL, (match, url/*, string*/) => {
		//log.info(toStr({string, match, url}));
		const absoluteUrl = resolve(baseUri, url);
		refTasks.push(submitNamed({
			name: 'persistUrl',
			config: {
				absoluteUrl,
				persistLookupTable: false,
				serviceUrl
			}
		}));
		/*log.info(toStr({
			string, match, url, absoluteUrl
		}));*/
		const path = '/';
		const name = `${fnv1a(absoluteUrl)}`;
		const key = `${path}${name}`;
		//refLookupTable[key] = absoluteUrl; // eslint-disable-line no-param-reassign
		//log.info(toStr({hashToUrl}));
		const newUrl = `${serviceUrl}?key=${key}`;
		//log.info(toStr({newUrl}));
		return `url(${newUrl})`;
	});
	//log.info(toStr({replacedCss}));
	return replacedCss;
}
