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

var reaction = module.exports.invokeReaction = function(/*inputChemical, reactionArray, reactionArray,... backupReactionArray*/) {
  var args = argumentsToArray(arguments)
  var inputChemical = args.shift()
  var backupReactionArray = args.pop()
  var reactionArray = []
  for(var i = 0; i<args.length; i++)
    reactionArray = reactionArray.concat(args[i])
  var next = function(err){
    if(err) {
      var backupReaction = backupReactionArray.shift()
      inputChemical.err = err
      return invoke(backupReaction, inputChemical, next)
    }
    var reaction = reactionArray.shift()
    invoke(reaction, inputChemical, next)
  }
  next()
}

var chain = module.exports.chain = function(/*reaction1, reaction2, ... */) {
  var reactionArraySource = argumentsToArray(arguments)
  return function(c, next){
    var reactionArray = reactionArraySource.slice(0)
    var next = function(err){
      if(err)
        inputChemical.err = err
      var reaction = reactionArray.shift()
      invoke(reaction, inputChemical, next)
    }
    next()
  }
}

var selectByMethod = module.exports.switchByMethod = function(input){
  return function(c, next) {
    return invoke(input[c.req.method], c, next)
  }
}

