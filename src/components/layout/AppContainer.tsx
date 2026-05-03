import { View } from "react-native";
import Sidebar from "./Sidebar";

export default function AppContainer({children}:any){

 return(

 <View style={{flex:1}}>

  <Sidebar/>

  <View style={{flex:1,padding:20}}>
   {children}
  </View>

 </View>

 )

}