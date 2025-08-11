export interface Order {
  id: string
  clientId: string
  product: string
  description?: string
  amount: number
  date: string
  status: "pending" | "processing" | "completed" | "cancelled"
}
