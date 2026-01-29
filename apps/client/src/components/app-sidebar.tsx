import * as React from 'react'
import {
  Bot,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users,
} from 'lucide-react'

import { useAuth } from '@/auth/auth-store'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = {
  student: [
    {
      title: 'Dashboard',
      url: '/student',
      icon: LayoutDashboard,
    },
    {
      title: 'Subjects',
      url: '/student/subjects',
      icon: Library,
    },
    {
      title: 'AI Chat Assistant',
      url: '/student/ai',
      icon: Bot,
    },
  ],
  lecturer: [
    {
      title: 'Dashboard',
      url: '/lecturer',
      icon: LayoutDashboard,
    },
    {
      title: 'AI Chat Assistant',
      url: '/lecturer/ai',
      icon: Bot,
    },
    {
      title: 'Subjects',
      url: '/lecturer/subjects',
      icon: Library,
    },
    {
      title: 'Assessments',
      url: '/lecturer/assessment',
      icon: ClipboardList,
    },
    {
      title: 'Manage Grades',
      url: '/lecturer/manage-grades',
      icon: FileText,
    },
    {
      title: 'Registered Users',
      url: '/lecturer/registered-users',
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  if (!user) return null

  const navItems =
    user.role === 'student' ? navigation.student : navigation.lecturer

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GraduationCap className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-lg tracking-tight">
                    EDUBOT
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
