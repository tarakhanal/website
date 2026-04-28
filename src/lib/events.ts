import type { EventData } from './calendar';

// All dates/times are in Eastern Time (America/New_York). We emit all-day events so timezone is informational.
export const ceremonyEvent: EventData = {
  title: 'Tara & Bandana Wedding Ceremony',
  location: 'Pittsburgh, PA',
  address: 'Pittsburgh, PA',
  startDate: new Date('2027-05-08'),
  endDate: new Date('2027-05-09'),
  description: "Join us to celebrate our wedding.",
  uid: 'tara-bandana-ceremony-2027@example.com',
  priority: 5,
  reminderMinutes: 60,
  allDay: true,
  lat: 40.32080301011465,
  lng: -79.9712480576721,
  timezone: 'America/New_York',
};

export const receptionEvent: EventData = {
  title: 'Tara & Bandana Wedding Reception',
  location: 'Pittsburgh, PA',
  address: 'Pittsburgh, PA',
  startDate: new Date('2027-05-08'),
  endDate: new Date('2027-05-09'),
  description: 'Reception to celebrate Tara & Bandana.',
  uid: 'tara-bandana-reception-2027@example.com',
  priority: 5,
  reminderMinutes: 60,
  allDay: true,
  lat: 40.32080301011465,
  lng: -79.9712480576721,
  timezone: 'America/New_York',
};
