//import {resolve} from 'uri-js';
import fnv1a from '@sindresorhus/fnv1a';

import {toStr} from '/lib/enonic/util';
import {request as clientRequest} from '/lib/http-client';
import {base64Encode} from '/lib/text-encoding';
import {
	//get as getTask,
	list,
	progress
} from '/lib/xp/task';

//import {HASH_TO_URL_NAME} from '../../lib/appProxy/constants.es';
import connectRepo from '../../lib/appProxy/connectRepo.es';
import createOrModifyNode from '../../lib/appProxy/createOrModifyNode.es';
import rewriteCss from '../../lib/appProxy/rewriteCss.es';
import rewriteHtml from '../../lib/appProxy/rewriteHtml.es';
import runAsSu from '../../lib/appProxy/runAsSu.es';
//import getLookupTable from '../../lib/appProxy/getLookupTable.es';
//import sleepUntilFinished from '../../lib/appProxy/sleepUntilFinished.es';


const connection = connectRepo();


function persistUrl({
	absoluteUrl, path, name, serviceUrl, refTasks//, refLookupTable
}) {
	//log.info(toStr({absoluteUrl, path, name}));
	const res = clientRequest({url: absoluteUrl}); //log.info(toStr({res, absoluteUrl}));
	if (res.status !== 200) {
		log.error(toStr({
			absoluteUrl,
			res: {
				status: res.status
			},
			persistTo: {path, name}
		}));
		return null;
	}

	if (res.contentType.startsWith('text/html')) {
		res.body = rewriteHtml({
			html: res.body,
			baseUri: absoluteUrl,
			serviceUrl,
			//refLookupTable,
			refTasks
		});
	} else if (res.contentType.startsWith('text/css')) {
		//log.info(toStr({res}));
		res.body = rewriteCss({
			css: res.body,
			baseUri: absoluteUrl,
			serviceUrl,
			//refLookupTable,
			refTasks
		});
	}
	//log.info(toStr({resBody: res.body}));

	return runAsSu(
		() => createOrModifyNode({
			_path: path,
			_name: name,
			data: {
				contentType: res.contentType,
				base64: base64Encode(res.body)
			}
		})
	);
}


export function run(config) {
	//log.info(toStr({config}));
	const {absoluteUrl, serviceUrl} = config;
	//const persistLookupTable = config.persistLookupTable !== false;
	//log.info(toStr({absoluteUrl, persistLookupTable, serviceUrl}));

	const path = '/';
	const name = `${fnv1a(absoluteUrl)}`;
	const key = `${path}${name}`;
	let alreadyRunningTaskId = null;
	const runningTasks = list({
		name: `${app.name}:persistUrl`,
		state: 'RUNNING'
	}); //log.info(toStr({runningTasks}));
	runningTasks.forEach((runningTask) => {
		const obj = runningTask.progress.info ? JSON.parse(runningTask.progress.info) : {};
		const runningTaskKey = obj.key;
		if (runningTaskKey === key) {
			//log.info(`Task already running! ${toStr({runningTask})}`);
			alreadyRunningTaskId = runningTask.id;
		}
	});
	//log.info(toStr({alreadyRunningTaskId}));
	//const refLookupTable = [];
	const refTasks = [];
	if (alreadyRunningTaskId) {
		/*sleepUntilFinished({taskId: alreadyRunningTaskId});
		const task = getTask(alreadyRunningTaskId);
		progress(task.progress);*/
		return alreadyRunningTaskId;
	}

	progress({ // NOTE this must be after checking for if already running.
		current: 0,
		total: 1,
		info: JSON.stringify({
			absoluteUrl,
			key
		})
	});
	const node = runAsSu(() => connection.get(key)); //log.info(toStr({node}));
	if (node) {
		const oneHourAgo = new Date();
		oneHourAgo.setHours(oneHourAgo.getHours() - 1); //log.info(toStr({oneHourAgo}));
		const modifiedTime = new Date(node.modifiedTime); //log.info(toStr({modifiedTime}));
		if (modifiedTime < oneHourAgo) {
			//log.info('modifiedTime older than oneHourAgo :(');
			persistUrl({
				absoluteUrl, path, name, serviceUrl, refTasks//, refLookupTable
			});
		} /*else {
			log.info('modifiedTime newer than oneHourAgo :)');
		}*/
	} else {
		persistUrl({
			absoluteUrl, path, name, serviceUrl, refTasks//, refLookupTable
		});
	}
	/*refTasks.forEach((taskId) => {
		sleepUntilFinished({taskId});
		const task = getTask(taskId);
		log.info(toStr({task}));
	});*/
	/*if (persistLookupTable) {
		const mergedLookupTable = {
			...getLookupTable(),
			...{[key]: absoluteUrl},
			...refLookupTable
		};
		log.info(toStr({mergedLookupTable}));
		createOrModifyNode({
			_name: HASH_TO_URL_NAME,
			data: {
				hashToUrl: mergedLookupTable
			}
		});
	}*/
	progress({
		current: 1,
		total: 1,
		info: JSON.stringify({
			absoluteUrl,
			key
		})
	});
	return null;
} // run
