import { IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/react';
import { create, trash } from 'ionicons/icons';
import { Task, TimeEntry } from '../hooks/useIndexedDB';
import { formatDistanceStrict } from 'date-fns';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  tasks,
  onEditEntry,
  onDeleteEntry,
}) => {
  const isRunning = (entry: TimeEntry) => !entry.endTime;
  
  const formatDuration = (startTime: string, endTime?: string) => {
    const end = endTime ? new Date(endTime) : new Date();
    return formatDistanceStrict(new Date(startTime), end);
  };

  return (
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
              onClick={() => onEditEntry(entry)}
              disabled={isRunning(entry)}
            >
              <IonIcon icon={create} slot="icon-only" />
            </IonButton>
            <IonButton
              fill="clear"
              onClick={() => onDeleteEntry(entry.id)}
              color="danger"
              disabled={isRunning(entry)}
            >
              <IonIcon icon={trash} slot="icon-only" />
            </IonButton>
          </IonItem>
        ))}
    </IonList>
  );
};

export default TimeEntryList; 