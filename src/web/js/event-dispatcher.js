class EventDispatcher
{
	constructor()
	{
		this.listeners = {};
	}

	addListener(name, handler)
	{
		if(!(name in this.listeners))
		{
			this.listeners[name] = [];
		}
		this.listeners[name].push(handler);
	}

	dispatch(e)
	{
		if(!(e.type in this.listeners))
		{
			return;
		}
		for(var i = 0; i < this.listeners[e.type].length; i++)
		{
			this.listeners[e.type][i](e);
		}
	}

	propagate()
	{
		return (function(thisArg)
		{
			return function(e)
			{
				e.context = thisArg;
				thisArg.dispatch(e);
			}
		})(this);
	}
	keepContext(method)
	{
		return (function(thisArg)
		{
			return function()
			{
				method.apply(thisArg, arguments);
			}
		})(this);
	}
}
