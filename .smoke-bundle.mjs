// .smoke-entry.jsx
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

// src/store/AppStore.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// src/data/mockData.js
var inr = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
var shortInr = (n) => {
  if (n >= 1e7) return "\u20B9" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "\u20B9" + (n / 1e5).toFixed(2) + " L";
  if (n >= 1e3) return "\u20B9" + (n / 1e3).toFixed(1) + "K";
  return inr(n);
};
var formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
var days = [
  "29 Jul",
  "30 Jul",
  "31 Jul",
  "01 Aug",
  "02 Aug",
  "03 Aug",
  "04 Aug"
];
var kpis = {
  enquiries: { value: 168, delta: 12.4, series: [22, 18, 26, 31, 24, 20, 27] },
  bookings: { value: 54, delta: 8.1, series: [6, 5, 9, 11, 7, 8, 8] },
  travellers: { value: 212, delta: 15.6, series: [24, 19, 33, 42, 28, 30, 36] },
  revenue: { value: 4265e3, delta: -3.2, series: [520, 480, 720, 910, 610, 540, 485] }
};
var trends = {
  enquiries: {
    stats: [
      { label: "Created", value: 168, tone: "brand" },
      { label: "Assigned", value: 151, tone: "ocean" },
      { label: "Untouched", value: 17, tone: "gold" },
      { label: "No task", value: 23, tone: "coral" },
      { label: "Stale", value: 9, tone: "grape" }
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [22, 18, 26, 31, 24, 20, 27][i],
      converted: [5, 4, 8, 11, 7, 6, 9][i]
    })),
    keys: [
      { key: "value", name: "Enquiries", color: "#14a58c" },
      { key: "converted", name: "Converted", color: "#0ea5e9" }
    ]
  },
  calls: {
    stats: [
      { label: "Outgoing", value: 412, tone: "brand" },
      { label: "Incoming", value: 286, tone: "ocean" },
      { label: "Missed", value: 74, tone: "coral" },
      { label: "Answered", value: 624, tone: "brand" },
      { label: "Answer rate", value: "82%", tone: "grape" },
      { label: "Avg. talk time", value: "3m 12s", tone: "gold" }
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [88, 64, 95, 112, 79, 71, 89][i],
      converted: [12, 9, 14, 19, 11, 10, 13][i]
    })),
    keys: [
      { key: "value", name: "Calls", color: "#0ea5e9" },
      { key: "converted", name: "Follow-ups", color: "#7c5cff" }
    ]
  },
  activity: {
    stats: [
      { label: "Status updated", value: 1284, tone: "brand" },
      { label: "Itinerary sent", value: 342, tone: "ocean" },
      { label: "WhatsApp sent", value: 918, tone: "brand" },
      { label: "Quotes shared", value: 176, tone: "grape" },
      { label: "Docs collected", value: 94, tone: "gold" },
      { label: "Visa filed", value: 38, tone: "coral" }
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [420, 365, 512, 604, 448, 396, 470][i],
      converted: [120, 98, 141, 176, 132, 110, 138][i]
    })),
    keys: [
      { key: "value", name: "Activities", color: "#7c5cff" },
      { key: "converted", name: "Customer touches", color: "#14a58c" }
    ]
  },
  sales: {
    stats: [
      { label: "Booked value", value: "\u20B942.65 L", tone: "brand" },
      { label: "Collected", value: "\u20B931.20 L", tone: "ocean" },
      { label: "Outstanding", value: "\u20B911.45 L", tone: "coral" },
      { label: "Refunds", value: "\u20B91.10 L", tone: "gold" },
      { label: "Avg. margin", value: "18.4%", tone: "grape" }
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [520, 480, 720, 910, 610, 540, 485][i],
      converted: [380, 350, 540, 690, 470, 410, 360][i]
    })),
    keys: [
      { key: "value", name: "Booked (\u20B9K)", color: "#f9714a" },
      { key: "converted", name: "Collected (\u20B9K)", color: "#14a58c" }
    ]
  }
};
var enquiryStatuses = ["New", "Contacted", "Interested", "Quoted", "Booked", "Lost"];
var statusTone = {
  New: "sky",
  Contacted: "violet",
  Interested: "amber",
  Quoted: "teal",
  Booked: "green",
  Lost: "rose"
};
var enquiries = [
  { id: "ENQ-2041", name: "Siddhesh Rane", phone: "+91 98201 44521", email: "siddhesh.r@gmail.com", destination: "Bali", pax: 2, travelDate: "18 Sep 2026", budget: 185e3, status: "Interested", source: "Instagram", owner: "Ritik", label: "Honeymoon", created: "04 Aug 2026" },
  { id: "ENQ-2040", name: "Jayashree Patil", phone: "+91 90045 88120", email: "jaya.patil@outlook.com", destination: "Kerala", pax: 4, travelDate: "02 Oct 2026", budget: 96e3, status: "New", source: "Website", owner: "Unassigned", label: "Family", created: "04 Aug 2026" },
  { id: "ENQ-2039", name: "Ridhima Param", phone: "+91 98670 21188", email: "ridhima.p@gmail.com", destination: "Maldives", pax: 2, travelDate: "25 Dec 2026", budget: 34e4, status: "Quoted", source: "Referral", owner: "Sneha", label: "Luxury", created: "03 Aug 2026" },
  { id: "ENQ-2038", name: "Aadarsh Bhatia", phone: "+91 99303 76540", email: "aadarsh938@gmail.com", destination: "Dubai", pax: 3, travelDate: "11 Sep 2026", budget: 148e3, status: "Contacted", source: "Google Ads", owner: "Ritik", label: "Shopping", created: "03 Aug 2026" },
  { id: "ENQ-2037", name: "Divya Sharma", phone: "+91 90821 33012", email: "divya.sharma@gmail.com", destination: "Switzerland", pax: 2, travelDate: "05 Nov 2026", budget: 42e4, status: "Interested", source: "Walk-in", owner: "Kabir", label: "Anniversary", created: "02 Aug 2026" },
  { id: "ENQ-2036", name: "Ajay Panchmukh", phone: "+91 88790 12234", email: "ajay.p@yahoo.com", destination: "Thailand", pax: 6, travelDate: "20 Aug 2026", budget: 21e4, status: "Booked", source: "WhatsApp", owner: "Sneha", label: "Group", created: "02 Aug 2026" },
  { id: "ENQ-2035", name: "Suhas Bansode", phone: "+91 97654 44001", email: "suhas.b@gmail.com", destination: "Ladakh", pax: 5, travelDate: "15 Sep 2026", budget: 165e3, status: "Interested", source: "Instagram", owner: "Kabir", label: "Adventure", created: "01 Aug 2026" },
  { id: "ENQ-2034", name: "Sitaram Parab", phone: "+91 90210 87766", email: "sitaram.parab@gmail.com", destination: "Singapore", pax: 4, travelDate: "28 Sep 2026", budget: 232e3, status: "Quoted", source: "Website", owner: "Ritik", label: "Family", created: "01 Aug 2026" },
  { id: "ENQ-2033", name: "Mahendra Mandhare", phone: "+91 98922 55410", email: "mahendra.m@gmail.com", destination: "Vietnam", pax: 2, travelDate: "09 Oct 2026", budget: 118e3, status: "Contacted", source: "Referral", owner: "Sneha", label: "Couple", created: "31 Jul 2026" },
  { id: "ENQ-2032", name: "Sulekha Chavan", phone: "+91 91234 09876", email: "sulekha.c@gmail.com", destination: "Andaman", pax: 3, travelDate: "22 Aug 2026", budget: 142e3, status: "Lost", source: "Google Ads", owner: "Kabir", label: "Beach", created: "31 Jul 2026" },
  { id: "ENQ-2031", name: "Neha Kulkarni", phone: "+91 99872 31145", email: "neha.k@gmail.com", destination: "Europe", pax: 2, travelDate: "14 Dec 2026", budget: 56e4, status: "Interested", source: "Instagram", owner: "Sneha", label: "Luxury", created: "30 Jul 2026" },
  { id: "ENQ-2030", name: "Rohan Desai", phone: "+91 98111 44329", email: "rohan.desai@gmail.com", destination: "Bhutan", pax: 4, travelDate: "03 Nov 2026", budget: 178e3, status: "New", source: "Website", owner: "Unassigned", label: "Family", created: "30 Jul 2026" }
];
var sources = [
  { name: "Instagram", value: 46, color: "#f9714a" },
  { name: "Website", value: 38, color: "#14a58c" },
  { name: "Google Ads", value: 31, color: "#0ea5e9" },
  { name: "Referral", value: 27, color: "#7c5cff" },
  { name: "Walk-in", value: 16, color: "#f5b73c" },
  { name: "WhatsApp", value: 10, color: "#6dd9c3" }
];
var packages = [
  { id: "PKG-01", name: "Bali Honeymoon Escape", destination: "Bali, Indonesia", startDate: "2026-09-02", days: 7, nights: 6, price: 92500, type: "Honeymoon", rating: 4.8, sold: 42, seats: 8, gradient: "from-brand-500 to-ocean" },
  { id: "PKG-02", name: "Maldives Overwater Luxury", destination: "Mal\xE9, Maldives", startDate: "2026-09-15", days: 6, nights: 5, price: 168e3, type: "Luxury", rating: 4.9, sold: 24, seats: 4, gradient: "from-ocean to-grape" },
  { id: "PKG-03", name: "Kerala Backwaters Family", destination: "Kochi \xB7 Alleppey", startDate: "2026-08-24", days: 6, nights: 5, price: 34500, type: "Family", rating: 4.6, sold: 78, seats: 22, gradient: "from-brand-600 to-brand-300" },
  { id: "PKG-04", name: "Dubai City & Desert", destination: "Dubai, UAE", startDate: "2026-09-11", days: 5, nights: 4, price: 58900, type: "City break", rating: 4.5, sold: 61, seats: 15, gradient: "from-gold to-coral" },
  { id: "PKG-05", name: "Swiss Alps Grand Tour", destination: "Zurich \xB7 Interlaken", startDate: "2026-10-05", days: 9, nights: 8, price: 212e3, type: "Luxury", rating: 4.9, sold: 18, seats: 6, gradient: "from-grape to-ocean" },
  { id: "PKG-06", name: "Thailand Island Hopper", destination: "Phuket \xB7 Krabi", startDate: "2026-08-20", days: 7, nights: 6, price: 47800, type: "Group", rating: 4.4, sold: 95, seats: 30, gradient: "from-coral to-gold" },
  { id: "PKG-07", name: "Ladakh Road Expedition", destination: "Leh \xB7 Nubra \xB7 Pangong", startDate: "2026-09-26", days: 8, nights: 7, price: 39900, type: "Adventure", rating: 4.7, sold: 53, seats: 12, gradient: "from-brand-700 to-brand-400" },
  { id: "PKG-08", name: "Singapore + Malaysia Combo", destination: "Singapore \xB7 KL", startDate: "2026-10-18", days: 7, nights: 6, price: 76400, type: "Family", rating: 4.5, sold: 37, seats: 18, gradient: "from-ocean to-brand-400" }
];
var topDestinations = [
  { name: "Bali", bookings: 42, revenue: 3885e3 },
  { name: "Thailand", bookings: 38, revenue: 1816400 },
  { name: "Dubai", bookings: 31, revenue: 1825900 },
  { name: "Kerala", bookings: 28, revenue: 966e3 },
  { name: "Maldives", bookings: 19, revenue: 3192e3 },
  { name: "Ladakh", bookings: 16, revenue: 638400 }
];
var bookings = [
  { id: "BKG-8821", customer: "Ajay Panchmukh", pkg: "Thailand Island Hopper", destination: "Phuket \xB7 Krabi", departure: "20 Aug 2026", nights: 6, pax: 6, amount: 286800, paid: 286800, status: "Confirmed", owner: "Sneha" },
  { id: "BKG-8820", customer: "Priya Nair", pkg: "Kerala Backwaters Family", destination: "Kochi \xB7 Alleppey", departure: "24 Aug 2026", nights: 5, pax: 4, amount: 138e3, paid: 7e4, status: "Part paid", owner: "Ritik" },
  { id: "BKG-8819", customer: "Vikram Shetty", pkg: "Bali Honeymoon Escape", destination: "Bali, Indonesia", departure: "02 Sep 2026", nights: 6, pax: 2, amount: 185e3, paid: 185e3, status: "Confirmed", owner: "Kabir" },
  { id: "BKG-8818", customer: "Farhan Qureshi", pkg: "Dubai City & Desert", destination: "Dubai, UAE", departure: "11 Sep 2026", nights: 4, pax: 3, amount: 176700, paid: 5e4, status: "Part paid", owner: "Ritik" },
  { id: "BKG-8817", customer: "Meera Iyer", pkg: "Maldives Overwater Luxury", destination: "Mal\xE9, Maldives", departure: "15 Sep 2026", nights: 5, pax: 2, amount: 336e3, paid: 336e3, status: "Confirmed", owner: "Sneha" },
  { id: "BKG-8816", customer: "Suhas Bansode", pkg: "Ladakh Road Expedition", destination: "Leh \xB7 Pangong", departure: "15 Sep 2026", nights: 7, pax: 5, amount: 199500, paid: 1e5, status: "Part paid", owner: "Kabir" },
  { id: "BKG-8815", customer: "Sitaram Parab", pkg: "Singapore + Malaysia Combo", destination: "Singapore \xB7 KL", departure: "28 Sep 2026", nights: 6, pax: 4, amount: 305600, paid: 0, status: "Pending", owner: "Ritik" },
  { id: "BKG-8814", customer: "Anita Deshmukh", pkg: "Bali Honeymoon Escape", destination: "Bali, Indonesia", departure: "06 Oct 2026", nights: 6, pax: 2, amount: 185e3, paid: 9e4, status: "Part paid", owner: "Sneha" },
  { id: "BKG-8813", customer: "Rahul Menon", pkg: "Swiss Alps Grand Tour", destination: "Zurich \xB7 Interlaken", departure: "05 Nov 2026", nights: 8, pax: 2, amount: 424e3, paid: 15e4, status: "Part paid", owner: "Kabir" },
  { id: "BKG-8812", customer: "Tanvi Joshi", pkg: "Thailand Island Hopper", destination: "Phuket \xB7 Krabi", departure: "18 Jul 2026", nights: 6, pax: 3, amount: 143400, paid: 143400, status: "Completed", owner: "Sneha" },
  { id: "BKG-8811", customer: "Imran Shaikh", pkg: "Dubai City & Desert", destination: "Dubai, UAE", departure: "09 Jul 2026", nights: 4, pax: 5, amount: 294500, paid: 294500, status: "Completed", owner: "Ritik" },
  { id: "BKG-8810", customer: "Kiran Rao", pkg: "Kerala Backwaters Family", destination: "Kochi \xB7 Alleppey", departure: "01 Jul 2026", nights: 5, pax: 2, amount: 69e3, paid: 2e4, status: "Cancelled", owner: "Kabir" }
];
var bookingStatusTone = {
  Confirmed: "green",
  "Part paid": "amber",
  Pending: "sky",
  Completed: "violet",
  Cancelled: "rose"
};
var customers = [
  { id: "CUS-512", name: "Ananya Deshmukh", phone: "+91 98330 21145", email: "ananya.d@gmail.com", city: "Pune", trips: 0, spend: 0, tier: "Silver", last: "\u2014", dob: "1994-06-19", special: "2022-03-08", specialLabel: "Anniversary", source: "Website", address: "31 Koregaon Park Annexe, Pune 411001", giftsGiven: [] },
  { id: "CUS-511", name: "Rohan Bhatt", phone: "+91 99201 55420", email: "rohan.bhatt@outlook.com", city: "Mumbai", trips: 1, spend: 96e3, tier: "Silver", last: "12 Jul 2026", dob: "1989-01-24", special: "2017-05-21", specialLabel: "Anniversary", source: "Website", address: "A-1202 Oberoi Splendor, Jogeshwari East, Mumbai 400060", giftsGiven: [{ gift: "Welcome travel kit on joining", date: "05 Aug 2026" }] },
  { id: "CUS-510", name: "Meher Shaikh", phone: "+91 97027 66311", email: "meher.s@gmail.com", city: "Nashik", trips: 1, spend: 78500, tier: "Silver", last: "02 Jun 2026", dob: "1996-10-03", special: "2024-02-11", specialLabel: "Spouse birthday", source: "Website", address: "9 College Road, Nashik 422005", giftsGiven: [{ gift: "Welcome travel kit on joining", date: "04 Aug 2026" }] },
  { id: "CUS-509", name: "Vikas Rane", phone: "+91 98194 30078", email: "vikas.rane@gmail.com", city: "Thane", trips: 2, spend: 214e3, tier: "Gold", last: "28 Jul 2026", dob: "1986-04-12", special: "2013-09-30", specialLabel: "Anniversary", source: "Website", address: "104 Hiranandani Estate, Ghodbunder Road, Thane 400607", giftsGiven: [{ gift: "Welcome travel kit on joining", date: "30 Jul 2026" }, { gift: "Free airport transfer on the first trip", date: "02 Aug 2026" }] },
  { id: "CUS-501", name: "Ajay Panchmukh", phone: "+91 88790 12234", email: "ajay.p@yahoo.com", city: "Pune", trips: 4, spend: 742e3, tier: "Platinum", last: "20 Aug 2026", dob: "1984-03-18", special: "2011-11-27", specialLabel: "Anniversary", source: "Referral", address: "12 Rosewood Society, Baner Road, Pune 411045", giftsGiven: [] },
  { id: "CUS-502", name: "Meera Iyer", phone: "+91 98211 55420", email: "meera.iyer@gmail.com", city: "Mumbai", trips: 3, spend: 688e3, tier: "Platinum", last: "15 Sep 2026", dob: "1990-07-05", special: "2016-02-14", specialLabel: "Anniversary", source: "Instagram", address: "B-704 Seaview Heights, Carter Road, Bandra West, Mumbai 400050", giftsGiven: [] },
  { id: "CUS-503", name: "Vikram Shetty", phone: "+91 99870 11223", email: "vikram.s@gmail.com", city: "Bengaluru", trips: 2, spend: 371e3, tier: "Gold", last: "02 Sep 2026", dob: "1987-12-01", special: "2019-06-09", specialLabel: "Anniversary", source: "Walk-in", address: "48 Brigade Meadows, Kanakapura Road, Bengaluru 560062", giftsGiven: [] },
  { id: "CUS-504", name: "Priya Nair", phone: "+91 90040 88991", email: "priya.nair@gmail.com", city: "Kochi", trips: 3, spend: 298e3, tier: "Gold", last: "24 Aug 2026", dob: "1992-09-23", special: "2021-01-30", specialLabel: "Anniversary", source: "Website", address: "Villa 9, Marine Drive Enclave, Kochi 682031", giftsGiven: [] },
  { id: "CUS-505", name: "Farhan Qureshi", phone: "+91 98333 21100", email: "farhan.q@gmail.com", city: "Hyderabad", trips: 2, spend: 254e3, tier: "Gold", last: "11 Sep 2026", dob: "1985-05-14", special: "2014-08-22", specialLabel: "Anniversary", source: "Google Ads", address: "3-6-140 Himayatnagar, Hyderabad 500029", giftsGiven: [] },
  { id: "CUS-506", name: "Tanvi Joshi", phone: "+91 97655 43210", email: "tanvi.joshi@gmail.com", city: "Nashik", trips: 1, spend: 143400, tier: "Silver", last: "18 Jul 2026", dob: "1995-11-08", special: "2023-04-16", specialLabel: "Spouse birthday", source: "Instagram", address: "22 Gangapur Road, Nashik 422013", giftsGiven: [] },
  { id: "CUS-507", name: "Rahul Menon", phone: "+91 98860 77120", email: "rahul.menon@gmail.com", city: "Chennai", trips: 1, spend: 424e3, tier: "Gold", last: "05 Nov 2026", dob: "1981-02-27", special: "2009-10-11", specialLabel: "Anniversary", source: "Referral", address: "Flat 5C, Adyar Riverside, Chennai 600020", giftsGiven: [] },
  { id: "CUS-508", name: "Anita Deshmukh", phone: "+91 91450 20033", email: "anita.d@gmail.com", city: "Nagpur", trips: 2, spend: 267e3, tier: "Silver", last: "06 Oct 2026", dob: "1993-08-30", special: "2018-12-05", specialLabel: "Child birthday", source: "Walk-in", address: "17 Dharampeth Extension, Nagpur 440010", giftsGiven: [] }
];
var tasks = [
  { id: "TSK-311", title: "Share revised Bali itinerary", customer: "Siddhesh Rane", type: "Send itinerary", due: "04 Aug 2026, 11:45 am", owner: "Ritik", bucket: "today", priority: "High", note: "Client wants a pool villa option and a private candlelight dinner added." },
  { id: "TSK-310", title: "Collect passport copies", customer: "Ajay Panchmukh", type: "Documents", due: "04 Aug 2026, 04:30 pm", owner: "Sneha", bucket: "today", priority: "High", note: "2 of 6 passports still pending. Visa filing deadline is 08 Aug." },
  { id: "TSK-309", title: "Follow-up call for Maldives quote", customer: "Ridhima Param", type: "Call", due: "05 Aug 2026, 10:00 am", owner: "Sneha", bucket: "upcoming", priority: "Medium", note: "Quote sent 03 Aug. Compare with competitor pricing before the call." },
  { id: "TSK-308", title: "Confirm hotel with DMC", customer: "Meera Iyer", type: "Supplier", due: "06 Aug 2026, 12:00 pm", owner: "Kabir", bucket: "upcoming", priority: "High", note: "Awaiting written confirmation for the overwater villa upgrade." },
  { id: "TSK-307", title: "Send balance payment reminder", customer: "Sitaram Parab", type: "Payment", due: "07 Aug 2026, 09:30 am", owner: "Ritik", bucket: "upcoming", priority: "Medium", note: "\u20B93,05,600 fully outstanding, departure in 8 weeks." },
  { id: "TSK-306", title: "Visa appointment slot booking", customer: "Rahul Menon", type: "Visa", due: "02 Aug 2026, 03:00 pm", owner: "Kabir", bucket: "overdue", priority: "High", note: "Schengen slots filling fast \u2014 escalate to the visa desk." },
  { id: "TSK-305", title: "Re-engage lost enquiry", customer: "Sulekha Chavan", type: "Call", due: "01 Aug 2026, 05:00 pm", owner: "Kabir", bucket: "overdue", priority: "Low", note: "Client said budget is tight; offer the 3N Andaman variant instead." },
  { id: "TSK-304", title: "Share group discount sheet", customer: "Suhas Bansode", type: "Send quote", due: "31 Jul 2026, 06:00 pm", owner: "Kabir", bucket: "overdue", priority: "Medium", note: "Group of 5 \u2014 apply the 8% early-bird slab." },
  { id: "TSK-303", title: "Airport transfer confirmation", customer: "Tanvi Joshi", type: "Supplier", due: "17 Jul 2026, 08:00 am", owner: "Sneha", bucket: "done", priority: "Medium", note: "Confirmed with the Phuket transfer partner." },
  { id: "TSK-302", title: "Post-trip feedback call", customer: "Imran Shaikh", type: "Call", due: "14 Jul 2026, 11:00 am", owner: "Ritik", bucket: "done", priority: "Low", note: "Rated 5/5. Asked about a Europe trip next summer." }
];
var quotations = [
  // Auto-generated from website membership signups — inclusions are snapshotted
  // from the plan at the moment the quotation was raised.
  { id: "QUO-1190", customer: "Vikas Rane", pkg: "Gold Voyager membership (Yearly)", pax: 3, amount: 35396, validTill: "04 Aug 2026", status: "Accepted", owner: "Sneha", source: "Membership", planId: "MEM-02", inclusions: ["10% off on every holiday package", "Dedicated travel consultant", "24\xD77 on-trip emergency helpline"] },
  { id: "QUO-1189", customer: "Rohan Bhatt", pkg: "Gold Voyager membership (Yearly)", pax: 2, amount: 23598, validTill: "10 Aug 2026", status: "Sent", owner: "Sneha", source: "Membership", planId: "MEM-02", inclusions: ["10% off on every holiday package", "Dedicated travel consultant", "24\xD77 on-trip emergency helpline"] },
  { id: "QUO-1188", customer: "Meher Shaikh", pkg: "Silver Explorer membership (Yearly)", pax: 1, amount: 5899, validTill: "09 Aug 2026", status: "Viewed", owner: "Ritik", source: "Membership", planId: "MEM-01", inclusions: ["5% off on every holiday package", "Priority enquiry response within 4 hours", "Dedicated WhatsApp support desk"] },
  { id: "QUO-1187", customer: "Ridhima Param", pkg: "Maldives Overwater Luxury", pax: 2, amount: 336e3, validTill: "12 Aug 2026", status: "Sent", owner: "Sneha" },
  { id: "QUO-1186", customer: "Sitaram Parab", pkg: "Singapore + Malaysia Combo", pax: 4, amount: 305600, validTill: "10 Aug 2026", status: "Viewed", owner: "Ritik" },
  { id: "QUO-1185", customer: "Divya Sharma", pkg: "Swiss Alps Grand Tour", pax: 2, amount: 424e3, validTill: "18 Aug 2026", status: "Sent", owner: "Kabir" },
  { id: "QUO-1184", customer: "Neha Kulkarni", pkg: "Europe Highlights 10N", pax: 2, amount: 56e4, validTill: "20 Aug 2026", status: "Draft", owner: "Sneha" },
  { id: "QUO-1183", customer: "Suhas Bansode", pkg: "Ladakh Road Expedition", pax: 5, amount: 199500, validTill: "08 Aug 2026", status: "Accepted", owner: "Kabir" },
  { id: "QUO-1182", customer: "Sulekha Chavan", pkg: "Andaman Beach Break", pax: 3, amount: 142e3, validTill: "02 Aug 2026", status: "Expired", owner: "Kabir" }
];
var quotationTone = {
  Draft: "slate",
  Sent: "sky",
  Viewed: "violet",
  Accepted: "green",
  Expired: "rose"
};
var MEMBERSHIP_GST = 18;
var giftKey = (gift) => String(gift).trim().toLowerCase();
var memberships = [
  {
    id: "MEM-01",
    name: "Silver Explorer",
    tagline: "For first-time travellers testing the waters",
    price: 4999,
    billing: "Yearly",
    discount: 5,
    gradient: "from-slate-600 to-slate-800",
    accent: "slate",
    popular: false,
    published: true,
    members: 24,
    gifts: [
      "Welcome travel kit on joining",
      "Birthday greeting card"
    ],
    features: [
      "5% off on every holiday package",
      "Priority enquiry response within 4 hours",
      "Dedicated WhatsApp support desk",
      "Free travel insurance quotation"
    ]
  },
  {
    id: "MEM-02",
    name: "Gold Voyager",
    tagline: "Our most-picked plan for families who travel twice a year",
    price: 9999,
    billing: "Yearly",
    discount: 10,
    gradient: "from-amber-500 to-orange-600",
    accent: "amber",
    popular: true,
    published: true,
    members: 41,
    gifts: [
      "Welcome travel kit on joining",
      "Free airport transfer on the first trip",
      "Anniversary cake at the hotel",
      "\u20B92,000 gift voucher every year"
    ],
    features: [
      "10% off on every holiday package",
      "Dedicated travel consultant",
      "Free visa documentation assistance",
      "Complimentary airport transfers",
      "24\xD77 on-trip emergency helpline"
    ]
  },
  {
    id: "MEM-03",
    name: "Platinum Elite",
    tagline: "Concierge-level travel for frequent flyers",
    price: 24999,
    billing: "Yearly",
    discount: 15,
    gradient: "from-violet-600 to-indigo-700",
    accent: "violet",
    popular: false,
    published: true,
    members: 12,
    gifts: [
      "Premium luggage set on joining",
      "Free airport transfer on every trip",
      "Anniversary cake and flowers at the hotel",
      "Complimentary one-night stay every year",
      "\u20B95,000 gift voucher every year"
    ],
    features: [
      "15% off on every holiday package",
      "Complimentary airport lounge access",
      "Free hotel upgrades subject to availability",
      "Personal itinerary designer",
      "Zero cancellation fee once a year",
      "Family add-on members at 50%"
    ]
  }
];
var memberSignups = [
  { id: "MSU-04", name: "Ananya Deshmukh", email: "ananya.d@gmail.com", phone: "+91 98330 21145", city: "Pune", planId: "MEM-03", plan: "Platinum Elite", members: 4, source: "Website", received: "04 Aug 2026", status: "New", quote: "" },
  { id: "MSU-03", name: "Rohan Bhatt", email: "rohan.bhatt@outlook.com", phone: "+91 99201 55420", city: "Mumbai", planId: "MEM-02", plan: "Gold Voyager", members: 2, source: "Website", received: "03 Aug 2026", status: "Quoted", quote: "QUO-1189" },
  { id: "MSU-02", name: "Meher Shaikh", email: "meher.s@gmail.com", phone: "+91 97027 66311", city: "Nashik", planId: "MEM-01", plan: "Silver Explorer", members: 1, source: "Website", received: "02 Aug 2026", status: "Quoted", quote: "QUO-1188" },
  { id: "MSU-01", name: "Vikas Rane", email: "vikas.rane@gmail.com", phone: "+91 98194 30078", city: "Thane", planId: "MEM-02", plan: "Gold Voyager", members: 3, source: "Website", received: "28 Jul 2026", status: "Active", quote: "QUO-1190" }
];
var signupTone = {
  New: "amber",
  Quoted: "sky",
  Active: "green",
  Cancelled: "rose"
};
function membershipAmount(plan, members = 1) {
  const subtotal = Number(plan?.price || 0) * Math.max(1, Number(members) || 1);
  const tax = Math.round(subtotal * MEMBERSHIP_GST / 100);
  return { subtotal, tax, total: subtotal + tax };
}
var invoices = [
  { id: "INV-4412", customer: "Ajay Panchmukh", booking: "BKG-8821", issued: "02 Aug 2026", due: "10 Aug 2026", amount: 286800, paid: 286800, status: "Paid" },
  { id: "INV-4411", customer: "Meera Iyer", booking: "BKG-8817", issued: "01 Aug 2026", due: "12 Aug 2026", amount: 336e3, paid: 336e3, status: "Paid" },
  { id: "INV-4410", customer: "Priya Nair", booking: "BKG-8820", issued: "31 Jul 2026", due: "14 Aug 2026", amount: 138e3, paid: 7e4, status: "Partial" },
  { id: "INV-4409", customer: "Farhan Qureshi", booking: "BKG-8818", issued: "30 Jul 2026", due: "20 Aug 2026", amount: 176700, paid: 5e4, status: "Partial" },
  { id: "INV-4408", customer: "Sitaram Parab", booking: "BKG-8815", issued: "29 Jul 2026", due: "05 Aug 2026", amount: 305600, paid: 0, status: "Overdue" },
  { id: "INV-4407", customer: "Rahul Menon", booking: "BKG-8813", issued: "28 Jul 2026", due: "25 Aug 2026", amount: 424e3, paid: 15e4, status: "Partial" },
  { id: "INV-4406", customer: "Tanvi Joshi", booking: "BKG-8812", issued: "02 Jul 2026", due: "12 Jul 2026", amount: 143400, paid: 143400, status: "Paid" }
];
var invoiceTone = {
  Paid: "green",
  Partial: "amber",
  Overdue: "rose",
  Draft: "slate"
};
var payments = [
  { id: "PAY-9931", customer: "Meera Iyer", invoice: "INV-4411", date: "03 Aug 2026", mode: "Bank transfer", amount: 186e3, status: "Success" },
  { id: "PAY-9930", customer: "Ajay Panchmukh", invoice: "INV-4412", date: "02 Aug 2026", mode: "UPI", amount: 286800, status: "Success" },
  { id: "PAY-9929", customer: "Rahul Menon", invoice: "INV-4407", date: "01 Aug 2026", mode: "Card", amount: 15e4, status: "Success" },
  { id: "PAY-9928", customer: "Priya Nair", invoice: "INV-4410", date: "31 Jul 2026", mode: "UPI", amount: 7e4, status: "Success" },
  { id: "PAY-9927", customer: "Farhan Qureshi", invoice: "INV-4409", date: "30 Jul 2026", mode: "Cash", amount: 5e4, status: "Success" },
  { id: "PAY-9926", customer: "Kiran Rao", invoice: "INV-4399", date: "28 Jul 2026", mode: "UPI", amount: 2e4, status: "Refunded" },
  { id: "PAY-9925", customer: "Imran Shaikh", invoice: "INV-4396", date: "26 Jul 2026", mode: "Bank transfer", amount: 294500, status: "Success" }
];
var paymentTone = { Success: "green", Pending: "amber", Failed: "rose", Refunded: "violet" };
var suppliers = [
  { id: "SUP-21", name: "Bali Sunrise DMC", category: "DMC", region: "Indonesia", contact: "Wayan Putra", phone: "+62 812 4455 991", rating: 4.8, bookings: 62, status: "Active" },
  { id: "SUP-22", name: "Emirates Holidays Desk", category: "Airline", region: "UAE", contact: "Sara Al Nuaimi", phone: "+971 50 221 4478", rating: 4.6, bookings: 48, status: "Active" },
  { id: "SUP-23", name: "Lagoon Resorts Maldives", category: "Hotel", region: "Maldives", contact: "Ahmed Rasheed", phone: "+960 779 3321", rating: 4.9, bookings: 24, status: "Active" },
  { id: "SUP-24", name: "Alps Rail & Coach", category: "Transport", region: "Switzerland", contact: "Lukas Meier", phone: "+41 79 220 1188", rating: 4.7, bookings: 17, status: "Active" },
  { id: "SUP-25", name: "Backwater Cruises Kerala", category: "Hotel", region: "India", contact: "Joseph Thomas", phone: "+91 98470 11223", rating: 4.4, bookings: 71, status: "Active" },
  { id: "SUP-26", name: "Phuket Coast Tours", category: "DMC", region: "Thailand", contact: "Nattapong S.", phone: "+66 81 334 5566", rating: 4.2, bookings: 88, status: "On hold" },
  { id: "SUP-27", name: "VisaExpress Consultants", category: "Visa", region: "Global", contact: "Rhea Dsouza", phone: "+91 98200 44117", rating: 4.5, bookings: 134, status: "Active" }
];
var campaigns = [
  { id: "CMP-77", name: "Monsoon Kerala Flash Sale", channel: "WhatsApp", sent: 4820, opened: 3612, clicked: 894, leads: 63, status: "Completed", spend: 18e3 },
  { id: "CMP-76", name: "Bali Honeymoon \u2014 Instagram", channel: "Instagram", sent: 22400, opened: 15380, clicked: 2104, leads: 118, status: "Running", spend: 65e3 },
  { id: "CMP-75", name: "Dubai Long Weekend", channel: "Email", sent: 7600, opened: 2812, clicked: 421, leads: 34, status: "Running", spend: 12e3 },
  { id: "CMP-74", name: "Early Bird Europe 2027", channel: "Google Ads", sent: 18900, opened: 11240, clicked: 1876, leads: 91, status: "Running", spend: 84e3 },
  { id: "CMP-73", name: "Ladakh Bike Expedition", channel: "WhatsApp", sent: 3100, opened: 2440, clicked: 512, leads: 41, status: "Paused", spend: 9500 }
];
var campaignTone = { Running: "green", Paused: "amber", Completed: "violet", Draft: "slate" };
var team = [
  { id: "USR-01", name: "Dushyant Kale", role: "Owner", email: "dushyant@smiraclub.com", phone: "+91 98200 11223", enquiries: 0, bookings: 0, revenue: 0, status: "Active" },
  { id: "USR-02", name: "Sneha Kulkarni", role: "Senior Travel Consultant", email: "sneha@smiraclub.com", phone: "+91 98211 44556", enquiries: 62, bookings: 21, revenue: 1684e3, status: "Active" },
  { id: "USR-03", name: "Ritik Sharma", role: "Travel Consultant", email: "ritik@smiraclub.com", phone: "+91 99303 88110", enquiries: 58, bookings: 17, revenue: 1215e3, status: "Active" },
  { id: "USR-04", name: "Kabir Menon", role: "Travel Consultant", email: "kabir@smiraclub.com", phone: "+91 90045 22119", enquiries: 48, bookings: 16, revenue: 1366e3, status: "Active" },
  { id: "USR-05", name: "Rhea Dsouza", role: "Visa & Documentation", email: "rhea@smiraclub.com", phone: "+91 98200 44117", enquiries: 0, bookings: 0, revenue: 0, status: "Active" },
  { id: "USR-06", name: "Amit Patil", role: "Accounts", email: "amit@smiraclub.com", phone: "+91 97654 33221", enquiries: 0, bookings: 0, revenue: 0, status: "Invited" }
];
var consultantPerformance = team.filter((t) => t.bookings > 0).map((t) => ({ name: t.name.split(" ")[0], enquiries: t.enquiries, bookings: t.bookings, revenue: t.revenue }));
var upcomingDepartures = bookings.filter((b) => ["Confirmed", "Part paid", "Pending"].includes(b.status)).slice(0, 5);

