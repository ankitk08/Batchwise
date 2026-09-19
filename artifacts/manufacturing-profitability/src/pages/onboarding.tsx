import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminOverviewQueryKey,
  getGetDataQualityQueryKey,
  getGetUploadsQueryKey,
  UploadAnalysis,
  useAnalyzeUpload,
  useGetUploads,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<UploadAnalysis | null>(null);
  const analyzeUpload = useAnalyzeUpload();
  const { data: uploads } = useGetUploads();
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setAnalysisResult(null);
    setIsAnalyzing(true);

    try {
      let rowCount = 1000; // Prototype default
      let columns: string[] = ["Job_ID", "Date", "Item", "Qty_Produced", "Material_Cost"]; // Prototype default
      
      // If it's a CSV, let's try to actually read the headers
      if (selected.name.endsWith('.csv')) {
        const text = await selected.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length > 0) {
          rowCount = lines.length - 1;
          columns = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        }
      }

      // Call API
      analyzeUpload.mutate({
        data: {
          fileName: selected.name,
          sizeBytes: selected.size,
          rowCount,
          columns
        }
      }, {
        onSuccess: (result) => {
          setAnalysisResult(result);
          setIsAnalyzing(false);
          queryClient.invalidateQueries({ queryKey: getGetUploadsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDataQualityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() });
        },
        onError: () => {
          setIsAnalyzing(false);
        }
      });
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connect Data Sources</h1>
        <p className="text-muted-foreground mt-1">
          Upload your production runs, BOMs, or accounting exports.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-dashed border-2 border-primary/20 bg-primary/5 hover-elevate cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Spreadsheet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop or click to browse.<br/>Accepts CSV, XLS, XLSX.
                </p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, .xls, .xlsx"
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>

          {file && !isAnalyzing && !analysisResult && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    Analyzing structure...
                  </span>
                  <span className="text-muted-foreground">This may take a moment</span>
                </div>
                <Progress value={65} className="h-2" />
                {file?.name.endsWith('.xlsx') && (
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    XLSX inspection runs in prototype metadata-only mode.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {analysisResult && (
            <Card className="h-full border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Analysis Complete
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {analysisResult.datasetName}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{analysisResult.readinessScore}%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Readiness Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Inferred Type</span>
                    <p className="font-medium">{analysisResult.inferredType}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Rows Detected</span>
                    <p className="font-medium font-mono">{analysisResult.rowCount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Columns</span>
                    <p className="font-medium font-mono">{analysisResult.columnsDetected}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium capitalize text-emerald-600">{analysisResult.status.replace(/-/g, ' ')}</p>
                  </div>
                </div>

                {analysisResult.issues.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Data Quality Issues Detected</h4>
                    {analysisResult.issues.map(issue => (
                      <div key={issue.id} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md flex gap-3 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-400">{issue.title}</p>
                          <p className="text-amber-700/80 dark:text-amber-500/80 mt-0.5 text-xs">{issue.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {analysisResult.mappings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Semantic Mapping Preview</h4>
                    <div className="space-y-2">
                      {analysisResult.mappings.slice(0, 3).map((map, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                          <span className="font-mono text-muted-foreground">{map.sourceColumn}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-primary">{map.semanticField}</span>
                        </div>
                      ))}
                      {analysisResult.mappings.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          + {analysisResult.mappings.length - 3} more mappings
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t p-6">
                <Button className="w-full" onClick={() => setLocation('/data-quality')}>
                  Review Data Quality & Continue
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Persisted Upload History</CardTitle>
          <CardDescription>These records are stored in PostgreSQL and remain after refresh.</CardDescription>
        </CardHeader>
        <CardContent>
          {!uploads || uploads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved uploads yet. Upload a CSV to create the first record.</p>
          ) : (
            <div className="space-y-3">
              {uploads.slice(0, 5).map((upload) => (
                <div key={upload.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{upload.fileName}</p>
                    <p className="text-xs text-muted-foreground">{upload.rowCount.toLocaleString()} rows · {new Date(upload.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono font-semibold text-primary">{upload.readinessScore}%</p>
                    <p className="text-xs text-muted-foreground capitalize">{upload.status.replace(/-/g, " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}