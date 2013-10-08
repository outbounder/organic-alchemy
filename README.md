# what

Collection of helper methods for reactions within http and websocket context

# why

Using `node-organic` core and Organelles based implementation of business logic
usually needs helper functions to be able to express reactive logic in managable way.

In general this is an experiment of [Continuation](http://en.wikipedia.org/wiki/Continuation) implementation in nodejs related to organic ecosystem.

# how

## http reaction

    var http_chain = require("organic-alchemy").http.chain

    var httpReaction = http_chain( 
      function(req, res, next) {
        // ...
        next && next()
      },
      function(req, res, next) {
        // ....
      },
      ....
    )

    httpReaction({
      req: HttpRequest,
      res: HttpResponse
    }, function(){
      // reaction completed
    })


## websocket reaction

    var ws_chain = require("organic-alchemy").ws.chain

    var wsReaction = ws_chain( 
      function(c, next) {
        // c.socket ...
        next && next()
      },
      function(c, next) {
        // c.socket ...
        next && next()
      },
      ....
    )

    wsReaction({
      socket: WebSocketConnection,
      name: EventName,
      data: EventData
    }, function(){
      // reaction completed
    })

# todo

* change behaviour support of 'next' in reactions at alchemy.http.chain so that it assigns to res.<something> the given arguments/results