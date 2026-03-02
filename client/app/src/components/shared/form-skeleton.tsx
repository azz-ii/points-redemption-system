interface FormFieldSkeletonProps {
  labelWidth?: number | string
  inputWidth?: number | string
  inputHeight?: number
}

function FormFieldSkeleton({ 
  labelWidth = 100, 
  inputWidth = "100%",
  inputHeight = 40
}: FormFieldSkeletonProps) {
  return (
    <div className="space-y-2">
      {/* Label skeleton */}
      <div 
        className="h-3 rounded bg-muted animate-pulse"
        style={{ width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }}
      />
      {/* Input skeleton */}
      <div 
        className="rounded border bg-muted animate-pulse border-border"
        style={{ 
          width: typeof inputWidth === 'number' ? `${inputWidth}px` : inputWidth,
          height: `${inputHeight}px`
        }}
      />
    </div>
  )
}

interface FormSkeletonProps {
  fieldCount?: number
  columns?: 1 | 2
  fieldConfig?: FormFieldSkeletonProps[]
}

export function FormSkeleton({ 
  fieldCount = 2, 
  columns = 1,
  fieldConfig
}: FormSkeletonProps) {
  const fields = fieldConfig || Array.from({ length: fieldCount }, () => ({}))
  
  const gridClass = columns === 2 
    ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
    : "space-y-4"
  
  return (
    <div className={gridClass}>
      {fields.map((config, index) => (
        <FormFieldSkeleton key={index} {...config} />
      ))}
    </div>
  )
}
