import {
  Briefcase,
  UserSearch,
  UserPlus,
  Handshake,
  Wallet,
  GraduationCap,
  Target,
  ShieldCheck,
  FileText,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const categoryIconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  'user-search': UserSearch,
  'user-plus': UserPlus,
  handshake: Handshake,
  wallet: Wallet,
  'graduation-cap': GraduationCap,
  target: Target,
  'shield-check': ShieldCheck,
  'file-text': FileText,
  users: Users,
}

export function getCategoryIcon(icon: string | undefined): LucideIcon {
  return (icon && categoryIconMap[icon]) || Briefcase
}
