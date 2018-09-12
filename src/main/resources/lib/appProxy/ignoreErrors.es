export default function ignoreErrors(fn) {
	let rv;
	try {
		rv = fn();
	} catch (e) {
		// no-op
	}
	return rv;
}
