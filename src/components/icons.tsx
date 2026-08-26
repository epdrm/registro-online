import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...props }: IconProps) {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, ...props }
}

export function IconDocCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 13 2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 3.5 1 4.8 1.5 5.5H4.5C5 15.3 6 14 6 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 19a2.6 2.6 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5.5h14M5 12h14M5 18.5h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10.5L12 4l8 6.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 21 19H3L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4M12 16.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3.8 2.6 5.4 5.9.6-4.4 4 1.2 5.9L12 16.8 6.7 19.7l1.2-5.9-4.4-4 5.9-.6L12 3.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconSmartphone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="3.5" width="10" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 17.2h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconDocX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m9.5 12.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconChat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5h16v10H10l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9v3.2M12 15.2v.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconUsersConflict(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19c.6-2.8 2.6-4.5 5-4.5s4.4 1.7 5 4.5M12.5 19c.5-2.4 2.3-4 4.5-4 2 0 3.7 1.2 4.5 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 20H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 4h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 16 20 12l-4.5-4M20 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconInfo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconPaperclip(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v11m0-11 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconBarChart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 19.5V11M12 19.5V4.5M19 19.5V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c.6-3 2.6-4.8 5.5-4.8s4.9 1.8 5.5 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 5.3a3 3 0 0 1 0 5.9M17.8 19c-.4-2.1-1.4-3.6-3-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconInbox(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12.5h4.2l1.3 2.5h5l1.3-2.5H20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 6h13l1.5 6.5v6a1.3 1.3 0 0 1-1.3 1.3H5.3A1.3 1.3 0 0 1 4 18.5v-6L5.5 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
