// Depending on the load, a move from Node to some more efficient programming language like C or C++ might be necessary

// TODO: Add IPv4 (/32) and IPv6 (/64) room creation limits

var randomstring = require("randomstring");
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({host: "127.0.0.1", port: 9090});

var rooms = [];
var idConnection = {};

var secrets = {};

wss.on('connection', function(connection)
{
	var remoteAddress = connection.upgradeReq.connection.remoteAddress;
	var connectedRoom = null;
	var connectionId = randomstring.generate(32);
	idConnection[connectionId] = connection;
	connection.on('close', function()
	{
		if(connectedRoom !== null)
		{
			delete rooms[connectedRoom];
			delete idConnection[connectedRoom];
		}
	});
	function sendClosedError()
	{
		connection.send(JSON.stringify(
		{
			error:
			{
				id: 'room_closed'
			}
		}));
	}
	connection.on('message', function(str)
	{
		var message = JSON.parse(str);
		console.log(connectionId);
		console.log(message);
		console.log("");
		switch(message.command)
		{
			case 'updateRoom':
				// TODO: Ensure existence of members: version, name, country, currentPlayers, maxPlayers, password, position (latitude, longitude)
				// TODO: Ensure that no additional members are present
				room = message.data;
				room.id = connectionId;
				rooms[room.id] = room;
				connectedRoom = room.id;
				connection.send(JSON.stringify(
				{
					data:
					{
						id: room.id
					}
				}));
				break;

			case 'getRooms':
				var result = [];
				for(var id in rooms)
				{
					var roomInfo = rooms[id];
					roomInfo.id = id;
					result.push(roomInfo);
				}
				connection.send(JSON.stringify(result));
				break;

			case 'requestOffer':
			case 'answerRequest':
			case 'acceptOffer':
			case 'addIceCandidate':
				if(!(message.data.remote in idConnection))
				{
					sendClosedError();
					return;
				}
				var hostConnection = idConnection[message.data.remote];
				var clientInfo =
				{
					remote: connectionId,
					remoteAddress: remoteAddress // this gives us more power for banning users
				};
				if(message.command != 'requestOffer')
				{
					clientInfo.description = message.data.description;
				}
				var newClientEvent =
				{
					command: message.command,
					data: clientInfo
				};
				hostConnection.send(JSON.stringify(newClientEvent));
				break;
		}
	});
});
