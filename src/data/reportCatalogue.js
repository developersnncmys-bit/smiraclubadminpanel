import {
  Trophy,
  FileText,
  TrendingUp,
  Filter,
  Target,
  UserPlus,
  PieChart,
  Tags,
  Activity,
  Clock,
  PlaneTakeoff,
  ReceiptIndianRupee,
  Wallet,
} from 'lucide-react';

/**
 * Reports the desk can pin onto the dashboard, grouped the way the client's
 * CRM groups them. Each entry becomes a card in the picker and a tab in the
 * reports panel.
 */
export const reportCatalogue = [
  {
    section: 'Sales & performance',
    reports: [
      {
        name: 'Consultant leaderboard',
        icon: Trophy,
        bar: 'bg-sky-500',
        tile: 'bg-sky-50 text-sky-600',
        blurb: 'Top performers by bookings and revenue',
      },
      {
        name: 'Quotation logs',
        icon: FileText,
        bar: 'bg-sky-500',
        tile: 'bg-sky-50 text-sky-600',
        blurb: 'Every proposal sent, and what happened to it',
      },
      {
        name: 'Consultant performance',
        icon: TrendingUp,
        bar: 'bg-emerald-500',
        tile: 'bg-emerald-50 text-emerald-600',
        blurb: 'Individual desk metrics side by side',
      },
      {
        name: 'Sales funnel analysis',
        icon: Filter,
        bar: 'bg-rose-500',
        tile: 'bg-rose-50 text-rose-600',
        blurb: 'Conversion rates through the pipeline',
      },
      {
        name: 'Sales target tracking',
        icon: Target,
        bar: 'bg-lime-500',
        tile: 'bg-lime-50 text-lime-600',
        blurb: 'Goal achievement and target progress',
      },
    ],
  },
  {
    section: 'Enquiries & pipeline',
    reports: [
      {
        name: 'Enquiry assignment',
        icon: UserPlus,
        bar: 'bg-amber-500',
        tile: 'bg-amber-50 text-amber-600',
        blurb: 'How enquiries are spread across the desk',
      },
      {
        name: 'Enquiry source analysis',
        icon: PieChart,
        bar: 'bg-cyan-500',
        tile: 'bg-cyan-50 text-cyan-600',
        blurb: 'Which channels actually bring business',
      },
      {
        name: 'Enquiries by label',
        icon: Tags,
        bar: 'bg-violet-500',
        tile: 'bg-violet-50 text-violet-600',
        blurb: 'Honeymoon, family and luxury mix',
      },
    ],
  },
  {
    section: 'Operations',
    reports: [
      {
        name: 'Activity summary',
        icon: Activity,
        bar: 'bg-violet-500',
        tile: 'bg-violet-50 text-violet-600',
        blurb: 'Comprehensive team activity overview',
      },
      {
        name: 'Task status report',
        icon: Clock,
        bar: 'bg-orange-500',
        tile: 'bg-orange-50 text-orange-600',
        blurb: 'Completion rates and pending items',
      },
      {
        name: 'Departure readiness',
        icon: PlaneTakeoff,
        bar: 'bg-ink-800',
        tile: 'bg-slate-100 text-slate-600',
        blurb: 'Documents and balances before travel',
      },
    ],
  },
  {
    section: 'Business intelligence',
    reports: [
      {
        name: 'Invoice status report',
        icon: ReceiptIndianRupee,
        bar: 'bg-rose-500',
        tile: 'bg-rose-50 text-rose-600',
        blurb: 'Billing and collection tracking',
      },
      {
        name: 'Payment ageing',
        icon: Wallet,
        bar: 'bg-emerald-500',
        tile: 'bg-emerald-50 text-emerald-600',
        blurb: 'How long money stays with customers',
      },
      {
        name: 'Trends & analytics',
        icon: TrendingUp,
        bar: 'bg-blue-500',
        tile: 'bg-blue-50 text-blue-600',
        blurb: 'Visual trends across enquiries, calls, activity and sales',
      },
    ],
  },
];

export const allReports = reportCatalogue.flatMap((s) => s.reports);
