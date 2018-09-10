import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {request as clientRequest} from '/lib/http-client';
import {getComponent} from '/lib/xp/portal';


export function get() {
	const {config} = getComponent();
	const res = clientRequest({url: config.url});
	log.info(toStr({res}));
	if (config.pageContributions) {
		res.pageContributions = {
			headBegin: [],
			headEnd: [],
			bodyBegin: [],
			bodyEnd: []
		};
		forceArray(config.pageContributions).forEach(({html, position}) => {
			res.pageContributions[position || 'headBegin'].push(html);
		});
	}
	return res;
}
