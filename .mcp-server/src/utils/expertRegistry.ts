import { Expert, ExpertName } from '../types';

class ExpertRegistry {
	private expertRegistry: Map<ExpertName, Expert> = new Map();

	public set(name: ExpertName, expert: Expert) {
		this.expertRegistry.set(name, expert);
	}

	public get(name: ExpertName) {
		return this.expertRegistry.get(name);
	}

	public get all() {
		return this.expertRegistry;
	}

	public get entries() {
		return Array.from(this.expertRegistry.entries());
	}

	public get values() {
		return Array.from(this.expertRegistry.values());
	}
}

export const expertRegistry = new ExpertRegistry();
