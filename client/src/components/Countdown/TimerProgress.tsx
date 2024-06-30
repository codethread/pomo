import { assertUnreachable } from "@shared/asserts";

export interface ITimerProgress {
  duration: number;
  mins: number;
  seconds: number;
  state: "break" | "inactive" | "pomo";
}

const stroke = 2;
const radius = 50 - stroke;
const circumference = radius * 2 * Math.PI;

export function TimerProgress({
  duration,
  mins,
  seconds,
  state,
}: ITimerProgress): JSX.Element {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle
        className="stroke-thmBackgroundSubtle"
        cx={50}
        cy={50}
        r={radius}
        fill="none"
        strokeWidth={stroke}
      />
      <circle
        className={state === "pomo" ? "stroke-thmPrimary" : `stroke-thmGood`}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          transitionProperty: "all",
          transitionDuration: state === "inactive" ? "0.2s" : "1s",
          transitionTimingFunction: "linear",
        }}
        cx={50}
        cy={50}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * getOffset()}
      />
    </svg>
  );

  /**
   * Get Progress as a percentage.
   * As this approaches zero, the timer will appear to fill or progress
   * i.e offset === 1 -> bar appears empty
   * i.e offset === 0 -> bar appears full
   */
  function getOffset(): number {
    const totalDurationInSeconds = duration * 60;
    const timeExpired = seconds + 60 * mins;
    const expiredAsPercentage = timeExpired / totalDurationInSeconds;

    switch (state) {
      case "inactive":
        return 1;
      case "break":
        return 1 - expiredAsPercentage;
      case "pomo":
        return expiredAsPercentage;
      default:
        return assertUnreachable(state);
    }
  }
}