// src/store/AppStore.jsx
import { jsx } from "react/jsx-runtime";
var KEY = "smira-club-admin:v7";
var AUTH_KEY = "smira-club-admin:auth";
var PREFIX = {
  enquiries: "ENQ",
  bookings: "BKG",
  packages: "PKG",
  customers: "CUS",
  tasks: "TSK",
  quotations: "QUO",
  invoices: "INV",
  payments: "PAY",
  suppliers: "SUP",
  campaigns: "CMP",
  team: "USR",
  memberships: "MEM",
  memberSignups: "MSU"
};
var SINGULAR = {
  enquiries: "Enquiry",
  bookings: "Booking",
  packages: "Package",
  customers: "Customer",
  tasks: "Task",
  quotations: "Quotation",
  invoices: "Invoice",
  payments: "Payment",
  suppliers: "Supplier",
  campaigns: "Campaign",
  team: "Team member",
  memberships: "Membership plan",
  memberSignups: "Membership signup"
};
var seedState = () => ({
  enquiries,
  bookings,
  packages,
  customers,
  tasks,
  quotations,
  invoices,
  payments,
  suppliers,
  campaigns,
  team,
  memberships,
  memberSignups,
  settings: {
    membership: { autoQuote: true, validityDays: 7 },
    agency: {
      name: "Smira Club Pvt. Ltd.",
      email: "hello@smiraclub.com",
      phone: "+91 98200 11223",
      gstin: "27AABCV1234M1ZQ",
      licence: "IATA-14-3-9981",
      currency: "INR \u2014 Indian Rupee",
      address: "304, Pinnacle Business Park, Andheri East, Mumbai 400093, Maharashtra"
    },
    notifications: {
      newEnquiry: true,
      payment: true,
      departure: true,
      digest: false,
      marketing: false
    },
    integrations: {
      "WhatsApp Business API": true,
      Razorpay: true,
      "Amadeus GDS": false,
      "Google Calendar": false,
      Tally: true
    },
    security: { twoFactor: true, restrictExport: true, sessionTimeout: false }
  }
});
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState();
    const saved = JSON.parse(raw);
    const base = seedState();
    return { ...base, ...saved, settings: { ...base.settings, ...saved.settings || {} } };
  } catch {
    return seedState();
  }
}
function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}
var phoneDigits = (v = "") => String(v).replace(/\D/g, "").slice(-10);
var AppContext = createContext(null);
function AppProvider({ children }) {
  const [db, setDb] = useState(load);
  const [toasts, setToasts] = useState([]);
  const [owner, setOwner] = useState("All team members");
  const [range, setRange] = useState("Last 7 days");
  const [auth, setAuth] = useState(loadAuth);
  const issued = useRef(/* @__PURE__ */ new Set());
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
    }
  }, [db]);
  useEffect(() => {
    try {
      if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      else localStorage.removeItem(AUTH_KEY);
    } catch {
    }
  }, [auth]);
  const toast = useCallback((message, tone = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const nextId = useCallback(
    (collection) => {
      const rows = db[collection] || [];
      let max = rows.reduce((m, r) => {
        const n = Number(String(r.id).split("-")[1]);
        return Number.isFinite(n) && n > m ? n : m;
      }, 1e3);
      let id = `${PREFIX[collection] || "REC"}-${max + 1}`;
      while (issued.current.has(id)) {
        max += 1;
        id = `${PREFIX[collection] || "REC"}-${max + 1}`;
      }
      issued.current.add(id);
      return id;
    },
    [db]
  );
  const create = useCallback(
    (collection, item, { silent = false } = {}) => {
      const id = item.id || nextId(collection);
      setDb((d) => ({ ...d, [collection]: [{ ...item, id }, ...d[collection]] }));
      if (!silent) toast(`${SINGULAR[collection]} ${id} created`);
      return id;
    },
    [nextId, toast]
  );
  const update = useCallback(
    (collection, id, patch, { silent = false, message } = {}) => {
      setDb((d) => ({
        ...d,
        [collection]: d[collection].map((r) => r.id === id ? { ...r, ...patch } : r)
      }));
      if (!silent) toast(message || `${SINGULAR[collection]} ${id} updated`);
    },
    [toast]
  );
  const updateMany = useCallback(
    (collection, ids, patch, message) => {
      setDb((d) => ({
        ...d,
        [collection]: d[collection].map((r) => ids.includes(r.id) ? { ...r, ...patch } : r)
      }));
      toast(message || `${ids.length} ${ids.length === 1 ? "record" : "records"} updated`);
    },
    [toast]
  );
  const remove = useCallback(
    (collection, ids) => {
      const list = Array.isArray(ids) ? ids : [ids];
      setDb((d) => ({ ...d, [collection]: d[collection].filter((r) => !list.includes(r.id)) }));
      toast(
        list.length === 1 ? `${SINGULAR[collection]} ${list[0]} deleted` : `${list.length} records deleted`,
        "danger"
      );
    },
    [toast]
  );
  const duplicate = useCallback(
    (collection, id) => {
      const row = db[collection].find((r) => r.id === id);
      if (!row) return;
      const newId = nextId(collection);
      const copy = { ...row, id: newId, name: row.name ? `${row.name} (copy)` : row.name };
      setDb((d) => ({ ...d, [collection]: [copy, ...d[collection]] }));
      toast(`Duplicated as ${newId}`);
    },
    [db, nextId, toast]
  );
  const saveSettings = useCallback(
    (patch) => {
      setDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    },
    []
  );
  const resetDemo = useCallback(() => {
    setDb(seedState());
    toast("Demo data restored");
  }, [toast]);
  const refresh = useCallback(() => {
    toast("Data refreshed just now");
  }, [toast]);
  const signIn = useCallback(
    (phone) => {
      const digits5 = phoneDigits(phone);
      const member = db.team.find((t) => phoneDigits(t.phone) === digits5) || db.team.find((t) => t.role === "Owner") || db.team[0];
      const session = {
        phone: digits5,
        name: member?.name || "Smira Club user",
        role: member?.role || "Owner",
        email: member?.email || "",
        initials: (member?.name || "SC").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
        since: (/* @__PURE__ */ new Date()).toISOString()
      };
      setAuth(session);
      return session;
    },
    [db.team]
  );
  const generateMembershipQuote = useCallback(
    (signup) => {
      const plan = db.memberships.find((p) => p.id === signup.planId) || db.memberships.find((p) => p.name === signup.plan);
      if (!plan) {
        toast(`No plan found for ${signup.name} \u2014 quotation not generated`, "danger");
        return null;
      }
      if (signup.quote) {
        toast(`${signup.id} already has quotation ${signup.quote}`, "info");
        return signup.quote;
      }
      const { subtotal, tax, total } = membershipAmount(plan, signup.members);
      const validDays = db.settings.membership?.validityDays ?? 7;
      const validTill = new Date(Date.now() + validDays * 864e5).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      const consultant = db.team.find((t) => t.bookings > 0);
      const quoteId = create(
        "quotations",
        {
          customer: signup.name,
          pkg: `${plan.name} membership (${plan.billing})`,
          pax: Number(signup.members) || 1,
          amount: total,
          subtotal,
          tax,
          validTill,
          status: "Draft",
          owner: consultant ? consultant.name.split(" ")[0] : "Sneha",
          source: "Membership",
          planId: plan.id,
          inclusions: [...plan.features]
        },
        { silent: true }
      );
      update("memberSignups", signup.id, { quote: quoteId, status: "Quoted" }, { silent: true });
      toast(`Quotation ${quoteId} generated for ${signup.name} \xB7 ${plan.name}`);
      return quoteId;
    },
    [db.memberships, db.settings, db.team, create, update, toast]
  );
  const receiveMemberSignup = useCallback(
    (payload) => {
      const id = nextId("memberSignups");
      const signup = { ...payload, id, status: "New", quote: "" };
      create("memberSignups", signup, { silent: true });
      const known = db.customers.some((c) => phoneDigits(c.phone) === phoneDigits(signup.phone));
      if (!known) {
        create(
          "customers",
          {
            name: signup.name,
            phone: signup.phone,
            email: signup.email,
            city: signup.city || "",
            trips: 0,
            spend: 0,
            tier: "Silver",
            last: "\u2014",
            dob: "",
            special: "",
            specialLabel: "Anniversary",
            address: "",
            giftsGiven: [],
            source: "Website"
          },
          { silent: true }
        );
      }
      toast(`${signup.name} selected ${signup.plan} on the website`, "info");
      if (db.settings.membership?.autoQuote) generateMembershipQuote(signup);
      return signup;
    },
    [nextId, create, toast, db.settings, db.customers, generateMembershipQuote]
  );
  const toggleGift = useCallback(
    (customerId, gift) => {
      const customer = db.customers.find((c) => c.id === customerId);
      if (!customer) return;
      const list = customer.giftsGiven || [];
      const already = list.some((g) => giftKey(g.gift) === giftKey(gift));
      if (already) {
        update(
          "customers",
          customerId,
          { giftsGiven: list.filter((g) => giftKey(g.gift) !== giftKey(gift)) },
          { silent: true }
        );
        toast(`\u201C${gift}\u201D marked as not given yet`, "info");
        return;
      }
      const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      update("customers", customerId, { giftsGiven: [...list, { gift, date }] }, { silent: true });
      toast(`\u201C${gift}\u201D given to ${customer.name}`);
    },
    [db.customers, update, toast]
  );
  const signOut = useCallback(() => {
    setAuth(null);
    toast("Signed out \u2014 verify your mobile number to continue", "info");
  }, [toast]);
  const recordPayment = useCallback(
    (payment) => {
      const id = create("payments", payment, { silent: true });
      setDb((d) => ({
        ...d,
        invoices: d.invoices.map((inv) => {
          if (inv.id !== payment.invoice) return inv;
          const paid = Math.min(inv.amount, inv.paid + Number(payment.amount || 0));
          return { ...inv, paid, status: paid >= inv.amount ? "Paid" : "Partial" };
        })
      }));
      toast(`Payment ${id} recorded`);
      return id;
    },
    [create, toast]
  );
  const value = useMemo(
    () => ({
      ...db,
      db,
      toasts,
      toast,
      dismissToast,
      create,
      update,
      updateMany,
      remove,
      duplicate,
      recordPayment,
      saveSettings,
      resetDemo,
      refresh,
      nextId,
      owner,
      setOwner,
      range,
      setRange,
      auth,
      signIn,
      signOut,
      generateMembershipQuote,
      receiveMemberSignup,
      toggleGift
    }),
    [
      db,
      toasts,
      toast,
      dismissToast,
      create,
      update,
      updateMany,
      remove,
      duplicate,
      recordPayment,
      saveSettings,
      resetDemo,
      refresh,
      nextId,
      owner,
      range,
      auth,
      signIn,
      signOut,
      generateMembershipQuote,
      receiveMemberSignup,
      toggleGift
    ]
  );
  return /* @__PURE__ */ jsx(AppContext.Provider, { value, children });
}
function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
function byOwner(rows, owner, key = "owner") {
  if (!owner || owner === "All team members") return rows;
  const first = owner.split(" ")[0];
  return rows.filter((r) => r[key] === first || r[key] === owner);
}

// src/App.jsx
import { Routes, Route, Navigate as Navigate3 } from "react-router-dom";

// src/components/layout/Layout.jsx
import { useState as useState3 } from "react";
import { Outlet, useLocation as useLocation2 } from "react-router-dom";

// src/components/layout/Header.jsx
import { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  CalendarRange,
  UsersRound as UsersRound2,
  X,
  CheckCheck,
  Plane,
  Clock3,
  ChevronDown,
  LogOut,
  RotateCcw,
  LifeBuoy
} from "lucide-react";

// src/data/nav.js
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  Crown,
  UserRound,
  ListTodo,
  FileText,
  ReceiptIndianRupee,
  Wallet,
  Building2,
  Megaphone,
  UsersRound,
  PieChart,
  Settings
} from "lucide-react";
var navGroups = [
  {
    section: "Home",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/tasks", label: "Tasks", icon: ListTodo, badgeKey: "tasks" }
    ]
  },
  {
    section: "Bookings",
    items: [
      { to: "/enquiries", label: "Enquiries", icon: Users, badgeKey: "enquiries" },
      { to: "/quotations", label: "Quotations", icon: FileText },
      { to: "/bookings", label: "Bookings", icon: CalendarCheck }
    ]
  },
  {
    section: "Packages",
    items: [
      { to: "/packages", label: "Packages", icon: Package },
      { to: "/memberships", label: "Memberships", icon: Crown, badgeKey: "memberships" },
      { to: "/suppliers", label: "Suppliers", icon: Building2 }
    ]
  },
  {
    section: "Finance",
    items: [
      { to: "/invoices", label: "Invoices", icon: ReceiptIndianRupee },
      { to: "/payments", label: "Payments", icon: Wallet }
    ]
  },
  {
    section: "Travellers",
    items: [
      { to: "/customers", label: "Customers", icon: UserRound },
      { to: "/team", label: "Team", icon: UsersRound },
      { to: "/campaigns", label: "Campaigns", icon: Megaphone, tag: "NEW" },
      { to: "/reports", label: "Reports", icon: PieChart }
    ]
  },
  {
    // Hidden at the client's request — Settings is still reachable from the
    // account menu. Drop `hidden` to put the tab back.
    section: "System",
    hidden: true,
    items: [{ to: "/settings", label: "Settings", icon: Settings }]
  }
];
var visibleNavGroups = navGroups.filter((g) => !g.hidden);
var nav = navGroups.flatMap((g) => g.items);

// src/components/layout/Header.jsx
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
var seedNotifications = [
  { id: "n1", title: "Payment received", body: "\u20B91,86,000 against INV-4411", when: "1 hr ago", read: false },
  { id: "n2", title: "New enquiry", body: "Jayashree Patil \xB7 Kerala \xB7 4 pax", when: "3 hrs ago", read: false },
  { id: "n3", title: "Visa deadline", body: "Rahul Menon \u2014 Schengen slot pending", when: "Yesterday", read: true }
];
function LiveClock() {
  const [now, setNow] = useState2(() => /* @__PURE__ */ new Date());
  useEffect2(() => {
    const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  const date = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "hidden shrink-0 items-center gap-2 rounded-lg bg-surface-soft px-2.5 py-1.5 lg:flex",
      title: `Live \xB7 ${date}`,
      children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2 shrink-0", children: [
          /* @__PURE__ */ jsx2("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" }),
          /* @__PURE__ */ jsx2("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })
        ] }),
        /* @__PURE__ */ jsx2(Clock3, { size: 14, className: "hidden shrink-0 text-ink-400 xl:block" }),
        /* @__PURE__ */ jsx2("span", { className: "num whitespace-nowrap text-sm font-bold leading-none text-ink-900", children: time }),
        /* @__PURE__ */ jsx2("span", { className: "hidden whitespace-nowrap text-xs font-semibold leading-none text-ink-500 2xl:block", children: date })
      ]
    }
  );
}
function Header({ onOpenMobile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    enquiries: enquiries2,
    bookings: bookings2,
    customers: customers2,
    tasks: tasks2,
    memberSignups: memberSignups2,
    owner,
    setOwner,
    range,
    setRange,
    refresh,
    team: team2,
    settings,
    auth,
    signOut,
    resetDemo
  } = useApp();
  const [query, setQuery] = useState2("");
  const [searchOpen, setSearchOpen] = useState2(false);
  const [notifications, setNotifications] = useState2(seedNotifications);
  const [bellOpen, setBellOpen] = useState2(false);
  const [menuOpen, setMenuOpen] = useState2(false);
  const searchRef = useRef2(null);
  const searchBoxRef = useRef2(null);
  const bellRef = useRef2(null);
  const menuRef = useRef2(null);
  const unread = notifications.filter((n) => !n.read).length;
  const counts = {
    enquiries: enquiries2.filter((e) => ["New", "Contacted"].includes(e.status)).length,
    tasks: tasks2.filter((t) => t.bucket === "today" || t.bucket === "overdue").length,
    memberships: memberSignups2.filter((s) => s.status === "New").length
  };
  const activeGroup = useMemo2(() => {
    let best = navGroups[0];
    let bestLen = -1;
    navGroups.forEach(
      (g) => g.items.forEach((item) => {
        const match = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        if (match && item.to.length > bestLen) {
          best = g;
          bestLen = item.to.length;
        }
      })
    );
    return best;
  }, [pathname]);
  useEffect2(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect2(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  useEffect2(() => {
    const onDown = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const q = query.trim().toLowerCase();
  const results = q ? [
    ...enquiries2.filter((e) => `${e.name} ${e.phone} ${e.destination}`.toLowerCase().includes(q)).slice(0, 4).map((e) => ({ id: e.id, label: e.name, meta: `Enquiry \xB7 ${e.destination}`, to: "/enquiries" })),
    ...bookings2.filter((b) => `${b.id} ${b.customer} ${b.pkg}`.toLowerCase().includes(q)).slice(0, 4).map((b) => ({ id: b.id, label: b.customer, meta: `Booking \xB7 ${b.id}`, to: "/bookings" })),
    ...customers2.filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ id: c.id, label: c.name, meta: `Customer \xB7 ${c.city}`, to: "/customers" }))
  ] : [];
  return /* @__PURE__ */ jsxs("header", { className: "z-30 shrink-0 bg-white", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-ink-900/[0.07] px-4 sm:px-5", children: [
      /* @__PURE__ */ jsx2("button", { onClick: onOpenMobile, className: "icon-btn my-2.5 h-9 w-9 lg:hidden", children: /* @__PURE__ */ jsx2(Menu, { size: 18 }) }),
      /* @__PURE__ */ jsxs(NavLink, { to: "/", className: "my-2.5 flex shrink-0 items-center gap-2.5", children: [
        /* @__PURE__ */ jsx2("span", { className: "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-ocean text-white", children: /* @__PURE__ */ jsx2(Plane, { size: 17, strokeWidth: 2.4, className: "-rotate-45" }) }),
        /* @__PURE__ */ jsxs("span", { className: "hidden font-display text-[1.05rem] font-extrabold leading-none tracking-tight text-ink-900 sm:block", children: [
          "Smira",
          /* @__PURE__ */ jsx2("span", { className: "text-brand-600", children: " Club" })
        ] })
      ] }),
      /* @__PURE__ */ jsx2("nav", { className: "no-scrollbar -mb-px ml-1 hidden min-w-0 flex-1 items-stretch gap-0.5 self-stretch overflow-x-auto lg:flex", children: visibleNavGroups.map((group) => {
        const on = group === activeGroup;
        return /* @__PURE__ */ jsx2(
          "button",
          {
            onClick: () => navigate(group.items[0].to),
            className: `relative shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 pt-4 text-sm font-bold transition-colors ${on ? "border-brand-600 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900"}`,
            children: group.section
          },
          group.section
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2 py-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: searchBoxRef, children: [
          /* @__PURE__ */ jsx2(
            "button",
            {
              onClick: () => setSearchOpen((o) => !o),
              className: "icon-btn h-9 w-9",
              title: "Search (Ctrl+K)",
              children: /* @__PURE__ */ jsx2(Search, { size: 17 })
            }
          ),
          searchOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-11 z-40 w-[min(380px,90vw)] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative border-b border-ink-900/[0.07]", children: [
              /* @__PURE__ */ jsx2(Search, { size: 15, className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" }),
              /* @__PURE__ */ jsx2(
                "input",
                {
                  ref: searchRef,
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  placeholder: "Search enquiries, bookings, customers\u2026",
                  className: "w-full border-0 bg-transparent py-3 pl-10 pr-10 text-sm text-ink-900 outline-none placeholder:text-ink-400"
                }
              ),
              query && /* @__PURE__ */ jsx2(
                "button",
                {
                  onClick: () => setQuery(""),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700",
                  children: /* @__PURE__ */ jsx2(X, { size: 15 })
                }
              )
            ] }),
            q ? /* @__PURE__ */ jsxs("div", { className: "max-h-80 overflow-y-auto py-1", children: [
              results.length === 0 && /* @__PURE__ */ jsxs("p", { className: "px-4 py-5 text-sm text-ink-500", children: [
                "No matches for \u201C",
                query,
                "\u201D"
              ] }),
              results.map((r) => /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    navigate(r.to);
                    setQuery("");
                    setSearchOpen(false);
                  },
                  className: "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-soft",
                  children: [
                    /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx2("span", { className: "block truncate text-sm font-bold text-ink-900", children: r.label }),
                      /* @__PURE__ */ jsx2("span", { className: "block truncate text-xs text-ink-500", children: r.meta })
                    ] }),
                    /* @__PURE__ */ jsx2("span", { className: "text-xs font-semibold text-brand-700", children: r.id })
                  ]
                },
                `${r.to}-${r.id}`
              ))
            ] }) : /* @__PURE__ */ jsxs("p", { className: "px-4 py-4 text-xs text-ink-500", children: [
              "Type a name, phone number or record ID. Press",
              " ",
              /* @__PURE__ */ jsx2("kbd", { className: "rounded border border-ink-900/10 bg-surface-soft px-1.5 py-0.5 text-[10px] font-bold", children: "Esc" }),
              " ",
              "to close."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx2(LiveClock, {}),
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: bellRef, children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setBellOpen((o) => !o), className: "icon-btn relative h-9 w-9", children: [
            /* @__PURE__ */ jsx2(Bell, { size: 17 }),
            unread > 0 && /* @__PURE__ */ jsx2("span", { className: "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" })
          ] }),
          bellOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-11 z-30 w-[320px] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-ink-900/[0.07] px-4 py-3", children: [
              /* @__PURE__ */ jsx2("p", { className: "text-sm font-bold text-ink-900", children: "Notifications" }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
                  className: "inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline",
                  children: [
                    /* @__PURE__ */ jsx2(CheckCheck, { size: 13 }),
                    " Mark all read"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("ul", { className: "max-h-80 divide-y divide-ink-900/[0.07] overflow-y-auto", children: [
              notifications.map((n) => /* @__PURE__ */ jsx2(
                "li",
                {
                  className: `px-4 py-3 transition hover:bg-surface-soft ${n.read ? "opacity-60" : ""}`,
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                    !n.read && /* @__PURE__ */ jsx2("span", { className: "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx2("p", { className: "text-sm font-bold text-ink-900", children: n.title }),
                      /* @__PURE__ */ jsx2("p", { className: "text-xs text-ink-500", children: n.body }),
                      /* @__PURE__ */ jsx2("p", { className: "mt-0.5 text-[11px] text-ink-400", children: n.when })
                    ] })
                  ] })
                },
                n.id
              )),
              notifications.length === 0 && /* @__PURE__ */ jsx2("li", { className: "px-4 py-6 text-center text-sm text-ink-500", children: "You're all caught up" })
            ] }),
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: () => setNotifications([]),
                className: "w-full border-t border-ink-900/[0.07] py-2.5 text-xs font-semibold text-ink-500 hover:text-rose-600",
                children: "Clear all"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMenuOpen((o) => !o),
              className: "flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white py-1 pl-1 pr-2 text-left shadow-xs transition hover:border-ink-900/20 hover:bg-surface-soft",
              children: [
                /* @__PURE__ */ jsx2("span", { className: "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-600 text-[11px] font-bold text-white", children: auth?.initials || "SC" }),
                /* @__PURE__ */ jsxs("span", { className: "hidden min-w-0 xl:block", children: [
                  /* @__PURE__ */ jsx2("span", { className: "block truncate text-sm font-bold leading-tight text-ink-900", children: auth?.name || "Signed in" }),
                  /* @__PURE__ */ jsxs("span", { className: "num block truncate text-[11px] leading-tight text-ink-500", children: [
                    "+91 ",
                    auth?.phone || "\u2014"
                  ] })
                ] }),
                /* @__PURE__ */ jsx2(ChevronDown, { size: 15, className: `shrink-0 text-ink-500 transition ${menuOpen ? "rotate-180" : ""}` })
              ]
            }
          ),
          menuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-30 w-[240px] overflow-hidden rounded-xl bg-white py-1 shadow-lift ring-1 ring-ink-900/[0.07]", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-ink-900/[0.07] px-3.5 py-3", children: [
              /* @__PURE__ */ jsx2("p", { className: "truncate text-sm font-bold text-ink-900", children: auth?.name }),
              /* @__PURE__ */ jsxs("p", { className: "truncate text-xs text-ink-500", children: [
                auth?.role,
                " \xB7 ",
                settings.agency.name
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuOpen(false);
                  resetDemo();
                },
                className: "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-surface-soft",
                children: [
                  /* @__PURE__ */ jsx2(RotateCcw, { size: 15 }),
                  " Reset demo data"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuOpen(false);
                  signOut();
                  navigate("/login", { replace: true });
                },
                className: "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50",
                children: [
                  /* @__PURE__ */ jsx2(LogOut, { size: 15 }),
                  " Sign out"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-ink-900/[0.07] bg-surface-soft/60 px-4 py-2 sm:px-5", children: [
      /* @__PURE__ */ jsx2("nav", { className: "no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto", children: activeGroup.items.map(({ to, label, icon: Icon, badgeKey, tag }) => {
        const badge = badgeKey ? counts[badgeKey] : null;
        return /* @__PURE__ */ jsx2(
          NavLink,
          {
            to,
            end: to === "/",
            className: ({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? "bg-white text-brand-700 shadow-xs ring-1 ring-ink-900/[0.07]" : "text-ink-600 hover:bg-white/70 hover:text-ink-900"}`,
            children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx2(Icon, { size: 15, strokeWidth: 2.2, className: isActive ? "text-brand-600" : "text-ink-400" }),
              label,
              badge > 0 && /* @__PURE__ */ jsx2(
                "span",
                {
                  className: `num rounded-full px-1.5 text-[11px] font-bold ${isActive ? "bg-brand-600 text-white" : "bg-ink-900/[0.07] text-ink-600"}`,
                  children: badge
                }
              ),
              tag && /* @__PURE__ */ jsx2("span", { className: "rounded-full bg-sky-50 px-1.5 text-[10px] font-extrabold tracking-wide text-sky-700 ring-1 ring-sky-600/15", children: tag })
            ] })
          },
          to
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex shrink-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "relative hidden xl:block", children: [
          /* @__PURE__ */ jsx2(CalendarRange, { size: 14, className: "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" }),
          /* @__PURE__ */ jsx2(
            "select",
            {
              value: range,
              onChange: (e) => setRange(e.target.value),
              className: "cursor-pointer appearance-none rounded-lg border border-ink-900/10 bg-white py-1.5 pl-7 pr-7 text-sm font-semibold text-ink-700 outline-none transition hover:border-ink-900/20",
              children: ["Today", "Last 7 days", "Last 30 days", "This quarter", "This year"].map((o) => /* @__PURE__ */ jsx2("option", { children: o }, o))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "relative hidden xl:block", children: [
          /* @__PURE__ */ jsx2(UsersRound2, { size: 14, className: "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: owner,
              onChange: (e) => setOwner(e.target.value),
              className: "cursor-pointer appearance-none rounded-lg border border-ink-900/10 bg-white py-1.5 pl-7 pr-7 text-sm font-semibold text-ink-700 outline-none transition hover:border-ink-900/20",
              children: [
                /* @__PURE__ */ jsx2("option", { children: "All team members" }),
                team2.filter((t) => t.bookings > 0).map((t) => /* @__PURE__ */ jsx2("option", { children: t.name }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx2("button", { className: "icon-btn h-8 w-8", onClick: refresh, title: "Refresh data", children: /* @__PURE__ */ jsx2(RefreshCw, { size: 14 }) })
      ] })
    ] })
  ] });
}
function MobileNav({ open, onClose }) {
  const { enquiries: enquiries2, tasks: tasks2, memberSignups: memberSignups2, toast } = useApp();
  const counts = {
    enquiries: enquiries2.filter((e) => ["New", "Contacted"].includes(e.status)).length,
    tasks: tasks2.filter((t) => t.bucket === "today" || t.bucket === "overdue").length,
    memberships: memberSignups2.filter((s) => s.status === "New").length
  };
  return /* @__PURE__ */ jsxs("div", { className: `fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`, children: [
    /* @__PURE__ */ jsx2(
      "div",
      {
        onClick: onClose,
        className: `absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `absolute inset-y-0 left-0 flex w-[272px] flex-col bg-white shadow-lift transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-ink-900/[0.07] px-4 py-3", children: [
            /* @__PURE__ */ jsx2("span", { className: "font-display text-base font-extrabold text-ink-900", children: "Menu" }),
            /* @__PURE__ */ jsx2("button", { onClick: onClose, className: "icon-btn h-8 w-8", children: /* @__PURE__ */ jsx2(X, { size: 17 }) })
          ] }),
          /* @__PURE__ */ jsx2("nav", { className: "no-scrollbar flex-1 overflow-y-auto px-3 py-4", children: visibleNavGroups.map((group, gi) => /* @__PURE__ */ jsxs("div", { className: gi === 0 ? "" : "mt-5", children: [
            /* @__PURE__ */ jsx2("p", { className: "eyebrow mb-1.5 px-3", children: group.section }),
            /* @__PURE__ */ jsx2("div", { className: "space-y-0.5", children: group.items.map(({ to, label, icon: Icon, badgeKey }) => {
              const badge = badgeKey ? counts[badgeKey] : null;
              return /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to,
                  end: to === "/",
                  onClick: onClose,
                  className: ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-surface-soft hover:text-ink-900"}`,
                  children: [
                    /* @__PURE__ */ jsx2(Icon, { size: 18, strokeWidth: 2.1, className: "shrink-0 text-ink-400" }),
                    /* @__PURE__ */ jsx2("span", { className: "flex-1 truncate", children: label }),
                    badge > 0 && /* @__PURE__ */ jsx2("span", { className: "num rounded-full bg-ink-900/[0.06] px-1.5 py-0.5 text-[11px] font-bold text-ink-600", children: badge })
                  ]
                },
                to
              );
            }) })
          ] }, group.section)) }),
          /* @__PURE__ */ jsx2("div", { className: "border-t border-ink-900/[0.07] px-3 py-3", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                onClose();
                toast("Support chat opened \u2014 our team replies within 10 minutes", "info");
              },
              className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-surface-soft",
              children: [
                /* @__PURE__ */ jsx2(LifeBuoy, { size: 18, strokeWidth: 2.1, className: "text-ink-400" }),
                " Help & support"
              ]
            }
          ) })
        ]
      }
    )
  ] });
}

// src/components/ui/Toaster.jsx
import { CheckCircle2, Info, Trash2, X as X2 } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var skins = {
  success: { bar: "bg-emerald-500", icon: CheckCircle2, tint: "text-emerald-600" },
  info: { bar: "bg-sky-500", icon: Info, tint: "text-sky-600" },
  danger: { bar: "bg-rose-500", icon: Trash2, tint: "text-rose-600" }
};
function Toaster() {
  const { toasts, dismissToast } = useApp();
  return /* @__PURE__ */ jsx3("div", { className: "pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5", children: toasts.map((t) => {
    const skin = skins[t.tone] || skins.success;
    const Icon = skin.icon;
    return /* @__PURE__ */ jsxs2(
      "div",
      {
        className: "pointer-events-auto flex items-center gap-3 overflow-hidden rounded-xl bg-white pr-3 shadow-lift ring-1 ring-ink-900/[0.07]",
        children: [
          /* @__PURE__ */ jsx3("span", { className: `h-full w-1 self-stretch ${skin.bar}` }),
          /* @__PURE__ */ jsx3(Icon, { size: 17, className: `shrink-0 ${skin.tint}` }),
          /* @__PURE__ */ jsx3("p", { className: "flex-1 py-3 text-sm font-semibold text-ink-800", children: t.message }),
          /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: () => dismissToast(t.id),
              className: "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-surface-soft hover:text-ink-700",
              children: /* @__PURE__ */ jsx3(X2, { size: 14 })
            }
          )
        ]
      },
      t.id
    );
  }) });
}

