import ignoreErrors from './lib/appProxy/ignoreErrors.es';
import runAsSu from './lib/appProxy/runAsSu.es';
import initRepo from './lib/appProxy/initRepo.es';


ignoreErrors(
	() => runAsSu(
		() => initRepo()
	)
);
