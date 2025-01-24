import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonAlert,
  IonDatetime,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { add, play, stop, ellipsisHorizontal, trash, create } from 'ionicons/icons';
import './Home.css';
import { Task, TimeEntry } from '../hooks/useIndexedDB';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { formatDistanceStrict } from 'date-fns';

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
  const [editTimeEntryId, setEditTimeEntryId] = useState<string | null>(null);
  const [timeEntryToDelete, setTimeEntryToDelete] = useState<string | null>(null);
  const [editTimeEntry, setEditTimeEntry] = useState<TimeEntry | null>(null);
  const [editTimeEntryModal, setEditTimeEntryModal] = useState(false);
  
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
          ? { ...entry, endTime: new Date() }
          : entry
      );
      
      try {
        const entryToUpdate = timeEntries.find(
          entry => entry.taskAlias === task.alias && !entry.endTime
        );
        if (entryToUpdate) {
          await db.updateTimeEntry({
            ...entryToUpdate,
            endTime: new Date()
          });
          setTimeEntries(prevEntries => 
            prevEntries.map(entry =>
              entry.id === entryToUpdate.id
                ? { ...entry, endTime: new Date() }
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
            endTime: new Date()
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
        startTime: new Date(),
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

  const handleDeleteTask = async (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditTimeEntry(entry);
    setEditTimeEntryModal(true);
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
        <IonList>
          {tasks.map(task => (
            <IonItem key={task.id}>
              {editTaskId === task.id ? (
                <IonLabel>
                  <IonInput
                    value={editTaskName}
                    onIonChange={e => setEditTaskName(e.detail.value!)}
                    placeholder="Task name"
                  />
                  <IonInput
                    value={editTaskAlias}
                    onIonChange={e => setEditTaskAlias(e.detail.value!)}
                    placeholder="Task alias"
                  />
                </IonLabel>
              ) : (
                <IonLabel>
                  <h2>{task.name}</h2>
                  <p>{task.alias}</p>
                </IonLabel>
              )}
              <IonButton
                fill="clear"
                onClick={() => toggleTimer(task)}
              >
                <IonIcon
                  icon={activeTaskId === task.id ? stop : play}
                  slot="icon-only"
                />
              </IonButton>
              <IonButton
                fill="clear"
                onClick={() => handleEditTask(task)}
              >
                <IonIcon
                  icon={editTaskId === task.id ? ellipsisHorizontal : create}
                  slot="icon-only"
                />
              </IonButton>
              <IonButton
                fill="clear"
                onClick={() => handleDeleteTask(task.id)}
                color="danger"
              >
                <IonIcon icon={trash} slot="icon-only" />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonList>
          <IonItem>
            <IonLabel>
              <h2>Time Entries</h2>
            </IonLabel>
          </IonItem>
          {timeEntries
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .map(entry => (
              <IonItem key={entry.id}>
                <IonLabel>
                  <h3>{tasks.find(t => t.alias === entry.taskAlias)?.name || entry.taskAlias}</h3>
                  <p>
                    {new Date(entry.startTime).toLocaleString()} - {' '}
                    {isRunning(entry) ? 'Running' : new Date(entry.endTime!).toLocaleString()}
                  </p>
                  <p>Duration: {formatDuration(entry.startTime, entry.endTime)}</p>
                </IonLabel>
                <IonButton
                  fill="clear"
                  onClick={() => handleEditTimeEntry(entry)}
                  disabled={isRunning(entry)}
                >
                  <IonIcon icon={create} slot="icon-only" />
                </IonButton>
                <IonButton
                  fill="clear"
                  onClick={() => setTimeEntryToDelete(entry.id)}
                  color="danger"
                  disabled={isRunning(entry)}
                >
                  <IonIcon icon={trash} slot="icon-only" />
                </IonButton>
              </IonItem>
            ))}
        </IonList>

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

        <IonModal isOpen={editTimeEntryModal} onDidDismiss={() => setEditTimeEntryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Time Entry</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {editTimeEntry && (
              <>
                <IonItem>
                  <IonLabel>Task</IonLabel>
                  <IonSelect
                    value={editTimeEntry.taskAlias}
                    onIonChange={e => setEditTimeEntry({
                      ...editTimeEntry,
                      taskAlias: e.detail.value
                    })}
                  >
                    {tasks.map(task => (
                      <IonSelectOption key={task.id} value={task.alias}>
                        {task.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                
                <IonItem>
                  <IonLabel>Start Time</IonLabel>
                  <IonDatetime
                    id="startTimePicker"
                    value={new Date(editTimeEntry.startTime).toISOString()}
                    onIonChange={e => setEditTimeEntry({
                      ...editTimeEntry,
                      startTime: new Date(e.detail.value as string)
                    })}
                    presentation="date-time"
                  />
                </IonItem>

                {editTimeEntry.endTime && (
                  <IonItem>
                    <IonLabel>End Time</IonLabel>
                    <IonDatetime
                      id="endTimePicker"
                      value={new Date(editTimeEntry.endTime).toISOString()}
                      onIonChange={e => setEditTimeEntry({
                        ...editTimeEntry,
                        endTime: new Date(e.detail.value as string)
                      })}
                      presentation="date-time"
                    />
                  </IonItem>
                )}

                <IonButton expand="block" onClick={handleSaveTimeEntry}>
                  Save Changes
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
