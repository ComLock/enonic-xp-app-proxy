import {getComponent} from '/lib/xp/portal';
import {request as clientRequest} from '/lib/http-client';


export function get() {
	const {url} = getComponent().config;
	return clientRequest({url});
}
