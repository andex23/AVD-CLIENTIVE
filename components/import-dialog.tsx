"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import type { Client } from "@/types/client"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImportPreview {
  valid: boolean
  data: Partial<Client>
  errors: string[]
  row: number
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { addClient } = useClients()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [hasHeaders, setHasHeaders] = useState(true)
  const [preview, setPreview] = useState<ImportPreview[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState({ success: 0, errors: 0 })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    const text = await file.text()
    let rows: string[][]

    if (file.name.endsWith(".csv")) {
      rows = parseCSV(text)
    } else {
      rows = parseExcel(text)
    }

    const startRow = hasHeaders ? 1 : 0
    const headerRow = hasHeaders ? rows[0] : []

    const previews: ImportPreview[] = rows.slice(startRow).map((row, index) => {
      const data: Partial<Client> = {}
      const errors: string[] = []

      // Map columns to client fields (assuming standard order or headers)
      if (hasHeaders) {
        headerRow.forEach((header, colIndex) => {
          const normalizedHeader = header.toLowerCase().trim()
          const value = row[colIndex]?.trim() || ""

          switch (normalizedHeader) {
            case "name":
              data.name = value
              break
            case "email":
              data.email = value
              break
            case "phone":
              data.phone = value
              break
            case "company":
              data.company = value
              break
            case "status":
              data.status = value as any
              break
            case "tags":
              data.tags = value ? value.split(";").map((t) => t.trim()) : []
              break
            case "notes":
              data.notes = value
              break
          }
        })
      } else {
        // Assume standard order: Name, Email, Phone, Company, Status, Tags, Notes
        data.name = row[0]?.trim() || ""
        data.email = row[1]?.trim() || ""
        data.phone = row[2]?.trim() || ""
        data.company = row[3]?.trim() || ""
        data.status = (row[4]?.trim() || "prospect") as any
        data.tags = row[5] ? row[5].split(";").map((t) => t.trim()) : []
        data.notes = row[6]?.trim() || ""
      }

      // Validation
      if (!data.name) {
        errors.push("Name is required")
      }
      if (!data.email) {
        errors.push("Email is required")
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.push("Invalid email format")
      }
      if (data.status && !["active", "inactive", "prospect", "lead", "vip"].includes(data.status)) {
        errors.push("Invalid status (must be: active, inactive, prospect, lead, or vip)")
      }

      return {
        valid: errors.length === 0,
        data,
        errors,
        row: startRow + index + 1,
      }
    })

    setPreview(previews)
    setStep("preview")
  }

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n")
    const result: string[][] = []

    for (const line of lines) {
      if (line.trim()) {
        // Simple CSV parsing (handles basic cases)
        const row = line.split(",").map((cell) => cell.trim().replace(/^"(.*)"$/, "$1"))
        result.push(row)
      }
    }

    return result
  }

  const parseExcel = (text: string): string[][] => {
    // For Excel files, we'll treat them as tab-separated for simplicity
    // In a real implementation, you'd use a library like xlsx
    const lines = text.split("\n")
    const result: string[][] = []

    for (const line of lines) {
      if (line.trim()) {
        const row = line.split("\t").map((cell) => cell.trim())
        result.push(row)
      }
    }

    return result
  }

  const handleImport = async () => {
    setStep("importing")
    setImportProgress(0)

    const validPreviews = preview.filter((p) => p.valid)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < validPreviews.length; i++) {
      const item = validPreviews[i]

      try {
        await addClient({
          ...(item.data as Omit<Client, "id">),
          lastContact: new Date().toISOString(),
          interactions: [],
          tags: item.data.tags || [],
          status: item.data.status || "prospect",
        })
        successCount++
      } catch (error) {
        errorCount++
      }

      setImportProgress(((i + 1) / validPreviews.length) * 100)

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    setImportResults({ success: successCount, errors: errorCount })
    setStep("complete")
  }

  const resetDialog = () => {
    setStep("upload")
    setFile(null)
    setPreview([])
    setImportProgress(0)
    setImportResults({ success: 0, errors: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }

  const validCount = preview.filter((p) => p.valid).length
  const errorCount = preview.filter((p) => !p.valid).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Clients
          </DialogTitle>
          <DialogDescription>
            Import clients from CSV or Excel files. Make sure your file includes Name and Email columns.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input ref={fileInputRef} id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
              <p className="text-xs text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="headers" checked={hasHeaders} onCheckedChange={setHasHeaders} />
              <Label htmlFor="headers" className="text-sm">
                First row contains column headers
              </Label>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Expected columns:</strong> Name*, Email*, Phone, Company, Status, Tags (semicolon-separated),
                Notes
                <br />
                <em>* Required fields</em>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-50">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} Errors
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Preview of {preview.length} rows</p>
            </div>

            <ScrollArea className="h-[300px] border rounded">
              <div className="space-y-2 p-4">
                {preview.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      item.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.data.name || "No name"} - {item.data.email || "No email"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Row {item.row} • {item.data.company || "No company"} • {item.data.status || "prospect"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    {item.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="text-xs text-red-600 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {errorCount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorCount} rows have errors and will be skipped during import. Only {validCount} valid rows will be
                  imported.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Importing Clients...</div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(importProgress)}% complete</p>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">Import Complete!</div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <Badge className="bg-green-100 text-green-800">{importResults.success} Imported Successfully</Badge>
                  {importResults.errors > 0 && <Badge variant="destructive">{importResults.errors} Failed</Badge>}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Clients
              </Button>
            </>
          )}

          {step === "importing" && <Button disabled>Importing...</Button>}

          {step === "complete" && <Button onClick={handleClose}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
