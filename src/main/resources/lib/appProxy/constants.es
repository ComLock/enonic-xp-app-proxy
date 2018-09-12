import {sanitize} from '/lib/xp/common';

export const BRANCH_ID = 'master';
export const REPO_ID = sanitize(`${app.name}-${app.version}`);
