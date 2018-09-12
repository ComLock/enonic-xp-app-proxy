//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {request as clientRequest} from '/lib/http-client';
import {getComponent} from '/lib/xp/portal';

import createOrModifyNode from '../../../lib/appProxy/createOrModifyNode.es';
import runAsSu from '../../../lib/appProxy/runAsSu.es';


const MATCH_ALL_CARRIAGE_RETURNS = /\/r/g;
const CAPTURE_HEAD = /<head[^>]*>([^]*?)<\/head>/m;
//const CAPTURE_STYLE = /<style[^>]*>([^]*?)<\/style>/m;
const MATCH_ALL_STYLE = /<style[^]*?<\/style>/gm;
//const CAPTURE_BODY = /<body([^]*?)<\/body>/m;
const REPLACE_BODY = /[^]*?<body([^]*?)<\/body>[^]*/m;
const REMOVE_LINK = /<link[^]*?<\/link>/gm;
const REMOVE_SCRIPT = /<script[^]*?<\/script>/gm;


export function get() {
	const {config} = getComponent();
	const {url} = config;
	const removeLink = config.removeLink !== false;
	const removeScripts = config.removeScripts !== false;
	const clientRes = clientRequest({url}); //log.info(toStr({clientRes}));

	const resBody = clientRes.body.replace(MATCH_ALL_CARRIAGE_RETURNS, '');
	const head = CAPTURE_HEAD.exec(resBody)[1];
	//log.info(toStr({head}));

	//log.info(toStr({styleMatch: head.match(MATCH_STYLE)}));
	//log.info(toStr({styleMatch: CAPTURE_STYLE.exec(head)[1]}));
	const headEnd = [];
	let aMatch;
	while ((aMatch = MATCH_ALL_STYLE.exec(head)) !== null) {
		//log.info(`Found ${aMatch[0]}. Next starts at ${MATCH_ALL_STYLE.lastIndex}.`);
		//log.info(toStr({aMatch}));
		headEnd.push(aMatch[0]);
	}

	let body = resBody.replace(REPLACE_BODY, '<div$1</div>');

	if (removeLink) {
		body = body.replace(REMOVE_LINK, '');
	}

	if (removeScripts) {
		body = body.replace(REMOVE_SCRIPT, '');
	}
	//log.info(toStr({body}));

	body = runAsSu(() => createOrModifyNode({
		_name: url,
		data: {
			body
		}
	})).data.body;

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
		contentType: 'text/html; charset=UTF-8',
		pageContributions
	};
}
