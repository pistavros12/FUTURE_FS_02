// Tiny data layer used by the dashboard / lead pages. Keeps the supabase
// calls in one spot so swapping out the backend later is painless.
import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  message: string | null;
  status: LeadStatus;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  author_email: string | null;
  text: string;
  created_at: string;
}

export const DEFAULT_SOURCES = [
  "Website Contact Form",
  "Referral",
  "Social Media",
  "Cold Outreach",
  "Event",
  "Other",
];

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Lead | null;
}

export async function listNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadNote[];
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const patch: Record<string, unknown> = { status };
  // Bump "last_contacted" when the admin records a touch.
  if (status === "contacted" || status === "converted") {
    patch.last_contacted_at = new Date().toISOString();
  }
  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addNote(leadId: string, text: string) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_id: user.id,
    author_email: user.email ?? null,
    text,
  });
  if (error) throw error;
}

export async function createLead(input: {
  name: string; email: string; phone?: string | null; source: string; message?: string | null;
}) {
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, status: "new" })
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

// Visual tokens for the four pipeline states. Centralised so the badge
// never goes out of sync between the list and the detail page.
export const STATUS_META: Record<LeadStatus, { label: string; dot: string; bg: string; text: string }> = {
  new:       { label: "New",       dot: "bg-[var(--status-new)]",       bg: "bg-[var(--status-new)]/10",       text: "text-[var(--status-new)]" },
  contacted: { label: "Contacted", dot: "bg-[var(--status-contacted)]", bg: "bg-[var(--status-contacted)]/15", text: "text-[oklch(0.42_0.12_70)]" },
  converted: { label: "Converted", dot: "bg-[var(--status-converted)]", bg: "bg-[var(--status-converted)]/15", text: "text-[var(--status-converted)]" },
  lost:      { label: "Lost",      dot: "bg-[var(--status-lost)]",      bg: "bg-[var(--status-lost)]/15",      text: "text-[var(--status-lost)]" },
};
