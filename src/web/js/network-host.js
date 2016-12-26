class NetworkHost extends NetworkDispatcher
{
	constructor(masterServer, result)
	{
		super();
		this.remotePeers = {};
		this.id = result.data.id;
		this.masterServer = masterServer;
		this.masterServer.addEventListener('message', this.onMasterServerMessage(this));
		this.client = new GameClient(this);
		this.client.state = new GameState();
		var me = new Player(0, Session.nickname, "", true, Team.SPECTATORS);
		this.client.state.players[me.id] = me;
		this.client.state.me = me;
	}
	getClient()
	{
		return GameClient(this.virtualPeer);
	}
	onClose(e)
	{
		super.onClose(e);
		var leaveAction = new LeaveAction(LeaveReason.DISCONNECT, "");
		leaveAction.senderId = e.context.shortId;
		var packed = leaveAction.pack();
		this.sendChannel("actionChannel", packed);
		this.client.onMessage({data: packed});
	}
	onMessage(e)
	{
		console.log(e);
		var action = GameAction.unpack(e.data);
		action.senderId = e.context.shortId;
		console.log(action);
		console.log(this);
		console.log(this.peers);
		if(action.relay)
		{
			var packed = action.pack();
			this.sendChannel(e.target.label, packed);
			this.client.onMessage({data: packed});
		}
		else
		{
			switch(action.id)
			{
				case ConnectionAction.id:
					console.log("RECEIVE STATE");
					var stateAction = new GameStateAction(this.client.state);
					stateAction.senderId = action.senderId;
					this.sendChannelPrivate(e.target.label, stateAction.pack(), [action.senderId]);
					
					var newPlayer = new NewPlayerAction(action.nickname, action.country);
					newPlayer.senderId = action.senderId;
					var packed = newPlayer.pack();
					this.sendChannelExcept(e.target.label, packed, [action.senderId]);	
					this.client.onMessage({data: packed});

					break;
			}
		}
	}
	onMasterServerMessage(instance)
	{
		return function(e)
		{
			console.log("Receive message from master server");
			var message = JSON.parse(e.data);
			console.log(message);
			switch(message.command)
			{
				case "requestOffer":
					instance.onOfferRequest(message.data);
					break;

				case "acceptOffer":
					instance.onAcceptRequest(message.data);
					break;

				case "addIceCandidate":
					instance.onAddIceCandidate(message.data);
			}
		};
	}
	onAddIceCandidate(e)
	{
		console.log(e.description);
		this.remotePeers[e.remote].addIceCandidate(e.description);
	}
	onAcceptRequest(e)
	{
		console.log("Receiving offer accept");
		this.remotePeers[e.remote].setRemoteDescription(e.description);
	}
	onOfferRequest(e)
	{
		console.log("Receive offer request");
		var clientConnection = new RTCPeerConnection({iceServers: MasterServer.stun}, null);
		var actionChannel = clientConnection.createDataChannel("actionChannel", null);
		var networkPeer = new NetworkPeer(clientConnection);
		networkPeer.addChannel(actionChannel);
		this.addPeer(networkPeer);
		clientConnection.onicecandidate = this.keepContext(function(iceEvent)
		{
			if(!iceEvent.candidate)
			{
				return;
			}
			this.masterServer.send(JSON.stringify(
			{
				command: "addIceCandidate",
				data:
				{
					remote: e.remote,
					description: iceEvent.candidate
				}
			}));
		});
		clientConnection.createOffer().then((function(instance)
		{
			return function(description)
			{
				console.log("Send offer");
				clientConnection.setLocalDescription(description);
				instance.masterServer.send(JSON.stringify(
				{
					command: "answerRequest",
					data:
					{
						remote: e.remote,
						description: description
					}
				}));
			};
		})(this));
		this.remotePeers[e.remote] = clientConnection;
	}
	static fromCreation(masterServer, result)
	{
		return new NetworkHost(masterServer, result);
	}
}
