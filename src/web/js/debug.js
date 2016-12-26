(function()
{
	function errorHandler(e)
	{
		if(!e)
		{
			return;
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/errors");
		var data = {
			message: e.message,
			filename: e.filename,
			lineno: e.lineno,
			colno: e.colno,
			stack: (e.error || {}).stack // mimic undefined-conditional operator
		};
		xhr.send(JSON.stringify(data));
	}
	window.addEventListener("error", errorHandler);
})();

class Debug
{
	static enable(master)
	{
		if(master == null)
		{
			return;
		}
		localStorage.setItem("debug", master);
		document.location.reload(true);
	}

	static fromSettings()
	{
		var url = localStorage.getItem("debug");
		if(!url)
		{
			return;
		}
		MasterServer.url = url;
	}

	static disable()
	{
		localStorage.removeItem("debug");
		document.location.reload(true);
	}
}
