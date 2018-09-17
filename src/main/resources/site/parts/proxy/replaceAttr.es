import {resolve} from 'uri-js';
import fnv1a from '@sindresorhus/fnv1a';

import {serviceUrl} from '/lib/xp/portal';
import {submitNamed} from '/lib/xp/task';


export default function replaceAttr({
	str,
	tagName,
	attrName,
	oldBaseUrl,
	refLookupTable, // Will get modified as such no need to return it
	refTasks // Will get modified as such no need to return it
}) {
	const REGEXP = new RegExp(`<${tagName}([^>]*?)${attrName}="([^"]+)"([^>]*)>`, 'gm');
	return str.replace(REGEXP, (match, pre, attr, post) => {
		const absoluteUrl = resolve(oldBaseUrl, attr);

		const path = '/';
		const name = `${fnv1a(absoluteUrl)}`;
		const key = `${path}${name}`;

		refTasks.push(submitNamed({
			name: 'persistUrl',
			config: {
				absoluteUrl,
				path,
				name
			}
		}));

		refLookupTable[key] = absoluteUrl; //eslint-disable-line no-param-reassign

		const newUrl = serviceUrl({
			service: 'onDemand',
			params: {key}
		});
		return `<${tagName}${pre}${attrName}="${newUrl}"${post}>`;
	}); // replace
}
