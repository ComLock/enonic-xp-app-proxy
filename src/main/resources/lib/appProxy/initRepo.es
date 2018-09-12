import {create, createBranch} from '/lib/xp/repo';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function initRepo() {
	create({
		id: REPO_ID
	});
	createBranch({
		branchId: BRANCH_ID,
		repoId: REPO_ID
	});
}
