import { Stats } from '@shared/types';
import { format, startOfWeek, parse, add } from 'date-fns';
import { useBridge } from '@client/hooks';
import moment from 'moment';
import { useAsync } from 'react-use';
import { useState } from 'react';
import { Button, ErrorBoundary, FormItemNumber, Box } from '@client/components';
import { FormItemText } from '@client/components/Form/FormItem';

export function Stats() {
  const b = useBridge();
  const { error, value: stats, loading } = useAsync(b.statsRead);

  if (loading) {
    return <p>loading</p>;
  }
  if (error) {
    return <p>oh no: {error.message}</p>;
  }

  if (!stats) return <p>???</p>;

  if (stats.completed.length === 0) {
    return (
      <>
        <p>no stats yet, go get working!</p>
        <ManualTime />
      </>
    );
  }

  const output = transform(stats);

  return (
    <>
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col justify-center grow m-4">
          <Summary output={output} />
          {output.completed.map(([date, duration]) => (
            <p key={date}>
              {format(date, 'ccc')} | {formatTime(duration, { hideSeconds: true })}
            </p>
          ))}
        </div>
      </div>
      <ErrorBoundary>
        <ManualTime />
      </ErrorBoundary>
    </>
  );
}

function Summary({ output }: { output: OUT }) {
  const [target, setTarget] = useState(25 * hour);
  return (
    <div className="text-lg text-center">
      <p>Week of {format(output.weekStartIso, 'MMM do')}</p>
      <p>
        Total {formatTime(output.total)}{' '}
        <span className="text-thmBright">{Math.round((output.total / target) * 100)}%</span>{' '}
        <span className="text-sm">({target / hour})</span>
      </p>
      <hr className="m-2" />
    </div>
  );
}

const timestampFormat = 'EEEE yy/MM/dd hh:mm';
const timestampFormatNoDay = 'yy/MM/dd hh:mm';
function ManualTime() {
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString());
  const [userTimestamp, setUserTimestamp] = useState(() => format(timestamp, timestampFormatNoDay));
  const [errorExample, setErrorExample] = useState('');

  const [duration, setDuration] = useState(60);
  const { statsTimerComplete } = useBridge();

  return (
    <div className="flex flex-col border border-thmWarn rounded-lg p-2 gap-4">
      <div className="flex gap-2">
        <div className="basis-1/3">
          <FormItemNumber
            label="Mins"
            input={{
              min: 0,
              max: 1000,
              value: duration / 60,
              onChange: (n) => {
                setDuration(n * 60);
              },
            }}
          />
        </div>
        <div>
          <FormItemText
            label="Timestamp"
            error={errorExample}
            input={{
              value: userTimestamp,
              onChange(t) {
                setUserTimestamp(t);
                try {
                  const date = parse(t, timestampFormatNoDay, new Date());
                  if (isNaN(date as any)) {
                    throw new Error('aweful api');
                  }
                  setTimestamp(date.toISOString());
                  setErrorExample('');
                } catch (_) {
                  setErrorExample('invalid timestamp');
                }
              },
            }}
          />
          <p className="text-thmFgDim text-sm">{format(timestamp, timestampFormat)}</p>
        </div>
      </div>
      <div className="flex justify-center flex-row w-fill">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            statsTimerComplete(duration, timestamp);
          }}
        >
          Add time
        </Button>
      </div>
    </div>
  );
}

function transform(stats: Stats): OUT {
  const weekStartIso = startOfWeek(Date.now(), { weekStartsOn: 1 }).toISOString();
  const weekEndIso = add(weekStartIso, { weeks: 1 }).toISOString();

  const map = stats.completed
    .filter((s) => weekStartIso <= s.timestamp && s.timestamp < weekEndIso)
    .map((s) => ({
      ...s,
      timestamp: moment(s.timestamp).seconds(0).minutes(0).hours(0).milliseconds(0),
    }))
    .reduce<Map<string, number>>((group, stat) => {
      const ts = stat.timestamp.toISOString();
      group.set(ts, (group.get(ts) ?? 0) + stat.duration);
      return group;
    }, new Map());

  const total = [...map.values()].reduce((t, n) => t + n, 0);
  return {
    weekStartIso,
    completed: [...map.entries()].sort(([a], [b]) => (a > b ? 1 : -1)),
    total,
  };
}

const sec = 1;
const min = 60 * sec;
const hour = 60 * min;
function formatTime(duration: number, { hideSeconds }: { hideSeconds?: boolean } = {}) {
  const { minutes, hours, seconds } = durationToTime(duration);
  return (
    `${formatTimerNumber(hours)}:${formatTimerNumber(minutes)}` +
    (hideSeconds ? '' : `:${formatTimerNumber(seconds)}`)
  );
}
function formatTimerNumber(n: number) {
  return n >= 10 ? n : `0${n}`;
}

function durationToTime(duration: number): {
  duration: number;
  seconds: number;
  minutes: number;
  hours: number;
} {
  if (duration < min) {
    return { duration, seconds: duration, hours: 0, minutes: 0 };
  }
  if (duration < hour) {
    const seconds = duration % min;
    const minutes = Math.floor(duration / min);
    return { duration, seconds, minutes, hours: 0 };
  }

  const seconds = duration % min;
  const minutes = Math.floor((duration % hour) / min);
  const hours = Math.floor(duration / hour);
  return { duration, seconds, minutes, hours };
}

/**
 * keeping this real simple for now
 */
interface OUT {
  weekStartIso: string;
  completed: [string, number][];
  total: number;
}
