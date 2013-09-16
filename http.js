var argumentsToArray = function(input) {
  var args = []
  for(var i = 0; i<input.length; i++)
    args.push(input[i])
  return args
}

var invoke = module.exports.invoke = function(reaction, c, next){
  if(reaction.length == 1)
    return reaction(c)
  if(reaction.length == 2)
    return reaction(c, next)
  if(reaction.length == 3)
    return reaction(c.req, c.res, next)
  if(reaction.length == 4)
    return reaction(c.err, c.req, c.res, next)

  return reaction()
}

var jsonResponse = module.exports.jsonResponse = function(res, next) {
  return function(err, data) {
    if(err){ res.end(err); return next(err) }
    res.end(JSON.stringify({result: data}))
    res.result = data;
    next()
  }
}

var error = module.exports.error = function(message, code){
  var err = new Error(message)
  err.code = code
  return err
}

var join = module.exports.join = function(/*reactionArray, reactionArray,... */) {
  var args = argumentsToArray(arguments)
  var reactionArraySource = []
  for(var i = 0; i<args.length; i++)
    reactionArraySource = reactionArraySource.concat(args[i])
  return chain(reactionArraySource)
}

var chain = module.exports.chain = function(/*reaction1, reaction2,... */) {
  var reactionArraySource = Array.isArray(arguments[0])?arguments[0]:argumentsToArray(arguments)
  return function(c, nextReaction){
    var reactionArray = reactionArraySource.slice(0)
    var next = function(input){
      if(input) {
        if(input instanceof Error)
          c.err = input
        else
          c.err = input.err
        return nextReaction && nextReaction(c)
      }

      var reaction = reactionArray.shift()
      if(reaction)
        invoke(reaction, c, next)
      else
        nextReaction && nextReaction()
    }
    next()
  }
}

var selectByMethod = module.exports.switchByMethod = function(input){
  return function(c, next) {
    return invoke(input[c.req.method], c, next)
  }
}

