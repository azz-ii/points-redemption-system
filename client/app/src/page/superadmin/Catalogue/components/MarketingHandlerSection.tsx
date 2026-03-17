import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MarketingUser {
  id: number;
  username: string;
  full_name: string;
}

interface MarketingHandlerSectionProps {
  productId: number;
  productName: string;
  currentMktgAdminId: number | null;
  currentMktgAdminUsername: string | null;
  onAssignmentChange: () => void;
}

export function MarketingHandlerSection({
  productId,
  productName,
  currentMktgAdminId,
  currentMktgAdminUsername,
  onAssignmentChange,
}: MarketingHandlerSectionProps) {
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentMktgAdminId?.toString() ?? ""
  );
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/users/?position=Handler,Admin&page_size=1000`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setMarketingUsers(data.results || []);
        }
      } catch (err) {
        console.error("Error fetching marketing users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedUserId(currentMktgAdminId?.toString() ?? "");
  }, [currentMktgAdminId]);

  const executeAssignment = async (userId: string) => {
    try {
      setSaving(true);
      const response = await fetchWithCsrf(
        `${API_URL}/catalogue/bulk-assign-handler/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_ids: [productId],
            mktg_admin_id: userId ? parseInt(userId) : null,
          }),
        }
      );

      if (response.ok) {
        setSelectedUserId(userId);
        const userName = userId
          ? marketingUsers.find((u) => u.id === parseInt(userId))?.full_name || "user"
          : "none";
        toast.success(
          userId
            ? `${productName} assigned to ${userName}`
            : `${productName} unassigned`
        );
        onAssignmentChange();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update assignment");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (newValue: string) => {
    // If product is currently assigned to someone else and we're assigning to a new user
    if (
      currentMktgAdminId &&
      newValue &&
      newValue !== currentMktgAdminId.toString()
    ) {
      setPendingUserId(newValue);
      return;
    }
    executeAssignment(newValue);
  };

  const confirmReassignment = () => {
    if (pendingUserId !== null) {
      executeAssignment(pendingUserId);
      setPendingUserId(null);
    }
  };

  const pendingUserName = pendingUserId
    ? marketingUsers.find((u) => u.id === parseInt(pendingUserId))?.full_name ||
      "selected user"
    : "";

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          Marketing Handler
        </label>
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedUserId}
              onChange={(e) => handleChange(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base disabled:opacity-50"
            >
              <option value="">No handler assigned</option>
              {marketingUsers.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>
            {saving && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingUserId !== null}
        onOpenChange={(open) => !open && setPendingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-foreground">
                    {productName}
                  </span>{" "}
                  is currently assigned to{" "}
                  <span className="font-medium text-foreground">
                    {currentMktgAdminUsername}
                  </span>
                  . Assigning it to{" "}
                  <span className="font-medium text-foreground">
                    {pendingUserName}
                  </span>{" "}
                  will remove it from the current owner.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border bg-card hover:bg-accent text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReassignment}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Reassignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
