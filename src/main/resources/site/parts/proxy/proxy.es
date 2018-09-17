//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {request as clientRequest} from '/lib/http-client';
import {getComponent} from '/lib/xp/portal';
import {
	isRunning,
	//get as getTask,
	sleep as sleepMillis
} from '/lib/xp/task';

import {HASH_TO_URL_NAME} from '../../../lib/appProxy/constants.es';
import getLookupTable from '../../../lib/appProxy/getLookupTable.es';
import createOrModifyNode from '../../../lib/appProxy/createOrModifyNode.es';

import replaceAttr from './replaceAttr.es';


const MATCH_ALL_CARRIAGE_RETURNS = /\/r/g;
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

	// TODO check if already in repo.
	const clientRes = clientRequest({url}); //log.info(toStr({clientRes}));

	let resBody = clientRes.body.replace(MATCH_ALL_CARRIAGE_RETURNS, '');

	const refLookupTable = getLookupTable();

	const refTasks = [];
	resBody = replaceAttr({
		str: resBody,
		tagName: 'link',
		attrName: 'href',
		oldBaseUrl: url,
		refLookupTable,
		refTasks
	});

	resBody = replaceAttr({
		str: resBody,
		tagName: 'script',
		attrName: 'src',
		oldBaseUrl: url,
		refLookupTable,
		refTasks
	});

	//log.info(toStr({refLookupTable}));
	createOrModifyNode({
		_name: HASH_TO_URL_NAME,
		data: {
			hashToUrl: refLookupTable
		}
	});

	const head = CAPTURE_HEAD.exec(resBody)[1];
	//log.info(toStr({head}));

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

	const body = resBody.replace(REPLACE_BODY, '<div$1</div>');

	/*if (removeLink) {
		body = body.replace(REMOVE_LINK, '');
	}*/

	/*if (removeScripts) {
		body = body.replace(REMOVE_SCRIPT, '');
	}*/
	//log.info(toStr({body}));


	//const id = uriToId(url); // TODO This does not modify response. Cache some other way?
	//const node = connection.get(id);
	/*const node = runAsSu(() => createOrModifyNode({
		_name: url,
		data: {
			contentType: clientRes.contentType,
			base64: base64Encode(body)
		}
	}));*/

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

	refTasks.forEach((taskId) => { // wait until all tasks finished
		while (isRunning(taskId)) { // wait until task finished
			//const task = getTask(taskId);
			//log.info(`Waiting for task to finish: ${toStr({task})}`);
			sleepMillis(50); // NOTE This should be a low number to avoid delaying the response too much.
		}
	});

	//log.info(toStr({pageContributions}));
	return {
		//body: readText(base64Decode(node.data.base64)),
		body,
		//contentType: node.data.contentType,
		contentType: clientRes.contentType,
		pageContributions
	};
}
