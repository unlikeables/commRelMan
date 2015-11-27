'use-strict';
module.exports = {
  options_graph: {
    hostname: 'graph.facebook.com',
    port: 443	
  },
  options_likeable: {
    hostname: 'pruebas.likeable.mx',
    port: 443	
  },
  options_likeable_servs: {
    hostname: 'pruebas-servs.likeable.mx',
    post: 443
  },
  fbapiversion: '/v2.4/',
  fb_app_id: '689164264519175',
  fb_app_secret: '0040413de6bc614158c8263767e84c80',
  path_app_at: 'oauth/access_token?client_id=689164264519175&client_secret=0040413de6bc614158c8263767e84c80&grant_type=client_credentials',
  path_post_query: '?fields=id,from,to,message,picture,link,type,status_type,object_id,created_time,is_hidden,attachments',
  path_posts_query_limit: '/posts?fields=id,from,to,message,picture,link,type,status_type,object_id,created_time,is_hidden,attachments&limit=5',
  path_siblings: '?fields=comments.order(reverse_chronological){id,from}',
  path_comment_query: '?fields=id,from,message,attachment,is_hidden,is_private,parent,created_time',
  path_me_convs_limit: 'me/conversations?fields=id,updated_time,participants,message_count,link,messages.limit(100){id,from,to,message,attachments,shares,created_time}&limit=100',
  path_conv_messages: '?fields=link,updated_time,messages.limit(10){id,from,to,message,attachments,shares,created_time}',
  path_comments_de_comments: '?fields=comments.limit(100).order(reverse_chronological){id,from,message,attachment,parent,is_hidden,is_private,created_time}',
  path_feed_limit: '/feed?fields=id,from,to,message,picture,link,type,status_type,object_id,created_time,is_hidden,attachments,comments.limit(100).order(reverse_chronological){id,from,message,attachment,parent,is_hidden,is_private,created_time}&limit=100'
};