// src/components/layout/Layout.jsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function Layout() {
  const [mobileOpen, setMobileOpen] = useState3(false);
  const { pathname } = useLocation2();
  return (
    // No sidebar: one header carries both navigation levels and the page
    // below it gets the full width of the window.
    /* @__PURE__ */ jsxs3("div", { className: "flex h-screen flex-col bg-surface-base bg-app-aurora", children: [
      /* @__PURE__ */ jsx4(Header, { onOpenMobile: () => setMobileOpen(true) }),
      /* @__PURE__ */ jsxs3("div", { className: "min-w-0 flex-1 overflow-y-auto", children: [
        /* @__PURE__ */ jsx4("main", { className: "mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8", children: /* @__PURE__ */ jsx4(Outlet, {}) }, pathname),
        /* @__PURE__ */ jsx4("footer", { className: "border-t border-ink-900/[0.07] px-6 py-5 text-center text-xs text-ink-400", children: "Smira Club \xB7 Travel agency admin panel \u2014 demo data for client review" })
      ] }),
      /* @__PURE__ */ jsx4(MobileNav, { open: mobileOpen, onClose: () => setMobileOpen(false) }),
      /* @__PURE__ */ jsx4(Toaster, {})
    ] })
  );
}

// src/components/RequireAuth.jsx
import { Navigate, useLocation as useLocation3 } from "react-router-dom";
import { jsx as jsx5 } from "react/jsx-runtime";
function RequireAuth({ children }) {
  const { auth } = useApp();
  const location = useLocation3();
  if (!auth) {
    return /* @__PURE__ */ jsx5(Navigate, { to: "/login", replace: true, state: { from: location.pathname + location.search } });
  }
  return children;
}

