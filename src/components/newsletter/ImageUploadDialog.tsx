
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageUrl: string, altText: string, size: string) => void;
}

const PLACEHOLDER_IMAGES = [
  { id: 'placeholder-1', url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7', alt: 'امرأة تستخدم حاسوب محمول' },
  { id: 'placeholder-2', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', alt: 'لوحة دوائر إلكترونية' },
  { id: 'placeholder-3', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', alt: 'شاشة برمجة' },
  { id: 'placeholder-4', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', alt: 'كود برمجي' },
];

const IMAGE_SIZES = [
  { value: 'small', label: 'صغير (25%)' },
  { value: 'medium', label: 'متوسط (50%)' },
  { value: 'large', label: 'كبير (75%)' },
  { value: 'full', label: 'كامل (100%)' }
];

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({ isOpen, onClose, onInsertImage }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [imageSize, setImageSize] = useState('medium');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      onInsertImage(imageUrl, altText, imageSize);
      resetForm();
      onClose();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `newsletter_images/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('newsletter_assets')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('newsletter_assets')
        .getPublicUrl(filePath);
      
      const uploadedImageUrl = publicUrlData.publicUrl;
      onInsertImage(uploadedImageUrl, altText || file.name, imageSize);
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setImageUrl('');
    setAltText('');
    setFile(null);
    setActiveTab('upload');
    setImageSize('medium');
  };
  
  const handleSelectPlaceholder = (url: string, alt: string) => {
    onInsertImage(url, alt, imageSize);
    resetForm();
    onClose();
  };
  
  const renderSizeSelector = () => (
    <div>
      <Label htmlFor="image-size" className="mb-2 block">حجم الصورة</Label>
      <Select value={imageSize} onValueChange={setImageSize}>
        <SelectTrigger id="image-size" className="w-full">
          <SelectValue placeholder="اختر حجم الصورة" />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_SIZES.map(size => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>إضافة صورة</DialogTitle>
          <DialogDescription>
            أدخل رابط صورة أو قم بتحميل صورة من جهازك
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload">تحميل ملف</TabsTrigger>
            <TabsTrigger value="url">إدخال رابط</TabsTrigger>
            <TabsTrigger value="placeholder">صور مقترحة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <form onSubmit={handleFileUpload}>
              <div className="py-2 space-y-4">
                <div>
                  <Label htmlFor="image-file" className="mb-2 block">اختر صورة</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="image-alt-text-file" className="mb-2 block">نص بديل للصورة</Label>
                  <Input
                    id="image-alt-text-file"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="وصف الصورة للقراء ذوي الإعاقة البصرية"
                  />
                </div>
                {renderSizeSelector()}
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                <Button 
                  type="submit" 
                  disabled={!file || isUploading}
                >
                  {isUploading ? 'جارِ التحميل...' : 'تحميل وإضافة'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit}>
              <div className="py-2 space-y-4">
                <div>
                  <Label htmlFor="image-url" className="mb-2 block">رابط الصورة</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="image-alt-text-url" className="mb-2 block">نص بديل للصورة</Label>
                  <Input
                    id="image-alt-text-url"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="وصف الصورة للقراء ذوي الإعاقة البصرية"
                  />
                </div>
                {renderSizeSelector()}
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                <Button type="submit" disabled={!imageUrl}>إضافة</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="placeholder">
            <div className="space-y-4">
              {renderSizeSelector()}
              <div className="grid grid-cols-2 gap-3">
                {PLACEHOLDER_IMAGES.map((image) => (
                  <div 
                    key={image.id}
                    className="border rounded-md overflow-hidden cursor-pointer hover:border-primary"
                    onClick={() => handleSelectPlaceholder(image.url, image.alt)}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt} 
                      className="w-full h-32 object-cover" 
                    />
                    <div className="p-2 text-xs truncate">
                      {image.alt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
