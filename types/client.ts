export interface Interaction {
  id: string
  type: "call" | "email" | "meeting" | "note"
  content: string
  date: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: "active" | "inactive" | "prospect" | "lead" | "vip"
  lastContact: string
  tags: string[]
  notes?: string
  interactions?: Interaction[]
}
