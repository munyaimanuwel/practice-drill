import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function QuizIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Quiz"} {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1.5 1.5L8 4.5" />
      <path d="M4 12l1.5 1.5L8 10.5" />
      <path d="M4 18l1.5 1.5L8 16.5" />
    </Icon>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Code"} {...props}>
      <path d="M8 6l-6 6 6 6" />
      <path d="M16 6l6 6-6 6" />
      <path d="M13.5 4l-3 16" />
    </Icon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Upload"} {...props}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Download"} {...props}>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </Icon>
  );
}

export function GradeIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Grade"} {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13l-2 8 5-3 5 3-2-8" />
    </Icon>
  );
}

export function SessionsIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Sessions"} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Log out"} {...props}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "User"} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </Icon>
  );
}

export function StartIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Start"} fill="currentColor" stroke="none" {...props}>
      <path d="M8 5v14l12-7z" />
    </Icon>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Save"} {...props}>
      <path d="M5 4h11l4 4v12H5z" />
      <path d="M8 4v5h8" />
      <path d="M8 16h8" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Time"} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon title={props.title ?? "Submit"} {...props}>
      <path d="M5 12l5 5L20 7" />
    </Icon>
  );
}
