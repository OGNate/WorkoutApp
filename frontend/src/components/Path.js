const app_name = 'shreddit-ucf'

exports.buildPath = function buildPath(route) {

  return process.env.NODE_ENV === 'production' ?
    'https://' + app_name +  '.herokuapp.com/' + route :
    'http://localhost:5000/' + route
}