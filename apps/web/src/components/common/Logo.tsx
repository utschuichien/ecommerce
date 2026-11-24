interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({
  className = '',
  showText = true,
  textClassName = 'text-lg font-bold  tracking-tight text-gray-800',
  iconClassName = 'h-8 w-8 shrink-0',
}: LogoProps) {
  return (
    <div 
    className={`inline-flex items-center gap-2.5 select-none  ${className}`}>
      <svg
        className={iconClassName}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-g" x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill="url(#logo-g)" />
        <path d="M18 21v-3.5a6 6 0 0 1 12 0V21" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M13 21.5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2V35a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V21.5Z"
          fill="#fff"
        />
        <path
          d="M18.5 29c1.4 3.2 3.4 4.5 5.5 4.5s4.1-1.3 5.5-4.5"
          stroke="#059669"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && <span className={textClassName}>CommerceOS</span>}
    </div>
  );
}