import {run} from '/lib/xp/context';
import {BRANCH_ID, REPO_ID} from './constants.es';


export default function runAsSu(fn, {
	branch = BRANCH_ID,
	repository = REPO_ID
} = {}) {
	return run({
		branch,
		repository,
		user: {
			login: 'su',
			userStore: 'system'
		},
		principals: ['role:system.admin']
	}, () => fn());
}
