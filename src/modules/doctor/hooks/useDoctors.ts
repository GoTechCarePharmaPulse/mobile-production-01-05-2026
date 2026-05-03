import { useQuery } from "@tanstack/react-query";
import { doctorService } from "../doctorService";

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: doctorService.getAll
  });
}