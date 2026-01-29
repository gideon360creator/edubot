import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Rocket,
  Shield,
  Users,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduBot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden py-12 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The future of e-learning is here
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Learn faster. <br />
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                Manage smarter.
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground leading-relaxed">
              Edubot is the all-in-one platform for modern education.
              Effortlessly manage subjects, assessments, and student progress in
              one unified experience.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button
                  size="lg"
                  className="cursor-pointer h-12 px-8 text-base shadow-lg transition-transform hover:scale-105"
                >
                  Get Started <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Everything you need to excel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built Edubot with both lecturers and students in mind,
              focusing on simplicity and efficiency.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Intuitive Dashboard',
                description:
                  "Get a bird's eye view of all your subjects and upcoming tasks.",
                icon: LayoutDashboard,
              },
              {
                title: 'Smart Assessments',
                description:
                  'Create, monitor, and grade assessments with ease.',
                icon: BookOpen,
              },
              {
                title: 'Student Analytics',
                description:
                  'Track progress and identify areas for improvement instantly.',
                icon: Users,
              },
              {
                title: 'Seamless Collaboration',
                description:
                  'Foster better interaction between students and lecturers.',
                icon: Rocket,
              },
              {
                title: 'Secure & Reliable',
                description:
                  'Your data is protected with industry-standard security.',
                icon: Shield,
              },
              {
                title: 'Role-Based Access',
                description:
                  'Customized experiences for students and lecturers.',
                icon: GraduationCap,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-none shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground font-medium">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">EduBot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EduBot. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
