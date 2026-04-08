export type WindowStrategy =
  | "natural_day"
  | "custom_day_boundary"
  | "rolling_hours"
  | "since_last_success";

export interface Schedule {
  id: string;
  timezone: string;
  triggerTime: string;
  windowStrategy: WindowStrategy;
  enabled: boolean;
}
