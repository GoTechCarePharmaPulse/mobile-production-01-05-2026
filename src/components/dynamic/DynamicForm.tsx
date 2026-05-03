import { View, TextInput } from "react-native";

export default function DynamicForm({fields,data,setData}){

 return (

  <View>

   {fields.map(field=>{

     return (

       <TextInput
         key={field.name}
         placeholder={field.name}
         value={data[field.name]}
         onChangeText={(v)=>setData({...data,[field.name]:v})}
       />

     )

   })}

  </View>

 )

}