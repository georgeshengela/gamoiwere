import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const ImageSearchUpload = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsUploading(true);
    
    try {
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the image to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Use the actual uploaded image URL from the server response
        const imageUrl = data.url;
        
        // Navigate to the image search results page with the API-compatible URL
        const encodedImageUrl = encodeURIComponent(imageUrl);
        setLocation(`/image-search/${encodedImageUrl}`);
        
        toast({
          title: "სურათით ძიება",
          description: "იტვირთება თქვენი სურათით ძიების შედეგები..."
        });
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // If there's a message in the error, show it
      if (error instanceof Error) {
        toast({
          title: "სურათით ძიება",
          description: error.message || "სურათის ატვირთვა ვერ მოხერხდა"
        });
      } else {
        toast({
          title: "სურათით ძიება",
          description: "სურათის ატვირთვა ვერ მოხერხდა"
        });
      }
    } finally {
      setIsUploading(false);
    }
  }, [setLocation, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading,
    noClick: false,
    noKeyboard: false
  });
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        type="button" 
        className="text-neutral-600 hover:text-primary hover:bg-transparent"
        disabled={isUploading}
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          e.stopPropagation(); // Stop event bubbling
          
          // Manually trigger the input click
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.multiple = false;
          
          fileInput.onchange = (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
              onDrop([files[0]]);
            }
          };
          
          fileInput.click();
        }}
      >
        {isUploading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ImageSearchUpload;