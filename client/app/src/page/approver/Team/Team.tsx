import { useState, useEffect, useRef } from "react";
import { Users, ChevronDown, ChevronRight, RefreshCw, UserCircle } from "lucide-react";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { useTeams } from "@/hooks/queries/useTeams";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamMembersRow } from "./components";
import { toast } from "sonner";

function ApproverTeam() {
  const { data: userProfile, isLoading: userLoading } = useCurrentUser({ refetchInterval: 30_000 });
  const { data: teams = [], isLoading: teamsLoading, isFetching: refreshing, refetch } = useTeams(30_000);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  // Track previous values for change detection — undefined means initial load (skip toast)
  const prevTeamIdRef = useRef<number | null | undefined>(undefined);
  const prevManagedCountRef = useRef<number | undefined>(undefined);

  // Toast on team membership change
  useEffect(() => {
    if (userLoading || userProfile === undefined) return;
    const currentTeamId = userProfile?.team_id ?? null;

    if (prevTeamIdRef.current === undefined) {
      prevTeamIdRef.current = currentTeamId;
      return;
    }

    if (currentTeamId !== prevTeamIdRef.current) {
      if (prevTeamIdRef.current === null && currentTeamId !== null) {
        toast.info(`You have been added to team "${userProfile?.team_name}"`, { duration: 4000 });
      } else if (prevTeamIdRef.current !== null && currentTeamId === null) {
        toast.info("You have been removed from your team", { duration: 4000 });
      } else {
        toast.info(`Your team membership changed to "${userProfile?.team_name}"`, { duration: 4000 });
      }
      prevTeamIdRef.current = currentTeamId;
    }
  }, [userProfile, userLoading]);

  // Toast on managed teams count change
  useEffect(() => {
    if (teamsLoading) return;

    if (prevManagedCountRef.current === undefined) {
      prevManagedCountRef.current = teams.length;
      return;
    }

    if (teams.length !== prevManagedCountRef.current) {
      if (teams.length > prevManagedCountRef.current) {
        toast.info("A new team has been assigned to you", { duration: 4000 });
      } else {
        toast.info("A managed team has been removed", { duration: 4000 });
      }
      prevManagedCountRef.current = teams.length;
    }
  }, [teams, teamsLoading]);

  const toggleExpand = (teamId: number) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your team membership and managed teams
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Section A: My Team Membership */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="h-5 w-5" />
            My Team Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
          ) : userProfile?.team_id ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{userProfile.team_name}</p>
                <p className="text-xs text-muted-foreground">You are a member of this team</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned to any team</p>
          )}
        </CardContent>
      </Card>

      {/* Section B: Managed Teams */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Managed Teams
          {!teamsLoading && (
            <span className="text-xs font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {teams.length}
            </span>
          )}
        </h2>

        {teamsLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-sm text-muted-foreground animate-pulse">
                Loading teams...
              </div>
            </CardContent>
          </Card>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-sm text-muted-foreground">
                You are not managing any teams
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Team Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Members</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teams.map((team) => {
                  const isExpanded = expandedTeamId === team.id;
                  return (
                    <TeamMembersRow
                      key={team.id}
                      team={team}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(team.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApproverTeam;
