const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  if (args[0].includes('https://gql.twitch.tv/gql')) {
    const body = JSON.parse(args[1].body)
    const item = body.find(x => x.operationName === 'VideoCommentsByOffsetOrCursor')
    if(item && item.variables.contentOffsetSeconds) {
      item.variables = {
        ...item.variables,
        contentOffsetSeconds: item.variables.contentOffsetSeconds - parseFloat(localStorage.getItem('chat-offset') || '0')
      }
    }
    args[1].body= JSON.stringify(body)
  }

  const response = await origFetch(...args);

  return response
};
