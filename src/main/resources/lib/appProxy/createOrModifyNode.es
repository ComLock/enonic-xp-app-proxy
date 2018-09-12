import {toStr} from '/lib/enonic/util';
import connectRepo from './connectRepo.es';
import {BRANCH_ID, REPO_ID} from './constants.es';
import createNode from './createNode.es';
import modifyNode from './modifyNode.es';


const CATCH_CLASS_NAMES = [
	'com.enonic.xp.node.NodeIdExistsException',
	'com.enonic.xp.node.NodeAlreadyExistAtPathException'
];


export default function createOrModifyNode({
	repoId = REPO_ID,
	branch = BRANCH_ID,
	connection = connectRepo({
		repoId,
		branch
	}),
	_path = '/',
	_name,
	displayName = _name,
	data
} = {}) {
	//log.info(toStr({_path, _name, displayName, data}));
	let rv;
	try {
		rv = createNode({
			connection, _path, _name, displayName, data
		});
	} catch (catchedError) {
		if (CATCH_CLASS_NAMES.includes(catchedError.class.name)) {
			rv = modifyNode({
				connection, _path, _name, displayName, data
			});
		} else {
			log.error(toStr({catchedErrorClassName: catchedError.class.name}));
			throw catchedError;
		}
	}
	//log.info(toStr({createOrModifyNodeRv: rv}));
	return rv;
}
