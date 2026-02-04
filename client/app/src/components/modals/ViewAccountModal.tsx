import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, User, Edit2, Save, XCircle, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import type { ModalBaseProps } from "./types";

interface UserAccount {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
  profile_picture?: string | null;
}

interface ViewAccountModalProps extends ModalBaseProps {}

export function ViewAccountModal({ isOpen, onClose }: ViewAccountModalProps) {
  const { resolvedTheme } = useTheme();
  const { updateProfilePicture } = useAuth();
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch current user data
  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithCsrf("/api/users/me/");
      const data = await response.json();
      if (response.ok) {
        setAccount(data);
      } else {
        setError(data.error || "Failed to load account details");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching current user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError("");
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
        setAccount(data.user);
        // Update auth context with new profile picture
        if (data.user?.profile_picture) {
          updateProfilePicture(data.user.profile_picture);
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

  const handleClose = () => {
    setIsEditingPicture(false);
    setNewImage(null);
    setImagePreview(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const displayImage = imagePreview || account?.profile_picture;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-account-title" className="text-xl font-semibold">
              My Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your account details
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

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500">Loading account details...</p>
            </div>
          ) : error && !account ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCurrentUser}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : account ? (
            <>
              {/* Profile Picture Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Profile Picture
                  </h3>
                  {!isEditingPicture ? (
                    <button
                      onClick={() => setIsEditingPicture(true)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : null}
                </div>

                {isEditingPicture ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600"
                            : "bg-gray-100 border-gray-300"
                        } border-2`}
                      >
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>

                      {/* Upload Area */}
                      <div className="flex-1">
                        <label
                          className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                            resolvedTheme === "dark"
                              ? "border-gray-600 bg-gray-800 hover:bg-gray-700"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {displayImage ? "Change photo" : "Upload photo"}
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WebP up to 5MB
                            </p>
                          </div>
                        </label>

                        {displayImage && (
                          <button
                            type="button"
                            onClick={handleImageRemove}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfilePicture}
                        disabled={isSaving || !newImage}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          resolvedTheme === "dark"
                            ? "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500"
                            : "bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500"
                        } disabled:cursor-not-allowed`}
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          resolvedTheme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden ${
                        resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      {account.profile_picture ? (
                        <img
                          src={account.profile_picture}
                          alt={`${account.full_name}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <User
                        className={`w-16 h-16 ${
                          resolvedTheme === "dark"
                            ? "text-gray-500"
                            : "text-gray-400"
                        } ${account.profile_picture ? "hidden" : ""}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={account.username || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={account.email || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={account.full_name || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={account.position || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Account Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Points
                    </label>
                    <input
                      type="text"
                      value={account.points?.toLocaleString() ?? "0"}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <input
                      type="text"
                      value={`${account.is_activated ? "Active" : "Inactive"}${
                        account.is_banned ? " • Banned" : ""
                      }`}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="p-8 flex justify-end">
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
