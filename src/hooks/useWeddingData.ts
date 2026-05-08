import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../integrations/api/client";

export const useWeddingSettings = () =>
  useQuery({
    queryKey: ["wedding_settings"],
    queryFn: async () => {
      const data = (await apiClient.getWeddingSettings()) as any;

      // Generate URLs for images if paths exist
      if (data.hero_image_path && !data.hero_public_url) {
        data.hero_public_url = apiClient.getGalleryImageUrl(data.hero_image_path);
      }
      if (data.hero_image_2_path && !data.hero_2_public_url) {
        data.hero_2_public_url = apiClient.getGalleryImageUrl(data.hero_image_2_path);
      }

      return data;
    },
  });

export const useSchedule = () =>
  useQuery({
    queryKey: ["schedule_events"],
    queryFn: async () => {
      return (await apiClient.getSchedule()) as any[];
    },
  });

export const useTimeline = () =>
  useQuery({
    queryKey: ["timeline_events"],
    queryFn: async () => {
      return (await apiClient.getTimeline()) as any[];
    },
  });

export const useGallery = () =>
  useQuery({
    queryKey: ["gallery_images"],
    queryFn: async () => {
      const data = (await apiClient.getGallery()) as any[];
      return (data ?? []).map((img: any) => ({
        ...img,
        public_url: apiClient.getGalleryImageUrl(img.storage_path),
      }));
    },
  });
