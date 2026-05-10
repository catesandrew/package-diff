import { useAppState } from '../state/AppState.js';

export function useTaskListWatcher(): { runningCount: number } {
  const tasks = useAppState(state => state.tasks);
  return {
    runningCount: tasks.filter(task => task.status === 'running').length
  };
}
