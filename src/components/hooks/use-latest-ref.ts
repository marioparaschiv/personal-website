import { useLayoutEffect, useRef } from 'react';

function useLatestRef<T>(value: T) {
	const ref = useRef(value);

	useLayoutEffect(() => {
		ref.current = value;
	});

	return ref;
}

export default useLatestRef;
