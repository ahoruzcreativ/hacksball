CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius)
{
	this.beginPath();
	this.moveTo(x + radius, y);
	this.arcTo(x + width, y, x + width, y + height, radius);
	this.arcTo(x + width, y + height, x, y + height, radius);
	this.arcTo(x, y + height, x, y, radius);
	this.arcTo(x, y, x + width, y, radius);
	this.closePath();
}

class Stadium
{
	constructor(description)
	{
		this.description = description;
		this.applyTraits();
	}
	static fromString(str)
	{
		// TODO: Ignore comments within string literals. 
		str = str.replace(/\/\/.*/gm, ""); // Strip single-line comments
		str = str.replace(/\/\*[\s\S]*?\*\//g, ""); // Strip multi-line comments
		return new this(JSON.parse(str));
	}
	applyTraits()
	{
		var traitsAllowed = ["vertexes", "segments", "goals", "discs", "planes"];
		for(var i = 0; i < traitsAllowed.length; i++)
		{
			var property = traitsAllowed[i];
			if(property in this.description && this.description[property].constructor === Array)
			{
				for(var j = 0; j < this.description[property].length; j++)
				{
					var objectReference = this.description[property][j];
					if('trait' in objectReference && objectReference.trait in this.description.traits)
					{
						this.description[property][j] = Object.assign(objectReference, this.description.traits[objectReference.trait]);
						delete objectReference['trait'];
					}
				}
			}
		}
	}
	renderBackground()
	{
		if(this.description.bg.type == "grass" || true)
		{
			// Fill canvas background
			this.context.fillStyle = "#718C5A";
			this.context.fillRect(0, 0, 2 * this.description.width, 2 * this.description.height);

			var bg =
			{
				"left": this.description.width - this.description.bg.width,
				"top": this.description.height - this.description.bg.height
			};

			// Fill field background with grass image
			this.context.fillStyle = this.context.createPattern(Stadium.grassImage, "repeat");
			this.context.lineWidth = 3;
			this.context.strokeStyle = "#C7E6BD";
			this.context.stroke();
			this.context.roundRect(bg.left, bg.top, this.description.bg.width * 2, this.description.bg.height * 2, this.description.bg.cornerRadius);
			this.context.fill();
			this.context.stroke();

			// Draw field separator
			this.context.beginPath();
			this.context.moveTo(bg.left + this.description.bg.width, bg.top);
			this.context.lineTo(bg.left + this.description.bg.width, bg.top + this.description.bg.height * 2);
			this.context.stroke();
			this.context.closePath();

			// Draw kickoff circle
			this.context.beginPath();
			this.context.arc(this.description.width, this.description.height, this.description.bg.kickOffRadius, 0, 2 * Math.PI);
			this.context.stroke();
			this.context.closePath();
		}
	}
	renderDiscs(includeMovables)
	{
		if(!('discs' in this.description))
		{
			return;
		}
		for(var i = 0; i < this.description.discs.length; i++)
		{
			var disc = this.description.discs[i];
			this.context.beginPath();
			this.context.arc(this.description.width + disc.pos[0], this.description.height + disc.pos[1], disc.radius - 1, 0, 2 * Math.PI);
			this.context.fillStyle = "#" + disc.color;
			this.context.strokeStyle = "black";
			this.context.lineWidth = 3;
			this.context.stroke();
			this.context.fill();
			this.context.closePath();
		}
	}
	renderSegments(debug)
	{
		if(!('segments' in this.description))
		{
			return;
		}
		// BROKEN: 14
		for(var i = 0; i < this.description.segments.length; i++)
		{
			var segment = this.description.segments[i];
			var from = this.description.vertexes[segment.v0];
			var to = this.description.vertexes[segment.v1];
			if(!('vis' in segment) || !segment.vis)
			{
				continue;
			}
			if(!('color' in segment))
			{
				this.context.strokeStyle = "black";
			}
			else
			{
				this.context.strokeStyle = "#" + segment.color;
			}
			this.context.beginPath();
			if(!('curve' in segment) || segment.curve == 0)
			{
				this.context.moveTo(this.description.width + from.x, this.description.height + from.y);
				this.context.lineTo(this.description.width + to.x, this.description.height + to.y);
				this.context.stroke();
			}
			else if(from.x != to.x && from.y != to.y && Math.abs(segment.curve) != 90)
			{
				var middle = {
					x: (from.x + to.x) / 2,
					y: (from.y + to.y) / 2
				};
				if(segment.curve < 0)
				{
					segment.curve *= -1;
					var tmp = from;
					from = to;
					to = tmp;
				}
				var alpha = Math.PI * segment.curve / 180;

				var dx = from.x - to.x;
				var dy = from.y - to.y;

				var d = Math.sqrt(dy * dy + dx * dx);

				var x1 = from.x;
				var y1 = from.y;
				
				var x2 = to.x;
				var y2 = to.y;

				var x3 = middle.x;
				var y3 = middle.y;

				var ms = - (x2 - x1) / (y2 - y1); // Slope of perpendicular
				var ns = y3 - x3 * ms;
				var b = d / Math.tan(alpha / 2);

				var p = (ms * ns - x3) / (1 + ms * ms);
				var q = (x3 * x3 + ns * ns - b * b) / (1 + ms * ms);

				if(q > p * p)
				{
					var pq_root = 0;
				}
				else
				{
					var pq_root = Math.sqrt(p*p - q); 
				}
				console.log(pq_root);
				if(segment.curve > 0 && !(dx > 0 && dy > 0) || segment.curve < 0 && dx < 0 && dy > 0 || segment.curve < 0 && dx > 0 && dy > 0)
				{
					console.log("SWITCH!");
					pq_root *= -1;
				}
				console.log(pq_root);
				var x4 = -p + pq_root;
				var y4 = x4 * ms + ns;
				
				//this.context.beginPath();
				//this.context.arc(this.description.width + x4, this.description.height + y4, 4, 0, 2 * Math.PI);
				//this.context.fillStyle = "red";
				//this.context.fill();
				//this.context.closePath();


				var radius = Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1));
				this.context.arc(this.description.width + x4, this.description.height + y4, radius - 1, 0, Math.PI * 2);
				this.context.stroke();
				console.log("DEBUG "+i.toString()+"\ndx: " + dx.toString() + "\ndy: " + dy.toString() + "\nalpha: " + alpha.toString() + "\nradius: " + radius.toString() + "\np: " + x4.toString() + ", " + y4.toString());
				debugger;
			}
			/*else
			{
				var lowerLeft = {
					x: from.x < to.x ? from.x : to.x,
					y: from.y < to.y ? from.y : to.y
				};
				var upperRight = {
					x: from.x > to.x ? from.x : to.x,
					y: from.y > to.y ? from.y : to.y
				};
				var dx = upperRight.x - lowerLeft.x;
				var dy = upperRight.y - lowerLeft.y;
				this.context.moveTo(this.description.width + lowerLeft.x, this.description.height + lowerLeft.y);
				this.context.arcTo(this.description.width + lowerLeft.x + dx, this.description.height + lowerLeft.y, this.description.width + upperRight.x, this.description.height + upperRight.y, dx);
				debugger;
			}*/
			this.context.closePath();
		}
	}
	renderStatic()
	{
		var canvas = document.createElement("canvas");
		this.context = canvas.getContext("2d");
		canvas.setAttribute("class", "stadium");
		canvas.width = 2 * this.description.width;
		canvas.height = 2 * this.description.height;
		document.body.appendChild(canvas);
		this.renderBackground();
		this.renderSegments();
		this.renderDiscs();
		return canvas;
	}
}

Stadium.grassImage = new Image();
Stadium.grassImage.src = "/img/grass.png";

class GameArea
{
	construct(stadium)
	{
		this.stadium = stadium;
	}
	render(container)
	{
		var canvas = document.createElement("canvas");
	}
}
