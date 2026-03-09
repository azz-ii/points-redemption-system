import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useTeamDetail } from "@/hooks/queries/useTeamDetail";
import type { Team } from "@/page/superadmin/Teams/modals/types";

interface TeamMembersRowProps {
  team: Team;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TeamMembersRow({ team, isExpanded, onToggle }: TeamMembersRowProps) {
  const { data: teamDetail, isLoading: loading } = useTeamDetail(team.id, isExpanded);
  const members = teamDetail?.members ?? [];

  return (
    <>
      {/* Team row */}
      <tr
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-sm">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </td>
        <td className="px-4 py-3 text-sm font-medium">{team.name}</td>
        <td className="px-4 py-3 text-sm">
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
            {team.member_count ?? 0}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {new Date(team.created_at).toLocaleDateString()}
        </td>
      </tr>

      {/* Expanded members sub-row */}
      {isExpanded && (
        <tr>
          <td colSpan={4} className="px-0 py-0">
            <div className="bg-muted/30 px-8 py-4 border-t border-border">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No members in this team
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left pb-2 font-medium">Full Name</th>
                      <th className="text-left pb-2 font-medium">Email</th>
                      <th className="text-left pb-2 font-medium">Position</th>
                      <th className="text-left pb-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="py-2 text-sm">{member.user_details.full_name}</td>
                        <td className="py-2 text-sm text-muted-foreground">{member.user_details.email}</td>
                        <td className="py-2 text-sm text-muted-foreground">{member.user_details.position}</td>
                        <td className="py-2 text-sm text-muted-foreground">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
