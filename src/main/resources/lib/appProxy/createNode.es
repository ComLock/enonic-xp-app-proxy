//import {toStr} from '/lib/enonic/util';
import {sanitize} from '/lib/xp/common';
import connectRepo from './connectRepo.es';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function createNode({
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
	const CREATE_PARAMS = {
		_path,
		_name: sanitize(_name),
		displayName,
		data
	};
	//log.info(toStr(CREATE_PARAMS));
	return connection.create(CREATE_PARAMS);
}
