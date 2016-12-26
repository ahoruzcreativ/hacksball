class GameState
{
	constructor()
	{
		this.players = {};
		this.me = null;
	}
	pack()
	{
		var buf = new Uint8Buffer();
		buf.append(Binary.fromUint32(Object.keys(this.players).length));
		for(var id in this.players)
		{
			buf.append(this.players[id].pack());
		}
		return buf.toArray();
	}
	static unpack(br)
	{
		var state = new this();
		var playerCount = br.readUint32();
		for(var i = 0; i < playerCount; i++)
		{
			var player = Player.unpack(br);
			state.players[player.id] = player;
		}
		return state;
	}
}
