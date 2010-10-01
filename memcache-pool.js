var memcache = require('./memcache'),
    crc32 = require('./crc32'),
    sys = require('sys');

function serverHashFunction(key)
{
    var hash = (((crc32.crc32(key) & 0xffffffff) >> 16) & 0x7fff);
    if (hash)
        return hash;
    else 
        return 1;
}

var Client = exports.Client = function(server_list)
{    
    this.servers = server_list || [{'host': 'localhost', 'port': 11211}];
}

Client.prototype.getServer = function(key)
{
    var hash = serverHashFunction(key)
    sys.debug('server hash: ' + key + ' -> ' +  hash);
    return this.servers[hash % this.servers.length];
}


Client.prototype.actual_get = function(server, key, callback)
{
    server.connection.get(key, callback);
}


Client.prototype.get = function(key, callback)
{
    var server = this.getServer(key);
    var pool = this;
    
    // have we used this server yet? if not, connect to it    
    if (server.connection === undefined)
    {
        server.connection = new memcache.Client(server.port, server.host);
        server.connection.connect();
        server.connection.addHandler(function ()
            {
                pool.actual_get(server, key, callback);
            });
    }
    else
    {
        this.actual_get(server, key, callback);
    }
}


Client.prototype.actual_set = function(server, key, value, callback)
{
    server.connection.set(key, value, callback);
}


Client.prototype.set = function(key, value, callback)
{
    var server = this.getServer(key);
    
    // have we used this server yet? if not, connect to it    
    if (server.connection === undefined)
    {
        server.connection = new memcache.Client();
        server.connection.connect();
        server.connection.addHandler(function ()
            {
                this.actual_set(server, key, value, callback);
            });
    }
    else
    {
        this.actual_set(server, key, value, callback);
    }
}