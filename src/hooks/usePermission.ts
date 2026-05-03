import { useAuth } from "@/src/context/AuthContext";

export default function usePermission(permission:string){

 const {user} = useAuth();

 return user?.permissions?.includes(permission);

}