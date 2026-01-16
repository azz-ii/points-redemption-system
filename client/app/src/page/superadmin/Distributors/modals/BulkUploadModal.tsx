import { useState } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { ModalBaseProps } from "./types";

interface BulkUploadResult {
  success: boolean;
  message: string;
  summary: {
    imported: number;
    skipped: number;
    errors: number;
  };
  imported_distributors: Array<{
    id: number;
    name: string;
    row: number;
  }>;
  errors: Array<{
    row: number;
    error: string;
  }>;
  note?: string;
}

interface BulkUploadModalProps extends ModalBaseProps {
  onUploadComplete: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: BulkUploadModalProps) {
  const { resolvedTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skip_duplicates', skipDuplicates.toString());

      const response = await fetch('http://localhost:8000/api/distributors/bulk_upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
      onUploadComplete();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-upload-title"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-3xl w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="bulk-upload-title" className="text-xl font-semibold">
              Bulk Upload Distributors
            </h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Upload Excel file with distributor names
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Instructions */}
          <div className={`p-4 rounded-lg border ${
            resolvedTheme === "dark"
              ? "bg-blue-900/20 border-blue-700"
              : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Excel File Format</p>
                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                  <li>File must have one column titled "LIST OF DISTRIBUTORS"</li>
                  <li>Each row should contain one distributor name</li>
                  <li>Placeholder values will be used for email, phone, and location</li>
                  <li>Update these details manually after import</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* File Upload */}
          {!uploadResult && (
            <>
              <div>
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    resolvedTheme === "dark"
                      ? "border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-750"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selectedFile ? (
                      <>
                        <FileSpreadsheet className="h-12 w-12 mb-3 text-green-500" />
                        <p className="mb-2 text-sm font-medium">{selectedFile.name}</p>
                        <p className={`text-xs ${
                          resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className={`h-12 w-12 mb-3 ${
                          resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`} />
                        <p className="mb-2 text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className={`text-xs ${
                          resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Excel files only (.xlsx, .xls)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="skip-duplicates"
                  className="text-sm cursor-pointer"
                >
                  Skip duplicate distributor names
                </label>
              </div>
            </>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className={`p-4 rounded-lg border ${
                uploadResult.summary.errors > 0
                  ? resolvedTheme === "dark"
                    ? "bg-yellow-900/20 border-yellow-700"
                    : "bg-yellow-50 border-yellow-200"
                  : resolvedTheme === "dark"
                    ? "bg-green-900/20 border-green-700"
                    : "bg-green-50 border-green-200"
              }`}>
                <div className="flex gap-2 mb-3">
                  <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${
                    uploadResult.summary.errors > 0 ? "text-yellow-500" : "text-green-500"
                  }`} />
                  <div className="text-sm font-medium">Upload Complete</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className={resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Imported
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {uploadResult.summary.imported}
                    </div>
                  </div>
                  <div>
                    <div className={resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Skipped
                    </div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {uploadResult.summary.skipped}
                    </div>
                  </div>
                  <div>
                    <div className={resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Errors
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                      {uploadResult.summary.errors}
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {uploadResult.note && (
                <div className={`p-3 rounded-lg text-xs ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <strong>Note:</strong> {uploadResult.note}
                </div>
              )}

              {/* Imported Distributors */}
              {uploadResult.imported_distributors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Successfully Imported ({uploadResult.imported_distributors.length})</h3>
                  <div className={`max-h-48 overflow-y-auto rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}>
                    <table className="w-full text-sm">
                      <thead className={`sticky top-0 ${
                        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                      }`}>
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.imported_distributors.map((distributor, idx) => (
                          <tr key={idx} className={`border-t ${
                            resolvedTheme === "dark"
                              ? "border-gray-700"
                              : "border-gray-200"
                          }`}>
                            <td className="px-3 py-2">{distributor.row}</td>
                            <td className="px-3 py-2">{distributor.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-red-500">Errors ({uploadResult.errors.length})</h3>
                  <div className={`max-h-48 overflow-y-auto rounded-lg border border-red-500 ${
                    resolvedTheme === "dark"
                      ? "bg-red-900/10"
                      : "bg-red-50"
                  }`}>
                    <table className="w-full text-sm">
                      <thead className={`sticky top-0 ${
                        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                      }`}>
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.errors.map((err, idx) => (
                          <tr key={idx} className={`border-t ${
                            resolvedTheme === "dark"
                              ? "border-gray-700"
                              : "border-gray-200"
                          }`}>
                            <td className="px-3 py-2">{err.row}</td>
                            <td className="px-3 py-2 text-red-500">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 flex gap-3 justify-end">
          {!uploadResult ? (
            <>
              <button
                onClick={handleClose}
                disabled={uploading}
                className={`px-6 py-3 rounded-lg border font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                    : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
