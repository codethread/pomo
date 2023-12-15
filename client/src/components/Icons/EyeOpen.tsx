import { SvgSize, useIcon } from './useIcon';

export function EyeOpen(props: SvgSize): JSX.Element {
  const { color, height, width } = useIcon(props);
  return (
    <svg
      width={height}
      height={width}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="6" className="fill-thmBright" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.732 20C35.9038 18.7342 34.6736 17.5384 33.0521 16.4845C29.8021 14.372 25.1931 13 20 13C14.8069 13 10.1979 14.372 6.94783 16.4845C5.32639 17.5384 4.09617 18.7342 3.26798 20H0.9646C3.56016 14.7775 11.1014 11 20 11C28.8986 11 36.4398 14.7775 39.0354 20H36.732Z"
        className="fill-thmBright"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.26798 20C4.09617 21.2658 5.32639 22.4616 6.94783 23.5155C10.1979 25.628 14.8069 27 20 27C25.1931 27 29.8021 25.628 33.0521 23.5155C34.6736 22.4616 35.9038 21.2658 36.732 20L39.0354 20C36.4398 25.2225 28.8986 29 20 29C11.1014 29 3.56016 25.2225 0.9646 20L3.26798 20Z"
        className="fill-thmBright"
      />
    </svg>
  );
}
