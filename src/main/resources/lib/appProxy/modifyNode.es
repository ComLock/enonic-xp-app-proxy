//import {toStr} from '/lib/enonic/util';
import {sanitize} from '/lib/xp/common';
import connectRepo from './connectRepo.es';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function modifyNode({
	repoId = REPO_ID,
	branch = BRANCH_ID,
	connection = connectRepo({
		repoId,
		branch
	}),
	_path = '/',
	_name,
	sanitizedName = sanitize(_name),
	key = `${_path}${sanitizedName}`,
	displayName = _name,
	data
} = {}) {
	//log.info(toStr({key, displayName, data}));
	return connection.modify({
		key,
		editor: (node) => {
			/* eslint-disable no-param-reassign */
			//node._timestamp = new Date(); // DOES NOT WORK?
			node.modifiedTime = new Date();
			node.displayName = displayName;
			node.data = data;
			/* eslint-enable no-param-reassign */
			return node;
		}
	});
}
