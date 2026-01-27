"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { POSITION_OPTIONS } from "../modals/types"

interface EditableCellProps {
  value: string | number
  isEditing: boolean
  onChange: (value: string | number) => void
  error?: string
}

export function EditableTextCell({ value, isEditing, onChange, error }: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value)
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing])

  if (!isEditing) {
    return <div className="py-2">{value || "N/A"}</div>
  }

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        value={localValue as string}
        onChange={(e) => {
          setLocalValue(e.target.value)
        }}
        onBlur={(e) => {
          onChange(e.target.value)
        }}
        className={`h-9 ${error ? "border-red-500" : ""}`}
        onClick={(e) => e.stopPropagation()}
      />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  )
}

export function EditableEmailCell({ value, isEditing, onChange, error }: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value)
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing])

  if (!isEditing) {
    return <div className="py-2">{value || "N/A"}</div>
  }

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        type="email"
        value={localValue as string}
        onChange={(e) => {
          setLocalValue(e.target.value)
        }}
        onBlur={(e) => {
          onChange(e.target.value)
        }}
        className={`h-9 ${error ? "border-red-500" : ""}`}
        onClick={(e) => e.stopPropagation()}
      />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  )
}

export function EditableNumberCell({ value, isEditing, onChange, error }: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value)
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing])

  if (!isEditing) {
    return <div className="py-2">{(value as number)?.toLocaleString() ?? 0}</div>
  }

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        type="number"
        min="0"
        value={localValue as number}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0
          setLocalValue(newValue)
        }}
        onBlur={(e) => {
          const newValue = parseInt(e.target.value) || 0
          onChange(newValue)
        }}
        className={`h-9 ${error ? "border-red-500" : ""}`}
        onClick={(e) => e.stopPropagation()}
      />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  )
}

interface EditableSelectCellProps {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  error?: string
}

export function EditableSelectCell({ value, isEditing, onChange, error }: EditableSelectCellProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setLocalValue(value)
    }
  }, [isEditing])

  if (!isEditing) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
        {value || "N/A"}
      </span>
    )
  }

  return (
    <div className="space-y-1">
      <select
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        className={`h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${error ? "border-red-500" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {POSITION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === ""}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  )
}
