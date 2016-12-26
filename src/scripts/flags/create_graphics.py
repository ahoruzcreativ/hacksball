import sys
import glob
import os
import json
from PIL import Image, ImageFilter

if len(sys.argv) < 2:
	print("Specify a flag folder as command line argument.")
	sys.exit(1)

folder = sys.argv[1]

images = {}
max_width = -1
total_height = 0

files = glob.glob(os.path.join(folder, "*.png"))

for filename in files:
	country_code = os.path.split(filename)[-1].split(".")[0]
	image = Image.open(filename)
	images[country_code] = {"image": image, "top": total_height}
	images[country_code]["size"] = image.size
	if image.size[0] > max_width:
		max_width = image.size[0]
	total_height += image.size[1]

destination = Image.new("RGBA", (max_width, total_height,))
for filename in files:
	country_code = os.path.split(filename)[-1].split(".")[0]
	destination.paste(images[country_code]["image"], (0, images[country_code]["top"],))
	del images[country_code]["image"]

print(json.dumps(images))

destination.save("flags.png")
