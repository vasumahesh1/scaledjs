# ScaledJS - Terrain Generator for HTML 5 Games & Apps
Fully compatible with Cocos 2D JS & Cordova Apps

> **IMPORTANT:**
> ScaledJS is **under construction**.
> It was initially coded in C++, But due to limited usability porting to
> JavaScript was important.

#### Features
* Uses Optimal Diamond Square Algorithm for Terrain Generation
* Freedom to Add as Many Layers as you want
* Freely decide on how the Starting Conditions of the Map are
* Inbuilt Generator for TMX Tiled Format Maps - For Runtime Tiled Map
  Generation (rather than having a static XML map)

#### Version
0.0.1

#### Basic Usage
Refer index.html for a live development example

```js
var generator = new ScaledGen();
generator.SetMapSize(17,17);

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

generator.GenerateMap();
generator.RenderMapValues('map-container');
```


License
----
MIT


[Animate]:https://github.com/daneden/animate.css

