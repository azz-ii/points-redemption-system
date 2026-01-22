export interface LegendAssignment {
  legend: string;
  item_count: number;
}

export interface MarketingUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
  assigned_legends: LegendAssignment[];
}
