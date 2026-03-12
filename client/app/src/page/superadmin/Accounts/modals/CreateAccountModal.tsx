import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import type { ModalBaseProps, TeamOption } from "./types";
import { POSITION_OPTIONS } from "./types";

interface NewAccountData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  can_self_request: boolean;
}

interface CreateAccountModalProps extends ModalBaseProps {
  newAccount: NewAccountData;
  setNewAccount: Dispatch<SetStateAction<NewAccountData>>;
  teams: TeamOption[];
  selectedTeamId: number | null;
  setSelectedTeamId: Dispatch<SetStateAction<number | null>>;
  selectedMemberTeamId: number | null;
  setSelectedMemberTeamId: Dispatch<SetStateAction<number | null>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  newAccount,
  setNewAccount,
  teams,
  selectedTeamId,
  setSelectedTeamId,
  selectedMemberTeamId,
  setSelectedMemberTeamId,
  loading,
  error,
  setError,
  onSubmit,
}: CreateAccountModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setError("");
    setSelectedTeamId(null);
    setSelectedMemberTeamId(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-account-title" className="text-xl font-semibold">
              Create New Account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Please fill in the details to create a new account
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  value={newAccount.username}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="Enter username"
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="Enter password"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={newAccount.full_name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="Enter full name"
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  placeholder="Enter email address"
                  aria-required="true"
                />
                {newAccount.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAccount.email) && (
                  <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Points Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Role & Points
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="position"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Position *
                </label>
                <select
                  id="position"
                  value={newAccount.position}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, position: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  aria-required="true"
                >
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {newAccount.position === "Sales Agent" && (
                <>
                  <div>
                    <label
                      htmlFor="points"
                      className="text-xs text-muted-foreground mb-2 block"
                    >
                      Points *
                    </label>
                    <input
                      id="points"
                      type="number"
                      min="0"
                      value={newAccount.points}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                      placeholder="Enter points"
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="team"
                      className="text-xs text-muted-foreground mb-2 block"
                    >
                      Team <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <select
                      id="team"
                      value={selectedTeamId ?? ""}
                      onChange={(e) =>
                        setSelectedTeamId(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="">No team assigned</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {newAccount.position === "Approver" && (
                <div>
                  <label
                    htmlFor="approver-points"
                    className="text-xs text-muted-foreground mb-2 block"
                  >
                    Points *
                  </label>
                  <input
                    id="approver-points"
                    type="number"
                    min="0"
                    value={newAccount.points}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                    placeholder="Enter points"
                    aria-required="true"
                  />
                </div>
              )}

              {newAccount.position === "Approver" && (
                <div>
                  <label
                    htmlFor="approver-team"
                    className="text-xs text-muted-foreground mb-2 block"
                  >
                    Manages Team <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <select
                    id="approver-team"
                    value={selectedTeamId ?? ""}
                    onChange={(e) =>
                      setSelectedTeamId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">No team assigned</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newAccount.position === "Approver" && (
                <div>
                  <label
                    htmlFor="approver-member-team"
                    className="text-xs text-muted-foreground mb-2 block"
                  >
                    Member of Team <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <select
                    id="approver-member-team"
                    value={selectedMemberTeamId ?? ""}
                    onChange={(e) =>
                      setSelectedMemberTeamId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-4 py-3 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">No team assigned</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The team whose approver will review this user's self-requests
                  </p>
                </div>
              )}

              {newAccount.position === "Approver" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAccount.can_self_request}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, can_self_request: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border"
                  />
                  <div>
                    <span className="text-sm text-foreground">Allow self-requests</span>
                    <p className="text-xs text-muted-foreground">
                      Enable this approver to create redemption requests for themselves
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
