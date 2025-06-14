
import { useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileUpload: (file: File | null) => void;
  uploadedFile: File | null;
}

export const FileUpload = ({ onFileUpload, uploadedFile }: FileUploadProps) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const removeFile = () => {
    onFileUpload(null);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
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
            Supports MP4, MOV, MP3, WAV and other formats
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{uploadedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
