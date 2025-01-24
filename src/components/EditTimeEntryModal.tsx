import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonDatetime } from '@ionic/react';
import { Task, TimeEntry } from '../hooks/useIndexedDB';

interface EditTimeEntryModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  timeEntry: TimeEntry | null;
  tasks: Task[];
  onSave: () => void;
  setTimeEntry: (entry: TimeEntry) => void;
}

const EditTimeEntryModal: React.FC<EditTimeEntryModalProps> = ({
  isOpen,
  onDidDismiss,
  timeEntry,
  tasks,
  onSave,
  setTimeEntry,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Time Entry</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {timeEntry && (
          <>
            <IonItem>
              <IonLabel>Task</IonLabel>
              <IonSelect
                value={timeEntry.taskAlias}
                onIonChange={e => setTimeEntry({
                  ...timeEntry,
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
                value={timeEntry.startTime}
                onIonChange={e => setTimeEntry({
                  ...timeEntry,
                  startTime: new Date(e.detail.value as string).toISOString()
                })}
                presentation="date-time"
                hourCycle="h23"
              />
            </IonItem>

            {timeEntry.endTime && (
              <IonItem>
                <IonLabel>End Time</IonLabel>
                <IonDatetime
                  id="endTimePicker"
                  value={timeEntry.endTime}
                  onIonChange={e => setTimeEntry({
                    ...timeEntry,
                    endTime: new Date(e.detail.value as string).toISOString()
                  })}
                  presentation="date-time"
                  hourCycle="h23"
                />
              </IonItem>
            )}

            <IonButton expand="block" onClick={onSave}>
              Save Changes
            </IonButton>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};

export default EditTimeEntryModal; 