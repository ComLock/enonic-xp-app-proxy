import {connect} from '/lib/xp/node';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function connectRepo({
	repoId = REPO_ID,
	branch = BRANCH_ID
} = {}) {
	return connect({
		repoId,
		branch
	});
}
