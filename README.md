## ScaledJS - Terrain Generator for HTML 5 Games & Apps
[![Build Status](https://travis-ci.org/vasumahesh1/scaledjs.svg?branch=master)](https://travis-ci.org/vasumahesh1/scaledjs)

Fully compatible with Cocos 2D JS & Cordova Apps

> **IMPORTANT:**
> ScaledJS is **under construction and doesn't work fully at the moment**.
> It was initially coded in C++, But due to limited usability porting to
> JavaScript was important.

Features
--------------------------------

* Uses Optimal Diamond Square Algorithm for Terrain Generation
* Freedom to Add as Many Layers as you want
* Freely decide on how the Starting Conditions of the Map are
* Inbuilt Generator for TMX Tiled Format Maps - For Runtime Tiled Map
  Generation (rather than having a static XML map)

Version
--------------------------------

0.0.2

Hey! What's working ?
--------------------------------

* Map Initialization
* Starting Conditions of the Map
* Adding more Terrains
* Terrain Generation based off Diamond Square Algorithm
* ~~Conversion of Value Matrix to 3D Layered Matrix~~
* ~~Conversion of 3D Matrix to TMX Tiled Map Format~~



Basic Usage
--------------------------------

Refer index.html for a live development example

```js
// Main Instance of the Generator
var generator = new ScaledGen();

// Set the Map Size you want to Generate
generator.SetMapSize(17,17);


// Add Terrains that meet your needs
generator.AddTerrain({
	key : 'layer_water',
	label : 'Water',
	max : 25,
	min : 0,
	default : true
});

generator.AddTerrain({
	key : 'layer_plain',
	label : 'Plain',
	max : 50,
	min : 25
});

// Terrains that act as decorations or aren't part of the Land generation must be marked as 'decoration'
generator.AddTerrain({
	key : 'layer_bushes',
	label : 'Bushes',
	max : 50,
	min : 25,
	zLevel : 1,
	type : 'decoration'
});

generator.AddTerrain({
	key : 'layer_forest',
	label : 'Forest',
	max : 75,
	min : 50
});

generator.AddTerrain({
	key : 'layer_hill',
	label : 'Hilly Terrain',
	max : 100,
	min : 75
});

// Define How the Map will look by specifying the Starting Condition of the map
generator.AddStartingCondition({
	layerKey: 'layer_hill', 
	minCount: 1,
	optionalPercent: 15
});

generator.AddStartingCondition({
	layerKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 65
});

// Final Command to Run and Execute the Map Generation
generator.GenerateMap();
generator.RenderMapValues('map-container');
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
	onProgressUpdate : updateFunction
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
		'mapValidation'
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

#### ScaledGen.SetMapSize(rowSize, columnSize)

Sets the Size of the Map. Check Limitations Heading for indepth status of ScaledJS.

Rectangular Maps are right now **Not Supported**.

**Supported Map Sizes:** 9, 17, 33, 65, 129, 257, 513, 1025, 2049, 4097, 8193


#### ScaledGen.AddTerrain(terrainData)

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

#### ScaledGen.AddStartingCondition(conditionData)

Specify the Starting Condition of some part of the Map. Like: Telling the Map to have atleast one Hilly Area.

There are 4 Starting slots namely the:
* Top Left
* Top Right
* Bottom Left
* Bottom Right

Areas of the Map.
```js
{
	layerKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 65
}
```
* `layerKey` - string - Required

	Specify the Layer to impose this condition on.

* `minCount` - int - Required

	Specify how many slots of the 4 Starting slots to be a `must have` for this terrain.

* `optionalPercent` - int - Required

	If there are any free slots left then what is the percentage that the free slot will be this terrain? The `optionalPercent` specifies this value.

For eg:

```js
generator.AddStartingCondition({
	layerKey: 'layer_plain', 
	minCount: 1,
	optionalPercent: 65
});
```
The above code basically says:
* There must be One Side of the Map which must have Plains (`layer_plain`)
* Furthermore the rest free slots of the map will have a 65% chance of being a Plain Terrain

License
--------------------------------

MIT

