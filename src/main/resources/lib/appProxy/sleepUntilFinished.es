import {toStr} from '/lib/enonic/util';
import {
	get,
	isRunning,
	sleep as sleepMillis
} from '/lib/xp/task';


export default function sleepUntilFinished({
	taskId,
	millis = 50  // NOTE This should be a low number to avoid delaying the response too much.
}) {
	//log.info(`Sleeping until not running task:${toStr({task: get(taskId)})}`);
	while (isRunning(taskId)) {
		log.info(`Sleeping millis:${millis} for task:${toStr({task: get(taskId)})} to stop running...`);
		sleepMillis(millis);
	}
	log.info(`No longer running task:${toStr({task: get(taskId)})}`);
}
