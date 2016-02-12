'use-strict';
module.exports = {
  url:{
    graph: 'graph.facebook.com',
    likeable: 'pruebas.likeable.mx',
    servs: 'pruebas-servs.likeable.mx',
    csvs: 'pruebas-csvs.likeable.mx',
    charts: 'pruebas-charts.likeable.mx'
  },
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
    port: 443
  },
  options_likeable_csvs: {
    hostname: 'pruebas-csvs.likeable.mx',
    port: 443
  },
  options_likeable_charts: {
    hostname: 'pruebas-charts.likeable.mx',
    port: 443
  }, 
  llaves: {
    'consumer_key': '79LwtQhKg5Gk2IZudcH2usWVJ',
    'consumer_secret': 'JAybjan6YvNKQIX1eXcdK82hnAqP0zqexmJSZ6goWpL3JfjNCN',
    'access_token': '1694381664-miJcSHRaXtqa7WzUsLZvIZhpCMh67yvLsIwIv5Y',
    'access_token_secret': 'YjDG1YAfIYMTVzrUFe4DzU0n02j4Du9EfEXZCMVBb6Cu3'
  },
  llaves_trackers: {
    'consumer_key': 'FULjqnKVTt8CZyRyB5DonNnc9',
    'consumer_secret': 'LifGYYkWOuiZqOyOMh2E5yI5Frlty5K1Ekl5Wj7LIloh1u5t80',
    'access_token': '1694381664-ISFfRr3xchyDMCxYrY1ZHWt6l2iEKx4KwmB2kj5',
    'access_token_secret': 'P2rNH0gmmW880Wg5WHgaS57YkczrCbEL02fiZKq524Brz'
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
  path_feed_limit: '/feed?fields=id,from,to,message,picture,link,type,status_type,object_id,created_time,is_hidden,attachments,comments.limit(100).order(reverse_chronological){id,from,message,attachment,parent,is_hidden,is_private,created_time}&limit=100',
  path_feed_nolimit: '/feed?fields=id,from,to,message,picture,link,type,status_type,object_id,created_time,is_hidden,attachments,comments.limit(100).order(reverse_chronological){id,from,message,attachment,parent,is_hidden,is_private,created_time}' 
};