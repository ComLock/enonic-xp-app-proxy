import runAsSu from './lib/appProxy/runAsSu.es';
import {HASH_TO_URL_PATH} from './lib/appProxy/constants.es';
import connectRepo from './lib/appProxy/connectRepo.es';


const connection = connectRepo();


export default function getLookupTable() {
	const hashToUrlNode = runAsSu(() => connection.get(HASH_TO_URL_PATH)); //log.info(toStr({hashToUrlNode}));
	return (hashToUrlNode && hashToUrlNode.data && hashToUrlNode.data.hashToUrl) || {};
}
