import { LogOut } from 'lucide-react'

import type { User } from '@/auth/types'
import { useAuth } from '@/auth/auth-store'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export function NavUser({ user }: { user: User }) {
  const { logout } = useAuth()

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-1 pr-1">
        <SidebarMenuButton
          size="lg"
          className="hover:bg-active/5 cursor-default flex-1"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={''} alt={user.fullName} />
            <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.fullName}</span>
            <span className="truncate text-xs capitalize opacity-70">
              {user.role}
            </span>
          </div>
        </SidebarMenuButton>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          onClick={() => logout()}
          title="Log out"
        >
          <LogOut className="size-4" />
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
