const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  let modify = false
  let offset 
  if (args[0].includes('https://gql.twitch.tv/gql')) {
    const body = JSON.parse(args[1].body)
    const item = body.find(x => x.operationName === 'VideoCommentsByOffsetOrCursor')

    offset = 30//parseFloat(localStorage.getItem('chat-offset') || '0')

    if(item && item.variables.contentOffsetSeconds) {
      item.variables = {
        ...item.variables,
        contentOffsetSeconds: item.variables.contentOffsetSeconds + offset
      }

      args[1].body= JSON.stringify(body)
      modify = true
    }
  }

  const response = await origFetch(...args);

  if (modify) {
    const responseBody = await response.clone().json()
    
    let modified = responseBody.map(x => {
      if (x.data.video && x.data.video.comments) {
        x.data.video.comments.edges = x.data.video.comments.edges.map(edge => {
          edge.node.contentOffsetSeconds = edge.node.contentOffsetSeconds - offset
          edge.node.createdAt = new Date(new Date(edge.node.createdAt).valueOf() - offset * 1000).toISOString()

          return edge
        })
        

        return x
      }

      return x
    })

    return new Response(JSON.stringify(modified))
  }

  return response
};