export type EventData = {
  title: string;
  location: string;
  address?: string;
  startDate?: Date;
  endDate?: Date;
  start?: Date;
  end?: Date;
  description?: string;
  uid?: string;
  priority?: number;
  reminderMinutes?: number;
  reminderMinutes2?: number;
  allDay?: boolean;
  lat?: number;
  lng?: number;
  timezone?: string; // ex: 'America/New_York'
};

export function escapeText(s = '') {
  return String(s).replace(/\n/g, '\\n').replace(/,/g, '\\,');
}

export function formatDateTimeToICS(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

export function formatDateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function generateICS(ev: EventData) {
  const uid = ev.uid || `${Date.now()}@wedding`;
  const dtStamp = formatDateTimeToICS(new Date());
  const lines: string[] = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//tara-bandana//EN');
  if (ev.timezone) {
    lines.push(`X-WR-TIMEZONE:${ev.timezone}`);
  }
  lines.push('CALSCALE:GREGORIAN');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${uid}`);
  lines.push(`DTSTAMP:${dtStamp}`);

  if (ev.allDay && ev.startDate && ev.endDate) {
    lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(ev.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDateOnly(ev.endDate)}`);
  } else if (ev.start && ev.end) {
    lines.push(`DTSTART:${formatDateTimeToICS(ev.start)}`);
    lines.push(`DTEND:${formatDateTimeToICS(ev.end)}`);
  }

  const locationFull = ev.address ? `${ev.location} - ${ev.address}` : ev.location;
  lines.push(`SUMMARY:${escapeText(ev.title)}`);
  lines.push(`LOCATION:${escapeText(locationFull)}`);
  lines.push(`DESCRIPTION:${escapeText(ev.description || '')}`);
  lines.push(`PRIORITY:${ev.priority || 5}`);

  if (ev.reminderMinutes) {
    lines.push('BEGIN:VALARM');
    lines.push(`TRIGGER:-PT${Number(ev.reminderMinutes)}M`);
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Reminder');
    lines.push('END:VALARM');
  }

  if (ev.reminderMinutes2) {
    lines.push('BEGIN:VALARM');
    lines.push(`TRIGGER:-PT${Number(ev.reminderMinutes2)}M`);
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Reminder');
    lines.push('END:VALARM');
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

export function downloadICSFile(ev: EventData) {
  const ics = generateICS(ev);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(ev.title || 'event').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(ev: EventData) {
  const locationFull = ev.address ? `${ev.location} - ${ev.address}` : ev.location;
  const params: any = { action: 'TEMPLATE', text: ev.title, details: ev.description || '', location: locationFull };
  if (ev.allDay && ev.startDate && ev.endDate) {
    params.dates = `${formatDateOnly(ev.startDate)}/${formatDateOnly(ev.endDate)}`;
  } else if (ev.start && ev.end) {
    params.dates = `${formatDateTimeToICS(ev.start)}/${formatDateTimeToICS(ev.end)}`;
  }
  return `https://www.google.com/calendar/render?${new URLSearchParams(params).toString()}`;
}

export function outlookWebUrl(ev: EventData) {
  const locationFull = ev.address ? `${ev.location} - ${ev.address}` : ev.location;
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    subject: ev.title,
    body: ev.description || '',
    location: locationFull,
  });
  if (ev.allDay && ev.startDate && ev.endDate) {
    params.set('startdt', new Date(ev.startDate).toISOString());
    params.set('enddt', new Date(ev.endDate).toISOString());
  } else if (ev.start && ev.end) {
    params.set('startdt', ev.start.toISOString());
    params.set('enddt', ev.end.toISOString());
  }
  return `https://outlook.live.com/owa/?${params.toString()}`;
}
