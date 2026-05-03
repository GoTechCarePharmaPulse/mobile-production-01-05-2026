import { useQuery } from "@tanstack/react-query";
import { mrService } from "../mrService";

export function useMRs() {
  return useQuery({
    queryKey: ["mrs"],
    queryFn: mrService.getAll
  });
}