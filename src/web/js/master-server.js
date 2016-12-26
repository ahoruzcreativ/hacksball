
class MasterServer
{
	static createRoom(info)
	{
		return new Promise(function(resolve, reject)
		{
			var socket = new WebSocket(MasterServer.url);
			socket.onopen = function()
			{
				this.send(JSON.stringify(
				{
					command: 'updateRoom',
					data: info
				}));
			};

			function firstMessageHandler(e)
			{
				this.removeEventListener('message', firstMessageHandler);
				resolve(NetworkHost.fromCreation(e.target, JSON.parse(e.data)));
			};

			socket.addEventListener('message', firstMessageHandler);
		});
	}

	static getRoomList(successCallback, errorCallback)
	{
		this.socket = new WebSocket(this.url);
		this.socket.onopen = function()
		{
			this.send(JSON.stringify(
			{
				command: 'getRooms'
			}));
		};
		this.socket.onmessage = function(e)
		{
			successCallback(JSON.parse(e.data));
			this.close();
		};
	}

	static requestJoinRoom(id)
	{
		return new Promise(function(resolve, reject)
		{
			var masterServer = new WebSocket(MasterServer.url);
			masterServer.onopen = function()
			{
				console.log("Request offer");
				this.send(JSON.stringify(
				{
					command: 'requestOffer',
					data:
					{
						remote: id
					}
				}));
			};
			var hostConnection = null;
			masterServer.onmessage = function(e)
			{
				var message = JSON.parse(e.data);
				if('error' in message && reject)
				{
					reject(message);
					return;
				}
				switch(message.command)
				{
					case "answerRequest":
						hostConnection = new RTCPeerConnection({iceServers: MasterServer.stun}, null);
						hostConnection.setRemoteDescription(message.data.description);

						hostConnection.onicecandidate = function(e)
						{
							if(!e.candidate)
							{
								return;
							}
							masterServer.send(JSON.stringify(
							{
								command: "addIceCandidate",
								data:
								{
									remote: id,
									description: e.candidate
								}
							}
							));
						};
						if(resolve)
						{
							resolve(new GameClient([new NetworkPeer(hostConnection)]));
						}

						hostConnection.createAnswer().then(function(description)
						{
							hostConnection.setLocalDescription(description);
							masterServer.send(JSON.stringify(
							{
								command: "acceptOffer",
								data:
								{
									remote: id,
									description: description
								}
							}));
						});
						break;

					case "addIceCandidate":
						hostConnection.addIceCandidate(message.data.description);
						break;
				}
			};
		});
	}
};

MasterServer.stun = [
	{
		urls:
		[
			'stun:stun.schlund.de',
			'stun:stun.l.google.com:19302',
			'stun:stun1.l.google.com:19302',
			'stun:stun2.l.google.com:19302',
			'stun:stun3.l.google.com:19302',
			'stun:stun4.l.google.com:19302',
			'stun:stunserver.org'
		]
	}
];

MasterServer.url = "wss://" + document.location.host + "/master/";
