//import {toStr} from '/lib/enonic/util';
import {base64Decode} from '/lib/text-encoding';
import {readText} from '/lib/xp/io';

import connectRepo from '../../lib/appProxy/connectRepo.es';


const connection = connectRepo();


export function get(req) {
	//log.info(toStr({req}));
	const node = connection.get(req.params.id);
	//log.info(toStr({node}));
	return {
		body: readText(base64Decode(node.data.base64)),
		contentType: node.data.contentType
	};
}
