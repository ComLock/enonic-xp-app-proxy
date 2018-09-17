import {sanitize} from '/lib/xp/common';

export const BRANCH_ID = 'master';
export const REPO_ID = sanitize(`${app.name}-${app.version}`);

export const HASH_TO_URL_NAME = sanitize('hashToUrl');
export const HASH_TO_URL_PATH = `/${HASH_TO_URL_NAME}`;
