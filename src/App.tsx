import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Calendar as CalendarIcon, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { convertCSVToICS, CSVRow } from './lib/converter';
import { PythonScript } from './components/PythonScript';
import Papa from 'papaparse';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [icsContent, setIcsContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'python'>('converter');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setIcsContent(null);
      
      // Preview the CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        Papa.parse<CSVRow>(text, {
          header: true,
          preview: 5,
          complete: (results) => {
            setPreviewData(results.data);
          }
        });
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const ics = await convertCSVToICS(text, isAllDay);
      setIcsContent(ics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert CSV. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadICS = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'my_calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = "Milestone,Target Date,Calendar Date,Proposed Dates,Day of the Week,Team Responsible,Primary Point of Contact,Notes\n";
    const sampleRow = "Project Kickoff,,04/23/2026,,Thursday,Engineering,Jane Doe,Initial meeting to discuss requirements\n";
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'calendar_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <CalendarIcon size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">CSV<span className="text-indigo-600">to</span>ICS</h1>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('converter')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'converter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Converter
            </button>
            <button 
              onClick={() => setActiveTab('python')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'python' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Python Script
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'converter' ? (
            <motion.div 
              key="converter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                  Turn your spreadsheets into <span className="text-indigo-600">calendar events</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Upload your project milestones CSV and generate a .ics file ready for Google Calendar, Outlook, or Apple Calendar.
                </p>
              </div>

              {/* Upload Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                      file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                      accept=".csv"
                    />
                    <div className={`p-4 rounded-full transition-transform duration-300 group-hover:scale-110 ${
                      file ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <FileUp size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-slate-700">
                        {file ? file.name : 'Click to upload CSV'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or drag and drop your file here'}
                      </p>
                    </div>
                  </div>

                  {/* Preview Section */}
                  {previewData.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <FileText size={18} className="text-indigo-500" />
                          <span>CSV Preview (First 5 rows)</span>
                        </div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data Check</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-3 font-semibold">Milestone</th>
                              <th className="px-6 py-3 font-semibold">Calendar Date</th>
                              <th className="px-6 py-3 font-semibold">Team</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {previewData.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{row.Milestone}</td>
                                <td className="px-6 py-4 text-slate-600">{row['Calendar Date'] || row['Target Date']}</td>
                                <td className="px-6 py-4 text-slate-500">{row['Team Responsible'] || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Info size={18} className="text-indigo-500" />
                        Requirements
                      </h3>
                      <ul className="text-sm text-slate-600 space-y-2">
                        <li className="flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>Column <strong>Milestone</strong> for event title</span>
                        </li>
                        <li className="flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>Column <strong>Calendar Date</strong> (MM/DD/YYYY)</span>
                        </li>
                        <li className="flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>Optional: Team Responsible, Notes, POC</span>
                        </li>
                      </ul>
                      
                      <button
                        onClick={downloadTemplate}
                        className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold mt-4 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <Download size={14} />
                        Download CSV Template
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="space-y-0.5">
                          <label className="text-sm font-semibold text-slate-700 cursor-pointer" htmlFor="all-day-toggle">
                            All-day events
                          </label>
                          <p className="text-xs text-slate-500">Remove time and set as all-day</p>
                        </div>
                        <button
                          id="all-day-toggle"
                          onClick={() => setIsAllDay(!isAllDay)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isAllDay ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isAllDay ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        disabled={!file || isProcessing}
                        onClick={handleConvert}
                        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                          !file || isProcessing
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Generate ICS
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>

                      {icsContent && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={downloadICS}
                          className="w-full py-3 px-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                        >
                          <Download size={18} />
                          Download .ics
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700"
                    >
                      <AlertCircle className="shrink-0" size={20} />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  {icsContent && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-emerald-700"
                    >
                      <CheckCircle2 className="shrink-0" size={20} />
                      <p className="text-sm font-medium">Conversion successful! Your calendar file is ready.</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="python"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Python CLI Tool</h2>
                <p className="text-slate-600">
                  Prefer the command line? Use this Python script to convert your CSV files locally.
                </p>
              </div>
              <PythonScript />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <CalendarIcon size={16} />
            <span className="text-sm font-medium">CSV to ICS Calendar Converter</span>
          </div>
          <p className="text-xs text-slate-500">
            All processing happens in your browser. Your data never leaves your computer.
          </p>
        </div>
      </footer>
    </div>
  );
}
