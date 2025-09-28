export interface TimeSlot {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
}

export interface DayTimeSlots {
  day: string; // Day of week (e.g., "monday", "tuesday", etc.)
  slots: TimeSlot[]; // Up to 3 time slots per day
}

export interface Table {
  id: string;
  section_id: string;
  name: string;
  status: number;
  seats: number;
  parent_id: string | null;
  revenue_center_id: string | null;
  meta: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  accepts_reservations: boolean;
}

export interface Section {
  id: string;
  branch_id: string;
  name: string;
  name_localized: string | null;
  meta: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  floor_id: string | null;
  revenue_center_id: string | null;
  tables: Table[];
}

export interface Branch {
  id: string;
  name: string;
  name_localized: string | null;
  reference: string | null;
  type: number;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  opening_from: string;
  opening_to: string;
  inventory_end_of_day_time: string;
  receipt_header: string | null;
  receipt_footer: string | null;
  settings: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  receives_online_orders: boolean;
  accepts_reservations: boolean;
  reservation_duration: number;
  reservation_times: ReservationTimesAPI | any;
  available_time_slots?: DayTimeSlots[];
  address: string | null;
  sections: Section[];
}

export interface BranchSummary {
  id: string;
  name: string;
  reference: string | null;
  reservation_tables_count: number;
  reservation_duration: number;
}

export interface ReservationTimesAPI {
  [day: string]: string[][]; // Each day has an array of [start, end] time pairs
}

export interface UpdateBranchReservationRequest {
  accepts_reservations?: boolean;
  reservation_duration?: number;
  reservation_times?: ReservationTimesAPI;
  available_time_slots?: DayTimeSlots[];
}
