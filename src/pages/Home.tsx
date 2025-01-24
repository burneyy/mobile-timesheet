import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonAlert,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { Task, TimeEntry } from '../hooks/useIndexedDB';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { formatDistanceStrict } from 'date-fns';
import TaskList from '../components/TaskList';
import TimeEntryList from '../components/TimeEntryList';
import EditTimeEntryModal from '../components/EditTimeEntryModal';

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAlias, setNewTaskAlias] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskAlias, setEditTaskAlias] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editTimeEntry, setEditTimeEntry] = useState<TimeEntry | null>(null);
  const [editTimeEntryModal, setEditTimeEntryModal] = useState(false);
  const [timeEntryToDelete, setTimeEntryToDelete] = useState<string | null>(null);
  
  const db = useIndexedDB();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await db.getAllTasks();
        const savedTimeEntries = await db.getAllTimeEntries();
        setTasks(savedTasks);
        setTimeEntries(savedTimeEntries);
        
        // Check for active task
        const activeEntry = savedTimeEntries.find(entry => !entry.endTime);
        if (activeEntry) {
          const activeTask = savedTasks.find(task => task.alias === activeEntry.taskAlias);
          if (activeTask) {
            setActiveTaskId(activeTask.id);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleAddTask = async () => {
    if (newTaskName && newTaskAlias) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName,
        alias: newTaskAlias,
      };
      try {
        await db.addTask(newTask);
        setTasks([...tasks, newTask]);
        setNewTaskName('');
        setNewTaskAlias('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const toggleTimer = async (task: Task) => {
    if (activeTaskId === task.id) {
      // Stop the timer
      const updatedEntries = timeEntries.map(entry =>
        entry.taskAlias === task.alias && !entry.endTime
          ? { ...entry, endTime: new Date().toISOString() }
          : entry
      );
      
      try {
        const entryToUpdate = timeEntries.find(
          entry => entry.taskAlias === task.alias && !entry.endTime
        );
        if (entryToUpdate) {
          await db.updateTimeEntry({
            ...entryToUpdate,
            endTime: new Date().toISOString()
          });
          setTimeEntries(prevEntries => 
            prevEntries.map(entry =>
              entry.id === entryToUpdate.id
                ? { ...entry, endTime: new Date().toISOString() }
                : entry
            )
          );
          setActiveTaskId(null);
        }
      } catch (error) {
        console.error('Error updating time entry:', error);
      }
    } else {
      // Stop any running timer first
      const runningEntry = timeEntries.find(entry => !entry.endTime);
      if (runningEntry) {
        try {
          const updatedEntry = {
            ...runningEntry,
            endTime: new Date().toISOString()
          };
          await db.updateTimeEntry(updatedEntry);
          setTimeEntries(prevEntries =>
            prevEntries.map(entry =>
              entry.id === runningEntry.id
                ? updatedEntry
                : entry
            )
          );
        } catch (error) {
          console.error('Error stopping previous timer:', error);
        }
      }
      
      // Start new timer
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        taskAlias: task.alias,
        startTime: new Date().toISOString(),
      };
      
      try {
        await db.addTimeEntry(newEntry);
        setTimeEntries(prevEntries => [...prevEntries, newEntry]);
        setActiveTaskId(task.id);
      } catch (error) {
        console.error('Error adding new time entry:', error);
      }
    }
  };

  const formatDuration = (startTime: Date, endTime: Date | undefined) => {
    const end = endTime || new Date();
    return formatDistanceStrict(new Date(startTime), new Date(end));
  };

  // Update the time entries display to properly check for running status
  const isRunning = (entry: TimeEntry) => {
    return !entry.endTime;
  };

  const handleEditTask = async (task: Task) => {
    if (editTaskId === task.id) {
      try {
        const updatedTask = {
          ...task,
          name: editTaskName,
          alias: editTaskAlias,
        };
        await db.updateTask(updatedTask);
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id ? updatedTask : t
          )
        );
        setEditTaskId(null);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      setEditTaskId(task.id);
      setEditTaskName(task.name);
      setEditTaskAlias(task.alias);
    }
  };

  const handleSaveTimeEntry = async () => {
    if (editTimeEntry) {
      try {
        await db.updateTimeEntry(editTimeEntry);
        setTimeEntries(prevEntries =>
          prevEntries.map(e => e.id === editTimeEntry.id ? editTimeEntry : e)
        );
        setEditTimeEntry(null);
        setEditTimeEntryModal(false);
      } catch (error) {
        console.error('Error updating time entry:', error);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Time Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          editTaskId={editTaskId}
          onToggleTimer={toggleTimer}
          onEditTask={handleEditTask}
          onDeleteTask={taskId => setTaskToDelete(taskId)}
          editTaskName={editTaskName}
          editTaskAlias={editTaskAlias}
          setEditTaskName={setEditTaskName}
          setEditTaskAlias={setEditTaskAlias}
        />

        <TimeEntryList
          timeEntries={timeEntries}
          tasks={tasks}
          onEditEntry={entry => {
            setEditTimeEntry(entry);
            setEditTimeEntryModal(true);
          }}
          onDeleteEntry={entryId => setTimeEntryToDelete(entryId)}
        />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Task</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonLabel position="stacked">Task Name</IonLabel>
              <IonInput
                value={newTaskName}
                onIonChange={e => setNewTaskName(e.detail.value!)}
                placeholder="Enter task name"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Task Alias</IonLabel>
              <IonInput
                value={newTaskAlias}
                onIonChange={e => setNewTaskAlias(e.detail.value!)}
                placeholder="Enter task alias"
              />
            </IonItem>
            <IonButton expand="block" onClick={handleAddTask}>
              Add Task
            </IonButton>
          </IonContent>
        </IonModal>

        <EditTimeEntryModal
          isOpen={editTimeEntryModal}
          onDidDismiss={() => setEditTimeEntryModal(false)}
          timeEntry={editTimeEntry}
          tasks={tasks}
          onSave={handleSaveTimeEntry}
          setTimeEntry={setEditTimeEntry}
        />

        <IonAlert
          isOpen={!!taskToDelete}
          onDidDismiss={() => setTaskToDelete(null)}
          header="Confirm Delete"
          message="Are you sure you want to delete this task?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: async () => {
                if (taskToDelete) {
                  try {
                    await db.deleteTask(taskToDelete);
                    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
                  } catch (error) {
                    console.error('Error deleting task:', error);
                  }
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={!!timeEntryToDelete}
          onDidDismiss={() => setTimeEntryToDelete(null)}
          header="Confirm Delete"
          message="Are you sure you want to delete this time entry?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: async () => {
                if (timeEntryToDelete) {
                  try {
                    await db.deleteTimeEntry(timeEntryToDelete);
                    setTimeEntries(prevEntries => 
                      prevEntries.filter(entry => entry.id !== timeEntryToDelete)
                    );
                  } catch (error) {
                    console.error('Error deleting time entry:', error);
                  }
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
