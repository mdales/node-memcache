var sys = require('sys'),
    memcache = require("./memcache-pool");

var server_list = [{'host': '192.168.61.237', 'port': 11211}, 
    {'host': '192.168.61.236', 'port': 11211}];

mcClient = new memcache.Client(server_list);


for (var i = 0; i < 10; i++)
{
    mcClient.get('' + i, function(value)
        {
            sys.debug('initial get: ' + value);                        
        });
}