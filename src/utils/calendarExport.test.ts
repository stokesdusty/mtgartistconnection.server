import { generateICalFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl, downloadICalFile } from './calendarExport';

const baseEvent = {
  name: 'GP Las Vegas',
  startDate: '2024-06-14',
  endDate: '2024-06-16',
  city: 'Las Vegas, NV',
  url: 'https://example.com/event',
};

// Parse the CRLF-delimited iCal lines into a Map for easy assertions
const parseICalLines = (ical: string): Map<string, string> => {
  const map = new Map<string, string>();
  ical.split('\r\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      map.set(line.substring(0, colonIdx), line.substring(colonIdx + 1));
    }
  });
  return map;
};

// ---------------------------------------------------------------------------
// generateICalFile
// ---------------------------------------------------------------------------
describe('generateICalFile', () => {
  it('produces valid iCal wrapper structure', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toMatch(/^BEGIN:VCALENDAR/);
    expect(ical).toMatch(/END:VCALENDAR$/);
    expect(ical).toContain('BEGIN:VEVENT');
    expect(ical).toContain('END:VEVENT');
  });

  it('uses CRLF line endings throughout', () => {
    const ical = generateICalFile(baseEvent);
    const lines = ical.split('\r\n');
    // If any line still contains a bare \n it was incorrectly split
    lines.forEach((line) => expect(line).not.toContain('\n'));
  });

  it('sets DTSTART to the event start date in YYYYMMDD format', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('DTSTART;VALUE=DATE:20240614');
  });

  it('sets DTEND to one day after the event end date (iCal exclusive end)', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('DTEND;VALUE=DATE:20240617');
  });

  it('includes the event name in SUMMARY', () => {
    const ical = generateICalFile(baseEvent);
    const lines = parseICalLines(ical);
    expect(lines.get('SUMMARY')).toBe('GP Las Vegas');
  });

  it('includes the city in LOCATION (commas are escaped per iCal spec)', () => {
    const ical = generateICalFile(baseEvent);
    const lines = parseICalLines(ical);
    // escapeiCalText escapes commas: "Las Vegas, NV" → "Las Vegas\, NV"
    expect(lines.get('LOCATION')).toBe('Las Vegas\\, NV');
  });

  it('includes a DESCRIPTION line when url is provided', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('DESCRIPTION:');
    expect(ical).toContain('https://example.com/event');
  });

  it('omits the DESCRIPTION line when url is not provided', () => {
    const { url, ...eventWithoutUrl } = baseEvent;
    const ical = generateICalFile(eventWithoutUrl);
    expect(ical).not.toContain('DESCRIPTION:');
  });

  it('includes the MtG Artist Connection PRODID', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('PRODID:-//MtG Artist Connection//Signing Events//EN');
  });

  it('includes a UID containing the event name (spaces as dashes) and start date', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('UID:GP-Las-Vegas-20240614@mtgartistconnection.com');
  });

  it('includes a DTSTAMP line in YYYYMMDD format', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toMatch(/DTSTAMP:\d{8}/);
  });

  it('includes STATUS:CONFIRMED', () => {
    const ical = generateICalFile(baseEvent);
    expect(ical).toContain('STATUS:CONFIRMED');
  });

  it('escapes backslashes in event name', () => {
    const ical = generateICalFile({ ...baseEvent, name: 'Art\\Show' });
    const lines = parseICalLines(ical);
    expect(lines.get('SUMMARY')).toBe('Art\\\\Show');
  });

  it('escapes semicolons in event name', () => {
    const ical = generateICalFile({ ...baseEvent, name: 'Art;Show' });
    const lines = parseICalLines(ical);
    expect(lines.get('SUMMARY')).toBe('Art\\;Show');
  });

  it('escapes commas in city', () => {
    const ical = generateICalFile({ ...baseEvent, city: 'Austin, TX' });
    const lines = parseICalLines(ical);
    expect(lines.get('LOCATION')).toBe('Austin\\, TX');
  });

  it('escapes newlines in event name', () => {
    const ical = generateICalFile({ ...baseEvent, name: 'Line1\nLine2' });
    const lines = parseICalLines(ical);
    expect(lines.get('SUMMARY')).toBe('Line1\\nLine2');
  });

  it('handles a single-day event where start and end are the same date', () => {
    const ical = generateICalFile({ ...baseEvent, startDate: '2024-06-14', endDate: '2024-06-14' });
    expect(ical).toContain('DTSTART;VALUE=DATE:20240614');
    expect(ical).toContain('DTEND;VALUE=DATE:20240615');
  });
});

