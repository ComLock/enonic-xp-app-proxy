import {create, createBranch} from '/lib/xp/repo';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function initRepo({
	repoId = REPO_ID,
	branchId = BRANCH_ID
} = {}) {
	create({
		id: repoId
	});
	createBranch({
		branchId,
		repoId
	});
}
