export interface Task {
  id: string;
  name: string;
  alias: string;
  folder?: string;
}

export interface TimeEntry {
  id: string;
  taskAlias: string;
  startTime: string;
  endTime?: string;
}

interface DBSchema {
  tasks: Task;
  timeEntries: TimeEntry;
}

const DB_NAME = 'timeTrackerDB';
const DB_VERSION = 1;

export const useIndexedDB = () => {
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('alias', 'alias', { unique: true });
        }

        // Create timeEntries store
        if (!db.objectStoreNames.contains('timeEntries')) {
          const timeEntryStore = db.createObjectStore('timeEntries', { keyPath: 'id' });
          timeEntryStore.createIndex('taskAlias', 'taskAlias', { unique: false });
        }
      };
    });
  };

  const getAllTasks = async (): Promise<Task[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addTask = async (task: Task): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.add(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const updateTask = async (task: Task): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.delete(taskId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getAllTimeEntries = async (): Promise<TimeEntry[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('timeEntries', 'readonly');
      const store = transaction.objectStore('timeEntries');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addTimeEntry = async (timeEntry: TimeEntry): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('timeEntries', 'readwrite');
      const store = transaction.objectStore('timeEntries');
      const request = store.add(timeEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const updateTimeEntry = async (timeEntry: TimeEntry): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('timeEntries', 'readwrite');
      const store = transaction.objectStore('timeEntries');
      const request = store.put(timeEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const deleteTimeEntry = async (timeEntryId: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('timeEntries', 'readwrite');
      const store = transaction.objectStore('timeEntries');
      const request = store.delete(timeEntryId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  return {
    getAllTasks,
    addTask,
    updateTask,
    deleteTask,
    getAllTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}; 