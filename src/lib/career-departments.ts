import { JOB_TYPES } from "@/db/schema";

// Shared between the Career Job edit form (a dropdown), the quick-edit row, and the admin list's filters.
export const CAREER_DEPARTMENTS = ["NOVA Marketing", "Lokajapanesefoodsbeverage", "SEATS Inc", "SEATS Farm", "PISA Food Retail", "SELECT STORE SORA"];

// The career site also posts freelance work, which the main-site list doesn't have
export const CAREER_JOB_TYPES: readonly string[] = [...JOB_TYPES, "Freelance"];
