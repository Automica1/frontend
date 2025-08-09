import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, X, File, FileText, Lock } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileWithPreview extends File {
  preview?: string;
}

// File validation constants
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} not supported. Please upload PDF, JPEG, JPG, or PNG files only.` 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds 10MB limit.` 
    };
  }
  
  return { isValid: true };
};

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Authentication
  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  // Create preview URLs for image files
  const createPreview = (file: File): FileWithPreview => {
    if (file.type.startsWith('image/')) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    }
    return file as FileWithPreview;
  };

  // Clean up preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  // Handle authentication check before file operations
  const handleAuthCheck = (): boolean => {
    if (!isAuthenticated) {
      router.push("/api/auth/login?post_login_redirect_url=/services");
      return false;
    }
    return true;
  };

  const handleFileChange = (newFiles: File[]) => {
    // Check authentication first
    if (!handleAuthCheck()) return;
    
    setError(null);
    
    // Validate each file
    const validFiles: File[] = [];
    let firstError: string | null = null;
    
    for (const file of newFiles) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else if (!firstError) {
        firstError = validation.error || 'Invalid file';
      }
    }
    
    if (firstError) {
      setError(firstError);
    }
    
    if (validFiles.length > 0) {
      // Clean up existing previews
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      const filesWithPreviews = validFiles.map(createPreview);
      setFiles(filesWithPreviews);
      onChange && onChange(validFiles);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    // Check authentication first
    if (!handleAuthCheck()) return;
    
    setError(null);
    
    // Clean up preview URL for removed file
    const fileToRemove = files[indexToRemove];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange && onChange(updatedFiles.map(f => f as File));
    
    // Clear the file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!handleAuthCheck()) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (!handleAuthCheck()) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  const isImageFile = (file: FileWithPreview) => {
    return file.type.startsWith('image/');
  };

  const isPDFFile = (file: FileWithPreview) => {
    return file.type === 'application/pdf';
  };

  const hasFiles = files.length > 0;

  return (
    <div className="w-full h-full flex flex-col max-h-[500px]">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Authentication required message */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-amber-900/50 border border-amber-700 rounded-lg">
          <p className="text-amber-300 text-sm flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Please log in to upload files
          </p>
        </div>
      )}

      {/* Upload Area with GridPattern Background */}
      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden ${
          !isAuthenticated ? 'opacity-50 pointer-events-none' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          onClick={!hasFiles && isAuthenticated ? handleClick : isAuthenticated ? undefined : handleAuthCheck}
          whileHover={!hasFiles && isAuthenticated ? "animate" : undefined}
          className={`flex-1 flex flex-col p-4 sm:p-6 group/file block rounded-lg w-full relative overflow-hidden min-h-0 ${
            !hasFiles && isAuthenticated ? 'cursor-pointer hover:shadow-2xl' : 
            !isAuthenticated ? 'cursor-pointer' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpeg,.jpg,.png,image/jpeg,image/png,application/pdf"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />
          
          {/* GridPattern Background */}
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>

          {!hasFiles ? (
            // Upload prompt with animations - centered in available space
            <div className="flex-1 flex flex-col items-center justify-center relative z-20 min-h-0">
              <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-4">
                <div className="text-center px-4">
                  <p className="relative z-20 font-sans font-bold text-neutral-300 text-sm sm:text-base">
                    {isAuthenticated ? 'Upload file' : 'Sign in to upload file'}
                  </p>
                  <p className="relative z-20 font-sans font-normal text-neutral-400 text-xs sm:text-base mt-2">
                    {isAuthenticated 
                      ? 'Drag or drop your files here or click to upload'
                      : 'Please sign in to start uploading files'
                    }
                  </p>
                  {isAuthenticated && (
                    <p className="relative z-20 font-sans font-normal text-neutral-500 text-xs mt-1">
                      Supports PDF, JPEG, JPG, PNG (max 10MB)
                    </p>
                  )}
                </div>
                
                <div className="relative mt-4">
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="relative group-hover/file:shadow-2xl z-40 bg-neutral-900 flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  >
                    {!isAuthenticated ? (
                      <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                    ) : isDragActive ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-400 flex flex-col items-center text-xs"
                      >
                        Drop it
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-neutral-400 mt-1" />
                      </motion.p>
                    ) : (
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-neutral-300" />
                    )}
                  </motion.div>

                  <motion.div
                    variants={secondaryVariant}
                    className={`absolute opacity-0 border border-dashed ${
                      isAuthenticated ? 'border-sky-400' : 'border-amber-400'
                    } inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 rounded-md`}
                  ></motion.div>
                </div>
              </div>
            </div>
          ) : (
            // File preview area with fixed dimensions
            <div className="flex-1 flex flex-col relative z-20 min-h-0">
              {files.map((file, idx) => (
                <motion.div
                  key={`file-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative bg-neutral-900 rounded-lg shadow-lg border border-neutral-700 overflow-hidden h-full"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  {isImageFile(file) && file.preview ? (
                    // Image preview with fixed container size
                    <div className="p-3 sm:p-4 h-full flex flex-col">
                      <div className="relative bg-neutral-800 rounded-lg overflow-hidden mb-3 sm:mb-4 flex-1 flex items-center justify-center">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={file.preview}
                          alt={file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      {/* File details - fixed at bottom */}
                      <div className="space-y-2 sm:space-y-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm sm:text-base font-medium text-neutral-300 truncate pr-4"
                          >
                            {file.name}
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs sm:text-sm text-neutral-400 whitespace-nowrap"
                          >
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </motion.p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-block px-2 sm:px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs font-medium w-fit"
                          >
                            {file.type}
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-neutral-400"
                          >
                            Modified {new Date(file.lastModified).toLocaleDateString()}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // PDF or other file preview
                    <div className="p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 h-full">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-neutral-800 rounded-lg flex items-center justify-center"
                      >
                        {isPDFFile(file) ? (
                          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                        ) : (
                          <File className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0 pr-6 sm:pr-8">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm sm:text-base font-medium text-neutral-300 truncate"
                        >
                          {file.name}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs sm:text-sm text-neutral-400 mt-1"
                        >
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-neutral-400 mt-1"
                        >
                          Modified {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload different file button - matches the process button styling */}
      {hasFiles && isAuthenticated && (
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleClick}
            className="w-full px-6 py-4 text-sm sm:text-lg font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 border border-neutral-600 shadow-sm hover:shadow-md transform"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Upload Different File</span>
          </motion.button>
        </div>
      )}

      {/* Login button when not authenticated */}
      {!isAuthenticated && (
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push("/api/auth/login?post_login_redirect_url=/services")}
            className="w-full px-6 py-4 text-sm sm:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Sign In to Upload</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

// GridPattern component
export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-neutral-950"
                  : "bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

export default FileUpload;