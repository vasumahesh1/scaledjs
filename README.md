## ScaledJS - Terrain Generator for HTML 5 Games & Apps
[![Build Status](https://travis-ci.org/vasumahesh1/scaledjs.svg?branch=master)](https://travis-ci.org/vasumahesh1/scaledjs)

Fully compatible with Cocos 2D JS & Cordova Apps

> **IMPORTANT:**
> ScaledJS is **under construction and doesn't work fully at the moment**.
> It was initially coded in C++, But due to limited usability porting to
> JavaScript was important.

### Features
----
* Uses Optimal Diamond Square Algorithm for Terrain Generation
* Freedom to Add as Many Layers as you want
* Freely decide on how the Starting Conditions of the Map are
* Inbuilt Generator for TMX Tiled Format Maps - For Runtime Tiled Map
  Generation (rather than having a static XML map)

### Version
----
0.0.2

### Hey! What's working ?
----
* Map Initialization
* Starting Conditions of the Map
* Adding more Terrains
* Terrain Generation based off Diamond Square Algorithm
* ~~Conversion of Value Matrix to 3D Layered Matrix~~
* ~~Conversion of 3D Matrix to TMX Tiled Map Format~~



### Basic Usage
----
Refer index.html for a live development example

```js
// Main Instance of the Generator
var generator = new ScaledGen({
	debug : true,
	logs : ['diamond-square']
});

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

### Some Function Definitions
----

#### generator.SetMapSize(rowSize, columnSize)
----
Sets the Size of the Map. Will be adding support later for Rectangular Maps.

#### generator.AddTerrain(terrainData)
----
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
* `key` - Specify the a unqiue key for the layer. Later use this key to define other Conditions and Parameters.
* `label` - Give a nice human readable String to this Layer.
* `max` - Maximum Value (Range 0-100) to be used to represent this Layer (Note more than One Layer can have Overlapping Values, used the `zLevel` param to define which comes first).
* `min` - Minimum Value (Range 0-100) to be used to represent this Layer (Note more than One Layer can have Overlapping Values, used the `zLevel` param to define which comes first).
* `zLevel` *Optional* - Indicates the Z Index of the Layer incase of Overlapping. If your Layers aren't overlapping no need to use this.
* `type` *Optional* - Type of Layer. Regular Layers have type as 'terrain', for Materials like Trees, Bushes or other decorative Items.
* `default` *Optional* - Mark one Layer as Default. Currently not being used.

#### generator.AddStartingCondition(conditionData)
----
Specify the Starting Condition of some part of the Map. Like: Telling the Map to have atleast one Hilly Area.

There are 4 Starting slots namely the 
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
* `layerKey` - Specify the Layer to impose this condition on.
* `minCount` - Specify how many slots of the 4 Starting slots to be a `must have` for this terrain.
* `optionalPercent` - If there are any free slots left then what is the percentage that the free slot will be this terrain? The `optionalPercent` specifies this value.

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


### License
----

MIT

