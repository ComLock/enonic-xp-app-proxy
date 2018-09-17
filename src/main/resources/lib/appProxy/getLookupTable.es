import runAsSu from './runAsSu.es';
import {HASH_TO_URL_PATH} from './constants.es';
import connectRepo from './connectRepo.es';


const connection = connectRepo();


export default function getLookupTable() {
	const hashToUrlNode = runAsSu(() => connection.get(HASH_TO_URL_PATH)); //log.info(toStr({hashToUrlNode}));
	return (hashToUrlNode && hashToUrlNode.data && hashToUrlNode.data.hashToUrl) || {};
}