// ---------------------------------------------------------------------------
// generateGoogleCalendarUrl
// ---------------------------------------------------------------------------
describe('generateGoogleCalendarUrl', () => {
  it('returns a Google Calendar URL', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    expect(url).toContain('https://calendar.google.com/calendar/render');
  });

  it('includes action=TEMPLATE', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('action')).toBe('TEMPLATE');
  });

  it('sets text to the event name', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('text')).toBe('GP Las Vegas');
  });

  it('sets location to the city', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('location')).toBe('Las Vegas, NV');
  });

  it('includes the event URL in details when provided', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('details')).toContain('https://example.com/event');
  });

  it('sets details to empty string when url is not provided', () => {
    const { url, ...eventWithoutUrl } = baseEvent;
    const calUrl = generateGoogleCalendarUrl(eventWithoutUrl);
    const params = new URLSearchParams(calUrl.split('?')[1]);
    expect(params.get('details')).toBe('');
  });

  it('sets the end date one day after the event end date', () => {
    const url = generateGoogleCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    const dates = params.get('dates')!;
    // Format: YYYYMMDD/YYYYMMDD
    expect(dates).toMatch(/^\d{8}\/\d{8}$/);
    const [startStr, endStr] = dates.split('/');
    // End must be numerically greater than start (end is always start + at least 1 day)
    expect(parseInt(endStr)).toBeGreaterThan(parseInt(startStr));
  });
});

// ---------------------------------------------------------------------------
// generateOutlookCalendarUrl
// ---------------------------------------------------------------------------
describe('generateOutlookCalendarUrl', () => {
  it('returns an Outlook Live URL', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    expect(url).toContain('https://outlook.live.com/calendar/');
  });

  it('sets subject to the event name', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('GP Las Vegas');
  });

  it('sets location to the city', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('location')).toBe('Las Vegas, NV');
  });

  it('sets allday to true', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('allday')).toBe('true');
  });

  it('sets startdt to the event start date', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('startdt')).toBe('2024-06-14');
  });

  it('sets enddt to one day after the event end date', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('enddt')).toBe('2024-06-17');
  });

  it('includes the event URL in body when provided', () => {
    const url = generateOutlookCalendarUrl(baseEvent);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('body')).toContain('https://example.com/event');
  });

  it('sets body to empty string when url is not provided', () => {
    const { url, ...eventWithoutUrl } = baseEvent;
    const calUrl = generateOutlookCalendarUrl(eventWithoutUrl);
    const params = new URLSearchParams(calUrl.split('?')[1]);
    expect(params.get('body')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// downloadICalFile
// ---------------------------------------------------------------------------
describe('downloadICalFile — desktop', () => {
  let mockLink: HTMLAnchorElement;
  let createElementSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;

  beforeEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configurable: true,
    });

    // jsdom does not implement these — assign mocks directly
    createObjectURL = jest.fn().mockReturnValue('blob:fake-url');
    revokeObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    mockLink = { href: '', download: '', click: jest.fn() } as any;
    createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockReturnValue(mockLink);
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockReturnValue(mockLink);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an anchor element and triggers a click', () => {
    downloadICalFile(baseEvent);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('sets the download filename from the event name (spaces as dashes)', () => {
    downloadICalFile(baseEvent);
    expect(mockLink.download).toBe('GP-Las-Vegas.ics');
  });

  it('appends and then removes the link from the DOM', () => {
    downloadICalFile(baseEvent);
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
  });

  it('revokes the object URL after the click', () => {
    downloadICalFile(baseEvent);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});

describe('downloadICalFile — mobile', () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true,
    });
    windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens a data URI rather than downloading a file', () => {
    downloadICalFile(baseEvent);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('data:text/calendar'),
      '_blank',
    );
  });

  it('encodes the full iCal content in the data URI', () => {
    downloadICalFile(baseEvent);
    const [dataUri] = windowOpenSpy.mock.calls[0];
    const decoded = decodeURIComponent(dataUri.split(',')[1]);
    expect(decoded).toContain('BEGIN:VCALENDAR');
    expect(decoded).toContain('GP Las Vegas');
  });
});
