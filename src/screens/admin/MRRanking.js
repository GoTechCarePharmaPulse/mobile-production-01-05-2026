export default function MRRanking({data}){

  return data.map(mr=>(
    <Text key={mr._id}>
      {mr._id} - {mr.visits}
    </Text>
  ));

}