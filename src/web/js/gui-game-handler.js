class GUIGameHandler
{
	constructor(client)
	{
		if(arguments.length <= 0)
		{
			this.client = Session.gameClient;
		}
		else
		{
			this.client = client;
		}
	}
	onActionApplied(action)
	{
		console.log(this);
		switch(action.id)
		{
			case ChatAction.id:
				GUI.appendChatView(this.client.state.players[action.senderId].nickname + ": " + action.text);
				break;
			case NewPlayerAction.id:
				GUI.appendChatView("* " + action.nickname + " has joined.");
				break;
		}
		GUI.update();
	}
	onBeforeApplyAction(action)
	{
		console.log(this);
		switch(action.id)
		{
			case LeaveAction.id:
				GUI.appendChatView("* " + this.client.state.players[action.senderId].nickname + " has left.");
				break;
		}
	}
}
