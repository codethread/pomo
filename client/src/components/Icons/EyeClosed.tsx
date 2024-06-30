import { SvgSize, useIcon } from "./useIcon";

export function EyeClosed(props: SvgSize): JSX.Element {
  const { color, height, width } = useIcon(props);
  return (
    <svg
      width={height}
      height={width}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.0227 27.6051C33.7426 26.0516 37.3867 23.3173 39.0354 20C36.4398 14.7775 28.8986 11 20 11C17.283 11 14.6925 11.3522 12.3308 11.9901L14.0762 13.6229C15.9231 13.2213 17.9145 13 20 13C25.1931 13 29.8021 14.372 33.0521 16.4845C34.6736 17.5384 35.9038 18.7342 36.732 20C35.9038 21.2658 34.6736 22.4616 33.0521 23.5155C31.4471 24.5588 29.5107 25.4214 27.3362 26.0274L29.0227 27.6051ZM26.7699 28.2363L24.982 26.5638C23.4059 26.8468 21.7355 27 20 27C14.8069 27 10.1979 25.628 6.94783 23.5155C5.32639 22.4616 4.09617 21.2658 3.26798 20C4.09617 18.7342 5.32639 17.5384 6.94783 16.4845C8.33677 15.5817 9.97391 14.8141 11.7988 14.2311L10.1459 12.6848C5.83052 14.2761 2.51512 16.8802 0.9646 20C3.56016 25.2225 11.1014 29 20 29C22.3762 29 24.6556 28.7306 26.7699 28.2363ZM14.7873 17.0268C14.2863 17.9032 14 18.9182 14 20C14 23.3137 16.6863 26 20 26C21.2249 26 22.364 25.633 23.3134 25.0029L14.7873 17.0268ZM24.776 23.6324C25.544 22.6241 26 21.3653 26 20C26 16.6863 23.3137 14 20 14C18.491 14 17.1122 14.557 16.0578 15.4767L24.776 23.6324Z"
        className="fill-thmBright"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M35.6886 33.7935L4.68856 4.79345L6.3663 3L37.3663 32L35.6886 33.7935Z"
        className="fill-thmBright"
      />
    </svg>
  );
}
