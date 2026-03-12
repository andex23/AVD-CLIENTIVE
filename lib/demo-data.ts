import type { Client } from "@/types/client"
import type { Task } from "@/types/task"
import type { Order } from "@/types/order"

export const demoClients: Client[] = [
  {
    id: "demo-client-1",
    name: "Maya Thompson",
    email: "maya@northline.studio",
    phone: "+1 (202) 555-0141",
    company: "Northline Studio",
    status: "vip",
    lastContact: "2026-03-12T08:15:00.000Z",
    tags: ["retainer", "design"],
    notes: "Weekly strategy cadence. Prefers concise WhatsApp follow-ups.",
    interactions: [],
  },
  {
    id: "demo-client-2",
    name: "Jordan Lee",
    email: "jordan@ledgerlane.co",
    phone: "+1 (202) 555-0159",
    company: "Ledger Lane",
    status: "active",
    lastContact: "2026-03-10T14:30:00.000Z",
    tags: ["finance", "proposal"],
    notes: "Needs a revised onboarding sequence quote by Friday.",
    interactions: [],
  },
  {
    id: "demo-client-3",
    name: "Amina Bello",
    email: "amina@helloatelier.io",
    phone: "+234 803 555 0087",
    company: "Hello Atelier",
    status: "prospect",
    lastContact: "2026-03-09T11:10:00.000Z",
    tags: ["lead", "branding"],
    notes: "Warm lead from referral. Interested in an April kickoff.",
    interactions: [],
  },
]

export const demoTasks: Task[] = [
  {
    id: "demo-task-1",
    title: "Send revised proposal",
    description: "Tighten scope and add retainer option for Q2.",
    clientId: "demo-client-2",
    dueDate: "2026-03-12T15:30:00.000Z",
    type: "email",
    priority: "high",
    completed: false,
    emailNotify: true,
  },
  {
    id: "demo-task-2",
    title: "WhatsApp follow-up after discovery call",
    description: "Confirm next steps and timeline.",
    clientId: "demo-client-3",
    dueDate: "2026-03-13T09:00:00.000Z",
    type: "follow-up",
    priority: "medium",
    completed: false,
    emailNotify: false,
  },
  {
    id: "demo-task-3",
    title: "Prep weekly client review",
    description: "Summarize wins, blockers, and next actions.",
    clientId: "demo-client-1",
    dueDate: "2026-03-14T08:00:00.000Z",
    type: "meeting",
    priority: "medium",
    completed: false,
    emailNotify: true,
  },
]

export const demoOrders: Order[] = [
  {
    id: "demo-order-1",
    clientId: "demo-client-1",
    product: "Quarterly content retainer",
    description: "March delivery block",
    amount: 3200,
    date: "2026-03-08T10:00:00.000Z",
    status: "processing",
  },
  {
    id: "demo-order-2",
    clientId: "demo-client-2",
    product: "Onboarding audit",
    description: "Initial audit and action plan",
    amount: 1450,
    date: "2026-03-05T16:10:00.000Z",
    status: "completed",
  },
]
