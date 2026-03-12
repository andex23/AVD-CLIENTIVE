"use client"

import { demoClients, demoOrders, demoTasks } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function HomeWorkspacePreview({ className }: { className?: string }) {
  const primaryTask = demoTasks[0]
  const secondaryTask = demoTasks[1]
  const primaryClient = demoClients.find((client) => client.id === primaryTask.clientId) || demoClients[0]
  const primaryOrder = demoOrders[0]

  return (
    <div className={cn("overflow-hidden rounded-[18px] border border-border bg-card", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div>
          <p className="section-label">Today</p>
          <h3 className="mt-2 font-sans text-[1.3rem] font-semibold leading-tight text-foreground">
            One calm workspace for client work.
          </h3>
        </div>
        <div className="space-y-1 text-right text-sm text-muted-foreground">
          <p>1 overdue</p>
          <p>1 due today</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:p-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section>
          <p className="text-sm font-semibold text-foreground">Focus queue</p>
          <div className="mt-3 border-t border-border">
            {[primaryTask, secondaryTask].map((task) => {
              const client = demoClients.find((entry) => entry.id === task.clientId)
              return (
                <div key={task.id} className="border-b border-border py-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {client?.name} · {task.description}
                      </p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{task.priority}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="space-y-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <section>
            <p className="text-sm font-semibold text-foreground">Client record</p>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 font-semibold text-primary">
                {initials(primaryClient.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{primaryClient.name}</p>
                <p className="text-sm text-muted-foreground">{primaryClient.company}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Notes, stage, and next action stay together so each follow-up starts with context.
            </p>
          </section>

          <section className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">Optional orders</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {primaryOrder.product} stays visible in the same workspace when you need light delivery and revenue context.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
