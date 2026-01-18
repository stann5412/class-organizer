## Packages
date-fns | For date formatting and manipulation
framer-motion | For smooth page transitions and micro-interactions
lucide-react | Icon set (already in base, but ensuring availability)
clsx | For conditional class names
tailwind-merge | For merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Authentication uses Replit Auth blueprint (useAuth hook).
API routes follow @shared/routes structure strictly.
