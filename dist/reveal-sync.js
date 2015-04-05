(function(){
    var socket = io(typeof(reveal_sync_uri) === 'string' ? reveal_sync_uri : 'http://sync.downlink.nz/'),
        search_parts = window.location.search.match(/sync=([-a-fA-f0-9]+)/),
        handler = undefined;

    if (search_parts){
        handler = new SyncClient(search_parts[1]);
    }else{
        handler = new SyncOwner();
    }

    socket.on('connect', function(){ handler.connect() });
    socket.on('nav', function(msg){ handler.remote_change(msg) });

    ['slidechanged', 'fragmentshown', 'fragmenthidden'].forEach(function(t){
        Reveal.addEventListener(t, function(e){
            handler.local_change(e, t);
        });
    });

    function SyncClient(id){
        this.id = id;
    }

    SyncClient.prototype.connect = function(){
        console.log('client#connect');
        socket.emit('join', this.id);
    }

    SyncClient.prototype.remote_change = function(msg){
        console.log('client#remote_change(' + JSON.stringify(msg) + ')');
        if (msg.id === this.id){
            switch(msg.type){
                case 'fragmentshown':
                    Reveal.nextFragment();
                    break;
                case 'fragmenthidden':
                    Reveal.prevFragment();
                    break;
                default:
                    Reveal.slide(msg.h, msg.v, msg.f);
                    break;
            }
        }
    }

    SyncClient.prototype.local_change = function(evt, type){
        console.log('client#local_change(' + type + ') - ignored');
    }

    function SyncOwner(){
        this.id = uuid();
        window.prompt('Ask people to join your presentation at', window.location.origin + window.location.pathname + '?sync=' + this.id);
    }

    SyncOwner.prototype.connect = function(){
        console.log('owner#connect');
        socket.emit('create', this.id);
    }

    SyncOwner.prototype.remote_change = function(msg){
        console.log('owner#remote_change(' + JSON.stringify(msg) + ') - ignored');
    }

    SyncOwner.prototype.local_change = function(evt, type){
        var msg = {id: this.id, h: evt.indexh, v: evt.indexv, f: evt.indexf, type: type};
        console.log('owner#local_change(' + JSON.stringify(msg) + ')');
        socket.emit('nav', msg);
    }

    function uuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
})();
