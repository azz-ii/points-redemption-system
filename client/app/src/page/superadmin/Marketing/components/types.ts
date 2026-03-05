export interface LegendAssignment {
  legend: string;
  item_count: number;
}

export interface MarketingUser {
  id: number;
  username?: string | null;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
  assigned_legends: LegendAssignment[];
  assigned_products?: { id: number; item_code: string; item_name: string; legend: string }[];
}
