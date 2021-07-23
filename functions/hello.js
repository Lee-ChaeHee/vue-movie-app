exports.handler = async function(event, context){
  return {
    statusCode: 200,
    body: JSON.stringify({
      name: 'CHAEHEE',
      age: 29,
      email: 'chlee9305@gmail.com'
    })
  }
}