var sys = require('sys'),
    memcache = require("./memcache-pool");

mcClient = new memcache.Client();

mcClient.get('foo', function(value)
    {
        sys.debug('initial get: ' + value);
        
        mcClient.set('foo', 'bar', function(response)
            {
                sys.debug('key set');
                
                
                mcClient.get('foo', function(value)
                    {
                        sys.debug('second get: ' + value);
                    });
            });
        
    });
    