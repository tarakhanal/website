import type { EventData } from './calendar';

// All dates/times are in Eastern Time (America/New_York). We emit all-day events so timezone is informational.
export const ceremonyEvent: EventData = {
  title: 'Tara & Bandana Wedding Ceremony',
  location: 'Home Economics Building, South Park',
  address: '2050 Buffalo Dr, South Park Township, PA 15129',
  startDate: new Date('2027-04-24'),
  endDate: new Date('2027-04-25'),
  description: "Join us to celebrate our wedding.",
  uid: 'tara-bandana-ceremony-2027@example.com',
  priority: 5,
  reminderMinutes: 60,
  allDay: true,
  lat: 40.28940,
  lng: -79.99870,
  timezone: 'America/New_York',
};

export const receptionEvent: EventData = {
  title: 'Tara & Bandana Wedding Reception',
  location: 'Star Venue LLC Party House, Columbus',
  address: '4257 Eastland Square Dr Suite A, Columbus, OH 43232',
  startDate: new Date('2027-04-24'),
  endDate: new Date('2027-04-25'),
  description: 'Reception to celebrate Tara & Bandana.',
  uid: 'tara-bandana-reception-2027@example.com',
  priority: 5,
  reminderMinutes: 60,
  allDay: true,
  lat: 39.94860,
  lng: -82.83140,
  timezone: 'America/New_York',
};
