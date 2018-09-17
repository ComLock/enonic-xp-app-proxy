import {toStr} from '/lib/enonic/util';
import {request as clientRequest} from '/lib/http-client';
import {base64Encode} from '/lib/text-encoding';
import {list, progress} from '/lib/xp/task';

import connectRepo from '../../lib/appProxy/connectRepo.es';
import createOrModifyNode from '../../lib/appProxy/createOrModifyNode.es';
import rewriteCss from '../../lib/appProxy/rewriteCss.es';
import runAsSu from '../../lib/appProxy/runAsSu.es';


const connection = connectRepo();


function persistUrl({absoluteUrl, path, name}) {
	//log.info(toStr({absoluteUrl, path, name}));
	const res = clientRequest({url: absoluteUrl}); //log.info(toStr({absoluteUrl, res}));
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

	const refLookupTable = [];
	if (res.contentType.startsWith('text/css')) {
		//log.info(toStr({res}));
		res.body = rewriteCss({
			css: res.body,
			baseUri: absoluteUrl,
			refLookupTable
		});
	}

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

	const {absoluteUrl, name} = config;
	const path = config.path || '/';
	const key = `${path}${name}`; //log.info(toStr({key}));

	let taskAlreadyRunning = 0;
	const runningTasks = list({
		name: `${app.name}:persistUrl`,
		state: 'RUNNING'
	}); //log.info(toStr({runningTasks}));
	runningTasks.forEach((runningTask) => {
		const {info} = runningTask.progress;
		if (info === key) {
			//log.info(`Task already running! ${toStr({runningTask})}`);
			taskAlreadyRunning = 1;
		}
	});

	progress({ // NOTE this must be after checking for if already running.
		current: 0,
		total: 1,
		info: key
	});

	if (!taskAlreadyRunning) {
		const node = runAsSu(() => connection.get(key)); //log.info(toStr({node}));
		if (node) {
			const oneHourAgo = new Date();
			oneHourAgo.setHours(oneHourAgo.getHours() - 1); //log.info(toStr({oneHourAgo}));
			const modifiedTime = new Date(node.modifiedTime); //log.info(toStr({modifiedTime}));
			if (modifiedTime < oneHourAgo) {
				//log.info('modifiedTime older than oneHourAgo :(');
				persistUrl({absoluteUrl, path, name});
			} /*else {
				log.info('modifiedTime newer than oneHourAgo :)');
			}*/
		} else {
			persistUrl({absoluteUrl, path, name});
		}
	}

	progress({
		current: 1,
		total: 1,
		info: key
	});
}
