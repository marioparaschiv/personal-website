import { useCallback, useEffect, useRef, useState } from 'react';

function useTemporaryVisibility(duration: number): [boolean, () => void] {
	const [visible, setVisible] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

	const trigger = useCallback(() => {
		setVisible(true);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setVisible(false), duration);
	}, [duration]);

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current);
	}, []);

	return [visible, trigger];
}

export default useTemporaryVisibility;
