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
    return reaction(c.name, c.data, next)
  if(reaction.length == 4)
    return reaction(c.err, c.name, c.data, next)
  return reaction()
}

module.exports.switchByEventname = function(definitions) {
  return function(c, next) {
    definitions[c.data.name || c.name](c, next)
  }
}

var join = module.exports.join = function(/*reactionArray1, reactionArray2,... */) {
  var args = argumentsToArray(arguments)
  var reactionArraySource = []
  for(var i = 0; i<args.length; i++)
    reactionArraySource = reactionArraySource.concat(args[i])
  return chain(reactionArraySource)
}

var chain = module.exports.chain = function(/*reaction1, reaction2,... */) {
  var reactionArray = Array.isArray(arguments[0])?arguments[0]:argumentsToArray(arguments)
  return function(c, parentReaction){
    var index = 0
    var next = function(){
      if(arguments.length > 0) {
        if(arguments[0] instanceof Error)
          c.err = arguments[0]
        else 
          if(arguments.length == 1)
            c = arguments[0]
          else
            if(arguments.length == 2) {
              c.err = arguments[0] 
              c.data = arguments[1]
            }
        if(c.err)
          return parentReaction && parentReaction(c)
      }
      var reaction = reactionArray[index++]
      if(reaction)
        invoke(reaction, c, next)
      else
        parentReaction && parentReaction(c)
    }
    next()
  }
}