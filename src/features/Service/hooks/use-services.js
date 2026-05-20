import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";

// Helper to fetch authorization header
const getHeaders = (contentType = "application/json") => {
  const token = Cookies.get("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
  };
};

/**
 * Hook to fetch paginated/searchable services list
 */
export const useFetchServices = (searchTerm, pageIndex, pageSize) => {
  return useQuery({
    queryKey: ["services", searchTerm, pageIndex + 1],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get(`${BASE_URL}/api/service?${params}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch single service log details by ID
 */
export const useFetchService = (id) => {
  return useQuery({
    queryKey: ["service-detail", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/service/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new service log (multipart/form-data)
 */
export const useCreateService = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${BASE_URL}/api/service`, payload, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Hook to update an existing service log (json)
 */
export const useUpdateService = (id) => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.put(`${BASE_URL}/api/service/${id}`, payload, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Hook to delete a service sub-bill item
 */
export const useDeleteSubService = () => {
  return useMutation({
    mutationFn: async (subId) => {
      const response = await axios.delete(`${BASE_URL}/api/service-sub/${subId}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Hook to fetch active vehicles for selection dropdown/popover
 */
export const useFetchActiveVehicles = () => {
  return useQuery({
    queryKey: ["active-vehicles"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/activeVehicle`, {
          headers: getHeaders(),
        });
        return response.data?.data || response.data || [];
      } catch (err) {
        console.warn("activeVehicle failed, falling back to minimal vehicle endpoint:", err);
        // Fallback
        const response = await axios.get(`${BASE_URL}/api/vehicle?pageSize=1000`, {
          headers: getHeaders(),
        });
        return response.data?.data?.data || response.data?.data || response.data || [];
      }
    },
  });
};

/**
 * Hook to fetch active vendors (garages) for selection dropdown
 */
export const useFetchActiveVendors = () => {
  return useQuery({
    queryKey: ["active-vendors"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/activeVendor`, {
          headers: getHeaders(),
        });
        return response.data?.data || response.data || [];
      } catch (err) {
        console.warn("activeVendor failed, returning empty list:", err);
        return [];
      }
    },
  });
};
