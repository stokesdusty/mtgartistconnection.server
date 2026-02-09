/**
 * Utility functions for exporting events to calendar formats
 */

interface CalendarEvent {
  name: string;
  startDate: string;
  endDate: string;
  city: string;
  url?: string;
}

/**
 * Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
 */
const formatICalDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Generate iCalendar (.ics) file content
 */
export const generateICalFile = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Add one day to end date for all-day events (iCal exclusive end date)
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  const dtstart = formatICalDate(startDate);
  const dtend = formatICalDate(endDatePlusOne);
  const dtstamp = formatICalDate(new Date());

  // Escape special characters in text fields
  const escapeiCalText = (text: string) => {
    return text.replace(/\\/g, '\\\\')
               .replace(/;/g, '\\;')
               .replace(/,/g, '\\,')
               .replace(/\n/g, '\\n');
  };

  const summary = escapeiCalText(event.name);
  const location = escapeiCalText(event.city);
  const description = event.url ? escapeiCalText(`Event URL: ${event.url}`) : '';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MtG Artist Connection//Signing Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `DTSTAMP:${dtstamp}`,
    `UID:${event.name.replace(/\s/g, '-')}-${dtstart}@mtgartistconnection.com`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    description ? `DESCRIPTION:${description}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');

  return icsContent;
};

/**
 * Detect if user is on mobile device
 */
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Download iCalendar file
 * On mobile, uses data URI for direct opening
 * On desktop, downloads the file
 */
export const downloadICalFile = (event: CalendarEvent): void => {
  const icsContent = generateICalFile(event);

  if (isMobileDevice()) {
    // For mobile devices, use data URI to open calendar app directly
    const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    window.open(dataUri, '_blank');
  } else {
    // For desktop, download the file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name.replace(/\s/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Add one day to end date for all-day events
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  const formatGoogleDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDatePlusOne)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: dates,
    location: event.city,
    details: event.url ? `Event URL: ${event.url}` : '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook.com Calendar URL
 */
export const generateOutlookCalendarUrl = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Add one day to end date for all-day events
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  const formatOutlookDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.name,
    startdt: formatOutlookDate(startDate),
    enddt: formatOutlookDate(endDatePlusOne),
    location: event.city,
    body: event.url ? `Event URL: ${event.url}` : '',
    allday: 'true',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};
