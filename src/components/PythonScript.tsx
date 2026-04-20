import React from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export const PythonScript = () => {
  const [copied, setCopied] = React.useState(false);

  const script = `import pandas as pd
from ics import Calendar, Event
from datetime import datetime
import sys

def convert_csv_to_ics(csv_file, output_file='my_calendar.ics', all_day=False):
    """
    Reads a CSV file and converts it to an .ics calendar file.
    Expected columns: Milestone, Calendar Date (MM/DD/YYYY), Notes, etc.
    """
    try:
        # Read the CSV file
        df = pd.read_csv(csv_file)
        
        # Create a new calendar
        c = Calendar()
        
        for index, row in df.iterrows():
            # Create a new event
            e = Event()
            
            # Set event name from 'Milestone'
            e.name = str(row.get('Milestone', 'Untitled Event'))
            
            # Parse the date from 'Calendar Date' or 'Target Date'
            # Format: MM/DD/YYYY
            date_str = str(row.get('Calendar Date', row.get('Target Date', '')))
            
            if not date_str:
                continue
                
            try:
                dt = datetime.strptime(date_str, '%m/%d/%Y')
                
                if all_day:
                    # For all-day events, we just set the date
                    e.begin = dt.date()
                    e.make_all_day()
                else:
                    # Set time to 9 AM by default
                    dt = dt.replace(hour=9, minute=0)
                    e.begin = dt
            except ValueError:
                print(f"Warning: Could not parse date '{date_str}' for milestone '{e.name}'")
                continue
            
            # Build description from other columns
            details = []
            for col in ['Team Responsible', 'Primary Point of Contact', 'Notes', 'Proposed Dates']:
                if col in row and pd.notna(row[col]):
                    details.append(f"{col}: {row[col]}")
                
            e.description = "\\n".join(details)
            
            # Add event to calendar
            c.events.add(e)
            
        # Write to file
        with open(output_file, 'w') as f:
            f.writelines(c.serialize_iter())
            
        print(f"Successfully created {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <path_to_csv> [--all-day]")
    else:
        is_all_day = "--all-day" in sys.argv
        convert_csv_to_ics(sys.argv[1], all_day=is_all_day)`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
          <Terminal size={16} />
          <span>csv_to_ics.py</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-300 leading-relaxed">
          <code>{script}</code>
        </pre>
      </div>
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Installation</h4>
        <div className="flex flex-col gap-2">
          <code className="text-xs bg-slate-950 p-2 rounded text-emerald-400 border border-slate-800">
            pip install pandas ics
          </code>
          <p className="text-xs text-slate-500 italic">
            Note: Ensure you have Python installed on your system.
          </p>
        </div>
      </div>
    </div>
  );
};
