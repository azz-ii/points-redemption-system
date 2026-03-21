import React from 'react';
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { FIELD_TYPE_OPTIONS } from './types';
import type { ProductExtraField } from './types';

interface ExtraFieldsFormBuilderProps {
  extraFields: ProductExtraField[];
  onChange: (fields: ProductExtraField[]) => void;
}

export function ExtraFieldsFormBuilder({ extraFields, onChange }: ExtraFieldsFormBuilderProps) {
  const handleAddField = () => {
    const newField: ProductExtraField = {
      field_key: '',
      label: '',
      field_type: 'TEXT',
      is_required: false,
      display_order: extraFields.length,
      choices_json: null,
    };
    onChange([...extraFields, newField]);
  };

  const handleChange = (index: number, field: Partial<ProductExtraField>) => {
    const newFields = [...extraFields];
    newFields[index] = { ...newFields[index], ...field };
    onChange(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = extraFields.filter((_, i) => i !== index);
    newFields.forEach((f, i) => { f.display_order = i; });
    onChange(newFields);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...extraFields];
    const temp = newFields[index - 1];
    newFields[index - 1] = newFields[index];
    newFields[index] = temp;
    
    newFields[index - 1].display_order = index - 1;
    newFields[index].display_order = index;
    onChange(newFields);
  };

  const handleMoveDown = (index: number) => {
    if (index === extraFields.length - 1) return;
    const newFields = [...extraFields];
    const temp = newFields[index + 1];
    newFields[index + 1] = newFields[index];
    newFields[index] = temp;
    
    newFields[index + 1].display_order = index + 1;
    newFields[index].display_order = index;
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Custom Input Fields</h3>
        <button
          type="button"
          onClick={handleAddField}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      {extraFields.length === 0 ? (
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-md text-center border border-dashed border-border flex items-center justify-center">
          No custom fields defined. The item will only possess standard fields.
        </p>
      ) : (
        <div className="space-y-3">
          {extraFields.map((field, index) => (
            <div key={index} className="flex gap-3 p-3 bg-card border border-border rounded-md shadow-sm">
              <div className="flex flex-col gap-1 justify-center">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === extraFields.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left whitespace-nowrap">
                    <label className="text-xs font-medium text-muted-foreground">Field Key</label>
                    <input
                      type="text"
                      value={field.field_key}
                      onChange={(e) => handleChange(index, { field_key: e.target.value })}
                      placeholder="e.g. print_size"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-1 text-left whitespace-nowrap">
                    <label className="text-xs font-medium text-muted-foreground">Display Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleChange(index, { label: e.target.value })}
                      placeholder="e.g. Desired Print Size"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1 text-left whitespace-nowrap">
                    <label className="text-xs font-medium text-muted-foreground">Input Type</label>
                    <select
                      value={field.field_type}
                      onChange={(e) => handleChange(index, { field_type: e.target.value as ProductExtraField['field_type'] })}
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
                    >
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center h-9 space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={field.is_required}
                      onChange={(e) => handleChange(index, { is_required: e.target.checked })}
                      className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <label
                      htmlFor={`required-${index}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Required Field
                    </label>
                  </div>
                </div>

                {field.field_type === 'CHOICE' && (
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-muted-foreground">Choices (comma-separated)</label>
                    <input
                      type="text"
                      value={field.choices_json?.join(', ') || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const choices = val ? val.split(',').map(s => s.trim()).filter(Boolean) : null;
                        handleChange(index, { choices_json: choices });
                      }}
                      placeholder="e.g. Small, Medium, Large"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Remove Field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
