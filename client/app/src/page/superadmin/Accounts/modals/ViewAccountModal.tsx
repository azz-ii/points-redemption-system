import { useState } from "react";
import { X, User, Edit2, Save, XCircle } from "lucide-react";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import { fetchWithCsrf } from "@/lib/csrf";
import type { Account, ModalBaseProps } from "./types";

interface ViewAccountModalProps extends ModalBaseProps {
  account: Account | null;
  onAccountUpdate?: (updatedAccount: Account) => void;
}

export function ViewAccountModal({
  isOpen,
  onClose,
  account,
  onAccountUpdate,
}: ViewAccountModalProps) {
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      setNewImage(null);
      setImagePreview(null);
      return;
    }
    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setNewImage(null);
    setImagePreview(null);
  };

  const handleCancelEdit = () => {
    setIsEditingPicture(false);
    setNewImage(null);
    setImagePreview(null);
    setError("");
  };

  const handleSaveProfilePicture = async () => {
    if (!account) return;

    setIsSaving(true);
    setError("");

    try {
      const formData = new FormData();
      
      // Include all required fields
      formData.append("username", account.username);
      formData.append("full_name", account.full_name);
      formData.append("email", account.email);
      formData.append("position", account.position);
      formData.append("points", String(account.points || 0));
      formData.append("is_activated", String(account.is_activated));
      formData.append("is_banned", String(account.is_banned));
      
      if (newImage) {
        formData.append("profile_picture", newImage);
      }

      const response = await fetchWithCsrf(`/api/users/${account.id}/`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update the account with new profile picture
        if (onAccountUpdate && data.user) {
          onAccountUpdate(data.user);
        }
        setIsEditingPicture(false);
        setNewImage(null);
        setImagePreview(null);
      } else {
        setError(data.error || "Failed to update profile picture");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating profile picture:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-3">
          <div>
            <h2 id="view-account-title" className="text-lg font-semibold">View Account</h2>
            <p className="text-xs text-gray-500 mt-0">
              Details for {account.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Profile Picture Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Profile Picture
              </h3>
              {!isEditingPicture ? (
                <button
                  onClick={() => setIsEditingPicture(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-muted hover:bg-accent text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              ) : null}
            </div>
            
            {isEditingPicture ? (
              <div className="space-y-4">
                <ProfilePictureUpload
                  currentImage={account.profile_picture}
                  preview={imagePreview}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfilePicture}
                    disabled={isSaving || !newImage}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-muted hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-muted">
                  {account.profile_picture ? (
                    <img
                      src={account.profile_picture}
                      alt={`${account.full_name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`w-16 h-16 text-muted-foreground ${account.profile_picture ? 'hidden' : ''}`} />
                </div>
              </div>
            )}
          </div>

          {/* Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={account.username || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={account.email || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={account.full_name || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <input
                  type="text"
                  value={account.position || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <input
                  type="text"
                  value={account.points?.toLocaleString() ?? "0"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value={`${account.is_activated ? "Active" : "Inactive"}${account.is_banned ? " • Banned" : ""}`}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
