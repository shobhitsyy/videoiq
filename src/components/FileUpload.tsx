
import { useCallback, useState } from "react";
import { Upload, File, X, Link, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileUploadProps {
  onFileUpload: (file: File | null) => void;
  onUrlUpload: (url: string | null) => void;
  uploadedFile: File | null;
  uploadedUrl: string | null;
}

export const FileUpload = ({ onFileUpload, onUrlUpload, uploadedFile, uploadedUrl }: FileUploadProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
      onUrlUpload(null); // Clear URL when file is uploaded
    }
  }, [onFileUpload, onUrlUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
      onUrlUpload(null); // Clear URL when file is uploaded
    }
  };

  const validateUrl = (url: string) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|instagram\.com|tiktok\.com)/i;
    return urlPattern.test(url);
  };

  const handleUrlSubmit = () => {
    if (urlInput && validateUrl(urlInput)) {
      onUrlUpload(urlInput);
      onFileUpload(null); // Clear file when URL is submitted
      setIsValidUrl(true);
    } else {
      setIsValidUrl(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    if (url) {
      setIsValidUrl(validateUrl(url));
    } else {
      setIsValidUrl(true);
    }
  };

  const removeFile = () => {
    onFileUpload(null);
  };

  const removeUrl = () => {
    onUrlUpload(null);
    setUrlInput("");
    setIsValidUrl(true);
  };

  const hasUpload = uploadedFile || uploadedUrl;

  return (
    <div className="space-y-4">
      {!hasUpload ? (
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Paste URL</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
              <Youtube className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-700 mb-2">Paste a video URL</p>
              <p className="text-sm text-slate-500 mb-4">YouTube, Vimeo, and other platforms supported</p>
              
              <div className="max-w-md mx-auto space-y-3">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={handleUrlChange}
                  className={`${!isValidUrl ? 'border-red-300 focus:border-red-500' : 'border-blue-300 focus:border-blue-500'}`}
                />
                {!isValidUrl && (
                  <p className="text-xs text-red-500">Please enter a valid video URL</p>
                )}
                <Button 
                  onClick={handleUrlSubmit}
                  disabled={!urlInput || !isValidUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Process URL
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-slate-400">
                <p className="mb-1">Supported platforms:</p>
                <p>YouTube • Vimeo • Dailymotion • Facebook • Instagram • TikTok</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
            >
              <Upload className="w-12 h-12 mx-auto text-slate-400 group-hover:text-blue-500 transition-colors duration-200 mb-4" />
              <p className="text-lg font-medium text-slate-700 mb-2">Drop your video or audio file here</p>
              <p className="text-sm text-slate-500 mb-4">or click to browse</p>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-input')?.click()}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Choose File
              </Button>
              <p className="text-xs text-slate-400 mt-3">
                Supports MP4, MOV, MP3, WAV and other formats • Max 100MB
              </p>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {uploadedFile ? (
                <File className="w-5 h-5 text-blue-600" />
              ) : (
                <Link className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {uploadedFile ? uploadedFile.name : uploadedUrl}
              </p>
              <p className="text-sm text-slate-500">
                {uploadedFile 
                  ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : "Video URL"
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={uploadedFile ? removeFile : removeUrl}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
