export default function FormContainer({value,onChange,placeholder}){

 return(
  <TextInput
   value={value}
   onChangeText={onChange}
   placeholder={placeholder}
   style={{
     borderWidth:1,
     padding:10,
     marginBottom:12
   }}
  />
 )

}