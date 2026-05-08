import { useGallery } from '@/hooks/useWeddingData';
import { apiClient } from '@/integrations/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

const GalleryEditor = () => {
  const { data: imagesData = [], refetch } = useGallery();
  const images = imagesData as any[];
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await apiClient.uploadGalleryImage(file, "", images.length);
      }
      toast.success("Photos uploaded");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      refetch();
      e.target.value = "";
    }
  };

  const remove = async (id: string, path: string) => {
    try {
      await apiClient.deleteGalleryImage(id);
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <label className="inline-flex items-center gap-2 px-5 py-2 border border-gold text-gold text-[11px] tracking-[0.3em] uppercase hover:bg-gold hover:text-warm-dark transition-colors cursor-pointer">
        <Upload className="w-3 h-3" /> {uploading ? "Uploading…" : "Upload photos"}
        <input type="file" multiple accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square overflow-hidden bg-blush">
            <img src={img.public_url} className="w-full h-full object-cover" alt="" />
            <button
              onClick={() => remove(img.id, img.storage_path)}
              className="absolute top-2 right-2 p-2 bg-warm-dark/80 text-cream opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      {images.length === 0 && <p className="text-center text-warm-soft py-12">No photos yet.</p>}
    </div>
  );
};

export default GalleryEditor