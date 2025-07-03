import { Card,  CardDescription, CardHeader, CardTitle } from '../components/ui/card';

import LogIngestor from '../components/LogIngestor';

export function LogIngestion() {
  const handleIngestSuccess = () => {
    console.log('Log ingested successfully');
  };

  return (
    <div className="p-6 space-y-6">
 
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Log Ingestion
        </h1>
        <p className="text-slate-600">
          Submit individual logs or batch upload multiple logs to the system with real-time processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Single Log Entry</CardTitle>
            <CardDescription className="text-blue-700">
              Submit individual log entries with full validation
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Batch Upload</CardTitle>
            <CardDescription className="text-green-700">
              Process multiple logs simultaneously for efficiency
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">JSON Import</CardTitle>
            <CardDescription className="text-purple-700">
              Import logs from JSON format with automatic parsing
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <LogIngestor onSuccess={handleIngestSuccess} />
    </div>
  );
}