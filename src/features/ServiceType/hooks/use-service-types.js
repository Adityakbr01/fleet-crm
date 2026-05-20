import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";

const getHeaders = (contentType = "application/json") => {
  const token = Cookies.get("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
  };
};

export const useFetchServiceTypes = (searchTerm, pageIndex, pageSize) => {
  return useQuery({
    queryKey: ["service-types", searchTerm, pageIndex + 1],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        pageSize: pageSize.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);
      const response = await axios.get(`${BASE_URL}/api/service-types?${params}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchServiceType = (id) => {
  return useQuery({
    queryKey: ["service-type-detail", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/service-types/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateServiceType = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("service_types", payload.service_types);
      const response = await axios.post(`${BASE_URL}/api/service-types`, formData, {
        headers: getHeaders("multipart/form-data"),
      });
      return response.data;
    },
  });
};

export const useUpdateServiceType = (id) => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.put(`${BASE_URL}/api/service-types/${id}`, payload, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};

export const useUpdateServiceTypeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const formData = new FormData();
      formData.append("service_types_status", status);
      const response = await axios.patch(
        `${BASE_URL}/api/service-types-status/${id}/status`,
        formData,
        { headers: getHeaders("multipart/form-data") }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["service-types"]);
    },
  });
};

export const useFetchActiveServiceTypes = () => {
  return useQuery({
    queryKey: ["activeServiceTypes"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/activeServiceTypes`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });
};
