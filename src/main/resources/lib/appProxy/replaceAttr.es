import {resolve} from 'uri-js';
import fnv1a from '@sindresorhus/fnv1a';

//import {toStr} from '/lib/enonic/util';
import {submitNamed} from '/lib/xp/task';

export default function replaceAttr({
	str,
	tagName,
	attrName,
	oldBaseUrl,
	//refLookupTable, // Will get modified as such no need to return it
	refTasks, // Will get modified as such no need to return it
	serviceUrl
}) {
	/*log.info(toStr({
		str, tagName, attrName, oldBaseUrl, refTasks, serviceUrl
	}));*/
	const REGEXP = new RegExp(`<${tagName}([^>]*?)${attrName}="([^"]+)"([^>]*)>`, 'gm');
	return str.replace(REGEXP, (match, pre, attr, post) => {
		/*log.info(toStr({
			match, pre, attr, post
		}));*/
		const absoluteUrl = resolve(oldBaseUrl, attr);
		/*log.info(toStr({
			absoluteUrl
		}));*/

		const path = '/';
		const name = `${fnv1a(absoluteUrl)}`;
		const key = `${path}${name}`;
		/*log.info(toStr({
			path, name, key
		}));*/

		refTasks.push(submitNamed({
			name: 'persistUrl',
			config: {
				absoluteUrl,
				persistLookupTable: false,
				serviceUrl
			}
		}));

		//refLookupTable[key] = absoluteUrl; //eslint-disable-line no-param-reassign

		const newUrl = `${serviceUrl}?key=${key}`; //log.info(toStr({newUrl}));
		const replaceMent = `<${tagName}${pre}${attrName}="${newUrl}"${post}>`;
		//log.info(toStr({replaceMent}));
		return  replaceMent;
	}); // replace
}
