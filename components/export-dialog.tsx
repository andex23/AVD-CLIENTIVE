"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download } from "lucide-react"
import type { Client } from "@/types/client"
import type { Order } from "@/types/order"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  orders: Order[]
  orderTrackingEnabled: boolean
}

export function ExportDialog({ open, onOpenChange, clients, orders, orderTrackingEnabled }: ExportDialogProps) {
  const [format, setFormat] = useState("csv")
  const [includeOrders, setIncludeOrders] = useState(false)

  const exportData = () => {
    const clientHeaders = ["Name", "Email", "Phone", "Company", "Status", "Last Contact", "Tags", "Notes"]
    const orderHeaders = ["Client", "Product", "Amount", "Date", "Status", "Description"]

    if (format === "csv") {
      let csvContent = ""

      // Export clients
      csvContent += clientHeaders.join(",") + "\n"
      csvContent += clients
        .map((client) =>
          [
            `"${client.name}"`,
            `"${client.email}"`,
            `"${client.phone || ""}"`,
            `"${client.company || ""}"`,
            `"${client.status}"`,
            `"${new Date(client.lastContact).toLocaleDateString()}"`,
            `"${client.tags.join("; ")}"`,
            `"${(client.notes || "").replace(/"/g, '""')}"`,
          ].join(","),
        )
        .join("\n")

      // Export orders if enabled and requested
      if (orderTrackingEnabled && includeOrders && orders.length > 0) {
        csvContent += "\n\nORDERS\n"
        csvContent += orderHeaders.join(",") + "\n"
        csvContent += orders
          .map((order) => {
            const client = clients.find((c) => c.id === order.clientId)
            return [
              `"${client?.name || "Unknown"}"`,
              `"${order.product}"`,
              `"${order.amount}"`,
              `"${new Date(order.date).toLocaleDateString()}"`,
              `"${order.status}"`,
              `"${(order.description || "").replace(/"/g, '""')}"`,
            ].join(",")
          })
          .join("\n")
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `crm_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Excel format
      let excelContent = ""

      // Export clients
      excelContent += clientHeaders.join("\t") + "\n"
      excelContent += clients
        .map((client) =>
          [
            client.name,
            client.email,
            client.phone || "",
            client.company || "",
            client.status,
            new Date(client.lastContact).toLocaleDateString(),
            client.tags.join("; "),
            client.notes || "",
          ].join("\t"),
        )
        .join("\n")

      // Export orders if enabled and requested
      if (orderTrackingEnabled && includeOrders && orders.length > 0) {
        excelContent += "\n\nORDERS\n"
        excelContent += orderHeaders.join("\t") + "\n"
        excelContent += orders
          .map((order) => {
            const client = clients.find((c) => c.id === order.clientId)
            return [
              client?.name || "Unknown",
              order.product,
              order.amount,
              new Date(order.date).toLocaleDateString(),
              order.status,
              order.description || "",
            ].join("\t")
          })
          .join("\n")
      }

      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `crm_export_${new Date().toISOString().split("T")[0]}.xls`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export CRM Data
          </DialogTitle>
          <DialogDescription>
            Export your client data and notes to a file. Choose your preferred format below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (Comma Separated Values)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel (XLS)</Label>
              </div>
            </RadioGroup>
          </div>

          {orderTrackingEnabled && orders.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox id="include-orders" checked={includeOrders} onCheckedChange={setIncludeOrders} />
              <Label htmlFor="include-orders">Include order data ({orders.length} orders)</Label>
            </div>
          )}

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Export includes:</strong> Client information (name, email, phone, company, status, tags, notes)
              {includeOrders && orderTrackingEnabled ? " and order history" : ""} for all {clients.length} clients.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
