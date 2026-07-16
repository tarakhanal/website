import type { EventData } from './calendar';

// All dates/times are in Eastern Time (America/New_York). We emit all-day events so timezone is informational.
export const ceremonyEvent: EventData = {
  title: 'Tara & Bandana Wedding Ceremony',
  location: 'Home Economics Building, South Park',
  address: '2050 Buffalo Dr, South Park Township, PA 15129',
  startDate: new Date(2027, 3, 24),
  endDate: new Date(2027, 3, 25),
  description: "We would love to have you join us celebrate our big day with us!",
  uid: 'tara-bandana-ceremony-2027@example.com',
  priority: 5,
  reminderMinutes: 10080,  // 1 week before
  reminderMinutes2: 2880,  // 2 days before
  allDay: true,
  lat: 40.28940,
  lng: -79.99870,
  timezone: 'America/New_York',
};

export const receptionEvent: EventData = {
  title: 'Tara & Bandana Wedding Reception',
  location: 'Star Venue LLC Party House, Columbus',
  address: '4257 Eastland Square Dr Suite A, Columbus, OH 43232',
  start: new Date('2027-04-25T16:00:00Z'),
  end: new Date('2027-04-26T02:30:00Z'),
  description: 'We would love to have you join us for our reception party!',
  uid: 'tara-bandana-reception-2027@example.com',
  priority: 5,
  reminderMinutes: 10080,  // 1 week before
  reminderMinutes2: 2880,  // 2 days before
  allDay: false,
  lat: 39.94860,
  lng: -82.83140,
  timezone: 'America/New_York',
};
