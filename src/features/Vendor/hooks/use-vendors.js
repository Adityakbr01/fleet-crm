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
 * Hook to fetch paginated/searchable vendors list
 */
export const useFetchVendors = (searchTerm, pageIndex, pageSize) => {
  return useQuery({
    queryKey: ["vendors", searchTerm, pageIndex + 1],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get(`${BASE_URL}/api/vendor?${params}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch single vendor details by ID
 */
export const useFetchVendor = (id) => {
  return useQuery({
    queryKey: ["vendor-detail", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/vendor/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new vendor
 */
export const useCreateVendor = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(`${BASE_URL}/api/vendor`, payload, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Hook to update an existing vendor
 */
export const useUpdateVendor = (id) => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.put(`${BASE_URL}/api/vendor/${id}`, payload, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Hook to patch vendor status
 */
export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axios.patch(
        `${BASE_URL}/api/vendors/${id}/status`,
        { vendor_status: status },
        { headers: getHeaders() }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
    },
  });
};
