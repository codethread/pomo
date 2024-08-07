import { StatType, StatTypeSchema, StatTypes, Stats } from '@shared/types';
import {
  ClockIcon,
  ChatAlt2Icon,
  XCircleIcon as CloseIcon,
} from '@heroicons/react/outline';
import { format, startOfWeek, parse, add } from 'date-fns';
import { useAsync } from 'react-use';
import { useEffect, useState, useMemo } from 'react';
import { FormItemNumber, FormItemText } from '@client/components/Form/FormItem';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@client/components/Button/Button';
import { useBridge } from '@client/hooks/useBridge';
import { InputSelect } from '@client/components/Inputs/InputSelect';

const timestampFormat = 'EEEE yy/MM/dd HH:mm';

export function Stats() {
  const b = useBridge();
  const { error, value, loading } = useAsync(b.statsRead);
  const [stats, setStats] = useState<Stats>({ completed: [] });
  useEffect(() => {
    value && setStats(value);
  }, [value]);

  const removeStat = (id: string) => {
    b.statsDelete(id).then((r) => setStats(r));
  };

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
      <div className="flex h-full flex-col justify-between">
        <div className="m-4 flex grow flex-col justify-center">
          <Summary output={output} />
          {output.completed.map(([date, duration]) => (
            <p key={date}>
              {format(date, 'ccc')} |{' '}
              {formatTime(duration, { hideSeconds: true })}
            </p>
          ))}
        </div>
      </div>
      <ManualTime />
      <Raw stats={stats} removeStat={removeStat} />
    </>
  );
}

function Raw({
  stats,
  removeStat,
}: {
  stats: Stats;
  removeStat: (id: string) => void;
}) {
  const [isShown, setIsShown] = useState(false);
  if (!isShown) {
    return (
      <div className="mb-4 flex flex-row justify-center">
        <Button onClick={() => setIsShown((s) => !s)} variant="tertiary">
          Show Raw
        </Button>
      </div>
    );
  }

  return (
    <div className="m-4">
      <Button onClick={() => setIsShown((s) => !s)} variant="tertiary">
        Hide
      </Button>
      {stats.completed.map((s) => (
        <p key={s.timestamp} className="flex justify-between tabular-nums">
          <span>{format(s.timestamp, 'MM/dd HH:mm')}</span>
          <span>{formatTime(s.duration, { hideSeconds: true })}</span>
          <RawIcon type={s._tag ?? 'pomo.pomo'} />
          <Button
            onClick={() => {
              removeStat(s.timestamp);
            }}
            variant="icon"
            className="flex h-auto w-auto content-center"
          >
            <CloseIcon className="inline-flex w-5 text-thmError" />
          </Button>
        </p>
      ))}
    </div>
  );
}

function RawIcon({ type }: { type: StatType }) {
  switch (type) {
    case 'pomo.pomo':
      return <ClockIcon className="inline-flex w-5 text-thmBright" />;
    case 'other.meeting':
      return <ChatAlt2Icon className="inline-flex w-5 text-thmWarn" />;
  }
}

function Summary({ output }: { output: OUT }) {
  const [target] = useState(25 * hour);
  return (
    <div className="text-center text-lg">
      <p>Week of {format(output.weekStartIso, 'MMM do')}</p>
      <p>
        Total {formatTime(output.total)}{' '}
        <span className="text-thmBright">
          {Math.round((output.total / target) * 100)}%
        </span>{' '}
        <span className="text-sm">({target / hour})</span>
      </p>
      <hr className="m-2" />
    </div>
  );
}

const ManualTimeSchema = z.object({
  duration: z.number().min(1, { message: '> 0' }),
  timestamp: z.string().refine((t) => Boolean(getFormatedDate(t)), {
    message: 'invalid timestamp',
  }),
  statType: StatTypeSchema,
});

type ManualTimeForm = z.infer<typeof ManualTimeSchema>;

function ManualTime() {
  const now = useMemo(
    () => format(new Date().toISOString(), 'yy/MM/dd HH:mm'),
    [],
  );
  const methods = useForm<ManualTimeForm>({
    defaultValues: {
      timestamp: now,
      duration: 10,
      statType: 'other.meeting',
    },
    resolver: zodResolver(ManualTimeSchema),
  });

  const [isShown, setIsShown] = useState(false);

  const { statsTimerComplete } = useBridge();

  const { reset, formState, getValues } = methods;
  const { isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues(), { keepIsSubmitted: true });
    }
  }, [isSubmitSuccessful, reset, getValues]);

  const [lastValidTs, setLastValidTs] = useState(now);
  const ts = methods.watch('timestamp');
  useEffect(() => {
    const d = getFormatedDate(ts);
    if (d) {
      setLastValidTs(d);
    }
  }, [ts]);

  if (!isShown) {
    return (
      <div className="flex flex-row justify-center">
        <Button onClick={() => setIsShown((s) => !s)} variant="tertiary">
          Add
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((form) => {
          const iso = parse(
            form.timestamp,
            'yy/MM/dd HH:mm',
            new Date(),
          ).toISOString();
          statsTimerComplete(form.duration * 60, form.statType, iso);
        })}
      >
        <div className="flex flex-col gap-4 rounded-lg border border-thmWarn p-2">
          <div className="flex gap-2">
            <div className="basis-1/3">
              <FormItemNumber<ManualTimeForm> name="duration" label="Mins" />
            </div>
            <div>
              <FormItemText<ManualTimeForm>
                name="timestamp"
                label="Timestamp"
              />
              <p className="text-sm text-thmFgDim">
                {format(lastValidTs, timestampFormat)}
              </p>
            </div>
          </div>
          <InputSelect<StatType>
            id="stat-type"
            options={StatTypes}
            initialValue={methods.getValues('statType')}
            onChange={(statType) => methods.setValue('statType', statType)}
          />
          <div className="w-fill flex flex-row justify-around gap-4">
            <Button
              type="submit"
              disabled={!methods.formState.isDirty}
              variant="secondary"
            >
              Add time
            </Button>
            <Button onClick={() => setIsShown((s) => !s)} variant="tertiary">
              Hide
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function transform(stats: Stats): OUT {
  const weekStartIso = startOfWeek(Date.now(), {
    weekStartsOn: 1,
  }).toISOString();
  const weekEndIso = add(weekStartIso, { weeks: 1 }).toISOString();

  const map = stats.completed
    .filter((s) => weekStartIso <= s.timestamp && s.timestamp < weekEndIso)
    .map((s) => {
      const d = new Date(s.timestamp);
      d.setSeconds(0);
      d.setMinutes(0);
      d.setHours(0);
      d.setMilliseconds(0);
      return { ...s, timestamp: d };
    })
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
function formatTime(
  duration: number,
  { hideSeconds }: { hideSeconds?: boolean } = {},
) {
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

function getFormatedDate(t: string): string | false {
  try {
    const date = parse(t, 'yy/MM/dd HH:mm', new Date());
    if (isNaN(date as any)) {
      throw new Error('aweful api');
    }
    return date.toISOString();
  } catch (_) {
    return false;
  }
}
