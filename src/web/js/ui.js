class GUI
{
	static showMenuInGame()
	{
		GUI.changeSelectorDisplay(".lobby", "none");
		GUI.changeSelectorDisplay(".ingame", "block");
	}
	static changeSelectorDisplay(selector, display)
	{
		var elements = document.querySelectorAll(selector);
		for(var i = 0; i < elements.length; i++)
		{
			elements[i].style.display = display;
		}
	}
	static appendChatView(text)
	{
		var messageDiv = document.createElement("div");
		messageDiv.textContent = text;
		GUI.chatView.appendChild(messageDiv);
	}
	static update()
	{
		var client = Session.gameClient;
		while(GUI.teamTableBody.firstChild)
		{
			GUI.teamTableBody.removeChild(GUI.teamTableBody.firstChild);
		}
		var teamCount = [0, 0, 0];
		for(var id in client.state.players)
		{
			teamCount[client.state.players[id].team]++;
		}
		var maxCount = Math.max.apply(null, teamCount);
		var table = {};
		for(var i = 0; i < maxCount; i++)
		{
			var tr = document.createElement("tr");
			for(var j = 0; j < 3; j++)
			{
				var td = document.createElement("td");
				table[[j, i]] = td;
				tr.appendChild(td);
			}
			GUI.teamTableBody.appendChild(tr);
		}
		teamCount = [0, 0, 0];
		for(var id in client.state.players)
		{
			var player = client.state.players[id];
			var cell = table[[player.team, teamCount[player.team]++]];
			if(player.admin)
			{
				cell.setAttribute("class", "admin");
			}
			cell.setAttribute("data-id", player.id);
			cell.textContent = player.nickname;
		}
	}
}

function createRoom(e)
{
	e.preventDefault();
	var roomInfo =
	{
		"name": document.getElementById("room_name").value,
		"players": document.getElementById("room_players").value,
		"password": document.getElementById("room_password").value != "",
		"public": document.getElementById("room_public").checked,
		"location": Location.getPlayerLocation()
	};
	MasterServer.createRoom(roomInfo).then(function(host)
	{
		Session.gameClient = host.client;
		GUI.showMenuInGame();
		host.client.addHandler(new GUIGameHandler());
		GUI.update();
	});
}

function roomClick(e)
{
	var target = e.target;
	if(e.target.getAttribute("data-id") != null)
	{
		var roomId = e.target.getAttribute("data-id"); // Clicked on tr element directly
	}
	else
	{
		var roomId = e.target.parentElement.getAttribute("data-id"); // Click on td element
	}
	MasterServer.requestJoinRoom(roomId).then(function(client)
	{
		console.log(client);
		Session.gameClient = client;
		GUI.showMenuInGame();
		client.addHandler(new GUIGameHandler());
	},
	function(e)
	{
		alert("Error connecting to room.");
	});
}

function fetchedRoomList(rooms)
{
	var roomTable = document.getElementById("room_list_body");
	while(roomTable.firstChild)
	{
		roomTable.removeChild(roomTable.firstChild);
	}

	for(var i in rooms)
	{
		var roomInfo = rooms[i];
		var roomTr = document.createElement("tr");
		
		roomTr.setAttribute("data-id", roomInfo.id);
		roomTr.addEventListener("click", roomClick);
		
		var nameTd = document.createElement("td");
		if('name' in roomInfo)
		{
			nameTd.textContent = roomInfo.name;
		}
		roomTr.appendChild(nameTd);

		var playersTd = document.createElement("td");
		if('players' in roomInfo)
		{
			playersTd.textContent = roomInfo.players;
		}
		roomTr.appendChild(playersTd);

		var passwordTd = document.createElement("td");
		if('password' in roomInfo)
		{
			passwordTd.textContent = roomInfo.password ? "Yes" : "No";
		}
		roomTr.appendChild(passwordTd);

		var countryTd = document.createElement("td");
		if('location' in roomInfo)
		{
			countryTd.textContent = roomInfo.location.country;
		}
		roomTr.appendChild(countryTd);

		roomTable.appendChild(roomTr);
	}
}

function roomCreateMenu()
{
	document.getElementById("room_create_menu").style.display = "block";
}

function loginSubmit(e)
{
	e.preventDefault();
	Session.nickname = document.getElementById("login_nickname").value;
	var after_login = document.querySelectorAll(".after_login");
	for(var i = 0; i < after_login.length; i++)
	{
		after_login[i].style.display = "block";
	}
	var before_login = document.querySelectorAll(".before_login");
	for(var i = 0; i < before_login.length; i++)
	{
		before_login[i].style.display = "none";
	}
}

function chatSend(e)
{
	e.preventDefault();
	Session.gameClient.chat(GUI.chatMessage.value);
	GUI.chatMessage.value = "";
}

function refreshRoomList()
{
	MasterServer.getRoomList(fetchedRoomList);
}

function setElements()
{
	GUI.chatView = document.getElementById("chat_content");
	GUI.chatMessage = document.getElementById("chat_message");
	GUI.teamTableBody = document.getElementById("team_table_body");
	GUI.playerKickButton = document.getElementById("player_kick");
	GUI.playerAdminButton = document.getElementById("player_admin");
	GUI.playerManagementMenu = document.getElementById("player_management_menu");
	GUI.buttonSelectMap = document.getElementById("game_select_map");
	GUI.mapFile = document.getElementById("game_map_file");

}

function changeTeam(team)
{
	return function()
	{
		Session.gameClient.changeTeam(Session.gameClient.state.me.id, team);
	};
}

function selectMap()
{
	GUI.mapFile.click();
}

function mapFileChanged(e)
{
	var files = e.target.files;
	if(!files || files.length <= 0)
	{
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e)
	{
		Stadium.fromString(e.target.result).renderStatic();
	};
	reader.readAsText(files[0]);
}

function playerKick()
{
}

function playerAdmin()
{
}

function onLoad()
{
	setElements();
	Debug.fromSettings();
	document.getElementById("room_create_form").addEventListener("submit", createRoom);
	document.getElementById("button_room_create_menu").addEventListener("click", roomCreateMenu);
	document.getElementById("login_form").addEventListener("submit", loginSubmit);
	document.getElementById("chat_form").addEventListener("submit", chatSend);
	document.getElementById("button_refresh_list").addEventListener("click", refreshRoomList);
	document.getElementById("team_table_head_red").addEventListener("click", changeTeam(Team.RED));
	document.getElementById("team_table_head_spec").addEventListener("click", changeTeam(Team.SPECTATORS));
	document.getElementById("team_table_head_blue").addEventListener("click", changeTeam(Team.BLUE));
	GUI.playerKickButton.addEventListener("click", playerKick);
	GUI.playerAdminButton.addEventListener("click", playerAdmin);
	GUI.buttonSelectMap.addEventListener("click", selectMap);
	GUI.mapFile.addEventListener("change", mapFileChanged);
	refreshRoomList();
}

window.addEventListener("load", onLoad);
