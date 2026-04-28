import type { EventData } from './calendar';

export function googleMapsSearchUrl(ev: EventData) {
  const q = ev.lat && ev.lng ? `${ev.lat},${ev.lng}` : ev.address || ev.location || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function googleMapsDirectionsUrl(ev: EventData) {
  const q = ev.lat && ev.lng ? `${ev.lat},${ev.lng}` : ev.address || ev.location || '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

export function appleMapsUrl(ev: EventData) {
  const q = ev.lat && ev.lng ? `${ev.lat},${ev.lng}` : ev.address || ev.location || '';
  return `maps://?q=${encodeURIComponent(q)}&ll=${ev.lat},${ev.lng}`;
}

export function wazeUrl(ev: EventData) {
  return `https://waze.com/ul?ll=${ev.lat}%2C${ev.lng}&navigate=yes`;
}

export function openMapInApp(app: 'google' | 'apple' | 'waze', ev: EventData) {
  if (app === 'google') {
    window.open(googleMapsDirectionsUrl(ev), '_blank');
  } else if (app === 'apple') {
    window.location.href = appleMapsUrl(ev);
  } else if (app === 'waze') {
    window.open(wazeUrl(ev), '_blank');
  }
}
