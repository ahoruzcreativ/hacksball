class Location
{
	static getIPLocation()
	{
		return new Promise(function(resolve, reject)
		{
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/geoip/");
			xhr.onreadystatechange = function()
			{
				if(this.readyState == 4 && (this.status == 204 || this.status == 204))
				{
					var countryCode = xhr.getResponseHeader("X-Geoip-CountryCode");
					var latitude = xhr.getResponseHeader("X-Geoip-Latitude");
					var longitude = xhr.getResponseHeader("X-Geoip-Longitude");
					if(resolve)
					{
						resolve(
						{
							country: countryCode.toLowerCase(),
							latitude: latitude,
							longitude: longitude
						});
					}
				}
				else if(this.readyState == 4)
				{
					if(reject)
					{
						reject();
					}
				}
			};
			xhr.ontimeout = function()
			{
				if(reject)
				{
					reject();
				}
			};
			xhr.send();
		});
	}
	static getPlayerLocation()
	{
		var loc = Location.geoip;
		loc.country = loc.country.toLowerCase();
		return loc;
	}
}