// src/pages/Login.jsx
import { useEffect as useEffect3, useMemo as useMemo3, useRef as useRef3, useState as useState4 } from "react";
import { useLocation as useLocation4, useNavigate as useNavigate2, Navigate as Navigate2 } from "react-router-dom";
import {
  Plane as Plane2,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  Globe2,
  CalendarCheck as CalendarCheck2,
  Wallet as Wallet2
} from "lucide-react";
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var OTP_LENGTH = 6;
var RESEND_SECONDS = 30;
var highlights = [
  { icon: Globe2, text: "Enquiries, itineraries and packages in one desk" },
  { icon: CalendarCheck2, text: "Departure tracking with live task reminders" },
  { icon: Wallet2, text: "Invoices, payments and supplier ledgers built in" }
];
function Login() {
  const navigate = useNavigate2();
  const location = useLocation4();
  const { auth, signIn, toast, team: team2, settings } = useApp();
  const [step, setStep] = useState4("phone");
  const [phone, setPhone] = useState4("");
  const [otp, setOtp] = useState4(Array(OTP_LENGTH).fill(""));
  const [sentCode, setSentCode] = useState4("");
  const [error, setError] = useState4("");
  const [busy, setBusy] = useState4(false);
  const [seconds, setSeconds] = useState4(0);
  const boxRefs = useRef3([]);
  const phoneRef = useRef3(null);
  const redirectTo = location.state?.from || "/";
  const validPhone = /^[6-9]\d{9}$/.test(phone);
  const code = otp.join("");
  const knownNumbers = useMemo3(
    () => team2.filter((t) => t.status === "Active").slice(0, 3),
    [team2]
  );
  useEffect3(() => {
    phoneRef.current?.focus();
  }, []);
  useEffect3(() => {
    if (seconds <= 0) return void 0;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1e3);
    return () => clearTimeout(t);
  }, [seconds]);
  if (auth) return /* @__PURE__ */ jsx6(Navigate2, { to: redirectTo, replace: true });
  const sendOtp = (e) => {
    e?.preventDefault();
    if (!validPhone) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setError("");
    setBusy(true);
    const generated = String(Math.floor(1e5 + Math.random() * 9e5));
    setTimeout(() => {
      setSentCode(generated);
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("otp");
      setSeconds(RESEND_SECONDS);
      setBusy(false);
      toast(`OTP sent to +91 ${phone}`, "info");
      setTimeout(() => boxRefs.current[0]?.focus(), 60);
    }, 700);
  };
  const verify = (e) => {
    e?.preventDefault();
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }
    if (code !== sentCode) {
      setError("That OTP does not match. Please check and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      boxRefs.current[0]?.focus();
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      const session = signIn(phone);
      setBusy(false);
      toast(`Welcome back, ${session.name.split(" ")[0]}`);
      navigate(redirectTo, { replace: true });
    }, 550);
  };
  const setDigit = (index, value) => {
    const digits5 = value.replace(/\D/g, "");
    if (!digits5) {
      setOtp((prev) => prev.map((d, i) => i === index ? "" : d));
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      digits5.split("").forEach((d, k) => {
        if (index + k < OTP_LENGTH) next[index + k] = d;
      });
      return next;
    });
    const focusAt = Math.min(index + digits5.length, OTP_LENGTH - 1);
    boxRefs.current[focusAt]?.focus();
  };
  const onOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) boxRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) boxRefs.current[index + 1]?.focus();
  };
  return /* @__PURE__ */ jsx6("div", { className: "min-h-screen bg-surface-base bg-app-aurora", children: /* @__PURE__ */ jsxs4("div", { className: "mx-auto grid min-h-screen max-w-[1180px] items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16", children: [
    /* @__PURE__ */ jsxs4("section", { className: "hidden lg:block", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx6("span", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean text-white shadow-glow", children: /* @__PURE__ */ jsx6(Plane2, { size: 21, strokeWidth: 2.4, className: "-rotate-45" }) }),
        /* @__PURE__ */ jsxs4("span", { className: "font-display text-2xl font-extrabold tracking-tight text-ink-900", children: [
          "Smira",
          /* @__PURE__ */ jsx6("span", { className: "text-brand-600", children: " Club" })
        ] })
      ] }),
      /* @__PURE__ */ jsx6("h1", { className: "mt-9 max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-ink-900", children: "Run every trip, quote and payment from one travel desk." }),
      /* @__PURE__ */ jsxs4("p", { className: "mt-4 max-w-md text-[15px] leading-relaxed text-ink-600", children: [
        "Sign in with the mobile number registered with ",
        settings.agency.name,
        ". We will text you a one-time password \u2014 no passwords to remember."
      ] }),
      /* @__PURE__ */ jsx6("ul", { className: "mt-9 space-y-3.5", children: highlights.map(({ icon: Icon, text }) => /* @__PURE__ */ jsxs4("li", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx6("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-card", children: /* @__PURE__ */ jsx6(Icon, { size: 17, strokeWidth: 2.2 }) }),
        /* @__PURE__ */ jsx6("span", { className: "text-sm font-semibold text-ink-700", children: text })
      ] }, text)) })
    ] }),
    /* @__PURE__ */ jsxs4("section", { className: "w-full", children: [
      /* @__PURE__ */ jsxs4("div", { className: "mb-7 flex items-center gap-2.5 lg:hidden", children: [
        /* @__PURE__ */ jsx6("span", { className: "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean text-white shadow-glow", children: /* @__PURE__ */ jsx6(Plane2, { size: 19, strokeWidth: 2.4, className: "-rotate-45" }) }),
        /* @__PURE__ */ jsxs4("span", { className: "font-display text-xl font-extrabold tracking-tight text-ink-900", children: [
          "Smira",
          /* @__PURE__ */ jsx6("span", { className: "text-brand-600", children: " Club" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "card mx-auto w-full max-w-[440px] p-7 sm:p-9", children: [
        /* @__PURE__ */ jsxs4("span", { className: "chip bg-brand-50 text-brand-700", children: [
          /* @__PURE__ */ jsx6(ShieldCheck, { size: 13 }),
          " Mobile OTP sign-in"
        ] }),
        step === "phone" ? /* @__PURE__ */ jsxs4("form", { onSubmit: sendOtp, noValidate: true, children: [
          /* @__PURE__ */ jsx6("h2", { className: "mt-4 text-2xl font-extrabold tracking-tight text-ink-900", children: "Sign in to your panel" }),
          /* @__PURE__ */ jsx6("p", { className: "mt-1.5 text-sm text-ink-500", children: "Enter your registered mobile number to receive a one-time password." }),
          /* @__PURE__ */ jsx6("label", { className: "label mt-7", htmlFor: "mobile", children: "Mobile number" }),
          /* @__PURE__ */ jsxs4(
            "div",
            {
              className: `flex items-center overflow-hidden rounded-xl border bg-white transition focus-within:ring-4 focus-within:ring-brand-500/10 ${error && !validPhone ? "border-rose-300" : "border-ink-900/10 focus-within:border-brand-400"}`,
              children: [
                /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-2 border-r border-ink-900/10 bg-surface-soft px-3.5 py-3 text-sm font-bold text-ink-700", children: [
                  /* @__PURE__ */ jsx6(Smartphone, { size: 16, className: "text-ink-500" }),
                  " +91"
                ] }),
                /* @__PURE__ */ jsx6(
                  "input",
                  {
                    id: "mobile",
                    ref: phoneRef,
                    value: phone,
                    onChange: (e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    },
                    type: "tel",
                    inputMode: "numeric",
                    autoComplete: "tel-national",
                    placeholder: "98200 11223",
                    className: "w-full bg-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400"
                  }
                )
              ]
            }
          ),
          error && /* @__PURE__ */ jsx6("p", { className: "mt-2 text-xs font-semibold text-rose-600", children: error }),
          /* @__PURE__ */ jsxs4("button", { type: "submit", disabled: busy, className: "btn-primary mt-6 w-full py-3", children: [
            busy ? /* @__PURE__ */ jsx6(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx6(ArrowRight, { size: 16 }),
            busy ? "Sending OTP\u2026" : "Send OTP"
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "mt-6 rounded-xl bg-surface-soft p-3.5", children: [
            /* @__PURE__ */ jsx6("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-500", children: "Demo numbers" }),
            /* @__PURE__ */ jsx6("div", { className: "mt-2 flex flex-wrap gap-1.5", children: knownNumbers.map((t) => /* @__PURE__ */ jsx6(
              "button",
              {
                type: "button",
                onClick: () => {
                  setPhone(t.phone.replace(/\D/g, "").slice(-10));
                  setError("");
                },
                className: "rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 shadow-card transition hover:text-brand-700",
                children: t.phone
              },
              t.id
            )) }),
            /* @__PURE__ */ jsx6("p", { className: "mt-2 text-[11px] text-ink-500", children: "Any valid 10-digit number works in this demo." })
          ] })
        ] }) : /* @__PURE__ */ jsxs4("form", { onSubmit: verify, noValidate: true, children: [
          /* @__PURE__ */ jsx6("h2", { className: "mt-4 text-2xl font-extrabold tracking-tight text-ink-900", children: "Verify your number" }),
          /* @__PURE__ */ jsxs4("p", { className: "mt-1.5 text-sm text-ink-500", children: [
            "We sent a ",
            OTP_LENGTH,
            "-digit code to",
            " ",
            /* @__PURE__ */ jsxs4("span", { className: "font-bold text-ink-800", children: [
              "+91 ",
              phone
            ] }),
            ".",
            " ",
            /* @__PURE__ */ jsx6(
              "button",
              {
                type: "button",
                onClick: () => {
                  setStep("phone");
                  setError("");
                  setSentCode("");
                },
                className: "font-semibold text-brand-700 hover:underline",
                children: "Change"
              }
            )
          ] }),
          /* @__PURE__ */ jsx6("div", { className: "mt-7 flex justify-between gap-2", children: otp.map((digit, i) => /* @__PURE__ */ jsx6(
            "input",
            {
              ref: (el) => {
                boxRefs.current[i] = el;
              },
              value: digit,
              onChange: (e) => {
                setDigit(i, e.target.value);
                setError("");
              },
              onKeyDown: (e) => onOtpKeyDown(i, e),
              onFocus: (e) => e.target.select(),
              inputMode: "numeric",
              autoComplete: i === 0 ? "one-time-code" : "off",
              maxLength: OTP_LENGTH,
              "aria-label": `OTP digit ${i + 1}`,
              className: `w-full min-w-0 rounded-xl border bg-white py-3 text-center text-lg font-extrabold text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 ${error ? "border-rose-300" : "border-ink-900/10"}`
            },
            i
          )) }),
          error && /* @__PURE__ */ jsx6("p", { className: "mt-2 text-xs font-semibold text-rose-600", children: error }),
          /* @__PURE__ */ jsxs4("div", { className: "mt-4 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs4("span", { className: "inline-flex items-center gap-1.5 font-semibold text-ink-500", children: [
              /* @__PURE__ */ jsx6(KeyRound, { size: 13, className: "text-brand-600" }),
              " Demo OTP:",
              " ",
              /* @__PURE__ */ jsx6("span", { className: "font-extrabold tracking-widest text-brand-700", children: sentCode })
            ] }),
            seconds > 0 ? /* @__PURE__ */ jsxs4("span", { className: "font-semibold text-ink-400", children: [
              "Resend in ",
              seconds,
              "s"
            ] }) : /* @__PURE__ */ jsx6(
              "button",
              {
                type: "button",
                onClick: sendOtp,
                className: "font-bold text-brand-700 hover:underline",
                children: "Resend OTP"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs4(
            "button",
            {
              type: "submit",
              disabled: busy || code.length !== OTP_LENGTH,
              className: "btn-primary mt-6 w-full py-3",
              children: [
                busy ? /* @__PURE__ */ jsx6(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx6(ShieldCheck, { size: 16 }),
                busy ? "Verifying\u2026" : "Verify & continue"
              ]
            }
          ),
          /* @__PURE__ */ jsxs4(
            "button",
            {
              type: "button",
              onClick: () => {
                setStep("phone");
                setError("");
                setSentCode("");
              },
              className: "mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800",
              children: [
                /* @__PURE__ */ jsx6(ArrowLeft, { size: 15 }),
                " Use a different number"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("p", { className: "mx-auto mt-5 max-w-[440px] text-center text-xs leading-relaxed text-ink-400", children: [
        "By continuing you agree to the ",
        settings.agency.name,
        " internal usage policy. Trouble signing in? Call ",
        settings.agency.phone,
        "."
      ] })
    ] })
  ] }) });
}

// src/pages/Dashboard.jsx
import { useNavigate as useNavigate3 } from "react-router-dom";
import {
  Users as Users3,
  CalendarCheck as CalendarCheck3,
  Luggage,
  IndianRupee as IndianRupee2,
  RefreshCw as RefreshCw2,
  Mail,
  PhoneCall as PhoneCall2,
  FileText as FileText2,
  Wallet as Wallet3,
  ArrowRight as ArrowRight2,
  ListTodo as ListTodo2
} from "lucide-react";

// src/components/ui/PageHeader.jsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function PageHeader({ eyebrow: eyebrow2, title, subtitle, children }) {
  return /* @__PURE__ */ jsx7("div", { className: "mb-6 border-b border-ink-900/[0.07] pb-5", children: /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap items-end justify-between gap-x-6 gap-y-3", children: [
    /* @__PURE__ */ jsxs5("div", { className: "min-w-0", children: [
      eyebrow2 && /* @__PURE__ */ jsx7("p", { className: "eyebrow mb-1.5", children: eyebrow2 }),
      /* @__PURE__ */ jsx7("h1", { className: "font-display text-[1.6rem] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[1.75rem]", children: title }),
      subtitle && /* @__PURE__ */ jsx7("p", { className: "mt-1 text-sm text-ink-500", children: subtitle })
    ] }),
    children && /* @__PURE__ */ jsx7("div", { className: "flex flex-wrap items-center gap-2", children })
  ] }) });
}

// src/components/ui/StatCard.jsx
import { TrendingUp, TrendingDown } from "lucide-react";

// src/components/ui/Sparkline.jsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
function Sparkline({ data = [], stroke = "#ffffff", fill = "rgba(255,255,255,0.28)", width = 120, height = 36 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => [i * step, height - (v - min) / span * (height - 6) - 3]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return /* @__PURE__ */ jsxs6("svg", { width, height, viewBox: `0 0 ${width} ${height}`, className: "overflow-visible", children: [
    /* @__PURE__ */ jsx8("path", { d: area, fill }),
    /* @__PURE__ */ jsx8("path", { d: line, fill: "none", stroke, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx8("circle", { cx: points[points.length - 1][0], cy: points[points.length - 1][1], r: "2.8", fill: stroke })
  ] });
}

// src/components/ui/StatCard.jsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
var skins2 = {
  brand: "from-brand-700 to-brand-500 text-white",
  ocean: "from-sky-700 to-sky-500 text-white",
  grape: "from-violet-700 to-violet-500 text-white",
  coral: "from-orange-600 to-amber-500 text-white",
  plain: "bg-surface-card"
};
function StatCard({ icon: Icon, label, value, delta, series = [], skin = "plain", hint }) {
  const filled = skin !== "plain";
  const up = (delta ?? 0) >= 0;
  return /* @__PURE__ */ jsxs7(
    "article",
    {
      className: `card card-hover relative h-full overflow-hidden px-5 py-4 ${filled ? `border-transparent bg-gradient-to-br ${skins2[skin]}` : skins2.plain}`,
      children: [
        filled && /* @__PURE__ */ jsx9("div", { className: "pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" }),
        /* @__PURE__ */ jsxs7("div", { className: "relative flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs7("span", { className: "flex min-w-0 items-center gap-2", children: [
            Icon && /* @__PURE__ */ jsx9(
              Icon,
              {
                size: 15,
                strokeWidth: 2.3,
                className: filled ? "shrink-0 text-white/70" : "shrink-0 text-ink-400"
              }
            ),
            /* @__PURE__ */ jsx9(
              "span",
              {
                className: `truncate text-xs font-semibold uppercase tracking-[0.08em] ${filled ? "text-white/75" : "text-ink-500"}`,
                children: label
              }
            )
          ] }),
          delta !== void 0 && /* @__PURE__ */ jsxs7(
            "span",
            {
              className: `chip shrink-0 px-2 py-0.5 text-[11px] ${filled ? "bg-white/15 text-white" : up ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15"}`,
              children: [
                up ? /* @__PURE__ */ jsx9(TrendingUp, { size: 11 }) : /* @__PURE__ */ jsx9(TrendingDown, { size: 11 }),
                up ? "+" : "",
                delta,
                "%"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "relative mt-3 flex items-end justify-between gap-3", children: [
          /* @__PURE__ */ jsxs7("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx9(
              "p",
              {
                className: `font-display text-[1.75rem] font-extrabold leading-none tracking-tight num ${filled ? "text-white" : "text-ink-900"}`,
                children: value
              }
            ),
            hint && /* @__PURE__ */ jsx9("p", { className: `mt-1.5 truncate text-xs ${filled ? "text-white/70" : "text-ink-500"}`, children: hint })
          ] }),
          series.length > 0 && /* @__PURE__ */ jsx9(
            Sparkline,
            {
              data: series,
              stroke: filled ? "#ffffff" : "#14a58c",
              fill: filled ? "rgba(255,255,255,0.22)" : "rgba(20,165,140,0.12)",
              width: 96,
              height: 30
            }
          )
        ] })
      ]
    }
  );
}

// src/components/dashboard/TrendReports.jsx
import { useState as useState5 } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Users as Users2, PhoneCall, Activity, IndianRupee, TrendingUp as TrendingUp2, Plus, X as X3 } from "lucide-react";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var tabs = [
  { key: "enquiries", label: "Enquiries Trend", icon: Users2 },
  { key: "calls", label: "Calls Trend", icon: PhoneCall },
  { key: "activity", label: "Activity Trend", icon: Activity },
  { key: "sales", label: "Sales Trend", icon: IndianRupee }
];
var statTones = {
  brand: "border-brand-500/25 bg-brand-50/70 text-brand-700",
  ocean: "border-sky-500/25 bg-sky-50/70 text-sky-700",
  grape: "border-violet-500/25 bg-violet-50/70 text-violet-700",
  coral: "border-orange-500/25 bg-orange-50/70 text-orange-700",
  gold: "border-amber-500/25 bg-amber-50/70 text-amber-700"
};
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs8("div", { className: "rounded-xl border border-ink-900/[0.07] bg-white/95 px-3.5 py-2.5 shadow-lift backdrop-blur", children: [
    /* @__PURE__ */ jsx10("p", { className: "mb-1.5 text-xs font-bold text-ink-900", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxs8("p", { className: "flex items-center gap-2 text-xs text-ink-600", children: [
      /* @__PURE__ */ jsx10("span", { className: "h-2 w-2 rounded-full", style: { background: p.color } }),
      p.name,
      /* @__PURE__ */ jsx10("span", { className: "ml-auto font-bold text-ink-900", children: p.value.toLocaleString("en-IN") })
    ] }, p.name))
  ] });
}
var REPORT_PRESETS = ["Consultant scorecard", "Destination mix", "Payment ageing", "Source ROI"];
function TrendReports() {
  const [tab, setTab] = useState5("enquiries");
  const [reports, setReports] = useState5(["Trends & Analytics"]);
  const [activeReport, setActiveReport] = useState5("Trends & Analytics");
  const data = trends[tab];
  const addReport = () => {
    const next = REPORT_PRESETS.find((r) => !reports.includes(r));
    if (!next) return;
    setReports((r) => [...r, next]);
    setActiveReport(next);
  };
  const closeReport = (name) => {
    if (reports.length === 1) return;
    const rest = reports.filter((r) => r !== name);
    setReports(rest);
    if (activeReport === name) setActiveReport(rest[0]);
  };
  return /* @__PURE__ */ jsxs8("section", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxs8("header", { className: "flex flex-wrap items-center justify-between gap-3 px-5 pt-4", children: [
      /* @__PURE__ */ jsxs8("div", { children: [
        /* @__PURE__ */ jsx10("p", { className: "eyebrow", children: "Analytics" }),
        /* @__PURE__ */ jsx10("h2", { className: "mt-1 font-display text-base font-extrabold text-ink-900", children: "Business reports" })
      ] }),
      /* @__PURE__ */ jsx10("p", { className: "text-xs text-ink-400", children: "Use + to add another report tab" })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "no-scrollbar flex items-center gap-2 overflow-x-auto px-5 pt-4", children: [
      reports.map((name) => /* @__PURE__ */ jsxs8(
        "span",
        {
          className: `inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-bold transition ${activeReport === name ? "border-brand-600 bg-white text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800"}`,
          children: [
            /* @__PURE__ */ jsx10("button", { onClick: () => setActiveReport(name), children: name }),
            reports.length > 1 && /* @__PURE__ */ jsx10("button", { onClick: () => closeReport(name), title: "Close report", children: /* @__PURE__ */ jsx10(X3, { size: 14, className: "text-ink-400 transition hover:text-rose-600" }) })
          ]
        },
        name
      )),
      /* @__PURE__ */ jsx10(
        "button",
        {
          onClick: addReport,
          disabled: reports.length === REPORT_PRESETS.length + 1,
          title: "Add report",
          className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dashed border-ink-900/15 text-ink-500 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-40",
          children: /* @__PURE__ */ jsx10(Plus, { size: 16 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "border-t border-ink-900/[0.07]", children: /* @__PURE__ */ jsxs8("div", { className: "flex items-start gap-3.5 px-5 py-4", children: [
      /* @__PURE__ */ jsx10("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700", children: /* @__PURE__ */ jsx10(TrendingUp2, { size: 19, strokeWidth: 2.3 }) }),
      /* @__PURE__ */ jsxs8("div", { children: [
        /* @__PURE__ */ jsx10("h3", { className: "font-display text-base font-extrabold text-ink-900", children: activeReport }),
        /* @__PURE__ */ jsx10("p", { className: "mt-0.5 text-sm text-ink-500", children: activeReport === "Trends & Analytics" ? "Visualise performance trends across enquiries, calls, activities and sales" : `Custom report \xB7 connect this to your live data to populate ${activeReport.toLowerCase()}` })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx10("div", { className: "no-scrollbar flex overflow-x-auto border-y border-ink-900/[0.07] bg-surface-soft/50", children: tabs.map(({ key, label, icon: Icon }) => {
      const on = tab === key;
      return /* @__PURE__ */ jsxs8(
        "button",
        {
          onClick: () => setTab(key),
          className: `flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-sm font-bold transition ${on ? "border-b-2 border-brand-600 bg-white text-brand-700" : "border-b-2 border-transparent text-ink-500 hover:text-ink-800"}`,
          children: [
            /* @__PURE__ */ jsx10(Icon, { size: 17, strokeWidth: 2.2 }),
            label
          ]
        },
        key
      );
    }) }),
    /* @__PURE__ */ jsx10("div", { className: "flex flex-wrap gap-3 p-5", children: data.stats.map((s) => /* @__PURE__ */ jsxs8(
      "div",
      {
        className: `min-w-[140px] flex-1 rounded-xl border px-4 py-3 ${statTones[s.tone] || statTones.brand}`,
        children: [
          /* @__PURE__ */ jsx10("p", { className: "text-[11px] font-bold uppercase tracking-wide opacity-80", children: s.label }),
          /* @__PURE__ */ jsx10("p", { className: "mt-1 font-display text-2xl font-extrabold", children: s.value })
        ]
      },
      s.label
    )) }),
    /* @__PURE__ */ jsx10("div", { className: "h-[320px] px-2 pb-5 pr-5", children: /* @__PURE__ */ jsx10(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs8(AreaChart, { data: data.series, margin: { top: 10, right: 8, left: 0, bottom: 0 }, children: [
      /* @__PURE__ */ jsx10("defs", { children: data.keys.map((k) => /* @__PURE__ */ jsxs8("linearGradient", { id: `grad-${tab}-${k.key}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx10("stop", { offset: "5%", stopColor: k.color, stopOpacity: 0.32 }),
        /* @__PURE__ */ jsx10("stop", { offset: "95%", stopColor: k.color, stopOpacity: 0.02 })
      ] }, k.key)) }),
      /* @__PURE__ */ jsx10(CartesianGrid, { strokeDasharray: "4 6", stroke: "rgba(11,21,36,0.07)", vertical: false }),
      /* @__PURE__ */ jsx10(
        XAxis,
        {
          dataKey: "day",
          tickLine: false,
          axisLine: false,
          tick: { fontSize: 12, fill: "#6d7c93", fontWeight: 600 },
          dy: 8
        }
      ),
      /* @__PURE__ */ jsx10(
        YAxis,
        {
          tickLine: false,
          axisLine: false,
          tick: { fontSize: 12, fill: "#96a2b4" },
          width: 48
        }
      ),
      /* @__PURE__ */ jsx10(Tooltip, { content: /* @__PURE__ */ jsx10(ChartTooltip, {}), cursor: { stroke: "rgba(11,21,36,0.12)", strokeWidth: 1 } }),
      /* @__PURE__ */ jsx10(
        Legend,
        {
          iconType: "circle",
          iconSize: 8,
          wrapperStyle: { fontSize: 12, fontWeight: 600, color: "#4a5a73", paddingTop: 8 }
        }
      ),
      data.keys.map((k) => /* @__PURE__ */ jsx10(
        Area,
        {
          type: "monotone",
          dataKey: k.key,
          name: k.name,
          stroke: k.color,
          strokeWidth: 2.6,
          fill: `url(#grad-${tab}-${k.key})`,
          activeDot: { r: 5, strokeWidth: 2, stroke: "#fff" }
        },
        k.key
      ))
    ] }) }) })
  ] });
}

// src/pages/Dashboard.jsx
import { Fragment as Fragment2, jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
function Dashboard() {
  const navigate = useNavigate3();
  const { enquiries: enquiries2, bookings: bookings2, quotations: quotations2, invoices: invoices2, tasks: tasks2, owner, range, refresh, toast, settings } = useApp();
  const scopedEnquiries = byOwner(enquiries2, owner);
  const scopedBookings = byOwner(bookings2, owner);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);
  const revenue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const toCall = scopedEnquiries.filter((e) => e.status === "New").length;
  const awaitingReply = quotations2.filter((q) => ["Sent", "Viewed"].includes(q.status)).length;
  const unpaid = invoices2.filter((i) => i.status !== "Paid");
  const dueToday = tasks2.filter((t) => t.bucket === "today" || t.bucket === "overdue").length;
  const todo = [
    {
      icon: PhoneCall2,
      count: toCall,
      title: "New enquiries to call",
      hint: "Nobody has spoken to them yet",
      to: "/enquiries",
      tone: "bg-sky-50 text-sky-700"
    },
    {
      icon: FileText2,
      count: awaitingReply,
      title: "Quotations waiting for a reply",
      hint: "Sent but not accepted",
      to: "/quotations",
      tone: "bg-violet-50 text-violet-700"
    },
    {
      icon: Wallet3,
      count: unpaid.length,
      title: "Invoices not fully paid",
      hint: "Balance still to collect",
      to: "/invoices",
      tone: "bg-amber-50 text-amber-700"
    },
    {
      icon: ListTodo2,
      count: dueToday,
      title: "Tasks due today",
      hint: "Follow-ups and documents",
      to: "/tasks",
      tone: "bg-brand-50 text-brand-700"
    }
  ];
  const total = scopedEnquiries.length;
  const contacted = scopedEnquiries.filter((e) => e.status !== "New").length;
  const quoted = scopedEnquiries.filter((e) => ["Quoted", "Booked"].includes(e.status)).length;
  const booked = scopedEnquiries.filter((e) => e.status === "Booked").length;
  const share = (n) => total ? Math.round(n / total * 100) : 0;
  const journey = [
    { label: "Enquiries received", value: total, note: "Everyone who asked us" },
    { label: "Contacted", value: contacted, note: "We have spoken to them" },
    { label: "Quotation sent", value: quoted, note: "Given a price" },
    { label: "Booked", value: booked, note: "Trip confirmed" }
  ];
  const billed = invoices2.reduce((s, i) => s + Number(i.amount || 0), 0);
  const collected = invoices2.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = Math.max(0, billed - collected);
  const departing = scopedBookings.filter(
    (b) => ["Confirmed", "Part paid", "Pending"].includes(b.status)
  ).length;
  return /* @__PURE__ */ jsxs9(Fragment2, { children: [
    /* @__PURE__ */ jsxs9(PageHeader, { title: "Dashboard", subtitle: `Tuesday, 04 August 2026 \xB7 ${range}`, children: [
      /* @__PURE__ */ jsxs9("button", { className: "btn-ghost", onClick: refresh, children: [
        /* @__PURE__ */ jsx11(RefreshCw2, { size: 16 }),
        " Refresh"
      ] }),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          className: "btn-primary",
          onClick: () => toast(`Daily report emailed to ${settings.agency.email}`),
          children: [
            /* @__PURE__ */ jsx11(Mail, { size: 16 }),
            " Daily email report"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs9("section", { children: [
      /* @__PURE__ */ jsx11("h2", { className: "font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900", children: "What needs your attention" }),
      /* @__PURE__ */ jsx11("p", { className: "mt-0.5 text-sm text-ink-500", children: "Click any card to open the list." }),
      /* @__PURE__ */ jsx11("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: todo.map(({ icon: Icon, count, title, hint, to, tone }) => /* @__PURE__ */ jsxs9(
        "button",
        {
          onClick: () => navigate(to),
          className: "card card-hover flex items-center gap-4 p-4 text-left",
          children: [
            /* @__PURE__ */ jsx11("span", { className: `grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`, children: /* @__PURE__ */ jsx11(Icon, { size: 19, strokeWidth: 2.2 }) }),
            /* @__PURE__ */ jsxs9("span", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx11("span", { className: "block font-display text-2xl font-extrabold leading-none text-ink-900 num", children: count }),
              /* @__PURE__ */ jsx11("span", { className: "mt-1 block truncate text-sm font-semibold text-ink-800", children: title }),
              /* @__PURE__ */ jsx11("span", { className: "block truncate text-xs text-ink-500", children: hint })
            ] })
          ]
        },
        title
      )) })
    ] }),
    /* @__PURE__ */ jsxs9("section", { className: "mt-8", children: [
      /* @__PURE__ */ jsx11("h2", { className: "font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900", children: "How this period is going" }),
      /* @__PURE__ */ jsxs9("p", { className: "mt-0.5 text-sm text-ink-500", children: [
        "Compared with the period before \xB7 ",
        range.toLowerCase(),
        "."
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx11("button", { onClick: () => navigate("/enquiries"), className: "h-full w-full text-left", children: /* @__PURE__ */ jsx11(
          StatCard,
          {
            icon: Users3,
            label: "Enquiries",
            value: scopedEnquiries.length,
            delta: kpis.enquiries.delta,
            series: kpis.enquiries.series,
            hint: "People who asked us",
            skin: "brand"
          }
        ) }),
        /* @__PURE__ */ jsx11("button", { onClick: () => navigate("/bookings"), className: "h-full w-full text-left", children: /* @__PURE__ */ jsx11(
          StatCard,
          {
            icon: CalendarCheck3,
            label: "Bookings",
            value: scopedBookings.length,
            delta: kpis.bookings.delta,
            series: kpis.bookings.series,
            hint: "Trips confirmed"
          }
        ) }),
        /* @__PURE__ */ jsx11("button", { onClick: () => navigate("/bookings"), className: "h-full w-full text-left", children: /* @__PURE__ */ jsx11(
          StatCard,
          {
            icon: Luggage,
            label: "Travellers",
            value: travellers,
            delta: kpis.travellers.delta,
            series: kpis.travellers.series,
            hint: "Seats sold across trips"
          }
        ) }),
        /* @__PURE__ */ jsx11("button", { onClick: () => navigate("/invoices"), className: "h-full w-full text-left", children: /* @__PURE__ */ jsx11(
          StatCard,
          {
            icon: IndianRupee2,
            label: "Revenue",
            value: shortInr(revenue),
            delta: kpis.revenue.delta,
            series: kpis.revenue.series,
            hint: "Value of confirmed trips"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("section", { className: "mt-8", children: [
      /* @__PURE__ */ jsx11("h2", { className: "font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900", children: "How an enquiry becomes a booking" }),
      /* @__PURE__ */ jsxs9("p", { className: "mt-0.5 text-sm text-ink-500", children: [
        "The same ",
        total,
        " enquiries at each step, so you can see where people drop off."
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "card mt-4 p-5", children: [
        /* @__PURE__ */ jsx11("div", { className: "grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center", children: journey.map((step, i) => /* @__PURE__ */ jsxs9("div", { className: "contents", children: [
          /* @__PURE__ */ jsxs9(
            "button",
            {
              onClick: () => navigate("/enquiries"),
              className: "rounded-xl border border-ink-900/[0.07] px-4 py-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40",
              children: [
                /* @__PURE__ */ jsxs9("p", { className: "eyebrow", children: [
                  "Step ",
                  i + 1
                ] }),
                /* @__PURE__ */ jsxs9("p", { className: "mt-1 flex items-baseline gap-2", children: [
                  /* @__PURE__ */ jsx11("span", { className: "font-display text-2xl font-extrabold leading-none text-ink-900 num", children: step.value }),
                  /* @__PURE__ */ jsxs9("span", { className: "text-xs font-bold text-brand-700 num", children: [
                    share(step.value),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx11("p", { className: "mt-1 text-sm font-semibold text-ink-800", children: step.label }),
                /* @__PURE__ */ jsx11("p", { className: "text-xs text-ink-500", children: step.note })
              ]
            }
          ),
          i < journey.length - 1 && /* @__PURE__ */ jsx11("span", { className: "hidden justify-center text-ink-300 lg:flex", children: /* @__PURE__ */ jsx11(ArrowRight2, { size: 18 }) })
        ] }, step.label)) }),
        /* @__PURE__ */ jsxs9("p", { className: "mt-4 border-t border-ink-900/[0.07] pt-3.5 text-sm text-ink-600", children: [
          "Out of ",
          /* @__PURE__ */ jsx11("b", { children: total }),
          " enquiries, ",
          /* @__PURE__ */ jsx11("b", { children: booked }),
          " turned into trips",
          total ? ` \u2014 that is ${share(booked)} out of every 100.` : "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("section", { className: "mt-8", children: [
      /* @__PURE__ */ jsx11("h2", { className: "font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900", children: "Money" }),
      /* @__PURE__ */ jsx11("p", { className: "mt-0.5 text-sm text-ink-500", children: "Across every invoice raised." }),
      /* @__PURE__ */ jsx11("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        { label: "Billed", value: inr(billed), note: "Total invoiced", bar: "bg-ink-400" },
        { label: "Collected", value: inr(collected), note: "Money in the bank", bar: "bg-emerald-500" },
        { label: "Still to collect", value: inr(outstanding), note: `${unpaid.length} invoices open`, bar: "bg-orange-500" },
        { label: "Upcoming departures", value: departing, note: "Trips yet to travel", bar: "bg-sky-500" }
      ].map((m) => /* @__PURE__ */ jsxs9("div", { className: "card flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx11("span", { className: `h-10 w-1 shrink-0 rounded-full ${m.bar}` }),
        /* @__PURE__ */ jsxs9("span", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx11("span", { className: "block text-sm font-semibold text-ink-500", children: m.label }),
          /* @__PURE__ */ jsx11("span", { className: "block truncate font-display text-xl font-extrabold text-ink-900 num", children: m.value }),
          /* @__PURE__ */ jsx11("span", { className: "block truncate text-xs text-ink-400", children: m.note })
        ] })
      ] }, m.label)) })
    ] }),
    /* @__PURE__ */ jsx11("section", { className: "mt-8", children: /* @__PURE__ */ jsx11(TrendReports, {}) })
  ] });
}

// src/pages/Enquiries.jsx
import { useEffect as useEffect8, useState as useState9 } from "react";
import { useNavigate as useNavigate4, useSearchParams } from "react-router-dom";
import {
  Phone,
  Mail as Mail2,
  MessageCircle,
  FileText as FileText3,
  Plus as Plus2,
  Upload,
  Pencil,
  Trash2 as Trash22,
  UserCheck,
  Tag
} from "lucide-react";

// src/components/ui/DataTable.jsx
import { useEffect as useEffect4, useMemo as useMemo4, useState as useState6 } from "react";
import {
  Search as Search2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Inbox,
  X as X4
} from "lucide-react";

// src/lib/csv.js
function downloadCsv(filename, rows, columns) {
  const cols = columns.filter((c) => c.key !== "actions" && c.header);
  const escape = (v) => {
    const s = v === void 0 || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.map((c) => escape(c.header)).join(",");
  const body = rows.map((r) => cols.map((c) => escape(c.csv ? c.csv(r) : r[c.key])).join(",")).join("\n");
  const blob = new Blob([`${head}
${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// src/components/ui/DataTable.jsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function DataTable({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = "Search\u2026",
  filters = [],
  pageSize: initialPageSize = 8,
  selectable = true,
  toolbar = null,
  bulkActions = [],
  onRowClick,
  exportName = "export",
  emptyLabel = "Nothing here yet",
  externalFilter = {},
  onClearExternal
}) {
  const [query, setQuery] = useState6("");
  const [active, setActive] = useState6({});
  const [showPanel, setShowPanel] = useState6(false);
  const [page, setPage] = useState6(1);
  const [pageSize, setPageSize] = useState6(initialPageSize);
  const [selected, setSelected] = useState6([]);
  useEffect4(() => {
    setSelected((s) => s.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);
  const filtered = useMemo4(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !q || searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
      const matchesChips = Object.entries(active).every(
        ([key, val]) => !val || String(row[key]) === val
      );
      const matchesExternal = Object.entries(externalFilter).every(
        ([key, val]) => !val || String(row[key]) === val
      );
      return matchesQuery && matchesChips && matchesExternal;
    });
  }, [rows, query, active, searchKeys, externalFilter]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);
  const clearFilter = (key) => {
    setActive((prev) => ({ ...prev, [key]: "" }));
    setPage(1);
  };
  const allOnPageSelected = slice.length > 0 && slice.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allOnPageSelected ? [] : slice.map((r) => r.id));
  const activeExternal = Object.entries(externalFilter).filter(([, v]) => v);
  const activeFilters = Object.entries(active).filter(([, v]) => v);
  return /* @__PURE__ */ jsxs10("div", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] p-3.5", children: [
      /* @__PURE__ */ jsxs10("div", { className: "relative min-w-[220px] flex-1", children: [
        /* @__PURE__ */ jsx12(Search2, { size: 15, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" }),
        /* @__PURE__ */ jsx12(
          "input",
          {
            value: query,
            onChange: (e) => {
              setQuery(e.target.value);
              setPage(1);
            },
            placeholder: searchPlaceholder,
            className: "input py-2 pl-9 pr-9"
          }
        ),
        query && /* @__PURE__ */ jsx12(
          "button",
          {
            onClick: () => setQuery(""),
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700",
            children: /* @__PURE__ */ jsx12(X4, { size: 15 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs10("span", { className: "hidden whitespace-nowrap text-xs font-semibold text-ink-500 sm:block", children: [
        filtered.length,
        " ",
        filtered.length === 1 ? "record" : "records"
      ] }),
      toolbar,
      filters.length > 0 && /* @__PURE__ */ jsxs10(
        "button",
        {
          onClick: () => setShowPanel((s) => !s),
          className: `btn py-2 ${showPanel || Object.values(active).some(Boolean) ? "bg-brand-50 text-brand-700 ring-1 ring-brand-600/20" : "btn-ghost"}`,
          children: [
            /* @__PURE__ */ jsx12(SlidersHorizontal, { size: 15 }),
            " Filters",
            Object.values(active).filter(Boolean).length > 0 && /* @__PURE__ */ jsx12("span", { className: "rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white", children: Object.values(active).filter(Boolean).length })
          ]
        }
      ),
      /* @__PURE__ */ jsxs10("button", { className: "btn-ghost py-2", onClick: () => downloadCsv(exportName, filtered, columns), children: [
        /* @__PURE__ */ jsx12(Download, { size: 15 }),
        " Export"
      ] })
    ] }),
    showPanel && filters.length > 0 && /* @__PURE__ */ jsxs10("div", { className: "grid gap-4 border-t border-ink-900/[0.07] bg-surface-soft/50 p-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      filters.map((f) => /* @__PURE__ */ jsxs10("div", { children: [
        /* @__PURE__ */ jsx12("label", { className: "label", children: f.label || f.key }),
        /* @__PURE__ */ jsxs10(
          "select",
          {
            className: "input bg-white",
            value: active[f.key] || "",
            onChange: (e) => {
              setActive((p) => ({ ...p, [f.key]: e.target.value }));
              setPage(1);
            },
            children: [
              /* @__PURE__ */ jsx12("option", { value: "", children: "All" }),
              f.options.map((o) => /* @__PURE__ */ jsx12("option", { value: o, children: o }, o))
            ]
          }
        )
      ] }, f.key)),
      /* @__PURE__ */ jsx12("div", { className: "flex items-end", children: /* @__PURE__ */ jsx12(
        "button",
        {
          className: "btn-ghost w-full",
          onClick: () => {
            setActive({});
            setPage(1);
          },
          children: "Reset filters"
        }
      ) })
    ] }),
    activeFilters.length > 0 && /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap items-center gap-2 border-b border-ink-900/[0.07] px-3.5 py-2.5", children: [
      /* @__PURE__ */ jsx12("span", { className: "eyebrow", children: "Filtered by" }),
      activeFilters.map(([key, val]) => /* @__PURE__ */ jsxs10(
        "button",
        {
          onClick: () => clearFilter(key),
          className: "chip bg-brand-50 text-brand-700 ring-1 ring-brand-600/15 hover:bg-brand-100",
          title: "Remove this filter",
          children: [
            val,
            /* @__PURE__ */ jsx12(X4, { size: 12 })
          ]
        },
        key
      )),
      /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: () => {
            setActive({});
            setPage(1);
          },
          className: "px-1 text-xs font-semibold text-ink-500 underline underline-offset-2 hover:text-brand-700",
          children: "Clear all"
        }
      )
    ] }),
    activeExternal.length > 0 && /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-2 border-b border-brand-600/15 bg-brand-50/70 px-5 py-2.5 text-sm", children: [
      /* @__PURE__ */ jsxs10("span", { className: "font-semibold text-brand-800", children: [
        "Showing only ",
        activeExternal.map(([, v]) => v).join(", ")
      ] }),
      onClearExternal && /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: onClearExternal,
          className: "ml-auto rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:text-brand-700",
          children: "Show all"
        }
      )
    ] }),
    selected.length > 0 && /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-brand-600/15 bg-brand-50 px-5 py-2.5 text-sm", children: [
      /* @__PURE__ */ jsxs10("span", { className: "font-semibold text-brand-800", children: [
        selected.length,
        " selected"
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap gap-2", children: [
        bulkActions.map(({ label, icon: Icon, onClick, danger }) => /* @__PURE__ */ jsxs10(
          "button",
          {
            onClick: () => {
              onClick(selected);
              setSelected([]);
            },
            className: `inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold transition ${danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-700 hover:text-brand-700"}`,
            children: [
              Icon && /* @__PURE__ */ jsx12(Icon, { size: 13 }),
              label
            ]
          },
          label
        )),
        /* @__PURE__ */ jsx12(
          "button",
          {
            onClick: () => setSelected([]),
            className: "rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800",
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx12("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs10("table", { className: "w-full min-w-[820px] border-collapse", children: [
      /* @__PURE__ */ jsx12("thead", { className: "sticky top-0 z-10 bg-surface-soft/95 backdrop-blur", children: /* @__PURE__ */ jsxs10("tr", { children: [
        selectable && /* @__PURE__ */ jsx12("th", { className: "w-11 border-b border-ink-900/[0.07] px-5 py-3", children: /* @__PURE__ */ jsx12(
          "input",
          {
            type: "checkbox",
            checked: allOnPageSelected,
            onChange: toggleAll,
            className: "h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-600"
          }
        ) }),
        columns.map((c) => /* @__PURE__ */ jsx12("th", { className: `th ${c.headerClass || ""}`, children: c.header }, c.key))
      ] }) }),
      /* @__PURE__ */ jsxs10("tbody", { className: "divide-y divide-ink-900/[0.07]", children: [
        slice.map((row) => /* @__PURE__ */ jsxs10(
          "tr",
          {
            onClick: () => onRowClick?.(row),
            className: `group transition-colors hover:bg-surface-soft/70 ${onRowClick ? "cursor-pointer" : ""}`,
            children: [
              selectable && /* @__PURE__ */ jsx12("td", { className: "px-5 py-3.5", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx12(
                "input",
                {
                  type: "checkbox",
                  checked: selected.includes(row.id),
                  onChange: () => setSelected(
                    (prev) => prev.includes(row.id) ? prev.filter((x) => x !== row.id) : [...prev, row.id]
                  ),
                  className: "h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-600"
                }
              ) }),
              columns.map((c) => /* @__PURE__ */ jsx12(
                "td",
                {
                  className: `td ${c.className || ""}`,
                  onClick: c.key === "actions" ? (e) => e.stopPropagation() : void 0,
                  children: c.render ? c.render(row) : row[c.key]
                },
                c.key
              ))
            ]
          },
          row.id
        )),
        slice.length === 0 && /* @__PURE__ */ jsx12("tr", { children: /* @__PURE__ */ jsxs10("td", { colSpan: columns.length + (selectable ? 1 : 0), className: "px-5 py-16 text-center", children: [
          /* @__PURE__ */ jsx12(Inbox, { size: 30, className: "mx-auto mb-3 text-ink-400" }),
          /* @__PURE__ */ jsx12("p", { className: "text-sm font-semibold text-ink-600", children: emptyLabel }),
          /* @__PURE__ */ jsx12("p", { className: "mt-1 text-xs text-ink-400", children: "Try clearing the search or filters." })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.07] bg-surface-soft/40 px-5 py-3", children: [
      /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-2 text-sm text-ink-500", children: [
        /* @__PURE__ */ jsx12("span", { children: "Rows" }),
        /* @__PURE__ */ jsx12(
          "select",
          {
            value: pageSize,
            onChange: (e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            },
            className: "rounded-lg border border-ink-900/10 bg-white px-2 py-1 text-sm font-semibold text-ink-700 outline-none",
            children: [8, 10, 25, 50].map((n) => /* @__PURE__ */ jsx12("option", { value: n, children: n }, n))
          }
        ),
        /* @__PURE__ */ jsxs10("span", { className: "ml-2", children: [
          filtered.length === 0 ? 0 : (current - 1) * pageSize + 1,
          "\u2013",
          Math.min(current * pageSize, filtered.length),
          " of ",
          filtered.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-1", children: [
        [
          { icon: ChevronsLeft, to: 1, disabled: current === 1 },
          { icon: ChevronLeft, to: current - 1, disabled: current === 1 }
        ].map(({ icon: Icon, to, disabled }, i) => /* @__PURE__ */ jsx12(
          "button",
          {
            disabled,
            onClick: () => setPage(to),
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40",
            children: /* @__PURE__ */ jsx12(Icon, { size: 16 })
          },
          i
        )),
        /* @__PURE__ */ jsxs10("span", { className: "px-3 text-sm font-semibold text-ink-700", children: [
          current,
          " / ",
          pages
        ] }),
        [
          { icon: ChevronRight, to: current + 1, disabled: current === pages },
          { icon: ChevronsRight, to: pages, disabled: current === pages }
        ].map(({ icon: Icon, to, disabled }, i) => /* @__PURE__ */ jsx12(
          "button",
          {
            disabled,
            onClick: () => setPage(to),
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40",
            children: /* @__PURE__ */ jsx12(Icon, { size: 16 })
          },
          i
        ))
      ] })
    ] })
  ] });
}

// src/components/ui/Badge.jsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var tones = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15",
  sky: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/15",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/15",
  teal: "bg-brand-50 text-brand-700 ring-1 ring-brand-600/15",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/15"
};
function Badge({ tone = "slate", children, dot = false, className = "" }) {
  return /* @__PURE__ */ jsxs11("span", { className: `chip ${tones[tone] || tones.slate} ${className}`, children: [
    dot && /* @__PURE__ */ jsx13("span", { className: "h-1.5 w-1.5 rounded-full bg-current opacity-70" }),
    children
  ] });
}

// src/components/ui/Avatar.jsx
import { jsx as jsx14 } from "react/jsx-runtime";
var palette = [
  "bg-brand-100 text-brand-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700"
];
function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function Avatar({ name = "", size = "md", className = "" }) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm"
  };
  return /* @__PURE__ */ jsx14(
    "span",
    {
      className: `grid shrink-0 place-items-center rounded-full font-bold ${palette[idx]} ${sizes[size]} ${className}`,
      title: name,
      children: initials(name)
    }
  );
}

// src/components/ui/RowMenu.jsx
import { useEffect as useEffect5, useRef as useRef4, useState as useState7 } from "react";
import { MoreHorizontal } from "lucide-react";
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
function RowMenu({ items = [] }) {
  const [open, setOpen] = useState7(false);
  const ref = useRef4(null);
  useEffect5(() => {
    if (!open) return void 0;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return /* @__PURE__ */ jsxs12("div", { className: "relative", ref, children: [
    /* @__PURE__ */ jsx15(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        },
        className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700",
        children: /* @__PURE__ */ jsx15(MoreHorizontal, { size: 15 })
      }
    ),
    open && /* @__PURE__ */ jsx15("div", { className: "absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lift ring-1 ring-ink-900/[0.07]", children: items.map(({ label, icon: Icon, onClick, danger }) => /* @__PURE__ */ jsxs12(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          setOpen(false);
          onClick();
        },
        className: `flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition ${danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-700 hover:bg-surface-soft"}`,
        children: [
          Icon && /* @__PURE__ */ jsx15(Icon, { size: 15 }),
          label
        ]
      },
      label
    )) })
  ] });
}

// src/components/ui/FormModal.jsx
import { useEffect as useEffect7, useState as useState8 } from "react";

// src/components/ui/Modal.jsx
import { useEffect as useEffect6 } from "react";
import { X as X5 } from "lucide-react";
import { jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
function Modal({ open, onClose, title, subtitle, footer, size = "lg", children }) {
  useEffect6(() => {
    if (!open) return void 0;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return /* @__PURE__ */ jsxs13("div", { className: "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6", children: [
    /* @__PURE__ */ jsx16("div", { className: "fixed inset-0 bg-ink-900/45 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxs13(
      "div",
      {
        className: `relative my-auto w-full ${widths[size]} overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]`,
        children: [
          /* @__PURE__ */ jsxs13("header", { className: "flex items-start justify-between gap-4 border-b border-ink-900/[0.07] bg-surface-soft/40 px-6 py-4", children: [
            /* @__PURE__ */ jsxs13("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx16("h2", { className: "font-display text-[1.05rem] font-extrabold leading-tight text-ink-900", children: title }),
              subtitle && /* @__PURE__ */ jsx16("p", { className: "mt-1 truncate text-sm text-ink-500", children: subtitle })
            ] }),
            /* @__PURE__ */ jsx16(
              "button",
              {
                onClick: onClose,
                className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-900/5 hover:text-ink-900",
                children: /* @__PURE__ */ jsx16(X5, { size: 17 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx16("div", { className: "max-h-[65vh] overflow-y-auto px-6 py-5", children }),
          footer && /* @__PURE__ */ jsx16("footer", { className: "flex flex-wrap items-center justify-end gap-2 border-t border-ink-900/[0.07] bg-surface-soft/40 px-6 py-3.5", children: footer })
        ]
      }
    )
  ] });
}

// src/components/ui/FormModal.jsx
import { Fragment as Fragment3, jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  fields,
  initial = {},
  submitLabel = "Save",
  size = "lg"
}) {
  const [values, setValues] = useState8(initial);
  const [errors, setErrors] = useState8({});
  useEffect7(() => {
    if (open) {
      const defaults = {};
      fields.forEach((f) => {
        if (initial[f.name] !== void 0) defaults[f.name] = initial[f.name];
        else if (f.type === "select") defaults[f.name] = f.options?.[0] ?? "";
        else defaults[f.name] = "";
      });
      setValues(defaults);
      setErrors({});
    }
  }, [open]);
  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };
  const submit = () => {
    const next = {};
    fields.forEach((f) => {
      if (f.required && String(values[f.name] ?? "").trim() === "") next[f.name] = "Required";
    });
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    const cleaned = { ...values };
    fields.forEach((f) => {
      if (f.type === "number") cleaned[f.name] = Number(cleaned[f.name] || 0);
    });
    onSubmit(cleaned);
    onClose();
  };
  return /* @__PURE__ */ jsx17(
    Modal,
    {
      open,
      onClose,
      title,
      subtitle,
      size,
      footer: /* @__PURE__ */ jsxs14(Fragment3, { children: [
        /* @__PURE__ */ jsx17("button", { className: "btn-ghost", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx17("button", { className: "btn-primary", onClick: submit, children: submitLabel })
      ] }),
      children: /* @__PURE__ */ jsx17("div", { className: "grid gap-5 sm:grid-cols-2", children: fields.map((f) => /* @__PURE__ */ jsxs14("div", { className: f.full ? "sm:col-span-2" : "", children: [
        /* @__PURE__ */ jsxs14("label", { className: "label", htmlFor: f.name, children: [
          f.label,
          f.required && /* @__PURE__ */ jsx17("span", { className: "ml-1 text-coral", children: "*" })
        ] }),
        f.type === "select" ? /* @__PURE__ */ jsx17(
          "select",
          {
            id: f.name,
            className: "input",
            value: values[f.name] ?? "",
            onChange: (e) => set(f.name, e.target.value),
            children: f.options.map((o) => /* @__PURE__ */ jsx17("option", { value: o, children: o }, o))
          }
        ) : f.type === "textarea" ? /* @__PURE__ */ jsx17(
          "textarea",
          {
            id: f.name,
            className: "input min-h-[92px] resize-y",
            placeholder: f.placeholder,
            value: values[f.name] ?? "",
            onChange: (e) => set(f.name, e.target.value)
          }
        ) : /* @__PURE__ */ jsx17(
          "input",
          {
            id: f.name,
            type: f.type === "number" ? "number" : f.type === "date" ? "date" : "text",
            className: "input",
            placeholder: f.placeholder,
            value: values[f.name] ?? "",
            onChange: (e) => set(f.name, e.target.value)
          }
        ),
        errors[f.name] ? /* @__PURE__ */ jsx17("p", { className: "mt-1.5 text-xs font-semibold text-rose-600", children: errors[f.name] }) : f.help && /* @__PURE__ */ jsx17("p", { className: "mt-1.5 text-xs text-ink-400", children: f.help })
      ] }, f.name)) })
    }
  );
}

// src/components/ui/ConfirmDialog.jsx
import { AlertTriangle } from "lucide-react";
import { Fragment as Fragment4, jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  tone = "danger"
}) {
  return /* @__PURE__ */ jsx18(
    Modal,
    {
      open,
      onClose,
      title,
      size: "sm",
      footer: /* @__PURE__ */ jsxs15(Fragment4, { children: [
        /* @__PURE__ */ jsx18("button", { className: "btn-ghost", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx18(
          "button",
          {
            className: `btn text-white ${tone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-600 hover:bg-brand-700"}`,
            onClick: () => {
              onConfirm();
              onClose();
            },
            children: confirmLabel
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxs15("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx18(
          "span",
          {
            className: `grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-600"}`,
            children: /* @__PURE__ */ jsx18(AlertTriangle, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx18("p", { className: "text-sm leading-relaxed text-ink-600", children: message })
      ] })
    }
  );
}

// src/pages/Enquiries.jsx
import { Fragment as Fragment5, jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
var SOURCES = ["Instagram", "Website", "Google Ads", "Referral", "Walk-in", "WhatsApp"];
var LABELS = ["Honeymoon", "Family", "Luxury", "Group", "Adventure", "Beach", "Couple", "Shopping"];
var digits = (phone) => String(phone).replace(/[^\d]/g, "");
function Enquiries() {
  const navigate = useNavigate4();
  const [params, setParams] = useSearchParams();
  const { enquiries: enquiries2, team: team2, owner, create, update, updateMany, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState9(false);
  const [editing, setEditing] = useState9(null);
  const [confirm, setConfirm] = useState9(null);
  const [importOpen, setImportOpen] = useState9(false);
  const [assignFor, setAssignFor] = useState9(null);
  const [statusFor, setStatusFor] = useState9(null);
  const [pipeline, setPipeline] = useState9("");
  useEffect8(() => {
    if (params.get("new")) {
      setEditing(null);
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);
  const rows = byOwner(enquiries2, owner);
  const owners = ["Unassigned", ...team2.filter((t) => t.bookings > 0).map((t) => t.name.split(" ")[0])];
  const fields = [
    { name: "name", label: "Client name", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "+91 " },
    { name: "email", label: "Email", type: "email" },
    { name: "destination", label: "Destination", type: "text", required: true },
    { name: "pax", label: "Travellers", type: "number", required: true },
    { name: "travelDate", label: "Travel date", type: "text", placeholder: "18 Sep 2026" },
    { name: "budget", label: "Budget (\u20B9)", type: "number" },
    { name: "status", label: "Status", type: "select", options: enquiryStatuses },
    { name: "source", label: "Source", type: "select", options: SOURCES },
    { name: "label", label: "Label", type: "select", options: LABELS },
    { name: "owner", label: "Assign to", type: "select", options: owners }
  ];
  const saveEnquiry = (values) => {
    if (editing) update("enquiries", editing.id, values);
    else create("enquiries", { ...values, created: "04 Aug 2026" });
  };
  const makeQuote = (row) => {
    const id = create("quotations", {
      customer: row.name,
      pkg: `${row.destination} custom itinerary`,
      pax: row.pax,
      amount: row.budget,
      validTill: "31 Aug 2026",
      status: "Draft",
      owner: row.owner === "Unassigned" ? "Sneha" : row.owner
    });
    update("enquiries", row.id, { status: "Quoted" }, { silent: true });
    toast(`Quotation ${id} drafted for ${row.name}`);
    navigate("/quotations");
  };
  const columns = [
    {
      key: "name",
      header: "Client",
      csv: (r) => r.name,
      render: (r) => /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx19(Avatar, { name: r.name, size: "sm" }),
        /* @__PURE__ */ jsxs16("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx19("p", { className: "truncate font-bold text-ink-900", children: r.name }),
          /* @__PURE__ */ jsx19("p", { className: "truncate text-xs text-ink-500", children: r.phone })
        ] })
      ] })
    },
    {
      key: "status",
      header: "Status",
      render: (r) => /* @__PURE__ */ jsx19(Badge, { tone: statusTone[r.status], dot: true, children: r.status })
    },
    {
      key: "destination",
      header: "Destination",
      render: (r) => /* @__PURE__ */ jsxs16("div", { children: [
        /* @__PURE__ */ jsx19("p", { className: "font-semibold text-ink-800", children: r.destination }),
        /* @__PURE__ */ jsxs16("p", { className: "text-xs text-ink-500", children: [
          r.pax,
          " pax \xB7 ",
          r.travelDate
        ] })
      ] })
    },
    {
      key: "budget",
      header: "Budget",
      render: (r) => /* @__PURE__ */ jsx19("span", { className: "font-bold text-ink-900", children: inr(r.budget) })
    },
    { key: "source", header: "Source", render: (r) => /* @__PURE__ */ jsx19("span", { className: "text-ink-600", children: r.source }) },
    { key: "label", header: "Label", render: (r) => /* @__PURE__ */ jsx19(Badge, { tone: "teal", children: r.label }) },
    {
      key: "owner",
      header: "Owner",
      render: (r) => r.owner === "Unassigned" ? /* @__PURE__ */ jsx19(
        "button",
        {
          onClick: () => setAssignFor([r.id]),
          className: "text-xs font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700",
          children: "Unassigned"
        }
      ) : /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx19(Avatar, { name: r.owner, size: "sm" }),
        /* @__PURE__ */ jsx19("span", { className: "font-semibold text-ink-700", children: r.owner })
      ] })
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx19(
          "a",
          {
            href: `tel:${digits(r.phone)}`,
            title: "Call",
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx19(Phone, { size: 14, strokeWidth: 2.3 })
          }
        ),
        /* @__PURE__ */ jsx19(
          "a",
          {
            href: `https://wa.me/${digits(r.phone)}?text=${encodeURIComponent(
              `Hi ${r.name}, thanks for your ${r.destination} enquiry with Smira Club!`
            )}`,
            target: "_blank",
            rel: "noreferrer",
            title: "WhatsApp",
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx19(MessageCircle, { size: 14, strokeWidth: 2.3 })
          }
        ),
        /* @__PURE__ */ jsx19(
          "a",
          {
            href: `mailto:${r.email}?subject=${encodeURIComponent(`Your ${r.destination} trip`)}`,
            title: "Email",
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-sky-500 hover:text-sky-600",
            children: /* @__PURE__ */ jsx19(Mail2, { size: 14, strokeWidth: 2.3 })
          }
        ),
        /* @__PURE__ */ jsx19(
          "button",
          {
            onClick: () => makeQuote(r),
            title: "Create quotation",
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-violet-500 hover:text-violet-600",
            children: /* @__PURE__ */ jsx19(FileText3, { size: 14, strokeWidth: 2.3 })
          }
        ),
        /* @__PURE__ */ jsx19(
          RowMenu,
          {
            items: [
              { label: "Edit", icon: Pencil, onClick: () => {
                setEditing(r);
                setFormOpen(true);
              } },
              { label: "Assign owner", icon: UserCheck, onClick: () => setAssignFor([r.id]) },
              { label: "Change status", icon: Tag, onClick: () => setStatusFor([r.id]) },
              { label: "Delete", icon: Trash22, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  const counts = enquiryStatuses.map((s) => ({ status: s, n: rows.filter((e) => e.status === s).length }));
  return /* @__PURE__ */ jsxs16(Fragment5, { children: [
    /* @__PURE__ */ jsxs16(PageHeader, { title: "Enquiries", subtitle: `${rows.length} enquiries in your pipeline`, children: [
      /* @__PURE__ */ jsxs16("button", { className: "btn-ghost", onClick: () => setImportOpen(true), children: [
        /* @__PURE__ */ jsx19(Upload, { size: 16 }),
        " Import"
      ] }),
      /* @__PURE__ */ jsxs16(
        "button",
        {
          className: "btn-primary",
          onClick: () => {
            setEditing(null);
            setFormOpen(true);
          },
          children: [
            /* @__PURE__ */ jsx19(Plus2, { size: 16 }),
            " Add enquiry"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx19("div", { className: "mb-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6", children: counts.map(({ status, n }) => /* @__PURE__ */ jsxs16(
      "button",
      {
        onClick: () => setPipeline((p) => p === status ? "" : status),
        className: `card card-hover px-4 py-3.5 text-left transition ${pipeline === status ? "ring-2 ring-brand-500" : ""}`,
        children: [
          /* @__PURE__ */ jsx19(Badge, { tone: statusTone[status], children: status }),
          /* @__PURE__ */ jsx19("p", { className: "mt-2 font-display text-2xl font-extrabold", children: n })
        ]
      },
      status
    )) }),
    /* @__PURE__ */ jsx19(
      DataTable,
      {
        columns,
        rows,
        searchKeys: ["name", "phone", "email", "destination", "id"],
        searchPlaceholder: "Search by name, phone, email or destination\u2026",
        filters: [
          { key: "status", label: "Status", options: enquiryStatuses },
          { key: "source", label: "Source", options: SOURCES },
          { key: "label", label: "Label", options: LABELS },
          { key: "owner", label: "Owner", options: owners }
        ],
        externalFilter: { status: pipeline },
        onClearExternal: () => setPipeline(""),
        exportName: "smira-club-enquiries",
        emptyLabel: "No enquiries match this view",
        onRowClick: (r) => {
          setEditing(r);
          setFormOpen(true);
        },
        bulkActions: [
          { label: "Assign", icon: UserCheck, onClick: (ids) => setAssignFor(ids) },
          { label: "Change status", icon: Tag, onClick: (ids) => setStatusFor(ids) },
          { label: "Delete", icon: Trash22, danger: true, onClick: (ids) => setConfirm(ids) }
        ]
      }
    ),
    /* @__PURE__ */ jsx19(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: saveEnquiry,
        title: editing ? `Edit ${editing.id}` : "Add enquiry",
        subtitle: editing ? editing.name : "Capture a new travel enquiry",
        fields,
        initial: editing || { status: "New", owner: "Unassigned" },
        submitLabel: editing ? "Save changes" : "Create enquiry"
      }
    ),
    /* @__PURE__ */ jsx19(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("enquiries", confirm),
        title: "Delete enquiries?",
        message: `This removes ${confirm?.length || 0} enquiry record${confirm?.length === 1 ? "" : "s"} from the pipeline. This cannot be undone.`
      }
    ),
    /* @__PURE__ */ jsx19(
      Modal,
      {
        open: Boolean(assignFor),
        onClose: () => setAssignFor(null),
        title: "Assign owner",
        subtitle: `${assignFor?.length || 0} enquiry(s) selected`,
        size: "sm",
        children: /* @__PURE__ */ jsx19("div", { className: "space-y-2", children: owners.map((o) => /* @__PURE__ */ jsxs16(
          "button",
          {
            onClick: () => {
              updateMany("enquiries", assignFor, { owner: o }, `Assigned to ${o}`);
              setAssignFor(null);
            },
            className: "flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50",
            children: [
              /* @__PURE__ */ jsx19(Avatar, { name: o, size: "sm" }),
              /* @__PURE__ */ jsx19("span", { className: "font-semibold text-ink-800", children: o })
            ]
          },
          o
        )) })
      }
    ),
    /* @__PURE__ */ jsx19(
      Modal,
      {
        open: Boolean(statusFor),
        onClose: () => setStatusFor(null),
        title: "Change status",
        subtitle: `${statusFor?.length || 0} enquiry(s) selected`,
        size: "sm",
        children: /* @__PURE__ */ jsx19("div", { className: "space-y-2", children: enquiryStatuses.map((s) => /* @__PURE__ */ jsx19(
          "button",
          {
            onClick: () => {
              updateMany("enquiries", statusFor, { status: s }, `Status set to ${s}`);
              setStatusFor(null);
            },
            className: "flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50",
            children: /* @__PURE__ */ jsx19(Badge, { tone: statusTone[s], dot: true, children: s })
          },
          s
        )) })
      }
    ),
    /* @__PURE__ */ jsx19(
      Modal,
      {
        open: importOpen,
        onClose: () => setImportOpen(false),
        title: "Import enquiries",
        subtitle: "Upload a CSV exported from your old CRM",
        size: "md",
        footer: /* @__PURE__ */ jsxs16(Fragment5, { children: [
          /* @__PURE__ */ jsx19("button", { className: "btn-ghost", onClick: () => setImportOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx19(
            "button",
            {
              className: "btn-primary",
              onClick: () => {
                setImportOpen(false);
                toast("Import queued \u2014 we will email you when it finishes", "info");
              },
              children: "Start import"
            }
          )
        ] }),
        children: /* @__PURE__ */ jsxs16("label", { className: "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-900/15 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40", children: [
          /* @__PURE__ */ jsx19(Upload, { size: 26, className: "mb-3 text-ink-400" }),
          /* @__PURE__ */ jsx19("span", { className: "text-sm font-bold text-ink-800", children: "Click to choose a CSV file" }),
          /* @__PURE__ */ jsx19("span", { className: "mt-1 text-xs text-ink-500", children: "Columns: name, phone, email, destination, pax, budget" }),
          /* @__PURE__ */ jsx19(
            "input",
            {
              type: "file",
              accept: ".csv",
              className: "hidden",
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) toast(`${file.name} ready to import`, "info");
              }
            }
          )
        ] })
      }
    )
  ] });
}

// src/pages/Bookings.jsx
import { useState as useState10 } from "react";
import { Plus as Plus3, CalendarCheck as CalendarCheck4, Wallet as Wallet4, Users as Users4, TrendingUp as TrendingUp3, Pencil as Pencil2, Trash2 as Trash23, Tag as Tag2, Receipt } from "lucide-react";
import { Fragment as Fragment6, jsx as jsx20, jsxs as jsxs17 } from "react/jsx-runtime";
var STATUSES = ["Confirmed", "Part paid", "Pending", "Completed", "Cancelled"];
function Bookings() {
  const { bookings: bookings2, packages: packages2, team: team2, owner, create, update, updateMany, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState10(false);
  const [editing, setEditing] = useState10(null);
  const [confirm, setConfirm] = useState10(null);
  const [statusFor, setStatusFor] = useState10(null);
  const rows = byOwner(bookings2, owner);
  const consultants = team2.filter((t) => t.bookings > 0).map((t) => t.name.split(" ")[0]);
  const booked = rows.reduce((s, b) => s + b.amount, 0);
  const collected = rows.reduce((s, b) => s + b.paid, 0);
  const pax = rows.reduce((s, b) => s + b.pax, 0);
  const fields = [
    { name: "customer", label: "Customer", type: "text", required: true },
    { name: "pkg", label: "Package", type: "select", options: packages2.map((p) => p.name) },
    { name: "destination", label: "Destination", type: "text", required: true },
    { name: "departure", label: "Departure", type: "text", required: true, placeholder: "20 Aug 2026" },
    { name: "nights", label: "Nights", type: "number" },
    { name: "pax", label: "Travellers", type: "number", required: true },
    { name: "amount", label: "Total value (\u20B9)", type: "number", required: true },
    { name: "paid", label: "Amount paid (\u20B9)", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUSES },
    { name: "owner", label: "Consultant", type: "select", options: consultants }
  ];
  const save = (values) => {
    if (editing) update("bookings", editing.id, values);
    else create("bookings", values);
  };
  const raiseInvoice = (r) => {
    const id = create("invoices", {
      customer: r.customer,
      booking: r.id,
      issued: "04 Aug 2026",
      due: "18 Aug 2026",
      amount: r.amount,
      paid: r.paid,
      status: r.paid >= r.amount ? "Paid" : r.paid > 0 ? "Partial" : "Overdue"
    });
    toast(`Invoice ${id} raised for ${r.customer}`);
  };
  const columns = [
    {
      key: "id",
      header: "Booking",
      render: (r) => /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("p", { className: "font-bold text-brand-700", children: r.id }),
        /* @__PURE__ */ jsx20("p", { className: "text-xs text-ink-500", children: r.customer })
      ] })
    },
    {
      key: "pkg",
      header: "Package",
      render: (r) => /* @__PURE__ */ jsxs17("div", { className: "min-w-[180px]", children: [
        /* @__PURE__ */ jsx20("p", { className: "font-semibold text-ink-800", children: r.pkg }),
        /* @__PURE__ */ jsx20("p", { className: "text-xs text-ink-500", children: r.destination })
      ] })
    },
    {
      key: "departure",
      header: "Departure",
      render: (r) => /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("p", { className: "font-semibold text-ink-800", children: r.departure }),
        /* @__PURE__ */ jsxs17("p", { className: "text-xs text-ink-500", children: [
          r.nights,
          " nights \xB7 ",
          r.pax,
          " pax"
        ] })
      ] })
    },
    { key: "amount", header: "Value", render: (r) => /* @__PURE__ */ jsx20("span", { className: "font-bold text-ink-900", children: inr(r.amount) }) },
    {
      key: "paid",
      header: "Collection",
      render: (r) => {
        const pct = r.amount ? Math.round(r.paid / r.amount * 100) : 0;
        return /* @__PURE__ */ jsxs17("div", { className: "min-w-[130px]", children: [
          /* @__PURE__ */ jsxs17("div", { className: "mb-1 flex justify-between text-xs", children: [
            /* @__PURE__ */ jsx20("span", { className: "font-semibold text-ink-700", children: inr(r.paid) }),
            /* @__PURE__ */ jsxs17("span", { className: "text-ink-400", children: [
              pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx20("div", { className: "h-1.5 overflow-hidden rounded-full bg-surface-soft", children: /* @__PURE__ */ jsx20(
            "div",
            {
              className: `h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-amber-500"}`,
              style: { width: `${Math.min(pct, 100)}%` }
            }
          ) })
        ] });
      }
    },
    {
      key: "status",
      header: "Status",
      render: (r) => /* @__PURE__ */ jsx20(Badge, { tone: bookingStatusTone[r.status], dot: true, children: r.status })
    },
    { key: "owner", header: "Consultant", render: (r) => /* @__PURE__ */ jsx20("span", { className: "font-semibold text-ink-700", children: r.owner }) },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsx20(
        RowMenu,
        {
          items: [
            { label: "Edit booking", icon: Pencil2, onClick: () => {
              setEditing(r);
              setFormOpen(true);
            } },
            { label: "Change status", icon: Tag2, onClick: () => setStatusFor([r.id]) },
            { label: "Raise invoice", icon: Receipt, onClick: () => raiseInvoice(r) },
            { label: "Delete", icon: Trash23, danger: true, onClick: () => setConfirm([r.id]) }
          ]
        }
      )
    }
  ];
  return /* @__PURE__ */ jsxs17(Fragment6, { children: [
    /* @__PURE__ */ jsx20(PageHeader, { title: "Bookings", subtitle: "Every confirmed and in-progress trip", children: /* @__PURE__ */ jsxs17(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx20(Plus3, { size: 16 }),
          " New booking"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs17("div", { className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx20(StatCard, { icon: CalendarCheck4, label: "Total bookings", value: rows.length, skin: "brand" }),
      /* @__PURE__ */ jsx20(StatCard, { icon: TrendingUp3, label: "Booked value", value: shortInr(booked) }),
      /* @__PURE__ */ jsx20(StatCard, { icon: Wallet4, label: "Collected", value: shortInr(collected) }),
      /* @__PURE__ */ jsx20(StatCard, { icon: Users4, label: "Travellers", value: pax })
    ] }),
    /* @__PURE__ */ jsx20(
      DataTable,
      {
        columns,
        rows,
        searchKeys: ["id", "customer", "pkg", "destination"],
        searchPlaceholder: "Search by booking ID, customer or package\u2026",
        filters: [
          { key: "status", label: "Status", options: STATUSES },
          { key: "owner", label: "Consultant", options: consultants }
        ],
        exportName: "smira-club-bookings",
        emptyLabel: "No bookings match this view",
        onRowClick: (r) => {
          setEditing(r);
          setFormOpen(true);
        },
        bulkActions: [
          { label: "Change status", icon: Tag2, onClick: (ids) => setStatusFor(ids) },
          { label: "Delete", icon: Trash23, danger: true, onClick: (ids) => setConfirm(ids) }
        ]
      }
    ),
    /* @__PURE__ */ jsx20(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.id}` : "New booking",
        subtitle: editing ? editing.customer : "Confirm a trip for a customer",
        fields,
        initial: editing || { status: "Pending", paid: 0 },
        submitLabel: editing ? "Save changes" : "Create booking"
      }
    ),
    /* @__PURE__ */ jsx20(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("bookings", confirm),
        title: "Delete bookings?",
        message: `This removes ${confirm?.length || 0} booking(s). Linked invoices stay untouched.`
      }
    ),
    /* @__PURE__ */ jsx20(
      Modal,
      {
        open: Boolean(statusFor),
        onClose: () => setStatusFor(null),
        title: "Change booking status",
        size: "sm",
        children: /* @__PURE__ */ jsx20("div", { className: "space-y-2", children: STATUSES.map((s) => /* @__PURE__ */ jsx20(
          "button",
          {
            onClick: () => {
              updateMany("bookings", statusFor, { status: s }, `Status set to ${s}`);
              setStatusFor(null);
            },
            className: "flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50",
            children: /* @__PURE__ */ jsx20(Badge, { tone: bookingStatusTone[s], dot: true, children: s })
          },
          s
        )) })
      }
    )
  ] });
}

// src/pages/Packages.jsx
import { useState as useState11 } from "react";
import { Plus as Plus4, Star, Moon, MapPin, Users as Users5, Pencil as Pencil3, Copy, Search as Search3, Trash2 as Trash24, CalendarDays } from "lucide-react";
import { Fragment as Fragment7, jsx as jsx21, jsxs as jsxs18 } from "react/jsx-runtime";
var TYPES = ["Honeymoon", "Luxury", "Family", "Group", "Adventure", "City break"];
var GRADIENTS = [
  "from-brand-500 to-ocean",
  "from-ocean to-grape",
  "from-brand-600 to-brand-300",
  "from-gold to-coral",
  "from-grape to-ocean",
  "from-coral to-gold"
];
function Packages() {
  const { packages: packages2, create, update, remove, duplicate } = useApp();
  const [type, setType] = useState11("All");
  const [query, setQuery] = useState11("");
  const [formOpen, setFormOpen] = useState11(false);
  const [editing, setEditing] = useState11(null);
  const [confirm, setConfirm] = useState11(null);
  const list = packages2.filter(
    (p) => (type === "All" || p.type === type) && `${p.name} ${p.destination}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  const fields = [
    { name: "name", label: "Package name", type: "text", required: true, full: true },
    { name: "destination", label: "Destination", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: TYPES },
    { name: "startDate", label: "Departure date", type: "date", required: true },
    { name: "days", label: "Days", type: "number", required: true, help: "Usually one more than the nights" },
    { name: "nights", label: "Nights", type: "number", required: true },
    { name: "price", label: "Price per person (\u20B9)", type: "number", required: true },
    { name: "seats", label: "Seats available", type: "number" },
    { name: "rating", label: "Rating", type: "number", placeholder: "4.5" }
  ];
  const save = (values) => {
    const withDays = { ...values, days: Number(values.days) || Number(values.nights) + 1 };
    if (editing) {
      update("packages", editing.id, withDays);
    } else {
      create("packages", {
        ...withDays,
        sold: 0,
        rating: values.rating || 4.5,
        gradient: GRADIENTS[packages2.length % GRADIENTS.length]
      });
    }
  };
  return /* @__PURE__ */ jsxs18(Fragment7, { children: [
    /* @__PURE__ */ jsx21(PageHeader, { title: "Packages", subtitle: "Ready-to-sell itineraries with live pricing", children: /* @__PURE__ */ jsxs18(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx21(Plus4, { size: 16 }),
          " Create package"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs18("div", { className: "card mb-6 flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxs18("div", { className: "relative min-w-[240px] flex-1", children: [
        /* @__PURE__ */ jsx21(Search3, { size: 16, className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" }),
        /* @__PURE__ */ jsx21(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search packages or destinations\u2026",
            className: "input pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsx21("div", { className: "no-scrollbar flex gap-2 overflow-x-auto", children: ["All", ...TYPES].map((t) => /* @__PURE__ */ jsx21(
        "button",
        {
          onClick: () => setType(t),
          className: `shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${type === t ? "bg-ink-900 text-white" : "border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"}`,
          children: t
        },
        t
      )) })
    ] }),
    /* @__PURE__ */ jsx21("div", { className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", children: list.map((p) => /* @__PURE__ */ jsxs18("article", { className: "card card-hover group overflow-hidden", children: [
      /* @__PURE__ */ jsxs18("div", { className: `relative h-32 bg-gradient-to-br ${p.gradient || GRADIENTS[0]}`, children: [
        /* @__PURE__ */ jsx21("div", { className: "absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.35),transparent_60%)]" }),
        /* @__PURE__ */ jsxs18("div", { className: "absolute left-4 top-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx21("span", { className: "chip bg-white/25 text-white backdrop-blur", children: p.type }),
          p.startDate && /* @__PURE__ */ jsxs18("span", { className: "chip bg-white/25 text-white backdrop-blur", children: [
            /* @__PURE__ */ jsx21(CalendarDays, { size: 12 }),
            " ",
            formatDate(p.startDate)
          ] })
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "absolute right-4 top-4 chip bg-white/90 text-ink-900", children: [
          /* @__PURE__ */ jsx21(Star, { size: 12, className: "fill-amber-400 text-amber-400" }),
          p.rating
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "absolute bottom-3 left-4 right-4", children: [
          /* @__PURE__ */ jsx21("p", { className: "truncate font-display text-lg font-extrabold text-white drop-shadow", children: p.name }),
          /* @__PURE__ */ jsxs18("p", { className: "flex items-center gap-1.5 text-xs font-semibold text-white/85", children: [
            /* @__PURE__ */ jsx21(MapPin, { size: 12 }),
            " ",
            p.destination
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxs18("div", { className: "flex items-end justify-between gap-3", children: [
          /* @__PURE__ */ jsxs18("div", { children: [
            /* @__PURE__ */ jsx21("p", { className: "text-xs font-semibold uppercase tracking-wide text-ink-400", children: "Starting from" }),
            /* @__PURE__ */ jsx21("p", { className: "font-display text-2xl font-extrabold text-ink-900", children: inr(p.price) }),
            /* @__PURE__ */ jsx21("p", { className: "text-xs text-ink-500", children: "per person" })
          ] }),
          /* @__PURE__ */ jsxs18("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs18("p", { className: "flex items-center justify-end gap-1.5 whitespace-nowrap text-sm font-semibold text-ink-700", children: [
              /* @__PURE__ */ jsx21(Moon, { size: 14, className: "shrink-0 text-ink-400" }),
              p.days || p.nights + 1,
              " days \xB7 ",
              p.nights,
              " nights"
            ] }),
            /* @__PURE__ */ jsxs18("p", { className: "mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-ink-700", children: [
              /* @__PURE__ */ jsx21(Users5, { size: 14, className: "text-ink-400" }),
              " ",
              p.sold,
              " sold"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "mt-4 flex items-center justify-between gap-3 border-t border-ink-900/[0.07] pt-4", children: [
          /* @__PURE__ */ jsxs18(Badge, { tone: p.seats <= 8 ? "rose" : "green", dot: true, children: [
            p.seats,
            " seats left"
          ] }),
          /* @__PURE__ */ jsxs18("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsx21(
              "button",
              {
                onClick: () => duplicate("packages", p.id),
                className: "icon-btn",
                title: "Duplicate",
                children: /* @__PURE__ */ jsx21(Copy, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsx21(
              "button",
              {
                onClick: () => {
                  setEditing(p);
                  setFormOpen(true);
                },
                className: "icon-btn",
                title: "Edit",
                children: /* @__PURE__ */ jsx21(Pencil3, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsx21(
              "button",
              {
                onClick: () => setConfirm(p),
                className: "icon-btn-danger",
                title: "Delete",
                children: /* @__PURE__ */ jsx21(Trash24, { size: 14 })
              }
            )
          ] })
        ] })
      ] })
    ] }, p.id)) }),
    list.length === 0 && /* @__PURE__ */ jsxs18("div", { className: "card p-16 text-center", children: [
      /* @__PURE__ */ jsx21("p", { className: "text-sm font-semibold text-ink-600", children: "No packages match this filter" }),
      /* @__PURE__ */ jsx21(
        "button",
        {
          className: "btn-soft mx-auto mt-4",
          onClick: () => {
            setQuery("");
            setType("All");
          },
          children: "Clear filters"
        }
      )
    ] }),
    /* @__PURE__ */ jsx21(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.name}` : "Create package",
        subtitle: editing ? editing.id : "Add a sellable itinerary to your catalogue",
        fields,
        initial: editing || { type: "Family", seats: 20, rating: 4.5 },
        submitLabel: editing ? "Save changes" : "Create package"
      }
    ),
    /* @__PURE__ */ jsx21(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("packages", confirm.id),
        title: "Delete package?",
        message: `\u201C${confirm?.name}\u201D will be removed from the catalogue. Existing bookings keep their package name.`
      }
    )
  ] });
}

// src/pages/Memberships.jsx
import { useState as useState12 } from "react";
import {
  Plus as Plus5,
  Crown as Crown2,
  Check,
  X as X6,
  Pencil as Pencil4,
  Trash2 as Trash25,
  Globe,
  EyeOff,
  Sparkles,
  UserPlus,
  IndianRupee as IndianRupee3,
  ShieldCheck as ShieldCheck2,
  Gift
} from "lucide-react";
import { Fragment as Fragment8, jsx as jsx22, jsxs as jsxs19 } from "react/jsx-runtime";
var BILLING = ["Yearly", "Half-yearly", "Monthly", "Lifetime"];
var ACCENTS = {
  slate: { gradient: "from-slate-600 to-slate-800" },
  amber: { gradient: "from-amber-500 to-orange-600" },
  violet: { gradient: "from-violet-600 to-indigo-700" },
  brand: { gradient: "from-brand-600 to-ocean" },
  sky: { gradient: "from-sky-600 to-ocean" }
};
var ACCENT_KEYS = ["brand", "sky", "amber", "violet", "slate"];
var VARIANTS = {
  plain: {
    card: "card",
    head: "bg-white px-5 pb-5 pt-5",
    tile: "bg-slate-100 text-slate-600",
    name: "text-ink-900",
    id: "text-ink-500",
    tagline: "text-ink-500",
    price: "text-ink-900",
    note: "text-ink-500",
    pill: "bg-slate-100 text-slate-600"
  },
  highlight: {
    card: "card ring-2 ring-amber-400 shadow-raised xl:-mt-3 xl:mb-3",
    head: "bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-500/25 px-5 pb-5 pt-5",
    tile: "bg-amber-400 text-white",
    name: "text-ink-900",
    id: "text-amber-700",
    tagline: "text-ink-600",
    price: "text-ink-900",
    note: "text-amber-800",
    pill: "bg-amber-100 text-amber-800"
  },
  premium: {
    card: "card",
    head: "bg-gradient-to-br from-ink-900 via-ink-800 to-grape px-5 pb-5 pt-5",
    tile: "bg-white/15 text-white",
    name: "text-white",
    id: "text-white/55",
    tagline: "text-white/70",
    price: "text-white",
    note: "text-white/70",
    pill: "bg-white/15 text-white"
  }
};
var VISITORS = [
  { name: "Pooja Ramteke", email: "pooja.r@gmail.com", phone: "+91 98700 41182", city: "Nagpur" },
  { name: "Imran Shaikh", email: "imran.shaikh@gmail.com", phone: "+91 99870 22314", city: "Mumbai" },
  { name: "Kavya Reddy", email: "kavya.reddy@outlook.com", phone: "+91 97411 55093", city: "Bengaluru" },
  { name: "Harsh Vora", email: "harsh.vora@gmail.com", phone: "+91 98250 77410", city: "Ahmedabad" }
];
function Eyebrow({ children }) {
  return /* @__PURE__ */ jsx22("p", { className: "eyebrow", children });
}
function Switch({ on }) {
  return /* @__PURE__ */ jsx22(
    "span",
    {
      className: `relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-ink-900/15"}`,
      children: /* @__PURE__ */ jsx22(
        "span",
        {
          className: `absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`
        }
      )
    }
  );
}
function Memberships() {
  const {
    memberships: memberships2,
    memberSignups: memberSignups2,
    settings,
    create,
    update,
    remove,
    toast,
    receiveMemberSignup
  } = useApp();
  const [formOpen, setFormOpen] = useState12(false);
  const [editing, setEditing] = useState12(null);
  const [confirm, setConfirm] = useState12(null);
  const [draftFeature, setDraftFeature] = useState12({});
  const [draftGift, setDraftGift] = useState12({});
  const dearest = Math.max(0, ...memberships2.map((p) => Number(p.price) || 0));
  const variantOf = (plan) => {
    if (plan.popular) return "highlight";
    if (memberships2.length > 1 && Number(plan.price) === dearest) return "premium";
    return "plain";
  };
  const published = memberships2.filter((p) => p.published);
  const activeMembers = memberSignups2.filter((s) => s.status === "Active").length;
  const membershipRevenue = memberSignups2.filter((s) => s.status !== "Cancelled").reduce((sum, s) => {
    const plan = memberships2.find((p) => p.id === s.planId);
    return sum + (plan ? membershipAmount(plan, s.members).total : 0);
  }, 0);
  const planFields = [
    { name: "name", label: "Plan name", type: "text", required: true },
    { name: "billing", label: "Billing cycle", type: "select", options: BILLING },
    { name: "price", label: "Price per member (\u20B9)", type: "number", required: true },
    { name: "discount", label: "Package discount (%)", type: "number", help: "Members get this off every package" },
    { name: "tagline", label: "Tagline shown on the website", type: "text", full: true }
  ];
  const savePlan = (values) => {
    if (editing) {
      update("memberships", editing.id, values);
    } else {
      const accent = ACCENT_KEYS[memberships2.length % ACCENT_KEYS.length];
      create("memberships", {
        ...values,
        features: [],
        gifts: [],
        published: false,
        popular: false,
        members: 0,
        accent,
        gradient: ACCENTS[accent].gradient
      });
    }
  };
  const addFeature = (plan) => {
    const text = (draftFeature[plan.id] || "").trim();
    if (!text) return;
    if (plan.features.some((f) => f.toLowerCase() === text.toLowerCase())) {
      toast("That feature is already on this plan", "info");
      return;
    }
    update("memberships", plan.id, { features: [...plan.features, text] }, {
      message: `Feature added to ${plan.name}`
    });
    setDraftFeature((d) => ({ ...d, [plan.id]: "" }));
  };
  const addGift = (plan) => {
    const text = (draftGift[plan.id] || "").trim();
    if (!text) return;
    const gifts = plan.gifts || [];
    if (gifts.some((g) => g.toLowerCase() === text.toLowerCase())) {
      toast("That gift is already on this plan", "info");
      return;
    }
    update("memberships", plan.id, { gifts: [...gifts, text] }, {
      message: `Gift added to ${plan.name}`
    });
    setDraftGift((d) => ({ ...d, [plan.id]: "" }));
  };
  const removeGift = (plan, index) => update(
    "memberships",
    plan.id,
    { gifts: (plan.gifts || []).filter((_, i) => i !== index) },
    { message: `Gift removed from ${plan.name}` }
  );
  const removeFeature = (plan, index) => update(
    "memberships",
    plan.id,
    { features: plan.features.filter((_, i) => i !== index) },
    { message: `Feature removed from ${plan.name}` }
  );
  const togglePublished = (plan) => update(
    "memberships",
    plan.id,
    { published: !plan.published },
    { message: plan.published ? `${plan.name} hidden from the website` : `${plan.name} is live on the website` }
  );
  const makePopular = (plan) => {
    memberships2.forEach(
      (p) => update("memberships", p.id, { popular: p.id === plan.id }, { silent: true })
    );
    toast(`${plan.name} is now highlighted on the website`);
  };
  const simulateSignup = () => {
    if (!published.length) {
      toast("Publish at least one plan before the website can take signups", "danger");
      return;
    }
    const visitor = VISITORS[Math.floor(Math.random() * VISITORS.length)];
    const plan = published[Math.floor(Math.random() * published.length)];
    receiveMemberSignup({
      ...visitor,
      planId: plan.id,
      plan: plan.name,
      members: 1 + Math.floor(Math.random() * 4),
      source: "Website",
      received: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    });
  };
  return /* @__PURE__ */ jsxs19(Fragment8, { children: [
    /* @__PURE__ */ jsxs19(
      PageHeader,
      {
        title: "Memberships",
        subtitle: "Plans published on your website \u2014 features here are what members get",
        children: [
          /* @__PURE__ */ jsxs19("button", { className: "btn-ghost", onClick: simulateSignup, children: [
            /* @__PURE__ */ jsx22(Sparkles, { size: 16 }),
            " Simulate signup"
          ] }),
          /* @__PURE__ */ jsxs19(
            "button",
            {
              className: "btn-primary",
              onClick: () => {
                setEditing(null);
                setFormOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx22(Plus5, { size: 16 }),
                " Add plan"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs19("div", { className: "mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx22(StatCard, { icon: Globe, label: "Live on website", value: `${published.length} / ${memberships2.length}` }),
      /* @__PURE__ */ jsx22(StatCard, { icon: UserPlus, label: "Website signups", value: memberSignups2.length }),
      /* @__PURE__ */ jsx22(StatCard, { icon: ShieldCheck2, label: "Active members", value: activeMembers }),
      /* @__PURE__ */ jsx22(StatCard, { icon: IndianRupee3, label: "Membership value", value: inr(membershipRevenue), skin: "brand" })
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "mb-4 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxs19("div", { children: [
        /* @__PURE__ */ jsx22(Eyebrow, { children: "Plan catalogue" }),
        /* @__PURE__ */ jsx22("h2", { className: "mt-1 font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900", children: "Membership plans" })
      ] }),
      /* @__PURE__ */ jsx22("p", { className: "text-sm text-ink-500", children: "Features added here appear on the website pricing page instantly." })
    ] }),
    /* @__PURE__ */ jsx22("div", { className: "grid gap-5 lg:grid-cols-2 xl:grid-cols-3", children: memberships2.map((plan) => {
      const variant = VARIANTS[variantOf(plan)];
      const isPremium = variantOf(plan) === "premium";
      return /* @__PURE__ */ jsxs19(
        "article",
        {
          className: `flex flex-col overflow-hidden transition ${variant.card}`,
          children: [
            plan.popular && /* @__PURE__ */ jsxs19("p", { className: "flex items-center justify-center gap-1.5 bg-amber-400 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-900", children: [
              /* @__PURE__ */ jsx22(Crown2, { size: 12 }),
              " Most popular"
            ] }),
            /* @__PURE__ */ jsxs19("div", { className: variant.head, children: [
              /* @__PURE__ */ jsxs19("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxs19("div", { className: "flex min-w-0 items-center gap-3", children: [
                  /* @__PURE__ */ jsx22("span", { className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl ${variant.tile}`, children: /* @__PURE__ */ jsx22(Crown2, { size: 18, strokeWidth: 2.2 }) }),
                  /* @__PURE__ */ jsxs19("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx22("p", { className: `truncate font-display text-base font-extrabold ${variant.name}`, children: plan.name }),
                    /* @__PURE__ */ jsx22("p", { className: `truncate text-xs ${variant.id}`, children: plan.id })
                  ] })
                ] }),
                isPremium && /* @__PURE__ */ jsx22("span", { className: `chip shrink-0 ${variant.pill}`, children: "Top tier" })
              ] }),
              /* @__PURE__ */ jsx22("p", { className: `mt-3 line-clamp-2 text-sm leading-relaxed ${variant.tagline}`, children: plan.tagline }),
              /* @__PURE__ */ jsxs19("div", { className: "mt-4 flex items-end gap-2", children: [
                /* @__PURE__ */ jsx22("span", { className: `font-display text-3xl font-extrabold leading-none ${variant.price}`, children: inr(plan.price) }),
                /* @__PURE__ */ jsxs19("span", { className: `pb-0.5 text-xs font-semibold ${variant.note}`, children: [
                  "per member \xB7 ",
                  String(plan.billing || "").toLowerCase()
                ] })
              ] }),
              /* @__PURE__ */ jsxs19("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
                /* @__PURE__ */ jsxs19("span", { className: `chip ${variant.pill}`, children: [
                  plan.discount,
                  "% off packages"
                ] }),
                /* @__PURE__ */ jsxs19("span", { className: `chip ${variant.pill}`, children: [
                  /* @__PURE__ */ jsx22(Gift, { size: 11 }),
                  " ",
                  (plan.gifts || []).length,
                  " gifts"
                ] }),
                /* @__PURE__ */ jsxs19("span", { className: `chip ${variant.pill}`, children: [
                  plan.members,
                  " members"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs19("div", { className: "flex flex-1 flex-col border-t border-ink-900/[0.07] px-5 pb-5 pt-4", children: [
              /* @__PURE__ */ jsxs19("div", { className: "mb-4 rounded-lg bg-brand-50 px-3 py-3", children: [
                /* @__PURE__ */ jsxs19("div", { className: "flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs19("p", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-800", children: [
                    /* @__PURE__ */ jsx22(Gift, { size: 13 }),
                    " Gifts for members"
                  ] }),
                  /* @__PURE__ */ jsx22("span", { className: "text-xs font-semibold text-brand-700/70", children: (plan.gifts || []).length })
                ] }),
                /* @__PURE__ */ jsxs19("ul", { className: "mt-2 space-y-1", children: [
                  (plan.gifts || []).map((g, i) => /* @__PURE__ */ jsxs19("li", { className: "group flex items-start gap-2 rounded px-1 py-0.5", children: [
                    /* @__PURE__ */ jsx22(Gift, { size: 12, className: "mt-1 shrink-0 text-brand-600" }),
                    /* @__PURE__ */ jsx22("span", { className: "flex-1 text-xs leading-snug text-brand-900", children: g }),
                    /* @__PURE__ */ jsx22(
                      "button",
                      {
                        onClick: () => removeGift(plan, i),
                        title: "Remove gift",
                        className: "shrink-0 text-brand-700/40 opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100",
                        children: /* @__PURE__ */ jsx22(X6, { size: 13 })
                      }
                    )
                  ] }, g)),
                  (plan.gifts || []).length === 0 && /* @__PURE__ */ jsx22("li", { className: "px-1 py-1 text-xs text-brand-800/70", children: "No gifts yet \u2014 add the first one below." })
                ] }),
                /* @__PURE__ */ jsxs19("div", { className: "mt-2 flex gap-1.5", children: [
                  /* @__PURE__ */ jsx22(
                    "input",
                    {
                      value: draftGift[plan.id] || "",
                      onChange: (e) => setDraftGift((d) => ({ ...d, [plan.id]: e.target.value })),
                      onKeyDown: (e) => e.key === "Enter" && addGift(plan),
                      placeholder: "Add a gift\u2026",
                      className: "input border-brand-600/20 bg-white py-1.5 text-xs"
                    }
                  ),
                  /* @__PURE__ */ jsx22(
                    "button",
                    {
                      onClick: () => addGift(plan),
                      className: "btn-soft shrink-0 px-2.5 py-1.5",
                      title: "Add gift",
                      children: /* @__PURE__ */ jsx22(Plus5, { size: 14 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs19("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx22(Eyebrow, { children: "Included in this plan" }),
                /* @__PURE__ */ jsxs19("span", { className: "text-xs font-semibold text-ink-400", children: [
                  plan.features.length,
                  " features"
                ] })
              ] }),
              /* @__PURE__ */ jsxs19("ul", { className: "mt-2.5 space-y-1", children: [
                plan.features.map((f, i) => /* @__PURE__ */ jsxs19(
                  "li",
                  {
                    className: "group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-surface-soft",
                    children: [
                      /* @__PURE__ */ jsx22(Check, { size: 14, className: "mt-0.5 shrink-0 text-brand-600", strokeWidth: 3 }),
                      /* @__PURE__ */ jsx22("span", { className: "flex-1 text-sm leading-snug text-ink-700", children: f }),
                      /* @__PURE__ */ jsx22(
                        "button",
                        {
                          onClick: () => removeFeature(plan, i),
                          title: "Remove feature",
                          className: "shrink-0 text-ink-300 opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100",
                          children: /* @__PURE__ */ jsx22(X6, { size: 14 })
                        }
                      )
                    ]
                  },
                  f
                )),
                plan.features.length === 0 && /* @__PURE__ */ jsx22("li", { className: "rounded-lg border border-dashed border-ink-900/10 px-3 py-3 text-xs text-ink-500", children: "No features yet \u2014 add the first one below." })
              ] }),
              /* @__PURE__ */ jsxs19("div", { className: "mt-3 flex gap-2", children: [
                /* @__PURE__ */ jsx22(
                  "input",
                  {
                    value: draftFeature[plan.id] || "",
                    onChange: (e) => setDraftFeature((d) => ({ ...d, [plan.id]: e.target.value })),
                    onKeyDown: (e) => e.key === "Enter" && addFeature(plan),
                    placeholder: "Add a feature\u2026",
                    className: "input py-2 text-sm"
                  }
                ),
                /* @__PURE__ */ jsx22("button", { onClick: () => addFeature(plan), className: "btn-soft shrink-0 px-3 py-2", title: "Add feature", children: /* @__PURE__ */ jsx22(Plus5, { size: 16 }) })
              ] }),
              /* @__PURE__ */ jsxs19("div", { className: "mt-5 flex items-center justify-between gap-2 border-t border-ink-900/[0.07] pt-4", children: [
                /* @__PURE__ */ jsxs19(
                  "button",
                  {
                    onClick: () => togglePublished(plan),
                    className: "flex items-center gap-2 text-xs font-bold",
                    title: plan.published ? "Hide from website" : "Publish to website",
                    children: [
                      /* @__PURE__ */ jsx22(Switch, { on: plan.published }),
                      /* @__PURE__ */ jsx22("span", { className: plan.published ? "text-brand-700" : "text-ink-500", children: plan.published ? /* @__PURE__ */ jsxs19("span", { className: "inline-flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx22(Globe, { size: 12 }),
                        " Live"
                      ] }) : /* @__PURE__ */ jsxs19("span", { className: "inline-flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx22(EyeOff, { size: 12 }),
                        " Hidden"
                      ] }) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs19("div", { className: "flex gap-1.5", children: [
                  !plan.popular && /* @__PURE__ */ jsx22(
                    "button",
                    {
                      onClick: () => makePopular(plan),
                      title: "Highlight on website",
                      className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-amber-400 hover:text-amber-600",
                      children: /* @__PURE__ */ jsx22(Crown2, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx22(
                    "button",
                    {
                      onClick: () => {
                        setEditing(plan);
                        setFormOpen(true);
                      },
                      title: "Edit plan",
                      className: "icon-btn",
                      children: /* @__PURE__ */ jsx22(Pencil4, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx22(
                    "button",
                    {
                      onClick: () => setConfirm({ id: plan.id, label: plan.name }),
                      title: "Delete plan",
                      className: "icon-btn-danger",
                      children: /* @__PURE__ */ jsx22(Trash25, { size: 14 })
                    }
                  )
                ] })
              ] })
            ] })
          ]
        },
        plan.id
      );
    }) }),
    /* @__PURE__ */ jsx22(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: savePlan,
        title: editing ? `Edit ${editing.name}` : "Add membership plan",
        subtitle: editing ? editing.id : "Features are added on the plan card after saving",
        fields: planFields,
        initial: editing || { billing: "Yearly", discount: 5 },
        submitLabel: editing ? "Save changes" : "Create plan"
      }
    ),
    /* @__PURE__ */ jsx22(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("memberships", confirm.id),
        title: "Delete this plan?",
        message: `\u201C${confirm?.label}\u201D will disappear from the website. Members already on it keep their quotations.`
      }
    )
  ] });
}

// src/pages/Customers.jsx
import { useState as useState13 } from "react";
import {
  Plus as Plus6,
  Phone as Phone2,
  MessageCircle as MessageCircle2,
  Mail as Mail3,
  Pencil as Pencil5,
  Trash2 as Trash26,
  CalendarPlus,
  Crown as Crown3,
  Gift as Gift2,
  Check as Check2,
  FileText as FileText4
} from "lucide-react";
import { useNavigate as useNavigate5 } from "react-router-dom";
import { Fragment as Fragment9, jsx as jsx23, jsxs as jsxs20 } from "react/jsx-runtime";
var TIERS = ["Platinum", "Gold", "Silver"];
var SPECIAL_LABELS = ["Anniversary", "Spouse birthday", "Child birthday", "Other"];
var SOURCES2 = ["Website", "Instagram", "Referral", "Walk-in", "Google Ads", "WhatsApp"];
var tierTone = { Platinum: "violet", Gold: "amber", Silver: "slate" };
var digits2 = (phone) => String(phone).replace(/[^\d]/g, "");
function daysUntilNext(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = /* @__PURE__ */ new Date();
  const today2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(today2.getFullYear(), d.getMonth(), d.getDate());
  if (next < today2) next = new Date(today2.getFullYear() + 1, d.getMonth(), d.getDate());
  return Math.round((next - today2) / 864e5);
}
function yearsSince(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = /* @__PURE__ */ new Date();
  let years = now.getFullYear() - d.getFullYear();
  const beforeBirthday = now.getMonth() < d.getMonth() || now.getMonth() === d.getMonth() && now.getDate() < d.getDate();
  if (beforeBirthday) years -= 1;
  return years;
}
function countdown(days2) {
  if (days2 === null) return null;
  if (days2 === 0) return "today";
  if (days2 === 1) return "tomorrow";
  return `in ${days2} days`;
}
function Row({ label, value, note }) {
  return /* @__PURE__ */ jsxs20("div", { className: "flex items-start gap-4 px-4 py-2.5", children: [
    /* @__PURE__ */ jsx23("dt", { className: "w-32 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-400", children: label }),
    /* @__PURE__ */ jsx23("dd", { className: "min-w-0 flex-1 text-sm leading-relaxed text-ink-800", children: value === 0 || value ? value : /* @__PURE__ */ jsx23("span", { className: "text-ink-400", children: "Not recorded" }) }),
    note && /* @__PURE__ */ jsx23("span", { className: "shrink-0 pt-0.5 text-xs font-semibold text-brand-700", children: note })
  ] });
}
function Customers() {
  const navigate = useNavigate5();
  const {
    customers: customers2,
    memberSignups: memberSignups2,
    memberships: memberships2,
    quotations: quotations2,
    bookings: bookings2,
    create,
    update,
    remove,
    toggleGift
  } = useApp();
  const [formOpen, setFormOpen] = useState13(false);
  const [editing, setEditing] = useState13(null);
  const [viewing, setViewing] = useState13(null);
  const [confirm, setConfirm] = useState13(null);
  const membershipFor = (customer) => {
    if (!customer) return null;
    const wanted = phoneDigits(customer.phone);
    const signup = memberSignups2.find(
      (s) => phoneDigits(s.phone) === wanted || s.email && s.email === customer.email
    );
    if (!signup) return null;
    return { signup, plan: memberships2.find((p) => p.id === signup.planId) || null };
  };
  const fields = [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "city", label: "City", type: "text" },
    { name: "address", label: "Address", type: "textarea", full: true, placeholder: "Flat / street / area, city, PIN" },
    { name: "dob", label: "Date of birth", type: "date" },
    { name: "specialLabel", label: "Special date is a", type: "select", options: SPECIAL_LABELS },
    { name: "special", label: "Special date", type: "date", help: "Used for greetings and offers" },
    { name: "source", label: "Came from", type: "select", options: SOURCES2 },
    { name: "trips", label: "Trips taken", type: "number" },
    { name: "spend", label: "Lifetime value (\u20B9)", type: "number" },
    { name: "tier", label: "Tier", type: "select", options: TIERS },
    { name: "last", label: "Latest trip", type: "text", placeholder: "24 Aug 2026" }
  ];
  const save = (values) => {
    if (editing) update("customers", editing.id, values);
    else create("customers", values);
  };
  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (r) => {
        const membership2 = membershipFor(r);
        return /* @__PURE__ */ jsxs20("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx23(Avatar, { name: r.name }),
          /* @__PURE__ */ jsxs20("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs20("p", { className: "flex items-center gap-1.5 truncate font-bold text-ink-900", children: [
              r.name,
              membership2 && /* @__PURE__ */ jsxs20("span", { className: "chip shrink-0 bg-brand-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-700", children: [
                /* @__PURE__ */ jsx23(Crown3, { size: 10 }),
                " Member"
              ] })
            ] }),
            /* @__PURE__ */ jsx23("p", { className: "truncate text-xs text-ink-500", children: r.email })
          ] })
        ] });
      }
    },
    { key: "phone", header: "Phone", render: (r) => /* @__PURE__ */ jsx23("span", { className: "text-ink-600", children: r.phone }) },
    { key: "city", header: "City" },
    {
      key: "dob",
      header: "Birthday",
      csv: (r) => r.dob || "",
      render: (r) => {
        const days2 = daysUntilNext(r.dob);
        if (!r.dob) return /* @__PURE__ */ jsx23("span", { className: "text-ink-400", children: "\u2014" });
        return /* @__PURE__ */ jsxs20("div", { children: [
          /* @__PURE__ */ jsx23("p", { className: "whitespace-nowrap font-semibold text-ink-800", children: formatDate(r.dob) }),
          days2 !== null && days2 <= 30 && /* @__PURE__ */ jsx23("p", { className: "text-xs font-semibold text-brand-700", children: countdown(days2) })
        ] });
      }
    },
    { key: "trips", header: "Trips", render: (r) => /* @__PURE__ */ jsx23("span", { className: "font-bold text-ink-900 num", children: r.trips }) },
    {
      key: "spend",
      header: "Lifetime value",
      render: (r) => /* @__PURE__ */ jsx23("span", { className: "font-bold text-brand-700 num", children: inr(r.spend) })
    },
    {
      key: "gifts",
      header: "Gifts",
      csv: (r) => {
        const m = membershipFor(r);
        return m?.plan ? `${(r.giftsGiven || []).length}/${m.plan.gifts?.length || 0}` : "";
      },
      render: (r) => {
        const m = membershipFor(r);
        if (!m?.plan) return /* @__PURE__ */ jsx23("span", { className: "text-ink-400", children: "\u2014" });
        const total = m.plan.gifts?.length || 0;
        const given = (r.giftsGiven || []).length;
        const done = total > 0 && given >= total;
        return /* @__PURE__ */ jsxs20(
          "span",
          {
            className: `chip ${done ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15" : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15"}`,
            title: done ? "All gifts handed over" : `${total - given} still to give`,
            children: [
              /* @__PURE__ */ jsx23(Gift2, { size: 11 }),
              /* @__PURE__ */ jsxs20("span", { className: "num", children: [
                given,
                "/",
                total
              ] })
            ]
          }
        );
      }
    },
    { key: "tier", header: "Tier", render: (r) => /* @__PURE__ */ jsx23(Badge, { tone: tierTone[r.tier], children: r.tier }) },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsxs20("div", { className: "flex justify-end gap-1.5", children: [
        /* @__PURE__ */ jsx23("a", { href: `tel:${digits2(r.phone)}`, title: "Call", className: "icon-btn hover:border-emerald-400 hover:text-emerald-600", children: /* @__PURE__ */ jsx23(Phone2, { size: 14 }) }),
        /* @__PURE__ */ jsx23(
          "a",
          {
            href: `https://wa.me/${digits2(r.phone)}`,
            target: "_blank",
            rel: "noreferrer",
            title: "WhatsApp",
            className: "icon-btn hover:border-emerald-400 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx23(MessageCircle2, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx23(
          RowMenu,
          {
            items: [
              { label: "View details", icon: FileText4, onClick: () => setViewing(r) },
              { label: "Edit customer", icon: Pencil5, onClick: () => {
                setEditing(r);
                setFormOpen(true);
              } },
              { label: "Email", icon: Mail3, onClick: () => {
                window.location.href = `mailto:${r.email}`;
              } },
              { label: "New booking", icon: CalendarPlus, onClick: () => navigate("/bookings") },
              { label: "Delete", icon: Trash26, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  const membership = membershipFor(viewing);
  const profile = viewing ? customers2.find((c) => c.id === viewing.id) || viewing : null;
  const planGifts = membership?.plan?.gifts || [];
  const givenGifts = profile?.giftsGiven || [];
  const customerQuotes = viewing ? quotations2.filter((q) => q.customer === viewing.name).slice(0, 4) : [];
  const customerTrips = viewing ? bookings2.filter((b) => b.customer === viewing.name).length : 0;
  return /* @__PURE__ */ jsxs20(Fragment9, { children: [
    /* @__PURE__ */ jsx23(PageHeader, { title: "Customers", subtitle: "Repeat travellers, key dates and memberships", children: /* @__PURE__ */ jsxs20(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx23(Plus6, { size: 16 }),
          " Add customer"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx23(
      DataTable,
      {
        columns,
        rows: customers2,
        searchKeys: ["name", "email", "phone", "city"],
        searchPlaceholder: "Search customers\u2026",
        filters: [
          { key: "tier", label: "Tier", options: TIERS },
          { key: "source", label: "Came from", options: SOURCES2 }
        ],
        exportName: "smira-club-customers",
        emptyLabel: "No customers match this view",
        onRowClick: (r) => setViewing(r),
        bulkActions: [{ label: "Delete", icon: Trash26, danger: true, onClick: (ids) => setConfirm(ids) }]
      }
    ),
    /* @__PURE__ */ jsx23(
      Modal,
      {
        open: Boolean(viewing),
        onClose: () => setViewing(null),
        title: viewing?.name || "",
        subtitle: viewing ? `${viewing.id} \xB7 ${viewing.city || "City not recorded"}` : "",
        footer: /* @__PURE__ */ jsxs20(Fragment9, { children: [
          /* @__PURE__ */ jsx23("button", { className: "btn-ghost", onClick: () => setViewing(null), children: "Close" }),
          /* @__PURE__ */ jsxs20(
            "button",
            {
              className: "btn-primary",
              onClick: () => {
                setEditing(viewing);
                setViewing(null);
                setFormOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx23(Pencil5, { size: 16 }),
                " Edit customer"
              ]
            }
          )
        ] }),
        children: profile && /* @__PURE__ */ jsxs20("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs20("div", { className: "flex items-center gap-3.5", children: [
            /* @__PURE__ */ jsx23(Avatar, { name: profile.name, size: "lg" }),
            /* @__PURE__ */ jsxs20("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs20("p", { className: "flex flex-wrap items-center gap-2 font-display text-lg font-extrabold text-ink-900", children: [
                profile.name,
                /* @__PURE__ */ jsx23(Badge, { tone: tierTone[profile.tier], children: profile.tier }),
                profile.source && /* @__PURE__ */ jsx23(Badge, { tone: profile.source === "Website" ? "sky" : "slate", children: profile.source })
              ] }),
              /* @__PURE__ */ jsxs20("p", { className: "mt-0.5 truncate text-sm text-ink-500", children: [
                profile.phone,
                " \xB7 ",
                profile.email
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs20("dl", { className: "divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]", children: [
            /* @__PURE__ */ jsx23(Row, { label: "Address", value: profile.address }),
            /* @__PURE__ */ jsx23(
              Row,
              {
                label: "Birthday",
                value: profile.dob ? `${formatDate(profile.dob)}${yearsSince(profile.dob) !== null ? ` \xB7 ${yearsSince(profile.dob)} yrs` : ""}` : "",
                note: countdown(daysUntilNext(profile.dob))
              }
            ),
            /* @__PURE__ */ jsx23(
              Row,
              {
                label: profile.specialLabel || "Special date",
                value: profile.special ? formatDate(profile.special) : "",
                note: countdown(daysUntilNext(profile.special))
              }
            ),
            /* @__PURE__ */ jsx23(Row, { label: "Trips taken", value: profile.trips ?? 0 }),
            /* @__PURE__ */ jsx23(Row, { label: "Lifetime value", value: inr(profile.spend) }),
            /* @__PURE__ */ jsx23(Row, { label: "Latest trip", value: profile.last })
          ] }),
          /* @__PURE__ */ jsxs20("div", { children: [
            /* @__PURE__ */ jsx23("p", { className: "eyebrow mb-2", children: "Membership" }),
            membership ? /* @__PURE__ */ jsxs20("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-brand-600/20 bg-brand-50/60 px-4 py-3", children: [
              /* @__PURE__ */ jsx23(Crown3, { size: 16, className: "shrink-0 text-brand-600" }),
              /* @__PURE__ */ jsx23("span", { className: "font-display text-sm font-extrabold text-ink-900", children: membership.signup.plan }),
              /* @__PURE__ */ jsx23(Badge, { tone: signupTone[membership.signup.status], dot: true, children: membership.signup.status }),
              /* @__PURE__ */ jsxs20("span", { className: "text-sm text-ink-600", children: [
                membership.signup.members,
                " ",
                membership.signup.members === 1 ? "member" : "members",
                membership.plan ? ` \xB7 ${inr(membershipAmount(membership.plan, membership.signup.members).total)}` : ""
              ] }),
              membership.signup.quote && /* @__PURE__ */ jsx23(
                "button",
                {
                  onClick: () => navigate("/quotations"),
                  className: "ml-auto text-sm font-bold text-brand-700 hover:underline",
                  children: membership.signup.quote
                }
              )
            ] }) : /* @__PURE__ */ jsxs20("div", { className: "flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-3", children: [
              /* @__PURE__ */ jsx23("p", { className: "flex-1 text-sm text-ink-500", children: "No membership yet." }),
              /* @__PURE__ */ jsx23("button", { className: "btn-ghost btn-sm", onClick: () => navigate("/memberships"), children: "View plans" })
            ] })
          ] }),
          membership?.plan && /* @__PURE__ */ jsxs20("div", { children: [
            /* @__PURE__ */ jsxs20("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx23("p", { className: "eyebrow", children: "Gifts" }),
              /* @__PURE__ */ jsxs20("span", { className: "text-xs font-semibold text-ink-400", children: [
                givenGifts.length,
                " of ",
                planGifts.length,
                " given"
              ] })
            ] }),
            /* @__PURE__ */ jsxs20("ul", { className: "divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]", children: [
              planGifts.map((gift) => {
                const record = givenGifts.find((g) => giftKey(g.gift) === giftKey(gift));
                return /* @__PURE__ */ jsx23("li", { children: /* @__PURE__ */ jsxs20(
                  "button",
                  {
                    onClick: () => toggleGift(profile.id, gift),
                    className: "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-soft",
                    title: record ? "Mark as not given" : "Mark as given",
                    children: [
                      /* @__PURE__ */ jsx23(
                        "span",
                        {
                          className: `grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${record ? "border-brand-600 bg-brand-600 text-white" : "border-ink-900/20 text-transparent"}`,
                          children: /* @__PURE__ */ jsx23(Check2, { size: 13, strokeWidth: 3 })
                        }
                      ),
                      /* @__PURE__ */ jsx23(
                        "span",
                        {
                          className: `min-w-0 flex-1 text-sm ${record ? "text-ink-500 line-through" : "font-semibold text-ink-800"}`,
                          children: gift
                        }
                      ),
                      /* @__PURE__ */ jsx23("span", { className: "shrink-0 text-xs text-ink-400", children: record ? record.date : "Tap to give" })
                    ]
                  }
                ) }, gift);
              }),
              planGifts.length === 0 && /* @__PURE__ */ jsx23("li", { className: "px-4 py-4 text-sm text-ink-500", children: "This plan has no gifts set up yet." })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx23(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.name}` : "Add customer",
        subtitle: editing ? editing.id : "Create a traveller profile",
        fields,
        initial: editing || { tier: "Silver", trips: 0, spend: 0, specialLabel: "Anniversary", source: "Website" },
        submitLabel: editing ? "Save changes" : "Add customer"
      }
    ),
    /* @__PURE__ */ jsx23(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("customers", confirm),
        title: "Delete customers?",
        message: `This removes ${confirm?.length || 0} customer profile(s).`
      }
    )
  ] });
}

// src/pages/Tasks.jsx
import { useState as useState14 } from "react";
import {
  Clock,
  CalendarDays as CalendarDays2,
  AlertTriangle as AlertTriangle2,
  CheckCircle2 as CheckCircle22,
  Plus as Plus7,
  Filter,
  Pencil as Pencil6,
  Trash2 as Trash27,
  ArrowUpRight
} from "lucide-react";
import { Fragment as Fragment10, jsx as jsx24, jsxs as jsxs21 } from "react/jsx-runtime";
var buckets = [
  { key: "today", label: "Today", icon: Clock },
  { key: "upcoming", label: "Upcoming", icon: CalendarDays2 },
  { key: "overdue", label: "Overdue", icon: AlertTriangle2 },
  { key: "done", label: "Done", icon: CheckCircle22 }
];
var TYPES2 = ["Call", "Send itinerary", "Send quote", "Documents", "Payment", "Visa", "Supplier"];
var PRIORITIES = ["High", "Medium", "Low"];
var priorityTone = { High: "rose", Medium: "amber", Low: "slate" };
function Tasks() {
  const { tasks: tasks2, team: team2, owner, create, update, remove, toast } = useApp();
  const [bucket, setBucket] = useState14("today");
  const [priority, setPriority] = useState14("");
  const [showFilter, setShowFilter] = useState14(false);
  const [formOpen, setFormOpen] = useState14(false);
  const [editing, setEditing] = useState14(null);
  const [confirm, setConfirm] = useState14(null);
  const consultants = team2.map((t) => t.name.split(" ")[0]);
  const scoped = byOwner(tasks2, owner);
  const list = scoped.filter((t) => t.bucket === bucket && (!priority || t.priority === priority));
  const fields = [
    { name: "title", label: "Task", type: "text", required: true, full: true },
    { name: "customer", label: "Customer", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: TYPES2 },
    { name: "due", label: "Due", type: "text", required: true, placeholder: "05 Aug 2026, 10:00 am" },
    { name: "owner", label: "Owner", type: "select", options: consultants },
    { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
    { name: "bucket", label: "Bucket", type: "select", options: ["today", "upcoming", "overdue", "done"] },
    { name: "note", label: "Note", type: "textarea", full: true }
  ];
  const save = (values) => {
    if (editing) update("tasks", editing.id, values);
    else create("tasks", values);
  };
  const toggleDone = (t) => {
    if (t.bucket === "done") {
      update("tasks", t.id, { bucket: t.prevBucket || "today" }, { message: "Task reopened" });
    } else {
      update("tasks", t.id, { bucket: "done", prevBucket: t.bucket }, { message: `\u201C${t.title}\u201D completed` });
    }
  };
  return /* @__PURE__ */ jsxs21(Fragment10, { children: [
    /* @__PURE__ */ jsxs21(PageHeader, { title: "Tasks", subtitle: "Follow-ups, documents and supplier confirmations", children: [
      /* @__PURE__ */ jsxs21(
        "button",
        {
          className: `btn ${showFilter || priority ? "bg-brand-50 text-brand-700" : "btn-ghost"}`,
          onClick: () => setShowFilter((s) => !s),
          children: [
            /* @__PURE__ */ jsx24(Filter, { size: 16 }),
            " Filter",
            priority && /* @__PURE__ */ jsx24("span", { className: "rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white", children: "1" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs21(
        "button",
        {
          className: "btn-primary",
          onClick: () => {
            setEditing(null);
            setFormOpen(true);
          },
          children: [
            /* @__PURE__ */ jsx24(Plus7, { size: 16 }),
            " Add task"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs21("div", { className: "card overflow-hidden", children: [
      /* @__PURE__ */ jsx24("div", { className: "no-scrollbar flex gap-2 overflow-x-auto border-b border-ink-900/[0.07] p-4", children: buckets.map(({ key, label, icon: Icon }) => {
        const n = scoped.filter((t) => t.bucket === key).length;
        const on = bucket === key;
        return /* @__PURE__ */ jsxs21(
          "button",
          {
            onClick: () => setBucket(key),
            className: `flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${on ? "bg-ink-900 text-white" : "border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"}`,
            children: [
              /* @__PURE__ */ jsx24(Icon, { size: 16, strokeWidth: 2.3 }),
              label,
              /* @__PURE__ */ jsx24(
                "span",
                {
                  className: `rounded-full px-1.5 py-0.5 text-[11px] ${on ? "bg-white/20" : "bg-ink-900/5 text-ink-600"}`,
                  children: n
                }
              )
            ]
          },
          key
        );
      }) }),
      showFilter && /* @__PURE__ */ jsxs21("div", { className: "flex flex-wrap items-center gap-2 border-b border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3", children: [
        /* @__PURE__ */ jsx24("span", { className: "text-xs font-bold uppercase tracking-wide text-ink-500", children: "Priority" }),
        PRIORITIES.map((p) => /* @__PURE__ */ jsx24(
          "button",
          {
            onClick: () => setPriority((c) => c === p ? "" : p),
            className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${priority === p ? "bg-brand-600 text-white" : "border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300"}`,
            children: p
          },
          p
        )),
        priority && /* @__PURE__ */ jsx24(
          "button",
          {
            onClick: () => setPriority(""),
            className: "text-xs font-semibold text-ink-500 underline underline-offset-2",
            children: "Clear"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs21("div", { className: "divide-y divide-ink-900/[0.07]", children: [
        list.map((t) => /* @__PURE__ */ jsxs21("div", { className: "flex flex-wrap items-start gap-4 p-5 transition hover:bg-brand-50/40", children: [
          /* @__PURE__ */ jsx24(
            "input",
            {
              type: "checkbox",
              checked: t.bucket === "done",
              onChange: () => toggleDone(t),
              className: "mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-900/20 accent-brand-600"
            }
          ),
          /* @__PURE__ */ jsxs21("div", { className: "min-w-[220px] flex-1", children: [
            /* @__PURE__ */ jsxs21("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx24(
                "p",
                {
                  className: `text-sm font-bold ${t.bucket === "done" ? "text-ink-400 line-through" : "text-ink-900"}`,
                  children: t.title
                }
              ),
              /* @__PURE__ */ jsx24(
                "button",
                {
                  onClick: () => {
                    setEditing(t);
                    setFormOpen(true);
                  },
                  title: "Open task",
                  className: "grid h-6 w-6 place-items-center rounded-md border border-ink-900/10 text-ink-400 transition hover:text-brand-700",
                  children: /* @__PURE__ */ jsx24(ArrowUpRight, { size: 13 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx24("p", { className: "mt-0.5 text-xs font-semibold text-brand-700", children: t.customer }),
            /* @__PURE__ */ jsx24("p", { className: "mt-2 max-w-xl text-sm leading-relaxed text-ink-500", children: t.note })
          ] }),
          /* @__PURE__ */ jsxs21("div", { className: "min-w-[150px]", children: [
            /* @__PURE__ */ jsx24("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-400", children: "Due" }),
            /* @__PURE__ */ jsx24("p", { className: `text-sm font-semibold ${t.bucket === "overdue" ? "text-rose-600" : "text-ink-800"}`, children: t.due })
          ] }),
          /* @__PURE__ */ jsxs21("div", { className: "min-w-[120px]", children: [
            /* @__PURE__ */ jsx24("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-400", children: "Type" }),
            /* @__PURE__ */ jsx24(Badge, { tone: "teal", className: "mt-1", children: t.type })
          ] }),
          /* @__PURE__ */ jsxs21("div", { className: "min-w-[100px]", children: [
            /* @__PURE__ */ jsx24("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-400", children: "Priority" }),
            /* @__PURE__ */ jsx24(Badge, { tone: priorityTone[t.priority], className: "mt-1", children: t.priority })
          ] }),
          /* @__PURE__ */ jsxs21("div", { className: "flex min-w-[130px] items-center gap-2", children: [
            /* @__PURE__ */ jsx24(Avatar, { name: t.owner, size: "sm" }),
            /* @__PURE__ */ jsxs21("div", { children: [
              /* @__PURE__ */ jsx24("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-400", children: "Owner" }),
              /* @__PURE__ */ jsx24("p", { className: "text-sm font-semibold text-ink-800", children: t.owner })
            ] })
          ] }),
          /* @__PURE__ */ jsx24(
            RowMenu,
            {
              items: [
                { label: "Edit task", icon: Pencil6, onClick: () => {
                  setEditing(t);
                  setFormOpen(true);
                } },
                {
                  label: t.bucket === "done" ? "Reopen" : "Mark done",
                  icon: CheckCircle22,
                  onClick: () => toggleDone(t)
                },
                { label: "Delete", icon: Trash27, danger: true, onClick: () => setConfirm(t) }
              ]
            }
          )
        ] }, t.id)),
        list.length === 0 && /* @__PURE__ */ jsxs21("div", { className: "p-16 text-center", children: [
          /* @__PURE__ */ jsx24(CheckCircle22, { size: 30, className: "mx-auto mb-3 text-ink-400" }),
          /* @__PURE__ */ jsx24("p", { className: "text-sm font-semibold text-ink-600", children: "Nothing in this bucket" }),
          /* @__PURE__ */ jsxs21(
            "button",
            {
              className: "btn-soft mx-auto mt-4",
              onClick: () => {
                setEditing(null);
                setFormOpen(true);
              },
              children: [
                /* @__PURE__ */ jsx24(Plus7, { size: 15 }),
                " Add a task"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx24(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.id}` : "Add task",
        subtitle: editing ? editing.title : "Schedule a follow-up for the team",
        fields,
        initial: editing || { bucket, priority: "Medium", type: "Call", owner: consultants[1] || consultants[0] },
        submitLabel: editing ? "Save changes" : "Create task"
      }
    ),
    /* @__PURE__ */ jsx24(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("tasks", confirm.id),
        title: "Delete task?",
        message: `\u201C${confirm?.title}\u201D will be removed from the board.`
      }
    )
  ] });
}

// src/pages/Quotations.jsx
import { useState as useState15 } from "react";
import { Plus as Plus8, Send, Eye, Download as Download2, Pencil as Pencil7, Trash2 as Trash28, CheckCircle2 as CheckCircle23, CalendarPlus as CalendarPlus2, Check as Check3 } from "lucide-react";

// src/lib/pdf.js
import { jsPDF } from "jspdf";
var PAGE = { w: 595.28, h: 841.89 };
var M = 48;
var RIGHT = PAGE.w - M;
var INK = [21, 34, 56];
var MUTED = [109, 124, 147];
var BRAND = [11, 132, 114];
var LINE = [222, 228, 236];
var SOFT = [242, 246, 250];
var rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
var today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
function eyebrow(doc, text, x, y, align = "left") {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(String(text).toUpperCase(), x, y, { align, charSpace: 0.8 });
}
function rule(doc, y, color = LINE, width = 0.8) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(M, y, RIGHT, y);
}
function quotationPdf(quote, settings, { save = true } = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const agency = settings?.agency || {};
  let y = M + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(agency.name || "Smira Club", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const address = doc.splitTextToSize(agency.address || "", 260);
  doc.text(address, M, y + 16);
  let metaY = y + 16 + address.length * 11 + 2;
  [
    agency.gstin && `GSTIN ${agency.gstin}`,
    agency.licence && `Licence ${agency.licence}`,
    [agency.phone, agency.email].filter(Boolean).join("  \xB7  ")
  ].filter(Boolean).forEach((line) => {
    doc.text(line, M, metaY);
    metaY += 11;
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND);
  doc.text("QUOTATION", RIGHT, y + 2, { align: "right" });
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(quote.id, RIGHT, y + 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Issued  ${today()}`, RIGHT, y + 34, { align: "right" });
  if (quote.validTill) doc.text(`Valid till  ${quote.validTill}`, RIGHT, y + 46, { align: "right" });
  y = Math.max(metaY, y + 58) + 6;
  rule(doc, y, BRAND, 1.6);
  y += 26;
  eyebrow(doc, "Prepared for", M, y);
  eyebrow(doc, "Consultant", RIGHT, y, "right");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(quote.customer || "\u2014", M, y + 16);
  doc.text(quote.owner || "\u2014", RIGHT, y + 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `${quote.pax || 1} ${Number(quote.pax) === 1 ? "traveller" : "travellers"}`,
    M,
    y + 30
  );
  doc.text(`Status  ${quote.status || "Draft"}`, RIGHT, y + 30, { align: "right" });
  y += 52;
  const COL_QTY = RIGHT - 165;
  const COL_AMT = RIGHT;
  doc.setFillColor(...SOFT);
  doc.rect(M, y, RIGHT - M, 22, "F");
  eyebrow(doc, "Description", M + 10, y + 14);
  eyebrow(doc, "Travellers", COL_QTY, y + 14, "right");
  eyebrow(doc, "Amount", COL_AMT - 10, y + 14, "right");
  y += 22;
  const desc = doc.splitTextToSize(quote.pkg || "Travel package", COL_QTY - M - 30);
  const rowH = Math.max(30, desc.length * 12 + 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(desc, M + 10, y + 18);
  doc.setFont("helvetica", "normal");
  doc.text(String(quote.pax || 1), COL_QTY, y + 18, { align: "right" });
  doc.text(rs(quote.subtotal ?? quote.amount), COL_AMT - 10, y + 18, { align: "right" });
  y += rowH;
  rule(doc, y);
  y += 18;
  const totals = [];
  if (quote.subtotal !== void 0 && quote.tax !== void 0) {
    totals.push(["Subtotal", rs(quote.subtotal)], ["GST", rs(quote.tax)]);
  }
  doc.setFontSize(9.5);
  totals.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, COL_AMT - 130, y, { align: "right" });
    doc.setTextColor(...INK);
    doc.text(value, COL_AMT - 10, y, { align: "right" });
    y += 15;
  });
  doc.setFillColor(...BRAND);
  doc.rect(COL_AMT - 230, y - 2, 230, 34, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL PAYABLE", COL_AMT - 220, y + 19, { charSpace: 0.8 });
  doc.setFontSize(14);
  doc.text(rs(quote.amount), COL_AMT - 12, y + 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${rs(Math.round((quote.amount || 0) / (quote.pax || 1)))} per traveller`,
    M,
    y + 20
  );
  y += 56;
  if (quote.inclusions?.length) {
    eyebrow(doc, "What's included", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    quote.inclusions.forEach((item) => {
      const lines = doc.splitTextToSize(item, RIGHT - M - 22);
      if (y + lines.length * 12 > PAGE.h - 110) {
        doc.addPage();
        y = M;
      }
      doc.setTextColor(...BRAND);
      doc.text("\u2022", M + 4, y);
      doc.setTextColor(...INK);
      doc.text(lines, M + 18, y);
      y += lines.length * 12 + 5;
    });
    y += 10;
  }
  if (y > PAGE.h - 130) {
    doc.addPage();
    y = M;
  }
  eyebrow(doc, "Terms", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const terms = doc.splitTextToSize(
    `Prices are quoted for the travel dates discussed and are subject to availability at the time of confirmation. A booking is confirmed only once the advance payment is received. Rates may change if airline fares, hotel tariffs or taxes change before confirmation. This quotation is valid till ${quote.validTill || "the date stated above"}.`,
    RIGHT - M
  );
  doc.text(terms, M, y + 14);
  const footY = PAGE.h - 42;
  rule(doc, footY - 14);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`${agency.name || "Smira Club"}  \xB7  ${agency.phone || ""}`, M, footY);
  doc.text("Thank you for travelling with us", RIGHT, footY, { align: "right" });
  if (save) doc.save(`${quote.id}.pdf`);
  return doc;
}

// src/pages/Quotations.jsx
import { Fragment as Fragment11, jsx as jsx25, jsxs as jsxs22 } from "react/jsx-runtime";
var STATUSES2 = ["Draft", "Sent", "Viewed", "Accepted", "Expired"];
function Quotations() {
  const { quotations: quotations2, packages: packages2, team: team2, owner, settings, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState15(false);
  const [editing, setEditing] = useState15(null);
  const [viewing, setViewing] = useState15(null);
  const [confirm, setConfirm] = useState15(null);
  const rows = byOwner(quotations2, owner);
  const consultants = team2.filter((t) => t.bookings > 0).map((t) => t.name.split(" ")[0]);
  const fields = [
    { name: "customer", label: "Customer", type: "text", required: true },
    { name: "pkg", label: "Package / itinerary", type: "text", required: true },
    { name: "pax", label: "Travellers", type: "number", required: true },
    { name: "amount", label: "Amount (\u20B9)", type: "number", required: true },
    { name: "validTill", label: "Valid till", type: "text", placeholder: "31 Aug 2026" },
    { name: "status", label: "Status", type: "select", options: STATUSES2 },
    { name: "owner", label: "Owner", type: "select", options: consultants }
  ];
  const save = (values) => {
    if (editing) update("quotations", editing.id, values);
    else create("quotations", values);
  };
  const sendQuote = (r) => {
    update("quotations", r.id, { status: "Sent" }, { silent: true });
    toast(`${r.id} sent to ${r.customer}`);
  };
  const downloadQuote = (r) => {
    quotationPdf(r, settings);
    toast(`${r.id}.pdf downloaded`);
  };
  const convert = (r) => {
    const id = create("bookings", {
      customer: r.customer,
      pkg: r.pkg,
      destination: r.pkg,
      departure: r.validTill,
      nights: 0,
      pax: r.pax,
      amount: r.amount,
      paid: 0,
      status: "Pending",
      owner: r.owner
    });
    update("quotations", r.id, { status: "Accepted" }, { silent: true });
    toast(`Converted to booking ${id}`);
  };
  const columns = [
    { key: "id", header: "Quote", render: (r) => /* @__PURE__ */ jsx25("span", { className: "font-bold text-brand-700", children: r.id }) },
    {
      key: "customer",
      header: "Customer",
      render: (r) => /* @__PURE__ */ jsxs22("div", { children: [
        /* @__PURE__ */ jsx25("p", { className: "font-bold text-ink-900", children: r.customer }),
        /* @__PURE__ */ jsxs22("p", { className: "flex items-center gap-1.5 text-xs text-ink-500", children: [
          r.pkg,
          r.source === "Membership" && /* @__PURE__ */ jsx25("span", { className: "rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-700", children: "Auto" })
        ] })
      ] })
    },
    { key: "pax", header: "Pax", render: (r) => /* @__PURE__ */ jsx25("span", { className: "font-semibold", children: r.pax }) },
    { key: "amount", header: "Amount", render: (r) => /* @__PURE__ */ jsx25("span", { className: "font-bold text-ink-900", children: inr(r.amount) }) },
    { key: "validTill", header: "Valid till" },
    { key: "status", header: "Status", render: (r) => /* @__PURE__ */ jsx25(Badge, { tone: quotationTone[r.status], dot: true, children: r.status }) },
    { key: "owner", header: "Owner" },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsxs22("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx25(
          "button",
          {
            onClick: () => setViewing(r),
            title: "Preview",
            className: "icon-btn",
            children: /* @__PURE__ */ jsx25(Eye, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx25(
          "button",
          {
            onClick: () => sendQuote(r),
            title: "Send",
            className: "icon-btn hover:border-sky-300 hover:text-sky-600",
            children: /* @__PURE__ */ jsx25(Send, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx25(
          "button",
          {
            onClick: () => downloadQuote(r),
            title: "Download PDF",
            className: "icon-btn",
            children: /* @__PURE__ */ jsx25(Download2, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx25(
          RowMenu,
          {
            items: [
              { label: "Edit", icon: Pencil7, onClick: () => {
                setEditing(r);
                setFormOpen(true);
              } },
              { label: "Mark accepted", icon: CheckCircle23, onClick: () => update("quotations", r.id, { status: "Accepted" }) },
              { label: "Convert to booking", icon: CalendarPlus2, onClick: () => convert(r) },
              { label: "Delete", icon: Trash28, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs22(Fragment11, { children: [
    /* @__PURE__ */ jsx25(PageHeader, { title: "Quotations", subtitle: "Proposals shared with prospective travellers", children: /* @__PURE__ */ jsxs22(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx25(Plus8, { size: 16 }),
          " New quotation"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx25(
      DataTable,
      {
        columns,
        rows,
        searchKeys: ["id", "customer", "pkg"],
        searchPlaceholder: "Search quotations\u2026",
        filters: [
          { key: "status", label: "Status", options: STATUSES2 },
          { key: "owner", label: "Owner", options: consultants }
        ],
        exportName: "smira-club-quotations",
        emptyLabel: "No quotations match this view",
        onRowClick: (r) => setViewing(r),
        bulkActions: [
          { label: "Mark sent", icon: Send, onClick: (ids) => ids.forEach((id) => update("quotations", id, { status: "Sent" }, { silent: true })) },
          { label: "Delete", icon: Trash28, danger: true, onClick: (ids) => setConfirm(ids) }
        ]
      }
    ),
    /* @__PURE__ */ jsx25(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.id}` : "New quotation",
        subtitle: editing ? editing.customer : "Build a proposal for a customer",
        fields,
        initial: editing || { status: "Draft", owner: consultants[0] },
        submitLabel: editing ? "Save changes" : "Create quotation"
      }
    ),
    /* @__PURE__ */ jsx25(
      Modal,
      {
        open: Boolean(viewing),
        onClose: () => setViewing(null),
        title: `Quotation ${viewing?.id || ""}`,
        subtitle: viewing?.customer,
        footer: /* @__PURE__ */ jsxs22(Fragment11, { children: [
          /* @__PURE__ */ jsxs22("button", { className: "btn-ghost", onClick: () => downloadQuote(viewing), children: [
            /* @__PURE__ */ jsx25(Download2, { size: 16 }),
            " Download PDF"
          ] }),
          /* @__PURE__ */ jsxs22(
            "button",
            {
              className: "btn-primary",
              onClick: () => {
                sendQuote(viewing);
                setViewing(null);
              },
              children: [
                /* @__PURE__ */ jsx25(Send, { size: 16 }),
                " Send to customer"
              ]
            }
          )
        ] }),
        children: viewing && /* @__PURE__ */ jsxs22("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs22("div", { className: "rounded-2xl bg-gradient-to-br from-brand-600 to-ocean p-5 text-white", children: [
            /* @__PURE__ */ jsx25("p", { className: "text-sm font-semibold text-white/80", children: settings.agency.name }),
            /* @__PURE__ */ jsx25("p", { className: "mt-1 font-display text-2xl font-extrabold", children: inr(viewing.amount) }),
            /* @__PURE__ */ jsxs22("p", { className: "text-sm text-white/80", children: [
              viewing.pax,
              " travellers \xB7 valid till ",
              viewing.validTill
            ] })
          ] }),
          /* @__PURE__ */ jsx25("dl", { className: "grid gap-4 sm:grid-cols-2", children: [
            ["Customer", viewing.customer],
            ["Package", viewing.pkg],
            ["Status", viewing.status],
            ["Consultant", viewing.owner],
            ["Per person", inr(Math.round(viewing.amount / (viewing.pax || 1)))],
            ["GSTIN", settings.agency.gstin]
          ].map(([k, v]) => /* @__PURE__ */ jsxs22("div", { className: "rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3", children: [
            /* @__PURE__ */ jsx25("dt", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-500", children: k }),
            /* @__PURE__ */ jsx25("dd", { className: "mt-0.5 text-sm font-bold text-ink-900", children: v })
          ] }, k)) }),
          viewing.inclusions?.length > 0 && /* @__PURE__ */ jsxs22("div", { className: "rounded-xl border border-ink-900/[0.07] bg-white p-4", children: [
            /* @__PURE__ */ jsx25("p", { className: "eyebrow mb-2", children: "What's included" }),
            /* @__PURE__ */ jsx25("ul", { className: "grid gap-2 sm:grid-cols-2", children: viewing.inclusions.map((f) => /* @__PURE__ */ jsxs22("li", { className: "flex items-start gap-2 text-sm text-ink-700", children: [
              /* @__PURE__ */ jsx25(Check3, { size: 15, className: "mt-0.5 shrink-0 text-brand-600", strokeWidth: 2.6 }),
              f
            ] }, f)) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx25(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("quotations", confirm),
        title: "Delete quotations?",
        message: `This removes ${confirm?.length || 0} quotation(s).`
      }
    )
  ] });
}

// src/pages/Invoices.jsx
import { useState as useState16 } from "react";
import {
  Plus as Plus9,
  ReceiptIndianRupee as ReceiptIndianRupee2,
  Wallet as Wallet5,
  AlertCircle,
  Download as Download3,
  Send as Send2,
  Pencil as Pencil8,
  Trash2 as Trash29,
  BadgeIndianRupee
} from "lucide-react";
import { Fragment as Fragment12, jsx as jsx26, jsxs as jsxs23 } from "react/jsx-runtime";
var STATUSES3 = ["Paid", "Partial", "Overdue", "Draft"];
var MODES = ["UPI", "Card", "Cash", "Bank transfer"];
function Invoices() {
  const { invoices: invoices2, bookings: bookings2, settings, create, update, remove, recordPayment, toast } = useApp();
  const [formOpen, setFormOpen] = useState16(false);
  const [editing, setEditing] = useState16(null);
  const [confirm, setConfirm] = useState16(null);
  const [payFor, setPayFor] = useState16(null);
  const billed = invoices2.reduce((s, i) => s + i.amount, 0);
  const collected = invoices2.reduce((s, i) => s + i.paid, 0);
  const outstanding = billed - collected;
  const fields = [
    { name: "customer", label: "Customer", type: "text", required: true },
    { name: "booking", label: "Booking", type: "select", options: bookings2.map((b) => b.id) },
    { name: "issued", label: "Issue date", type: "text", required: true, placeholder: "04 Aug 2026" },
    { name: "due", label: "Due date", type: "text", required: true, placeholder: "18 Aug 2026" },
    { name: "amount", label: "Amount (\u20B9)", type: "number", required: true },
    { name: "paid", label: "Already paid (\u20B9)", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUSES3 }
  ];
  const save = (values) => {
    if (editing) update("invoices", editing.id, values);
    else create("invoices", values);
  };
  const downloadInvoice = (r) => {
    const text = [
      settings.agency.name,
      settings.agency.address,
      `GSTIN: ${settings.agency.gstin}`,
      "",
      `INVOICE ${r.id}`,
      `Customer : ${r.customer}`,
      `Booking  : ${r.booking}`,
      `Issued   : ${r.issued}`,
      `Due      : ${r.due}`,
      `Amount   : ${inr(r.amount)}`,
      `Paid     : ${inr(r.paid)}`,
      `Balance  : ${inr(r.amount - r.paid)}`
    ].join("\n");
    downloadText(`${r.id}.txt`, text);
    toast(`${r.id} downloaded`);
  };
  const columns = [
    { key: "id", header: "Invoice", render: (r) => /* @__PURE__ */ jsx26("span", { className: "font-bold text-brand-700", children: r.id }) },
    {
      key: "customer",
      header: "Customer",
      render: (r) => /* @__PURE__ */ jsxs23("div", { children: [
        /* @__PURE__ */ jsx26("p", { className: "font-bold text-ink-900", children: r.customer }),
        /* @__PURE__ */ jsx26("p", { className: "text-xs text-ink-500", children: r.booking })
      ] })
    },
    { key: "issued", header: "Issued" },
    {
      key: "due",
      header: "Due date",
      render: (r) => /* @__PURE__ */ jsx26("span", { className: r.status === "Overdue" ? "font-semibold text-rose-600" : "", children: r.due })
    },
    { key: "amount", header: "Amount", render: (r) => /* @__PURE__ */ jsx26("span", { className: "font-bold text-ink-900", children: inr(r.amount) }) },
    {
      key: "balance",
      header: "Balance",
      csv: (r) => r.amount - r.paid,
      render: (r) => {
        const bal = r.amount - r.paid;
        return /* @__PURE__ */ jsx26("span", { className: `font-bold ${bal > 0 ? "text-orange-600" : "text-emerald-600"}`, children: bal > 0 ? inr(bal) : "\u2014" });
      }
    },
    { key: "status", header: "Status", render: (r) => /* @__PURE__ */ jsx26(Badge, { tone: invoiceTone[r.status], dot: true, children: r.status }) },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsxs23("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx26(
          "button",
          {
            onClick: () => downloadInvoice(r),
            title: "Download",
            className: "icon-btn",
            children: /* @__PURE__ */ jsx26(Download3, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx26(
          "button",
          {
            onClick: () => toast(`${r.id} emailed to ${r.customer}`),
            title: "Send",
            className: "icon-btn hover:border-sky-300 hover:text-sky-600",
            children: /* @__PURE__ */ jsx26(Send2, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx26(
          RowMenu,
          {
            items: [
              { label: "Record payment", icon: BadgeIndianRupee, onClick: () => setPayFor(r) },
              { label: "Edit invoice", icon: Pencil8, onClick: () => {
                setEditing(r);
                setFormOpen(true);
              } },
              { label: "Delete", icon: Trash29, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs23(Fragment12, { children: [
    /* @__PURE__ */ jsx26(PageHeader, { title: "Invoices", subtitle: "Billing across all confirmed bookings", children: /* @__PURE__ */ jsxs23(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx26(Plus9, { size: 16 }),
          " Create invoice"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs23("div", { className: "mb-6 grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx26(StatCard, { icon: ReceiptIndianRupee2, label: "Total billed", value: shortInr(billed), skin: "brand" }),
      /* @__PURE__ */ jsx26(StatCard, { icon: Wallet5, label: "Collected", value: shortInr(collected) }),
      /* @__PURE__ */ jsx26(StatCard, { icon: AlertCircle, label: "Outstanding", value: shortInr(outstanding) })
    ] }),
    /* @__PURE__ */ jsx26(
      DataTable,
      {
        columns,
        rows: invoices2,
        searchKeys: ["id", "customer", "booking"],
        searchPlaceholder: "Search invoices\u2026",
        filters: [{ key: "status", label: "Status", options: STATUSES3 }],
        exportName: "smira-club-invoices",
        emptyLabel: "No invoices match this view",
        onRowClick: (r) => {
          setEditing(r);
          setFormOpen(true);
        },
        bulkActions: [
          {
            label: "Send reminder",
            icon: Send2,
            onClick: (ids) => toast(`Reminder sent for ${ids.length} invoice(s)`)
          },
          { label: "Delete", icon: Trash29, danger: true, onClick: (ids) => setConfirm(ids) }
        ]
      }
    ),
    /* @__PURE__ */ jsx26(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.id}` : "Create invoice",
        subtitle: editing ? editing.customer : "Bill a customer for a booking",
        fields,
        initial: editing || { status: "Draft", paid: 0 },
        submitLabel: editing ? "Save changes" : "Create invoice"
      }
    ),
    /* @__PURE__ */ jsx26(
      FormModal,
      {
        open: Boolean(payFor),
        onClose: () => setPayFor(null),
        onSubmit: (values) => recordPayment({
          customer: payFor.customer,
          invoice: payFor.id,
          date: values.date || "04 Aug 2026",
          mode: values.mode,
          amount: values.amount,
          status: "Success"
        }),
        title: `Record payment \xB7 ${payFor?.id || ""}`,
        subtitle: payFor ? `Balance ${inr(payFor.amount - payFor.paid)}` : "",
        size: "md",
        fields: [
          { name: "amount", label: "Amount (\u20B9)", type: "number", required: true },
          { name: "mode", label: "Mode", type: "select", options: MODES },
          { name: "date", label: "Date", type: "text", placeholder: "04 Aug 2026" }
        ],
        initial: { amount: payFor ? payFor.amount - payFor.paid : 0, mode: "UPI", date: "04 Aug 2026" },
        submitLabel: "Record payment"
      }
    ),
    /* @__PURE__ */ jsx26(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("invoices", confirm),
        title: "Delete invoices?",
        message: `This removes ${confirm?.length || 0} invoice(s) and their billing history.`
      }
    )
  ] });
}

// src/pages/Payments.jsx
import { useState as useState17 } from "react";
import { Plus as Plus10, CreditCard, Smartphone as Smartphone2, Banknote, Building2 as Building22, Undo2, Trash2 as Trash210, Download as Download4 } from "lucide-react";
import { Fragment as Fragment13, jsx as jsx27, jsxs as jsxs24 } from "react/jsx-runtime";
var MODES2 = ["UPI", "Card", "Cash", "Bank transfer"];
var modeIcon = { UPI: Smartphone2, Card: CreditCard, Cash: Banknote, "Bank transfer": Building22 };
function Payments() {
  const { payments: payments2, invoices: invoices2, settings, recordPayment, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState17(false);
  const [confirm, setConfirm] = useState17(null);
  const fields = [
    { name: "customer", label: "Customer", type: "text", required: true },
    { name: "invoice", label: "Against invoice", type: "select", options: invoices2.map((i) => i.id) },
    { name: "amount", label: "Amount (\u20B9)", type: "number", required: true },
    { name: "mode", label: "Mode", type: "select", options: MODES2 },
    { name: "date", label: "Date", type: "text", required: true, placeholder: "04 Aug 2026" }
  ];
  const receipt = (r) => {
    downloadText(
      `${r.id}.txt`,
      [
        settings.agency.name,
        "",
        `RECEIPT ${r.id}`,
        `Customer: ${r.customer}`,
        `Invoice : ${r.invoice}`,
        `Date    : ${r.date}`,
        `Mode    : ${r.mode}`,
        `Amount  : ${inr(r.amount)}`,
        `Status  : ${r.status}`
      ].join("\n")
    );
    toast(`Receipt ${r.id} downloaded`);
  };
  const columns = [
    { key: "id", header: "Receipt", render: (r) => /* @__PURE__ */ jsx27("span", { className: "font-bold text-brand-700", children: r.id }) },
    {
      key: "customer",
      header: "Customer",
      render: (r) => /* @__PURE__ */ jsxs24("div", { children: [
        /* @__PURE__ */ jsx27("p", { className: "font-bold text-ink-900", children: r.customer }),
        /* @__PURE__ */ jsx27("p", { className: "text-xs text-ink-500", children: r.invoice })
      ] })
    },
    { key: "date", header: "Date" },
    {
      key: "mode",
      header: "Mode",
      render: (r) => {
        const Icon = modeIcon[r.mode] || CreditCard;
        return /* @__PURE__ */ jsxs24("span", { className: "inline-flex items-center gap-2 font-semibold text-ink-700", children: [
          /* @__PURE__ */ jsx27("span", { className: "grid h-7 w-7 place-items-center rounded-lg bg-surface-soft text-ink-500", children: /* @__PURE__ */ jsx27(Icon, { size: 14 }) }),
          r.mode
        ] });
      }
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => /* @__PURE__ */ jsxs24("span", { className: `font-bold ${r.status === "Refunded" ? "text-rose-600" : "text-emerald-600"}`, children: [
        r.status === "Refunded" ? "-" : "+",
        inr(r.amount)
      ] })
    },
    { key: "status", header: "Status", render: (r) => /* @__PURE__ */ jsx27(Badge, { tone: paymentTone[r.status], dot: true, children: r.status }) },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsxs24("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx27(
          "button",
          {
            onClick: () => receipt(r),
            title: "Download receipt",
            className: "icon-btn",
            children: /* @__PURE__ */ jsx27(Download4, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx27(
          RowMenu,
          {
            items: [
              {
                label: r.status === "Refunded" ? "Mark successful" : "Mark refunded",
                icon: Undo2,
                onClick: () => update("payments", r.id, { status: r.status === "Refunded" ? "Success" : "Refunded" })
              },
              { label: "Delete", icon: Trash210, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs24(Fragment13, { children: [
    /* @__PURE__ */ jsx27(PageHeader, { title: "Payments", subtitle: "Every receipt and refund recorded against invoices", children: /* @__PURE__ */ jsxs24("button", { className: "btn-primary", onClick: () => setFormOpen(true), children: [
      /* @__PURE__ */ jsx27(Plus10, { size: 16 }),
      " Record payment"
    ] }) }),
    /* @__PURE__ */ jsx27(
      DataTable,
      {
        columns,
        rows: payments2,
        searchKeys: ["id", "customer", "invoice", "mode"],
        searchPlaceholder: "Search payments\u2026",
        filters: [
          { key: "mode", label: "Mode", options: MODES2 },
          { key: "status", label: "Status", options: ["Success", "Refunded"] }
        ],
        exportName: "smira-club-payments",
        emptyLabel: "No payments match this view",
        bulkActions: [{ label: "Delete", icon: Trash210, danger: true, onClick: (ids) => setConfirm(ids) }]
      }
    ),
    /* @__PURE__ */ jsx27(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: (values) => recordPayment({ ...values, status: "Success" }),
        title: "Record payment",
        subtitle: "Applies the amount to the selected invoice",
        fields,
        initial: { mode: "UPI", date: "04 Aug 2026" },
        submitLabel: "Record payment",
        size: "md"
      }
    ),
    /* @__PURE__ */ jsx27(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("payments", confirm),
        title: "Delete payments?",
        message: `This removes ${confirm?.length || 0} payment record(s). Invoice balances are not recalculated.`
      }
    )
  ] });
}

// src/pages/Suppliers.jsx
import { useState as useState18 } from "react";
import { Plus as Plus11, Star as Star2, Phone as Phone3, Pencil as Pencil9, Trash2 as Trash211, PauseCircle, PlayCircle, Mail as Mail4 } from "lucide-react";
import { Fragment as Fragment14, jsx as jsx28, jsxs as jsxs25 } from "react/jsx-runtime";
var CATEGORIES = ["DMC", "Hotel", "Airline", "Transport", "Visa"];
var digits3 = (p) => String(p).replace(/[^\d]/g, "");
function Suppliers() {
  const { suppliers: suppliers2, create, update, remove } = useApp();
  const [formOpen, setFormOpen] = useState18(false);
  const [editing, setEditing] = useState18(null);
  const [confirm, setConfirm] = useState18(null);
  const fields = [
    { name: "name", label: "Supplier name", type: "text", required: true, full: true },
    { name: "category", label: "Category", type: "select", options: CATEGORIES },
    { name: "region", label: "Region", type: "text", required: true },
    { name: "contact", label: "Contact person", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "rating", label: "Rating", type: "number", placeholder: "4.5" },
    { name: "bookings", label: "Bookings routed", type: "number" },
    { name: "status", label: "Status", type: "select", options: ["Active", "On hold"] }
  ];
  const save = (values) => {
    if (editing) update("suppliers", editing.id, values);
    else create("suppliers", values);
  };
  const columns = [
    {
      key: "name",
      header: "Supplier",
      render: (r) => /* @__PURE__ */ jsxs25("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx28(Avatar, { name: r.name }),
        /* @__PURE__ */ jsxs25("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx28("p", { className: "truncate font-bold text-ink-900", children: r.name }),
          /* @__PURE__ */ jsx28("p", { className: "truncate text-xs text-ink-500", children: r.region })
        ] })
      ] })
    },
    { key: "category", header: "Category", render: (r) => /* @__PURE__ */ jsx28(Badge, { tone: "teal", children: r.category }) },
    {
      key: "contact",
      header: "Contact person",
      render: (r) => /* @__PURE__ */ jsxs25("div", { children: [
        /* @__PURE__ */ jsx28("p", { className: "font-semibold text-ink-800", children: r.contact }),
        /* @__PURE__ */ jsxs25("p", { className: "flex items-center gap-1 text-xs text-ink-500", children: [
          /* @__PURE__ */ jsx28(Phone3, { size: 11 }),
          " ",
          r.phone
        ] })
      ] })
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => /* @__PURE__ */ jsxs25("span", { className: "inline-flex items-center gap-1.5 font-bold text-ink-900", children: [
        /* @__PURE__ */ jsx28(Star2, { size: 14, className: "fill-amber-400 text-amber-400" }),
        r.rating
      ] })
    },
    { key: "bookings", header: "Bookings routed", render: (r) => /* @__PURE__ */ jsx28("span", { className: "font-bold text-ink-900", children: r.bookings }) },
    {
      key: "status",
      header: "Status",
      render: (r) => /* @__PURE__ */ jsx28(Badge, { tone: r.status === "Active" ? "green" : "amber", dot: true, children: r.status })
    },
    {
      key: "actions",
      header: "",
      render: (r) => /* @__PURE__ */ jsxs25("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx28(
          "a",
          {
            href: `tel:${digits3(r.phone)}`,
            title: "Call",
            className: "grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx28(Phone3, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsx28(
          RowMenu,
          {
            items: [
              { label: "Edit supplier", icon: Pencil9, onClick: () => {
                setEditing(r);
                setFormOpen(true);
              } },
              {
                label: r.status === "Active" ? "Put on hold" : "Reactivate",
                icon: r.status === "Active" ? PauseCircle : PlayCircle,
                onClick: () => update("suppliers", r.id, { status: r.status === "Active" ? "On hold" : "Active" })
              },
              { label: "Delete", icon: Trash211, danger: true, onClick: () => setConfirm([r.id]) }
            ]
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs25(Fragment14, { children: [
    /* @__PURE__ */ jsx28(PageHeader, { title: "Suppliers", subtitle: "DMCs, hotels, transport and visa partners", children: /* @__PURE__ */ jsxs25(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx28(Plus11, { size: 16 }),
          " Add supplier"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx28(
      DataTable,
      {
        columns,
        rows: suppliers2,
        searchKeys: ["name", "contact", "region", "category"],
        searchPlaceholder: "Search suppliers\u2026",
        filters: [
          { key: "category", label: "Category", options: CATEGORIES },
          { key: "status", label: "Status", options: ["Active", "On hold"] }
        ],
        exportName: "smira-club-suppliers",
        emptyLabel: "No suppliers match this view",
        onRowClick: (r) => {
          setEditing(r);
          setFormOpen(true);
        },
        bulkActions: [
          { label: "Put on hold", icon: PauseCircle, onClick: (ids) => ids.forEach((id) => update("suppliers", id, { status: "On hold" }, { silent: true })) },
          { label: "Delete", icon: Trash211, danger: true, onClick: (ids) => setConfirm(ids) }
        ]
      }
    ),
    /* @__PURE__ */ jsx28(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.name}` : "Add supplier",
        subtitle: editing ? editing.id : "Register a new partner",
        fields,
        initial: editing || { category: "DMC", status: "Active", rating: 4.5, bookings: 0 },
        submitLabel: editing ? "Save changes" : "Add supplier"
      }
    ),
    /* @__PURE__ */ jsx28(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("suppliers", confirm),
        title: "Delete suppliers?",
        message: `This removes ${confirm?.length || 0} supplier record(s).`
      }
    )
  ] });
}

// src/pages/Campaigns.jsx
import { useState as useState19 } from "react";
import {
  Plus as Plus12,
  Megaphone as Megaphone2,
  MousePointerClick,
  UserPlus as UserPlus2,
  IndianRupee as IndianRupee4,
  Play,
  Pause,
  Copy as Copy2,
  Trash2 as Trash212,
  Pencil as Pencil10
} from "lucide-react";

// src/components/ui/Card.jsx
import { jsx as jsx29, jsxs as jsxs26 } from "react/jsx-runtime";
function Card({
  eyebrow: eyebrow2,
  title,
  subtitle,
  action,
  className = "",
  bodyClass = "",
  children
}) {
  return /* @__PURE__ */ jsxs26("section", { className: `card flex flex-col ${className}`, children: [
    (title || action) && /* @__PURE__ */ jsxs26("header", { className: "flex items-start justify-between gap-4 border-b border-ink-900/[0.07] px-5 py-3.5", children: [
      /* @__PURE__ */ jsxs26("div", { className: "min-w-0", children: [
        eyebrow2 && /* @__PURE__ */ jsx29("p", { className: "eyebrow mb-1", children: eyebrow2 }),
        title && /* @__PURE__ */ jsx29("h3", { className: "font-display text-[0.95rem] font-extrabold leading-tight text-ink-900", children: title }),
        subtitle && /* @__PURE__ */ jsx29("p", { className: "mt-1 text-xs leading-relaxed text-ink-500", children: subtitle })
      ] }),
      action && /* @__PURE__ */ jsx29("div", { className: "shrink-0", children: action })
    ] }),
    /* @__PURE__ */ jsx29("div", { className: bodyClass || "p-5", children })
  ] });
}

// src/pages/Campaigns.jsx
import { Fragment as Fragment15, jsx as jsx30, jsxs as jsxs27 } from "react/jsx-runtime";
var CHANNELS = ["WhatsApp", "Instagram", "Email", "Google Ads"];
var STATUSES4 = ["Draft", "Running", "Paused", "Completed"];
var channelTone = { WhatsApp: "green", Instagram: "rose", Email: "sky", "Google Ads": "violet" };
function Campaigns() {
  const { campaigns: campaigns2, create, update, remove, duplicate } = useApp();
  const [formOpen, setFormOpen] = useState19(false);
  const [editing, setEditing] = useState19(null);
  const [confirm, setConfirm] = useState19(null);
  const [channel, setChannel] = useState19("All");
  const list = campaigns2.filter((c) => channel === "All" || c.channel === channel);
  const leads = campaigns2.reduce((s, c) => s + c.leads, 0);
  const spend = campaigns2.reduce((s, c) => s + c.spend, 0);
  const clicks = campaigns2.reduce((s, c) => s + c.clicked, 0);
  const fields = [
    { name: "name", label: "Campaign name", type: "text", required: true, full: true },
    { name: "channel", label: "Channel", type: "select", options: CHANNELS },
    { name: "status", label: "Status", type: "select", options: STATUSES4 },
    { name: "sent", label: "Audience size", type: "number", required: true },
    { name: "opened", label: "Opened", type: "number" },
    { name: "clicked", label: "Clicked", type: "number" },
    { name: "leads", label: "Leads generated", type: "number" },
    { name: "spend", label: "Spend (\u20B9)", type: "number" }
  ];
  const save = (values) => {
    if (editing) update("campaigns", editing.id, values);
    else create("campaigns", values);
  };
  return /* @__PURE__ */ jsxs27(Fragment15, { children: [
    /* @__PURE__ */ jsx30(PageHeader, { title: "Campaigns", subtitle: "Broadcasts and paid campaigns feeding the pipeline", children: /* @__PURE__ */ jsxs27(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx30(Plus12, { size: 16 }),
          " New campaign"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs27("div", { className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx30(
        StatCard,
        {
          icon: Megaphone2,
          label: "Active campaigns",
          value: campaigns2.filter((c) => c.status === "Running").length,
          skin: "brand"
        }
      ),
      /* @__PURE__ */ jsx30(StatCard, { icon: MousePointerClick, label: "Clicks", value: clicks.toLocaleString("en-IN") }),
      /* @__PURE__ */ jsx30(StatCard, { icon: UserPlus2, label: "Leads generated", value: leads }),
      /* @__PURE__ */ jsx30(StatCard, { icon: IndianRupee4, label: "Cost per lead", value: leads ? inr(Math.round(spend / leads)) : "\u2014" })
    ] }),
    /* @__PURE__ */ jsxs27("div", { className: "card mb-6 flex flex-wrap items-center gap-2 p-4", children: [
      /* @__PURE__ */ jsx30("span", { className: "mr-1 text-xs font-bold uppercase tracking-wide text-ink-500", children: "Channel" }),
      ["All", ...CHANNELS].map((c) => /* @__PURE__ */ jsx30(
        "button",
        {
          onClick: () => setChannel(c),
          className: `rounded-full px-3.5 py-2 text-xs font-bold transition ${channel === c ? "bg-ink-900 text-white" : "border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"}`,
          children: c
        },
        c
      ))
    ] }),
    /* @__PURE__ */ jsx30("div", { className: "grid gap-5 lg:grid-cols-2", children: list.map((c) => {
      const openRate = c.sent ? Math.round(c.opened / c.sent * 100) : 0;
      const clickRate = c.sent ? Math.round(c.clicked / c.sent * 100) : 0;
      return /* @__PURE__ */ jsxs27(Card, { className: "card-hover", children: [
        /* @__PURE__ */ jsxs27("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs27("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs27("div", { className: "mb-1.5 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx30(Badge, { tone: channelTone[c.channel], children: c.channel }),
              /* @__PURE__ */ jsx30(Badge, { tone: campaignTone[c.status], dot: true, children: c.status })
            ] }),
            /* @__PURE__ */ jsx30("h3", { className: "truncate text-base font-bold", children: c.name }),
            /* @__PURE__ */ jsxs27("p", { className: "text-xs text-ink-500", children: [
              c.id,
              " \xB7 spend ",
              inr(c.spend)
            ] })
          ] }),
          /* @__PURE__ */ jsxs27("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxs27("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx30("p", { className: "font-display text-2xl font-extrabold text-brand-700", children: c.leads }),
              /* @__PURE__ */ jsx30("p", { className: "text-xs font-semibold text-ink-500", children: "leads" })
            ] }),
            /* @__PURE__ */ jsx30(
              RowMenu,
              {
                items: [
                  { label: "Edit campaign", icon: Pencil10, onClick: () => {
                    setEditing(c);
                    setFormOpen(true);
                  } },
                  {
                    label: c.status === "Running" ? "Pause" : "Resume",
                    icon: c.status === "Running" ? Pause : Play,
                    onClick: () => update("campaigns", c.id, { status: c.status === "Running" ? "Paused" : "Running" })
                  },
                  { label: "Duplicate", icon: Copy2, onClick: () => duplicate("campaigns", c.id) },
                  { label: "Delete", icon: Trash212, danger: true, onClick: () => setConfirm(c) }
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx30("div", { className: "mt-5 grid grid-cols-3 gap-3 text-center", children: [
          { label: "Sent", value: c.sent.toLocaleString("en-IN") },
          { label: "Opened", value: `${openRate}%` },
          { label: "Clicked", value: `${clickRate}%` }
        ].map((m) => /* @__PURE__ */ jsxs27("div", { className: "rounded-xl bg-surface-soft px-3 py-2.5", children: [
          /* @__PURE__ */ jsx30("p", { className: "font-display text-lg font-extrabold text-ink-900", children: m.value }),
          /* @__PURE__ */ jsx30("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-ink-500", children: m.label })
        ] }, m.label)) }),
        /* @__PURE__ */ jsxs27("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxs27("div", { className: "mb-1 flex justify-between text-xs font-semibold text-ink-500", children: [
            /* @__PURE__ */ jsx30("span", { children: "Engagement" }),
            /* @__PURE__ */ jsxs27("span", { children: [
              openRate,
              "% opened"
            ] })
          ] }),
          /* @__PURE__ */ jsx30("div", { className: "h-2 overflow-hidden rounded-full bg-surface-soft", children: /* @__PURE__ */ jsx30(
            "div",
            {
              className: "h-full rounded-full bg-gradient-to-r from-brand-600 to-ocean",
              style: { width: `${openRate}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs27("div", { className: "mt-4 flex gap-2 border-t border-ink-900/[0.07] pt-4", children: [
          /* @__PURE__ */ jsxs27(
            "button",
            {
              className: "btn-soft flex-1 py-2 text-xs",
              onClick: () => update("campaigns", c.id, { status: c.status === "Running" ? "Paused" : "Running" }),
              children: [
                c.status === "Running" ? /* @__PURE__ */ jsx30(Pause, { size: 14 }) : /* @__PURE__ */ jsx30(Play, { size: 14 }),
                c.status === "Running" ? "Pause" : "Resume"
              ]
            }
          ),
          /* @__PURE__ */ jsxs27("button", { className: "btn-ghost flex-1 py-2 text-xs", onClick: () => duplicate("campaigns", c.id), children: [
            /* @__PURE__ */ jsx30(Copy2, { size: 14 }),
            " Duplicate"
          ] })
        ] })
      ] }, c.id);
    }) }),
    list.length === 0 && /* @__PURE__ */ jsx30("div", { className: "card p-16 text-center", children: /* @__PURE__ */ jsx30("p", { className: "text-sm font-semibold text-ink-600", children: "No campaigns on this channel" }) }),
    /* @__PURE__ */ jsx30(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.name}` : "New campaign",
        subtitle: editing ? editing.id : "Launch a broadcast or paid campaign",
        fields,
        initial: editing || { channel: "WhatsApp", status: "Draft", opened: 0, clicked: 0, leads: 0, spend: 0 },
        submitLabel: editing ? "Save changes" : "Create campaign"
      }
    ),
    /* @__PURE__ */ jsx30(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("campaigns", confirm.id),
        title: "Delete campaign?",
        message: `\u201C${confirm?.name}\u201D and its performance history will be removed.`
      }
    )
  ] });
}

// src/pages/Team.jsx
import { useState as useState20 } from "react";
import { UserPlus as UserPlus3, Mail as Mail5, Phone as Phone4, Pencil as Pencil11, Trash2 as Trash213, ShieldCheck as ShieldCheck3, Send as Send3 } from "lucide-react";
import { Fragment as Fragment16, jsx as jsx31, jsxs as jsxs28 } from "react/jsx-runtime";
var ROLES = [
  "Owner",
  "Senior Travel Consultant",
  "Travel Consultant",
  "Visa & Documentation",
  "Accounts"
];
var STATUSES5 = ["Active", "Invited", "Disabled"];
var statusTone2 = { Active: "green", Invited: "amber", Disabled: "slate" };
var digits4 = (phone) => String(phone).replace(/[^\d]/g, "");
var rate = (m) => m.enquiries ? Math.round(m.bookings / m.enquiries * 100) : null;
function Team() {
  const { team: team2, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState20(false);
  const [editing, setEditing] = useState20(null);
  const [confirm, setConfirm] = useState20(null);
  const fields = [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: ROLES },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "status", label: "Status", type: "select", options: STATUSES5 }
  ];
  const save = (values) => {
    if (editing) update("team", editing.id, values);
    else create("team", { ...values, enquiries: 0, bookings: 0, revenue: 0 });
  };
  const columns = [
    {
      key: "name",
      header: "Member",
      render: (m) => /* @__PURE__ */ jsxs28("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx31(Avatar, { name: m.name }),
        /* @__PURE__ */ jsxs28("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx31("p", { className: "truncate font-bold text-ink-900", children: m.name }),
          /* @__PURE__ */ jsx31("p", { className: "truncate text-xs text-ink-500", children: m.role })
        ] })
      ] })
    },
    {
      key: "email",
      header: "Contact",
      render: (m) => /* @__PURE__ */ jsxs28("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx31("a", { href: `mailto:${m.email}`, className: "block truncate text-ink-700 hover:text-brand-700", children: m.email }),
        /* @__PURE__ */ jsx31("a", { href: `tel:${digits4(m.phone)}`, className: "block text-xs text-ink-500 hover:text-brand-700", children: m.phone })
      ] })
    },
    {
      key: "enquiries",
      header: "Enquiries",
      render: (m) => /* @__PURE__ */ jsx31("span", { className: "num font-semibold text-ink-800", children: m.enquiries || "\u2014" })
    },
    {
      key: "bookings",
      header: "Bookings",
      render: (m) => /* @__PURE__ */ jsx31("span", { className: "num font-semibold text-ink-800", children: m.bookings || "\u2014" })
    },
    {
      key: "revenue",
      header: "Revenue",
      render: (m) => /* @__PURE__ */ jsx31("span", { className: "num font-bold text-brand-700", children: m.revenue ? inr(m.revenue) : "\u2014" })
    },
    {
      key: "conversion",
      header: "Conversion",
      csv: (m) => rate(m) === null ? "" : `${rate(m)}%`,
      render: (m) => rate(m) === null ? /* @__PURE__ */ jsx31("span", { className: "text-ink-400", children: "\u2014" }) : /* @__PURE__ */ jsxs28("span", { className: "num font-bold text-ink-900", children: [
        rate(m),
        "%"
      ] })
    },
    {
      key: "status",
      header: "Status",
      render: (m) => /* @__PURE__ */ jsx31(Badge, { tone: statusTone2[m.status], dot: true, children: m.status })
    },
    {
      key: "actions",
      header: "",
      render: (m) => /* @__PURE__ */ jsx31("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx31(
        RowMenu,
        {
          items: [
            {
              label: "Edit member",
              icon: Pencil11,
              onClick: () => {
                setEditing(m);
                setFormOpen(true);
              }
            },
            { label: "Email", icon: Mail5, onClick: () => {
              window.location.href = `mailto:${m.email}`;
            } },
            { label: "Call", icon: Phone4, onClick: () => {
              window.location.href = `tel:${digits4(m.phone)}`;
            } },
            ...m.status === "Invited" ? [{ label: "Resend invite", icon: Send3, onClick: () => toast(`Invite resent to ${m.email}`) }] : [],
            {
              label: m.status === "Disabled" ? "Enable access" : "Disable access",
              icon: ShieldCheck3,
              onClick: () => update("team", m.id, { status: m.status === "Disabled" ? "Active" : "Disabled" })
            },
            { label: "Remove", icon: Trash213, danger: true, onClick: () => setConfirm(m) }
          ]
        }
      ) })
    }
  ];
  return /* @__PURE__ */ jsxs28(Fragment16, { children: [
    /* @__PURE__ */ jsx31(PageHeader, { title: "Team", subtitle: `${team2.length} people on the desk`, children: /* @__PURE__ */ jsxs28(
      "button",
      {
        className: "btn-primary",
        onClick: () => {
          setEditing(null);
          setFormOpen(true);
        },
        children: [
          /* @__PURE__ */ jsx31(UserPlus3, { size: 16 }),
          " Invite member"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx31(
      DataTable,
      {
        columns,
        rows: team2,
        selectable: false,
        searchKeys: ["name", "email", "phone", "role"],
        searchPlaceholder: "Search the team\u2026",
        filters: [
          { key: "role", label: "Role", options: ROLES },
          { key: "status", label: "Status", options: STATUSES5 }
        ],
        exportName: "smira-club-team",
        emptyLabel: "No team members match this view",
        onRowClick: (m) => {
          setEditing(m);
          setFormOpen(true);
        }
      }
    ),
    /* @__PURE__ */ jsx31(
      FormModal,
      {
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: save,
        title: editing ? `Edit ${editing.name}` : "Invite team member",
        subtitle: editing ? editing.id : "They receive an email invite to join the workspace",
        fields,
        initial: editing || { role: "Travel Consultant", status: "Invited" },
        submitLabel: editing ? "Save changes" : "Send invite",
        size: "md"
      }
    ),
    /* @__PURE__ */ jsx31(
      ConfirmDialog,
      {
        open: Boolean(confirm),
        onClose: () => setConfirm(null),
        onConfirm: () => remove("team", confirm.id),
        title: "Remove team member?",
        message: `${confirm?.name} loses access to this workspace immediately. Their records stay assigned.`,
        confirmLabel: "Remove"
      }
    )
  ] });
}

// src/pages/Reports.jsx
import {
  ResponsiveContainer as ResponsiveContainer3,
  ComposedChart,
  Bar,
  Line,
  XAxis as XAxis2,
  YAxis as YAxis2,
  CartesianGrid as CartesianGrid2,
  Tooltip as Tooltip3,
  Legend as Legend2,
  RadialBarChart,
  RadialBar
} from "recharts";
import { Download as Download5, FileSpreadsheet } from "lucide-react";

// src/components/dashboard/SourceDonut.jsx
import { ResponsiveContainer as ResponsiveContainer2, PieChart as PieChart2, Pie, Cell, Tooltip as Tooltip2 } from "recharts";
import { jsx as jsx32, jsxs as jsxs29 } from "react/jsx-runtime";
function SourceDonut() {
  const total = sources.reduce((s, x) => s + x.value, 0);
  return /* @__PURE__ */ jsx32(Card, { eyebrow: "Attribution", title: "Enquiry sources", subtitle: "Where this week's enquiries came from", children: /* @__PURE__ */ jsxs29("div", { className: "flex flex-col items-center gap-4 sm:flex-row", children: [
    /* @__PURE__ */ jsxs29("div", { className: "relative h-[190px] w-[190px] shrink-0", children: [
      /* @__PURE__ */ jsx32(ResponsiveContainer2, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs29(PieChart2, { children: [
        /* @__PURE__ */ jsx32(
          Pie,
          {
            data: sources,
            dataKey: "value",
            nameKey: "name",
            innerRadius: 58,
            outerRadius: 90,
            paddingAngle: 3,
            stroke: "none",
            children: sources.map((s) => /* @__PURE__ */ jsx32(Cell, { fill: s.color }, s.name))
          }
        ),
        /* @__PURE__ */ jsx32(
          Tooltip2,
          {
            contentStyle: {
              borderRadius: 12,
              border: "1px solid rgba(11,21,36,0.06)",
              boxShadow: "0 20px 45px -20px rgba(11,21,36,0.28)",
              fontSize: 12,
              fontWeight: 600
            }
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx32("div", { className: "pointer-events-none absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxs29("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx32("p", { className: "font-display text-2xl font-extrabold leading-none", children: total }),
        /* @__PURE__ */ jsx32("p", { className: "mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400", children: "Enquiries" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx32("ul", { className: "w-full space-y-2.5", children: sources.map((s) => /* @__PURE__ */ jsxs29("li", { className: "flex items-center gap-3 text-sm", children: [
      /* @__PURE__ */ jsx32("span", { className: "h-2.5 w-2.5 shrink-0 rounded-full", style: { background: s.color } }),
      /* @__PURE__ */ jsx32("span", { className: "flex-1 font-semibold text-ink-700", children: s.name }),
      /* @__PURE__ */ jsxs29("span", { className: "text-ink-500", children: [
        Math.round(s.value / total * 100),
        "%"
      ] }),
      /* @__PURE__ */ jsx32("span", { className: "w-8 text-right font-bold text-ink-900", children: s.value })
    ] }, s.name)) })
  ] }) });
}

// src/components/dashboard/TopDestinations.jsx
import { MapPin as MapPin2 } from "lucide-react";
import { Link } from "react-router-dom";
import { jsx as jsx33, jsxs as jsxs30 } from "react/jsx-runtime";
function TopDestinations() {
  const max = Math.max(...topDestinations.map((d) => d.bookings));
  return /* @__PURE__ */ jsx33(
    Card,
    {
      eyebrow: "Demand",
      title: "Top destinations",
      subtitle: "Bookings and revenue this quarter",
      action: /* @__PURE__ */ jsx33(Link, { to: "/reports", className: "text-sm font-semibold text-brand-700 hover:underline", children: "View all" }),
      children: /* @__PURE__ */ jsx33("ul", { className: "space-y-4", children: topDestinations.map((d, i) => /* @__PURE__ */ jsxs30("li", { children: [
        /* @__PURE__ */ jsxs30("div", { className: "mb-1.5 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx33("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600", children: /* @__PURE__ */ jsx33(MapPin2, { size: 15, strokeWidth: 2.3 }) }),
          /* @__PURE__ */ jsx33("span", { className: "flex-1 text-sm font-bold text-ink-900", children: d.name }),
          /* @__PURE__ */ jsxs30("span", { className: "text-sm font-semibold text-ink-600", children: [
            d.bookings,
            " bookings"
          ] }),
          /* @__PURE__ */ jsx33("span", { className: "w-20 text-right text-sm font-bold text-brand-700", children: shortInr(d.revenue) })
        ] }),
        /* @__PURE__ */ jsx33("div", { className: "ml-11 h-2 overflow-hidden rounded-full bg-surface-soft", children: /* @__PURE__ */ jsx33(
          "div",
          {
            className: "h-full rounded-full bg-gradient-to-r from-brand-600 to-ocean transition-all duration-700",
            style: { width: `${d.bookings / max * 100}%`, transitionDelay: `${i * 60}ms` }
          }
        ) })
      ] }, d.name)) })
    }
  );
}

// src/pages/Reports.jsx
import { Fragment as Fragment17, jsx as jsx34, jsxs as jsxs31 } from "react/jsx-runtime";
var funnel = [
  { stage: "Enquiries", value: 168, fill: "#14a58c" },
  { stage: "Contacted", value: 151, fill: "#0ea5e9" },
  { stage: "Quoted", value: 96, fill: "#7c5cff" },
  { stage: "Booked", value: 54, fill: "#f9714a" }
];
var monthly = [
  { month: "Mar", booked: 3120, collected: 2680, bookings: 38 },
  { month: "Apr", booked: 3860, collected: 3210, bookings: 44 },
  { month: "May", booked: 4520, collected: 3720, bookings: 51 },
  { month: "Jun", booked: 4180, collected: 3640, bookings: 47 },
  { month: "Jul", booked: 5240, collected: 4310, bookings: 61 },
  { month: "Aug", booked: 4265, collected: 3120, bookings: 54 }
];
function Reports() {
  const { toast, range } = useApp();
  const exportMonthly = () => downloadCsv("smira-club-monthly-report", monthly, [
    { key: "month", header: "Month" },
    { key: "booked", header: "Booked (INR thousands)" },
    { key: "collected", header: "Collected (INR thousands)" },
    { key: "bookings", header: "Bookings" }
  ]);
  const printReport = () => {
    toast("Opening print dialog \u2014 choose \u201CSave as PDF\u201D", "info");
    setTimeout(() => window.print(), 400);
  };
  return /* @__PURE__ */ jsxs31(Fragment17, { children: [
    /* @__PURE__ */ jsxs31(PageHeader, { title: "Reports", subtitle: `Deeper analysis across the whole agency \xB7 ${range}`, children: [
      /* @__PURE__ */ jsxs31("button", { className: "btn-ghost", onClick: exportMonthly, children: [
        /* @__PURE__ */ jsx34(FileSpreadsheet, { size: 16 }),
        " Export Excel"
      ] }),
      /* @__PURE__ */ jsxs31("button", { className: "btn-primary", onClick: printReport, children: [
        /* @__PURE__ */ jsx34(Download5, { size: 16 }),
        " Download PDF"
      ] })
    ] }),
    /* @__PURE__ */ jsx34(
      Card,
      {
        title: "Booked vs collected",
        subtitle: "Last 6 months, amounts in \u20B9 thousands",
        className: "mb-6",
        children: /* @__PURE__ */ jsx34("div", { className: "h-[340px]", children: /* @__PURE__ */ jsx34(ResponsiveContainer3, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs31(ComposedChart, { data: monthly, margin: { top: 10, right: 10, left: 0, bottom: 0 }, children: [
          /* @__PURE__ */ jsx34(CartesianGrid2, { strokeDasharray: "4 6", stroke: "rgba(11,21,36,0.07)", vertical: false }),
          /* @__PURE__ */ jsx34(XAxis2, { dataKey: "month", tickLine: false, axisLine: false, tick: { fontSize: 12, fill: "#6d7c93", fontWeight: 600 }, dy: 8 }),
          /* @__PURE__ */ jsx34(YAxis2, { yAxisId: "left", tickLine: false, axisLine: false, width: 56, tick: { fontSize: 12, fill: "#96a2b4" } }),
          /* @__PURE__ */ jsx34(YAxis2, { yAxisId: "right", orientation: "right", tickLine: false, axisLine: false, width: 40, tick: { fontSize: 12, fill: "#96a2b4" } }),
          /* @__PURE__ */ jsx34(
            Tooltip3,
            {
              cursor: { fill: "rgba(20,165,140,0.06)" },
              contentStyle: {
                borderRadius: 12,
                border: "1px solid rgba(11,21,36,0.06)",
                boxShadow: "0 20px 45px -20px rgba(11,21,36,0.28)",
                fontSize: 12,
                fontWeight: 600
              }
            }
          ),
          /* @__PURE__ */ jsx34(Legend2, { iconType: "circle", iconSize: 8, wrapperStyle: { fontSize: 12, fontWeight: 600, paddingTop: 8 } }),
          /* @__PURE__ */ jsx34(Bar, { yAxisId: "left", dataKey: "booked", name: "Booked (\u20B9K)", fill: "#14a58c", radius: [8, 8, 4, 4], barSize: 26 }),
          /* @__PURE__ */ jsx34(Bar, { yAxisId: "left", dataKey: "collected", name: "Collected (\u20B9K)", fill: "#a8ebda", radius: [8, 8, 4, 4], barSize: 26 }),
          /* @__PURE__ */ jsx34(Line, { yAxisId: "right", type: "monotone", dataKey: "bookings", name: "Bookings", stroke: "#f9714a", strokeWidth: 3, dot: { r: 4 } })
        ] }) }) })
      }
    ),
    /* @__PURE__ */ jsxs31("div", { className: "mb-6 grid gap-6 xl:grid-cols-3", children: [
      /* @__PURE__ */ jsxs31(Card, { title: "Conversion funnel", subtitle: "From first enquiry to confirmed booking", children: [
        /* @__PURE__ */ jsx34("div", { className: "h-[240px]", children: /* @__PURE__ */ jsx34(ResponsiveContainer3, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs31(RadialBarChart, { data: funnel, innerRadius: "30%", outerRadius: "100%", startAngle: 90, endAngle: -270, children: [
          /* @__PURE__ */ jsx34(RadialBar, { dataKey: "value", background: true, cornerRadius: 8 }),
          /* @__PURE__ */ jsx34(
            Tooltip3,
            {
              contentStyle: {
                borderRadius: 12,
                border: "1px solid rgba(11,21,36,0.06)",
                fontSize: 12,
                fontWeight: 600
              }
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsx34("ul", { className: "mt-2 space-y-2", children: funnel.map((f, i) => /* @__PURE__ */ jsxs31("li", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsx34("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: f.fill } }),
          /* @__PURE__ */ jsx34("span", { className: "flex-1 font-semibold text-ink-700", children: f.stage }),
          /* @__PURE__ */ jsx34("span", { className: "font-bold text-ink-900", children: f.value }),
          /* @__PURE__ */ jsx34("span", { className: "w-12 text-right text-xs text-ink-500", children: i === 0 ? "100%" : `${Math.round(f.value / funnel[0].value * 100)}%` })
        ] }, f.stage)) })
      ] }),
      /* @__PURE__ */ jsx34(SourceDonut, {}),
      /* @__PURE__ */ jsx34(TopDestinations, {})
    ] }),
    /* @__PURE__ */ jsxs31(Card, { title: "Sales snapshot", subtitle: "Current period totals", children: [
      /* @__PURE__ */ jsx34("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: trends.sales.stats.map((s) => /* @__PURE__ */ jsxs31("div", { className: "rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3.5", children: [
        /* @__PURE__ */ jsx34("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-500", children: s.label }),
        /* @__PURE__ */ jsx34("p", { className: "mt-1 font-display text-xl font-extrabold text-ink-900", children: s.value })
      ] }, s.label)) }),
      /* @__PURE__ */ jsxs31("p", { className: "mt-4 text-xs text-ink-400", children: [
        "Peak month so far: July at ",
        shortInr(524e4),
        " booked value."
      ] })
    ] })
  ] });
}

// src/pages/Settings.jsx
import { useState as useState21 } from "react";
import {
  Building2 as Building23,
  Bell as Bell2,
  Plug,
  CreditCard as CreditCard2,
  ShieldCheck as ShieldCheck4,
  Save,
  Check as Check4,
  RotateCcw as RotateCcw2
} from "lucide-react";
import { Fragment as Fragment18, jsx as jsx35, jsxs as jsxs32 } from "react/jsx-runtime";
var tabs2 = [
  { key: "agency", label: "Agency profile", icon: Building23 },
  { key: "notifications", label: "Notifications", icon: Bell2 },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "billing", label: "Plan & billing", icon: CreditCard2 },
  { key: "security", label: "Security", icon: ShieldCheck4 }
];
var integrationCopy = {
  "WhatsApp Business API": "Send itineraries and payment reminders",
  Razorpay: "Collect advance and balance payments online",
  "Amadeus GDS": "Live flight availability and fares",
  "Google Calendar": "Sync departures and follow-up tasks",
  Tally: "Push invoices into your accounting books"
};
function Toggle({ on, onChange }) {
  return /* @__PURE__ */ jsx35(
    "button",
    {
      onClick: () => onChange(!on),
      className: `relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-ink-900/15"}`,
      "aria-pressed": on,
      children: /* @__PURE__ */ jsx35(
        "span",
        {
          className: `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`
        }
      )
    }
  );
}
function Settings2() {
  const { settings, saveSettings, resetDemo, toast } = useApp();
  const [tab, setTab] = useState21("agency");
  const [agency, setAgency] = useState21(settings.agency);
  const [resetOpen, setResetOpen] = useState21(false);
  const setNotification = (key, value) => saveSettings({ notifications: { ...settings.notifications, [key]: value } });
  const setSecurity = (key, value) => saveSettings({ security: { ...settings.security, [key]: value } });
  const toggleIntegration = (name) => {
    const next = !settings.integrations[name];
    saveSettings({ integrations: { ...settings.integrations, [name]: next } });
    toast(next ? `${name} connected` : `${name} disconnected`, next ? "success" : "info");
  };
  const saveAll = () => {
    saveSettings({ agency });
    toast("Settings saved");
  };
  return /* @__PURE__ */ jsxs32(Fragment18, { children: [
    /* @__PURE__ */ jsxs32(PageHeader, { title: "Settings", subtitle: "Configure the workspace for your agency", children: [
      /* @__PURE__ */ jsxs32("button", { className: "btn-ghost", onClick: () => setResetOpen(true), children: [
        /* @__PURE__ */ jsx35(RotateCcw2, { size: 16 }),
        " Reset demo data"
      ] }),
      /* @__PURE__ */ jsxs32("button", { className: "btn-primary", onClick: saveAll, children: [
        /* @__PURE__ */ jsx35(Save, { size: 16 }),
        " Save changes"
      ] })
    ] }),
    /* @__PURE__ */ jsxs32("div", { className: "grid gap-6 lg:grid-cols-[240px_1fr]", children: [
      /* @__PURE__ */ jsx35("nav", { className: "card h-fit p-2", children: tabs2.map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxs32(
        "button",
        {
          onClick: () => setTab(key),
          className: `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === key ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-surface-soft"}`,
          children: [
            /* @__PURE__ */ jsx35(Icon, { size: 17, strokeWidth: 2.2 }),
            label
          ]
        },
        key
      )) }),
      /* @__PURE__ */ jsxs32("div", { className: "space-y-6", children: [
        tab === "agency" && /* @__PURE__ */ jsxs32(Card, { title: "Agency profile", subtitle: "Appears on quotations, invoices and vouchers", children: [
          /* @__PURE__ */ jsxs32("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            [
              ["name", "Agency name"],
              ["email", "Contact email"],
              ["phone", "Phone"],
              ["gstin", "GSTIN"],
              ["licence", "IATA / licence no."]
            ].map(([key, label]) => /* @__PURE__ */ jsxs32("div", { children: [
              /* @__PURE__ */ jsx35("label", { className: "label", htmlFor: key, children: label }),
              /* @__PURE__ */ jsx35(
                "input",
                {
                  id: key,
                  className: "input",
                  value: agency[key],
                  onChange: (e) => setAgency({ ...agency, [key]: e.target.value })
                }
              )
            ] }, key)),
            /* @__PURE__ */ jsxs32("div", { children: [
              /* @__PURE__ */ jsx35("label", { className: "label", htmlFor: "currency", children: "Default currency" }),
              /* @__PURE__ */ jsxs32(
                "select",
                {
                  id: "currency",
                  className: "input",
                  value: agency.currency,
                  onChange: (e) => setAgency({ ...agency, currency: e.target.value }),
                  children: [
                    /* @__PURE__ */ jsx35("option", { children: "INR \u2014 Indian Rupee" }),
                    /* @__PURE__ */ jsx35("option", { children: "USD \u2014 US Dollar" }),
                    /* @__PURE__ */ jsx35("option", { children: "AED \u2014 UAE Dirham" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs32("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx35("label", { className: "label", htmlFor: "address", children: "Registered address" }),
              /* @__PURE__ */ jsx35(
                "textarea",
                {
                  id: "address",
                  className: "input min-h-[92px] resize-y",
                  value: agency.address,
                  onChange: (e) => setAgency({ ...agency, address: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs32("div", { className: "mt-5 flex justify-end gap-2.5 border-t border-ink-900/[0.07] pt-5", children: [
            /* @__PURE__ */ jsx35("button", { className: "btn-ghost", onClick: () => setAgency(settings.agency), children: "Discard" }),
            /* @__PURE__ */ jsxs32("button", { className: "btn-primary", onClick: saveAll, children: [
              /* @__PURE__ */ jsx35(Save, { size: 16 }),
              " Save profile"
            ] })
          ] })
        ] }),
        tab === "notifications" && /* @__PURE__ */ jsx35(Card, { title: "Notifications", subtitle: "Choose what the team gets alerted about", children: /* @__PURE__ */ jsx35("ul", { className: "divide-y divide-ink-900/[0.07]", children: [
          ["newEnquiry", "New enquiry received", "Ping the assigned consultant instantly"],
          ["payment", "Payment received", "Alert accounts when money lands"],
          ["departure", "Departure reminders", "72 hours before every trip starts"],
          ["digest", "Daily email digest", "Morning summary of pipeline and tasks"],
          ["marketing", "Campaign performance", "Weekly rollup of campaign results"]
        ].map(([key, title, desc]) => /* @__PURE__ */ jsxs32("li", { className: "flex items-center gap-4 py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs32("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx35("p", { className: "text-sm font-bold text-ink-900", children: title }),
            /* @__PURE__ */ jsx35("p", { className: "text-xs text-ink-500", children: desc })
          ] }),
          /* @__PURE__ */ jsx35(Toggle, { on: settings.notifications[key], onChange: (v) => setNotification(key, v) })
        ] }, key)) }) }),
        tab === "integrations" && /* @__PURE__ */ jsx35(Card, { title: "Integrations", subtitle: "Connect the tools your agency already runs on", children: /* @__PURE__ */ jsx35("ul", { className: "divide-y divide-ink-900/[0.07]", children: Object.entries(settings.integrations).map(([name, connected]) => /* @__PURE__ */ jsxs32("li", { className: "flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsx35("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-surface-soft text-ink-600", children: /* @__PURE__ */ jsx35(Plug, { size: 18 }) }),
          /* @__PURE__ */ jsxs32("div", { className: "min-w-[180px] flex-1", children: [
            /* @__PURE__ */ jsx35("p", { className: "text-sm font-bold text-ink-900", children: name }),
            /* @__PURE__ */ jsx35("p", { className: "text-xs text-ink-500", children: integrationCopy[name] })
          ] }),
          connected ? /* @__PURE__ */ jsxs32("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs32(Badge, { tone: "green", dot: true, children: [
              /* @__PURE__ */ jsx35(Check4, { size: 12 }),
              " Connected"
            ] }),
            /* @__PURE__ */ jsx35(
              "button",
              {
                className: "btn-ghost py-2 text-xs",
                onClick: () => toggleIntegration(name),
                children: "Disconnect"
              }
            )
          ] }) : /* @__PURE__ */ jsx35("button", { className: "btn-soft py-2 text-xs", onClick: () => toggleIntegration(name), children: "Connect" })
        ] }, name)) }) }),
        tab === "billing" && /* @__PURE__ */ jsxs32(Card, { title: "Plan & billing", subtitle: "Your current subscription", children: [
          /* @__PURE__ */ jsxs32("div", { className: "rounded-2xl bg-gradient-to-br from-brand-600 to-ocean p-6 text-white", children: [
            /* @__PURE__ */ jsx35(Badge, { className: "bg-white/20 text-white", children: "Current plan" }),
            /* @__PURE__ */ jsx35("p", { className: "mt-3 font-display text-3xl font-extrabold", children: "Growth" }),
            /* @__PURE__ */ jsx35("p", { className: "mt-1 text-sm text-white/80", children: "\u20B94,999 / month \xB7 10 consultant seats \xB7 unlimited enquiries" }),
            /* @__PURE__ */ jsxs32("div", { className: "mt-5 flex flex-wrap gap-2.5", children: [
              /* @__PURE__ */ jsx35(
                "button",
                {
                  className: "rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700",
                  onClick: () => toast("Upgrade request sent \u2014 our team will call you today", "info"),
                  children: "Upgrade to Ultimate"
                }
              ),
              /* @__PURE__ */ jsx35(
                "button",
                {
                  className: "rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur",
                  onClick: () => toast("Billing history emailed to " + agency.email, "info"),
                  children: "Billing history"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx35("div", { className: "mt-5 grid gap-4 sm:grid-cols-3", children: [
            ["Seats used", "6 / 10"],
            ["Next invoice", "01 Sep 2026"],
            ["Storage", "4.2 GB / 25 GB"]
          ].map(([k, v]) => /* @__PURE__ */ jsxs32("div", { className: "rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3.5", children: [
            /* @__PURE__ */ jsx35("p", { className: "text-[11px] font-bold uppercase tracking-wide text-ink-500", children: k }),
            /* @__PURE__ */ jsx35("p", { className: "mt-1 font-display text-lg font-extrabold text-ink-900", children: v })
          ] }, k)) })
        ] }),
        tab === "security" && /* @__PURE__ */ jsxs32(Card, { title: "Security", subtitle: "Protect customer data and payment records", children: [
          /* @__PURE__ */ jsxs32("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs32("div", { children: [
              /* @__PURE__ */ jsx35("label", { className: "label", htmlFor: "pwd-current", children: "Current password" }),
              /* @__PURE__ */ jsx35("input", { id: "pwd-current", type: "password", className: "input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })
            ] }),
            /* @__PURE__ */ jsxs32("div", { children: [
              /* @__PURE__ */ jsx35("label", { className: "label", htmlFor: "pwd-new", children: "New password" }),
              /* @__PURE__ */ jsx35("input", { id: "pwd-new", type: "password", className: "input", placeholder: "Enter a new password" })
            ] }),
            /* @__PURE__ */ jsx35("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx35("button", { className: "btn-soft", onClick: () => toast("Password updated"), children: "Update password" }) })
          ] }),
          /* @__PURE__ */ jsx35("ul", { className: "mt-5 divide-y divide-ink-900/[0.07] border-t border-ink-900/[0.07]", children: [
            ["twoFactor", "Two-factor authentication", "Require an OTP on every new device"],
            ["restrictExport", "Restrict export", "Only owners can export customer lists"],
            ["sessionTimeout", "Session timeout", "Sign out idle sessions after 30 minutes"]
          ].map(([key, title, desc]) => /* @__PURE__ */ jsxs32("li", { className: "flex items-center gap-4 py-4", children: [
            /* @__PURE__ */ jsxs32("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx35("p", { className: "text-sm font-bold text-ink-900", children: title }),
              /* @__PURE__ */ jsx35("p", { className: "text-xs text-ink-500", children: desc })
            ] }),
            /* @__PURE__ */ jsx35(Toggle, { on: settings.security[key], onChange: (v) => setSecurity(key, v) })
          ] }, key)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx35(
      ConfirmDialog,
      {
        open: resetOpen,
        onClose: () => setResetOpen(false),
        onConfirm: resetDemo,
        title: "Reset demo data?",
        message: "Every record you added or edited is discarded and the original demo dataset comes back.",
        confirmLabel: "Reset everything"
      }
    )
  ] });
}

// src/App.jsx
import { jsx as jsx36, jsxs as jsxs33 } from "react/jsx-runtime";
function App() {
  return /* @__PURE__ */ jsxs33(Routes, { children: [
    /* @__PURE__ */ jsx36(Route, { path: "/login", element: /* @__PURE__ */ jsx36(Login, {}) }),
    /* @__PURE__ */ jsxs33(
      Route,
      {
        element: /* @__PURE__ */ jsx36(RequireAuth, { children: /* @__PURE__ */ jsx36(Layout, {}) }),
        children: [
          /* @__PURE__ */ jsx36(Route, { index: true, element: /* @__PURE__ */ jsx36(Dashboard, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "enquiries", element: /* @__PURE__ */ jsx36(Enquiries, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "bookings", element: /* @__PURE__ */ jsx36(Bookings, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "packages", element: /* @__PURE__ */ jsx36(Packages, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "memberships", element: /* @__PURE__ */ jsx36(Memberships, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "customers", element: /* @__PURE__ */ jsx36(Customers, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "tasks", element: /* @__PURE__ */ jsx36(Tasks, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "quotations", element: /* @__PURE__ */ jsx36(Quotations, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "invoices", element: /* @__PURE__ */ jsx36(Invoices, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "payments", element: /* @__PURE__ */ jsx36(Payments, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "suppliers", element: /* @__PURE__ */ jsx36(Suppliers, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "campaigns", element: /* @__PURE__ */ jsx36(Campaigns, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "team", element: /* @__PURE__ */ jsx36(Team, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "reports", element: /* @__PURE__ */ jsx36(Reports, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "settings", element: /* @__PURE__ */ jsx36(Settings2, {}) }),
          /* @__PURE__ */ jsx36(Route, { path: "*", element: /* @__PURE__ */ jsx36(Navigate3, { to: "/", replace: true }) })
        ]
      }
    )
  ] });
}

// .smoke-entry.jsx
var markers = { "/": "What needs your attention", "/enquiries": "Add enquiry", "/quotations": "New quotation", "/bookings": "Bookings", "/packages": "Create package", "/memberships": "Membership plans", "/suppliers": "Suppliers", "/invoices": "Invoices", "/payments": "Payments", "/customers": "Add customer", "/team": "Invite member", "/campaigns": "Campaigns", "/reports": "Reports", "/settings": "Settings", "/tasks": "Tasks" };
var failed = 0;
for (const [route, marker] of Object.entries(markers)) {
  try {
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(AppProvider, null, React.createElement(App))
      )
    );
    if (!html.includes(marker)) {
      failed++;
      console.log("  EMPTY " + route + '  ->  rendered without "' + marker + '"');
    } else {
      console.log("  ok    " + route);
    }
  } catch (err) {
    failed++;
    console.log("  FAIL  " + route + "  ->  " + err.message);
  }
}
localStorage.removeItem("smira-club-admin:auth");
try {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/login"] },
      React.createElement(AppProvider, null, React.createElement(App))
    )
  );
  if (html.includes("Sign in to your panel")) console.log("  ok    /login");
  else {
    failed++;
    console.log("  EMPTY /login");
  }
} catch (err) {
  failed++;
  console.log("  FAIL  /login  ->  " + err.message);
}
console.log(failed ? "\n" + failed + " route(s) failed" : "\nall routes rendered their content");
process.exit(failed ? 1 : 0);
