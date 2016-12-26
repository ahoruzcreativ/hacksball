class NetworkPeer extends EventDispatcher
{
	constructor(peer)
	{
		super();
		this.virtual = false;
		this.peer = peer;
		this.channels = {};
		this.peer.addEventListener('datachannel', this.keepContext(this.onDataChannel));
		this.peer.addEventListener('datachannel', this.propagate());
		this.peer.addEventListener('iceconnectionstatechange', this.keepContext(this.onIceConnectionStateChange));
	}
	addChannel(channel)
	{
		this.channels[channel.label] = channel;
		channel.addEventListener('message', this.propagate());
		channel.addEventListener('open', this.propagate());
		channel.addEventListener('close', this.propagate());
	}
	onIceConnectionStateChange(e)
	{
		if(e.target.iceConnectionState == "disconnected")
		{
			this.dispatch({
				type: "close",
				context: this,
				target: this
			});
		}
	}
	onDataChannel(e)
	{
		this.addChannel(e.channel);
	}
	sendChannel(label, data)
	{
		this.channels[label].send(data);
	}
}
