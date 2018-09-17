import {base64Decode} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';

import connectRepo from '../../lib/appProxy/connectRepo.es';
import runAsSu from '../../lib/appProxy/runAsSu.es';


const connection = connectRepo();


export function get(req) {
	if (!req.params.key) { return {status: 400}; }

	const node = runAsSu(() => connection.get(req.params.key));
	if (!node) { return {status: 404}; }

	return {
		body: readText(base64Decode(node.data.base64)),
		contentType: node.data.contentType
	};
}
