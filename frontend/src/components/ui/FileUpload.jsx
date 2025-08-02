import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const FileUpload = ({ 
  onFileSelect, 
  acceptedFileTypes = ['.csv'], 
  maxFiles = 1,
  label = "Glissez-déposez vos fichiers ici ou cliquez pour sélectionner",
  className,
  disabled = false
}) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploaded'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    onFileSelect?.(acceptedFiles);
  }, [onFileSelect]);

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    maxFiles,
    disabled
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? "Déposez les fichiers ici..." : label}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Types acceptés: {acceptedFileTypes.join(', ')}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers sélectionnés:</h4>
          {files.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{fileInfo.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {fileInfo.status === 'uploaded' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileInfo.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { FileUpload }; 