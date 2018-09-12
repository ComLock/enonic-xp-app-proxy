import {resolve} from 'uri-js';

import {newCache} from '/lib/cache';
//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {request as clientRequest} from '/lib/http-client';
import {base64Decode, base64Encode} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';
import {getComponent, serviceUrl} from '/lib/xp/portal';

import connectRepo from '../../../lib/appProxy/connectRepo.es';
import createOrModifyNode from '../../../lib/appProxy/createOrModifyNode.es';
import runAsSu from '../../../lib/appProxy/runAsSu.es';


const MATCH_ALL_CARRIAGE_RETURNS = /\/r/g;
const CAPTURE_HEAD = /<head[^>]*>([^]*?)<\/head>/m;
const REPLACE_ALL_LINK_HREF = /<link([^>]*?)href="([^"]+)"([^>]*)>/gm;
const REPLACE_ALL_SCRIPT_SRC = /<script([^>]*?)src="([^"]+)"([^>]*)>/gm;
const MATCH_ALL_LINK = /<link[^]*?<\/link>/gm;
const MATCH_ALL_SCRIPT = /<script[^]*?<\/script>/gm;
const MATCH_ALL_STYLE = /<style[^]*?<\/style>/gm;
const REPLACE_BODY = /[^]*?<body([^]*?)<\/body>[^]*/m;
//const REMOVE_LINK = /<link[^]*?<\/link>/gm;
//const REMOVE_SCRIPT = /<script[^]*?<\/script>/gm;


const connection = connectRepo();


const uriCache = newCache({
	size: 1000,
	expire: 3600 // An hour
});


function uriToId(uri) {
	return uriCache.get(uri, () => {
		const res = clientRequest({url: uri});
		//log.info(toStr({uri, res}));
		if (res.status === 200) {
			return runAsSu(
				() => createOrModifyNode({
					_name: uri,
					data: {
						contentType: res.contentType,
						base64: base64Encode(res.body)
					}
				})
			)._id;
		}
		log.error(`${res.status} ${uri}`);
		return '';
	});
}


export function get() {
	const {config} = getComponent();
	const {url} = config;
	if (!url) { throw new Error('Please input an url to proxy'); }
	//const removeLink = config.removeLink !== false;
	//const removeScripts = config.removeScripts !== false;
	const clientRes = clientRequest({url}); //log.info(toStr({clientRes}));

	let resBody = clientRes.body.replace(MATCH_ALL_CARRIAGE_RETURNS, '');

	resBody = resBody.replace(REPLACE_ALL_LINK_HREF, (match, pre, href, post) => {
		/*log.info(toStr({
			match, pre, href, post, offset
		}));*/
		const newHref = serviceUrl({
			service: 'getNode',
			params: {
				id: uriToId(resolve(url, href))
			}
		});
		const link = `<link${pre}href="${newHref}"${post}>`;
		//log.info(toStr({link}));
		return link;
	});
	resBody = resBody.replace(REPLACE_ALL_SCRIPT_SRC, (match, pre, src, post) => {
		/*log.info(toStr({
			match, pre, src, post, offset
		}));*/
		const newSrc = serviceUrl({
			service: 'getNode',
			params: {
				id: uriToId(resolve(url, src))
			}
		});
		const script = `<script${pre}href="${newSrc}"${post}>`;
		//log.info(toStr({script}));
		return script;
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
	const node = runAsSu(() => createOrModifyNode({
		_name: url,
		data: {
			contentType: clientRes.contentType,
			base64: base64Encode(body)
		}
	}));

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
		body: readText(base64Decode(node.data.base64)),
		contentType: node.data.contentType,
		pageContributions
	};
}
