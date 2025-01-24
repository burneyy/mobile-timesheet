import { IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput } from '@ionic/react';
import { play, stop, create, trash, ellipsisHorizontal } from 'ionicons/icons';
import { Task } from '../hooks/useIndexedDB';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  editTaskId: string | null;
  onToggleTimer: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  editTaskName: string;
  editTaskAlias: string;
  setEditTaskName: (name: string) => void;
  setEditTaskAlias: (alias: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  editTaskId,
  onToggleTimer,
  onEditTask,
  onDeleteTask,
  editTaskName,
  editTaskAlias,
  setEditTaskName,
  setEditTaskAlias,
}) => {
  return (
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
            onClick={() => onToggleTimer(task)}
          >
            <IonIcon
              icon={activeTaskId === task.id ? stop : play}
              slot="icon-only"
            />
          </IonButton>
          <IonButton
            fill="clear"
            onClick={() => onEditTask(task)}
          >
            <IonIcon
              icon={editTaskId === task.id ? ellipsisHorizontal : create}
              slot="icon-only"
            />
          </IonButton>
          <IonButton
            fill="clear"
            onClick={() => onDeleteTask(task.id)}
            color="danger"
          >
            <IonIcon icon={trash} slot="icon-only" />
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  );
};

export default TaskList; 