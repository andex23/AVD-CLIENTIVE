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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFilter: (filters: FilterOptions) => void
  orderTrackingEnabled: boolean
}

export interface FilterOptions {
  status?: string
  lastContactDays?: number
  tag?: string
  lastOrderDays?: number
}

export function FilterDialog({ open, onOpenChange, onFilter, orderTrackingEnabled }: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>({})

  const handleApplyFilters = () => {
    onFilter(filters)
    onOpenChange(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    onFilter({})
    onOpenChange(false)
  }

  const setTagPreset = (value: string) => {
    setFilters((prev) => ({ ...prev, tag: value || undefined }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Clients
          </DialogTitle>
          <DialogDescription>Apply filters to narrow down your client list.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastContact">Last Contact</Label>
            <Select
              value={filters.lastContactDays?.toString() || "any"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  lastContactDays: value === "any" ? undefined : Number.parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderTrackingEnabled && (
            <div className="space-y-2">
              <Label htmlFor="lastOrder">Last Order</Label>
              <Select
                value={filters.lastOrderDays?.toString() || "any"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    lastOrderDays: value === "any" ? undefined : Number.parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              placeholder="Filter by tag (VIP, Lead, etc.)"
              value={filters.tag || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value || undefined }))}
            />
            {/* Quick tag presets */}
            <div className="mt-2 flex flex-wrap gap-2">
              {["VIP", "Lead", "Prospect"].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={filters.tag?.toLowerCase() === preset.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTagPreset(preset)}
                >
                  {preset}
                </Button>
              ))}
              {filters.tag && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setTagPreset("")}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
