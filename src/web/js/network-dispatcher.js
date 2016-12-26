class NetworkDispatcher extends EventDispatcher
{
	constructor()
	{
		super();
		this.peerIndex = 1;
		this.peers = [];
		if(arguments.length == 1 && arguments[0])
		{
			for(var i = 0; i < arguments[0].length; i++)
			{
				this.addPeer(arguments[0][i]);
			}
		}
	}
	addPeer(peer)
	{
		this.peers.push(peer);
		peer.shortId = this.peerIndex++;
		peer.addListener('open', this.keepContext(this.onOpenChannel));
		peer.addListener('datachannel', this.keepContext(this.onDataChannel));
		peer.addListener('message', this.keepContext(this.onMessage));
		peer.addListener('close', this.keepContext(this.onClose));
	}
	onOpenChannel(e)
	{
	}
	onDataChannel(e)
	{
	}
	onMessage(e)
	{
	}
	onClose(e)
	{
		this.peers.splice(e.context.shortId - 1, 1);
	}
	sendChannel(name, data)
	{
		for(var i = 0; i < this.peers.length; i++)
		{
			this.peers[i].sendChannel(name, data);
		}
	}
	sendChannelPrivate(name, data, ids)
	{
		for(var i = 0; i < this.peers.length; i++)
		{
			if(ids.indexOf(this.peers[i].shortId) < 0)
			{
				continue;
			}
			this.peers[i].sendChannel(name, data);
		}
	}
	sendChannelExcept(name, data, exceptions)
	{
		for(var i = 0; i < this.peers.length; i++)
		{
			if(exceptions.indexOf(this.peers[i].shortId) >= 0)
			{
				continue;
			}
			this.peers[i].sendChannel(name, data);
		}
	}
}
