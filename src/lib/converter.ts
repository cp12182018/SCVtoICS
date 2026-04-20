import Papa from 'papaparse';
import { createEvents, EventAttributes } from 'ics';
import { parse } from 'date-fns';

export interface CSVRow {
  Milestone: string;
  'Target Date': string;
  'Calendar Date': string;
  'Proposed Dates': string;
  'Day of the Week': string;
  'Team Responsible': string;
  'Primary Point of Contact': string;
  Notes: string;
}

export const convertCSVToICS = (csvContent: string, isAllDay: boolean = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const events: EventAttributes[] = [];

        results.data.forEach((row) => {
          const dateStr = row['Calendar Date'] || row['Target Date'];
          if (!dateStr || !row.Milestone) return;

          try {
            // Parse MM/DD/YYYY
            const date = parse(dateStr, 'MM/dd/yyyy', new Date());
            
            if (isNaN(date.getTime())) {
              console.warn(`Invalid date format for: ${row.Milestone} (${dateStr})`);
              return;
            }

            const description = [
              row['Team Responsible'] ? `Team: ${row['Team Responsible']}` : '',
              row['Primary Point of Contact'] ? `POC: ${row['Primary Point of Contact']}` : '',
              row['Proposed Dates'] ? `Proposed: ${row['Proposed Dates']}` : '',
              row.Notes ? `Notes: ${row.Notes}` : '',
            ].filter(Boolean).join('\n');

            const start: [number, number, number, number, number] | [number, number, number] = isAllDay 
              ? [date.getFullYear(), date.getMonth() + 1, date.getDate()]
              : [date.getFullYear(), date.getMonth() + 1, date.getDate(), 9, 0];

            events.push({
              title: row.Milestone,
              start,
              duration: isAllDay ? { days: 1 } : { hours: 1 },
              description: description,
            });
          } catch (err) {
            console.error(`Error parsing row:`, row, err);
          }
        });

        if (events.length === 0) {
          reject(new Error('No valid events found in CSV. Check your date format (MM/DD/YYYY).'));
          return;
        }

        const { error, value } = createEvents(events);
        if (error) {
          reject(error);
        } else {
          resolve(value!);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
