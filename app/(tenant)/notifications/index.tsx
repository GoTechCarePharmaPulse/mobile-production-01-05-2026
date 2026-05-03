import { View, Text } from "react-native";
import useNotifications from "@/src/modules/notifications/useNotifications";

export default function NotificationsScreen(){

 const notifications = useNotifications();

 return(
  <View style={{padding:20}}>

   {notifications.length === 0 && (
        <Text>No notifications</Text>
      )}
   {notifications.map((n,i)=>(
    <Text key={i}>
      {n.title} - {n.message}
    </Text>
   ))}

  </View>
 )
}