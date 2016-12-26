class GameClient extends NetworkDispatcher
{
	constructor()
	{
		if(arguments.length == 1)
		{
			if(arguments[0] instanceof NetworkHost)
			{
				super();
				this.host = arguments[0];
			}
			else
			{
				super(arguments[0]);
			}
		}
		else
		{
			super();
		}
		this.state = null;
		this.handlers = [];
		for(var i = 0; i < GameAction.actions.length; i++)
		{
			var action = GameAction.actions[i];
			var name = action.name;
			if(!name.endsWith("Action"))
			{
				continue;
			}
			var methodName = name.substr(0, 1).toLowerCase() + name.substr(1, name.length - 7);
			this[methodName] = (function(action)
			{
				return function()
				{
					var flattenedArgs = [];
					for(var i = 0; i < arguments.length; i++)
					{
						flattenedArgs.push(arguments[i]);
					}
					var newAction = new (Function.prototype.bind.apply(action, [null].concat(flattenedArgs)));
					console.log(newAction);
					var data = newAction.pack();
					var destination = this.host || this.peers[0];
					destination.sendChannel("actionChannel", data);
					if(this.host)
					{
						this.onMessage({data: data});
					}
				};
			})(action);
		}
	}
	addHandler(handler)
	{
		this.handlers.push(handler);
		if('onRegister' in handler)
		{
			handler.onRegister(this);
		}
	}
	onOpenChannel(e)
	{
		console.log("Open channel");
		if(e.target.label == "actionChannel") // Woop, woop!
		{
			var newConnection = new ConnectionAction(Session.nickname, Session.country, "");
			e.target.send(newConnection.pack());
		}
	}
	applyActionHandlers(name, parameters)
	{
		for(var i = 0; i < this.handlers.length; i++)
		{
			if(!(name in this.handlers[i]))
			{
				continue;
			}
			this.handlers[i][name].apply(this.handlers[i], parameters);
		}
	}
	onMessage(e)
	{
		if(e.data instanceof Blob) // Firefox receives data as blobs
		{
			var blobReader = new FileReader();
			blobReader.onload = (function(client)
			{
				return function()
				{
					var ev = {
						data: this.result
					};
					client.onMessage.apply(client, [ev]);
				};
			})(this);
			blobReader.readAsArrayBuffer(e.data);
			return;
		}
		var action = GameAction.unpack(e.data);
		console.log(action);
		switch(action.id)
		{
			case NewPlayerAction.id:
				console.log("New player " + action.senderId);
				this.state.players[action.senderId] = new Player(action.senderId, action.nickname, action.country, Team.SPECTATORS, false);
				break;
			case ChangeTeamAction.id:
				if(!this.state.players[action.senderId].admin && action.senderId != action.playerId || action.team > 2)
				{
					return;
				}
				this.state.players[action.playerId].team = action.team;
				break;
			case GameStateAction.id:
				if(this.state)
				{
					return;
				}
				this.state = action.state;
				this.state.players[action.senderId] = new Player(action.senderId, Session.nickname, Session.country, Team.SPECTATORS, false);
				this.state.me = this.state.players[action.senderId];
				break;
			case LeaveAction.id:
				this.applyActionHandlers("onBeforeApplyAction", [action]);
				delete this.state.players[action.senderId];
				break;
		}
		this.applyActionHandlers("onActionApplied", [action]);
	}
	onClose(e)
	{
		alert("Connection closed!");
	}
}
