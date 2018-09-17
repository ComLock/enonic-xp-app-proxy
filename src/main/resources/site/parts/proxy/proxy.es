import fnv1a from '@sindresorhus/fnv1a';

//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {readText} from '/lib/xp/io';
import {getComponent, serviceUrl} from '/lib/xp/portal';
import {
	get as getTask,
	submitNamed
} from '/lib/xp/task';
import {base64Decode} from '/lib/text-encoding';

import connectRepo from '../../../lib/appProxy/connectRepo.es';
//import sleepUntilFinished from '../../../lib/appProxy/sleepUntilFinished.es';
import runAsSu from '../../../lib/appProxy/runAsSu.es';


const connection = connectRepo();

const CAPTURE_HEAD = /<head[^>]*>([^]*?)<\/head>/m;
const MATCH_ALL_LINK = /<link[^]*?<\/link>/gm;
const MATCH_ALL_SCRIPT = /<script[^]*?<\/script>/gm;
const MATCH_ALL_STYLE = /<style[^]*?<\/style>/gm;
const REPLACE_BODY = /[^]*?<body([^]*?)<\/body>[^]*/m;
//const REMOVE_LINK = /<link[^]*?<\/link>/gm;
//const REMOVE_SCRIPT = /<script[^]*?<\/script>/gm;


export function get() {
	const {config} = getComponent();
	const {url} = config;
	if (!url) { throw new Error('Please input an url to proxy'); }
	//const removeLink = config.removeLink !== false;
	//const removeScripts = config.removeScripts !== false;

	//const taskId =
	submitNamed({
		name: 'persistUrl',
		config: {
			absoluteUrl: url,
			persistLookupTable: true,
			serviceUrl: serviceUrl({
				service: 'onDemand'
			})
		}
	});
	//sleepUntilFinished({taskId});
	//const task = getTask(taskId); //log.info(toStr({task}));

	//const {key} = task.progress.info ? JSON.parse(task.progress.info) : {}; //log.info(toStr({key}));
	//if (!key) { return {status: 404}; }

	const path = '/';
	const name = `${fnv1a(url)}`;
	const key = `${path}${name}`;

	const node = runAsSu(() => connection.get(key)); //log.info(toStr({node}));
	if (!node) { return {status: 404}; }

	const htmlStr = readText(base64Decode(node.data.base64)); //log.info(toStr({htmlStr}));

	const head = CAPTURE_HEAD.exec(htmlStr)[1]; //log.info(toStr({head}));

	const headEnd = [];
	let aMatch;
	while ((aMatch = MATCH_ALL_LINK.exec(head)) !== null) {
		headEnd.push(aMatch[0]);
	}
	while ((aMatch = MATCH_ALL_SCRIPT.exec(head)) !== null) {
		headEnd.push(aMatch[0]);
	}
	while ((aMatch = MATCH_ALL_STYLE.exec(head)) !== null) {
		//log.info(`Found ${aMatch[0]}. Next starts at ${MATCH_ALL_STYLE.lastIndex}.`);
		//log.info(toStr({aMatch}));
		headEnd.push(aMatch[0]);
	}

	const body = htmlStr.replace(REPLACE_BODY, '<div$1</div>'); //log.info(toStr({body}));

	/*if (removeLink) {
		body = body.replace(REMOVE_LINK, '');
	}*/

	/*if (removeScripts) {
		body = body.replace(REMOVE_SCRIPT, '');
	}*/
	//log.info(toStr({body}));

	const pageContributions = {
		headBegin: [],
		headEnd,
		bodyBegin: [],
		bodyEnd: []
	};
	if (config.pageContributions) {
		forceArray(config.pageContributions).forEach(({html, position}) => {
			pageContributions[position || 'headBegin'].push(html);
		});
	}

	//log.info(toStr({pageContributions}));
	return {
		body,
		contentType: 'text/html; charset=utf-8',
		pageContributions
	};
}
