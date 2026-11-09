import { createSignal, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';

function useTemporaryVisibility(duration: number): [Accessor<boolean>, () => void] {
	const [visible, setVisible] = createSignal(false);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	function trigger() {
		setVisible(true);
		clearTimeout(timeout);
		timeout = setTimeout(() => setVisible(false), duration);
	}

	onCleanup(() => clearTimeout(timeout));

	return [visible, trigger];
}

export default useTemporaryVisibility;
