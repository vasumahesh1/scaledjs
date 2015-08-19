## ScaledJS - Terrain Generator for HTML 5 Games & Apps
[![Build Status](https://travis-ci.org/vasumahesh1/scaledjs.svg?branch=master)](https://travis-ci.org/vasumahesh1/scaledjs)

Fully compatible with Cocos 2D JS & Cordova Apps

![alt text][banner]

> **IMPORTANT:**
> ScaledJS is **under construction** and might have some quirks. Refer "What's working" Section.
> Currently works awesome with Three Terrain Layers. When Terrain has 4 or more may lead to 
> Unexpected Behaviour 
> You will have certain issues with inter layer Edge Detection

Installation
--------------------------------
You can install it via Bower:
```sh
bower install scaledjs --save
```

Or download a release build in Github.

Features
--------------------------------

* Uses Optimal Diamond Square Algorithm for Terrain Generation
* Freedom to Add as Many Layers as you want
* Freely decide on how the Starting Conditions of the Map are
* Inbuilt Generator for TMX Tiled Format Maps - For Runtime Tiled Map
  Generation (rather than having a static XML map)

Hey! What's working ?
--------------------------------

* Map Initialization
* Starting Conditions of the Map
* Adding more Terrains
* Terrain Generation based off Diamond Square Algorithm
* Conversion of Value Matrix to 3D Layered Matrix
* Conversion of 3D Matrix to TMX Tiled Map Format
* ~~Panoramic Maps - Allowing Maps to continue Horizontally, Vertically or Both!~~
* Support for Variable Textures (Like Textures of Variable Trees etc.)
* ~~Enabling More Terrain Layer Support~~ - As of Now Works Upto 3 Layers.
* ~~Optional Hook for Developers when the Actual Adjacency Placement Rules are applied~~


Basic Usage
--------------------------------

Refer index.html for a live development example

```js
// Main Instance of the Generator
var generator = new ScaledGen({
    debug : true,
    logs : ['tmxRender'],
    maxTries : 20
});

// Set the Map Size you want to Generate
generator.setMapSize(17,17);


// Add Terrains that meet your needs
generator.addTerrain({
	key : 'layer_water',
	label : 'Water',
	max : 30,
	min : 0,
	default : true
});

generator.addTerrain({
	key : 'layer_plain',
	label : 'Plain',
	max : 65,
	min : 30
});

// Define How the Map will look by specifying the 
// Starting Condition of the map
generator.addStartingCondition({
	terrainKey: 'layer_water', 
	minCount: 1,
	optionalPercent: 25
});

generator.addStartingCondition({
	terrainKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 35
});


// Define Validation Rules
// So that the Generator will only generate a Map that
// meets the Rules you have given
generator.addValidationRule({
	terrainKey : 'layer_water',
	minPercent : 5
});


// If you are generating Full TMX Map. Provide the GID Values (Explained Below)
// for each Layer. Default(Lowest Level) layer needs only one tile data
// "fullValue" Tile image.
generator.setTileInfo({
	terrainKey : 'layer_water',
	tiles : [{
		type: "other-tiles",
		placement: "all",
		fullValue: 3
	}]	
});

// This is how a regular layer will look like. You can provide textures for 
// different types of Edges & intersections
generator.setTileInfo({
	terrainKey: 'layer_plain',
	tiles: [{
		type: "enclosing-tiles",
		placement: "top",
		leftValue: 4,
		rightValue: 6,
		topValue: 5
	}, {
		type: "enclosing-tiles",
		placement: "bottom",
		leftValue: 18,
		rightValue: 20,
		bottomValue: 19
	}, {
		type: "enclosing-tiles",
		placement: "left",
		leftValue: 11
	}, {
		type: "enclosing-tiles",
		placement: "right",
		rightValue: 13
	}, {
		type: "excluding-tiles",
		placement: "top",
		leftValue: 8,
		rightValue: 9,
	}, {
		type: "excluding-tiles",
		placement: "bottom",
		leftValue: 15,
		rightValue: 16,
	}, {
		type: "other-tiles",
		placement: "all",
		fullValue: 2
	}, {
		type: "closed-tiles",
		placement: "open",
		topValue: 22,
		rightValue: 23,
		bottomValue: 24,
		leftValue: 25,
		noneValue: 26,
	}, {
		type: "closed-tiles",
		placement: "parallel",
		topBottom: 27,
		leftRight: 28
	}, {
		type: "open-tiles",
		placement: "open",
		topValue: 29,
		rightValue: 30,
		bottomValue: 31,
		leftValue: 32,
		noneValue: 33
	}, {
		type: "open-tiles",
		placement: "parallel",
		topBottomValue: 34,
		leftRightValue: 35
	}]
});

// This is Important for Layer Hierarchy
// Larger the Index the more Dominant it is.
// The layer you want to stay at the top most, stays at the end of this Array
generator.addLayerDomination({
	dominationPriority: ['layer_water', 'layer_plain']
});

// Tileset Information for the Tiled Map
generator.addTileset({
	source: 'origin_tileset.png',
	height:160,
	width:224,
	tileWidth:32,
	tileHeight:32
});

// For Generating Only 2D Array of Values:
// generator.generateMapValues();
// var map = generator.getMapValues();

// Full Generation - Map Array -> 3D Layer -> TMX Map
// Use this If you want full generation from Scratch without any Custom Breakpoints 
// between the Generation Process
generator.generateMap();

// For Displaying Map: (Array Values)
generator.renderMapValues('map-container');

// For Getting Final TMX Map
var TMX_XML = generator.getTmxXml();
console.log(TMX_XML);
```

Customizations
--------------------------------

#### ScaledGen(settingsData)

Constructor for the main ScaledJS generator.

Parameters that can be consumed:
```js
{
	debug : true,
	logs : [],
	onProgressUpdate : updateFunction,
	maxTries : 10
}
```
* `debug` - boolean - Optional

	Sets the mode to Debug. Enables Console Logging.

* `logs` - array - Optional

	Array of strings containing the set of Console Log to show. By default it is set to `all` which allows all sub-modules of the generator to log to the console.

	If you want to Enable logging for only a specific part of the Generation like Validation or the Generation Itself. Use the following Keys:

	```js
	[
		'mapInit',
		'diamondSquare',
		'mapValidation',
		'mapRender',
		'tmxRender'
	]
	```

* onProgressUpdate - function - Optional

	Enable Progress Reporting sent from the Generator. Useful in cases when you have bigger maps and have load times. You can use this hook to show progress for better User Experience.

	```js
	var generator = new ScaledGen({
		onProgressUpdate : function(progressValue) {
			console.log("Progress from Library " + progressValue);
		}
	});
	```

* `maxTries` - int - Optional

	Specify the Maximum number of Iterations the Terrain Generator must perform incase of repeated validation failure by the Rules provided by the User


#### ScaledGen.setMapSize(rowSize, columnSize)

Sets the Size of the Map. Check Limitations Heading for indepth status of ScaledJS.

Rectangular Maps are right now **Not Supported**.

**Supported Map Sizes:** 9, 17, 33, 65, 129, 257, 513, 1025, 2049, 4097, 8193


#### ScaledGen.addTerrain(terrainData)

Add a new Terrain to the Map.

```js
{
	key : 'layer_hill',
	label : 'Hilly Terrain',
	max : 100,
	min : 75,
	zLevel : 1,
	type : 'decoration',
	default : true
}
```

* `key` - string - Required

	Specify the a unqiue key for the layer. Later use this key to define other Conditions and Parameters.

* `label` - string - Required

	Human Readable name for the layer. (has a future use trust me).


* `max` - int - Required - Range (0,100) (Inclusive)

	Maximum Value to be used to represent this Layer (Note more than One Layer can have Overlapping Values, used the `zLevel` param to define which comes first).

* `min` - int - Required - Range (0,100) (Inclusive)

	Minimum Value to be used to represent this Layer (Note more than One Layer can have Overlapping Values, used the `zLevel` param to define which comes first).

* `zLevel`  - int - Optional

	Indicates the Z Index of the Layer incase of Overlapping. If your Layers aren't overlapping no need to use this.

* `type`  - string - Optional

	Type of Layer. Regular Layers have type as 'terrain', for Materials like Trees, Bushes or other decorative Items.

* `default` - boolean - Optional

	Mark one Layer as Default. Currently not being used.

#### ScaledGen.addStartingCondition(conditionData)

Specify the Starting Condition of some part of the Map. Like: Telling the Map to have atleast one Hilly Area.

There are 4 Starting slots:
* Top Left
* Top Right
* Bottom Left
* Bottom Right

Areas of the Map.
```js
{
	terrainKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 65
}
```
* `terrainKey` - string - Required

	Specify the Terrain's Key to impose this condition on.

* `minCount` - int - Required

	Specify how many slots of the 4 Starting slots to be a `must have` for this terrain.

* `optionalPercent` - int - Required

	If there are any free slots left then what is the percentage that the free slot will be this terrain? The `optionalPercent` specifies this value.

For eg:

```js
generator.addStartingCondition({
	terrainKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 65
});
```
The above code basically says:
* There must be One Side of the Map which must have Plains (`layer_plain`)
* Furthermore the rest free slots of the map will have a 65% chance of being a Plain Terrain


#### ScaledGen.addValidationRule(ruleData)

Add a Validation Rule for the Generation.

> **Note:** Validation Rules are "Post Generation Rules". That means the map is 
> tested for Validity after the algorithm.
> But wait! There's more. If the Terrain Generation fails to meet the Terrain Criteria 
> at first run, a Validity Report is generated. And will (soon) be fed into the Algorithm.
> This will make the Terrain Generator Auto Correct it's mistakes. And making sure the 
> Generation will produce suitable output on second run.

```js
generator.addValidationRule({
	terrainKey : 'layer_water',
	minPercent : 5
});
```

* `terrainKey` - string - Required

	Specify the Terrain's Key to impose the Validation Rule on.

* `minPercent` - int - Range (0,100) (Inclusive)

	Minimum Percentage of that Terrain must be in the Map.

* `maxPercent` - int - Range (0,100) (Inclusive)

	Maximum Percentage of that Terrain must be in the Map.


#### ScaledGen.setTileInfo(gidData)

Add Texture Information About each Layer.

Gid Data is given as:

```js
{
	terrainKey: 'layer_plain',
	tiles: [{
		type: "enclosing-tiles",
		placement: "top",
		leftValue: 4,
		rightValue: 6,
		topValue: 5
	}, {
		type: "enclosing-tiles",
		placement: "bottom",
		leftValue: 18,
		rightValue: 20,
		bottomValue: 19
	}, {
		type: "enclosing-tiles",
		placement: "left",
		leftValue: 11
	}, {
		type: "enclosing-tiles",
		placement: "right",
		rightValue: 13
	}, {
		type: "excluding-tiles",
		placement: "top",
		leftValue: 8,
		rightValue: 9,
	}, {
		type: "excluding-tiles",
		placement: "bottom",
		leftValue: 15,
		rightValue: 16,
	}, {
		type: "other-tiles",
		placement: "all",
		fullValue: 2
	}, {
		type: "closed-tiles",
		placement: "open",
		topValue: 22,
		rightValue: 23,
		bottomValue: 24,
		leftValue: 25,
		noneValue: 26,
	}, {
		type: "closed-tiles",
		placement: "parallel",
		topBottom: 27,
		leftRight: 28
	}, {
		type: "open-tiles",
		placement: "open",
		topValue: 29,
		rightValue: 30,
		bottomValue: 31,
		leftValue: 32,
		noneValue: 33
	}, {
		type: "open-tiles",
		placement: "parallel",
		topBottomValue: 34,
		leftRightValue: 35
	}]
}
```

This Image will help you understand what each part of the JSON signifies:

![alt text][tiling]


#### ScaledGen.addLayerDomination(dominationData)

Currently Specifies the Priority in which the layers standout to each other. Based on that the TMX is rendered. This will be usefull when you have 3 or more types of Terrain Layers.

```js
{
	dominationPriority: ['layer_water', 'layer_plain']
}
```

#### ScaledGen.addTileset(tilesetData)

Add Information Regarding the TileSet used in your TMX Map.

```js
{
	source: 'origin_tileset.png',
	height:160,
	width:224,
	tileWidth:32,
	tileHeight:32
}
```

Options are pretty self-explanatory


#### ScaledGen.generateMap()

Main Function which starts the Map Generation Process.


#### ScaledGen.getTmxXml()

Function to return TMX Map XML which can further be used in Cocos or other Game Engines


License
--------------------------------

MIT


I don't own any textures used in this Image. They are used for Illustrative Purposes only.



[banner]: screenshots/readme-image.jpg "Terrain Gen"
[tiling]: screenshots/tiling-json.jpg "Tile Setup"
