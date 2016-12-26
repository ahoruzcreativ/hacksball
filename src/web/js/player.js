class Player
{
	constructor(id, nickname, country, team, admin)
	{
		this.id = id;
		this.nickname = nickname;
		this.country = country;
		this.team = Team.SPECTATORS;
		this.admin = admin;
	}
	pack()
	{
		var buf = new Uint8Buffer();
		buf.append(Binary.fromUint32(this.id));
		buf.append(Binary.fromString(this.nickname));
		buf.append(Binary.fromString(this.country));
		buf.append(Binary.fromUint8(this.team));
		buf.append(Binary.fromBool(this.admin));
		return buf.toArray();
	}
	static unpack(br)
	{
		var id = br.readUint32();
		var nickname = br.readString();
		var country = br.readString();
		var team = br.readUint8();
		var admin = br.readBool();
		return new this(id, nickname, country, team, admin);
	}
}
