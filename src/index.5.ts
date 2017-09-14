/**
 * Copy interactive_voxel_painter code
 */

// add styles
import './style.css'
// three.js
import * as THREE from 'three'
import {default as Stats} from 'stats.js/src/Stats'
let stats
let container:HTMLDivElement
let camera:THREE.PerspectiveCamera
let scene:THREE.Scene 
let renderer:THREE.WebGLRenderer

let plane:THREE.Mesh
let cube:THREE.Mesh

let raycaster:THREE.Raycaster
let mouse:THREE.Vector2 = new THREE.Vector2()
let gridHelper:THREE.GridHelper
let isShiftDown:Boolean = false

let rollOverGeo:THREE.BoxGeometry
let rollOverMesh:THREE.Mesh
let rollOverMaterial:THREE.MeshLambertMaterial

let cubeGeo:THREE.BoxGeometry
let cubeMaterial

let objects:THREE.Object3D[] = []

init()
// animate()

function init() {
	container = document.createElement('div')
	document.body.appendChild(container)

	// Scene
	scene = new THREE.Scene()
	scene.background = new THREE.Color(0xffffff)

	//Camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
	camera.position.set(500, 800, 1300)
	camera.lookAt(new THREE.Vector3())

	// roll-over helpers
	rollOverGeo = new THREE.BoxGeometry(50, 50, 50)
	rollOverMaterial = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		opacity: 0.5,
		transparent: true
	})
	rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial)
	scene.add(rollOverMesh)

	// cubes
	cubeGeo = new THREE.BoxGeometry(50, 50, 50)
	cubeMaterial = new THREE.MeshLambertMaterial({
		color: 0xfeb74c,
		map: new THREE.TextureLoader().load('textures/square-outline-textured.png')
	})

	// gird
	gridHelper = new THREE.GridHelper(1000, 20)
	scene.add(gridHelper)

	raycaster = new THREE.Raycaster()
	mouse = new THREE.Vector2()

	let geometry = new THREE.PlaneBufferGeometry(1000, 1000)
	geometry.rotateX(- Math.PI / 2)
	plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({visible: true}))
	plane.name = '我是平面'
	objects.push(plane)

	let ambientLight = new THREE.AmbientLight(0x606060)
	scene.add(ambientLight)

	let directionalLight = new THREE.DirectionalLight(0xffffff)
	directionalLight.position.set(1, 0.75, 0.5).normalize()
	scene.add(directionalLight)

	renderer = new THREE.WebGLRenderer({antialias: true})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	container.appendChild(renderer.domElement)
	
	stats = new Stats()
	container.appendChild(stats.dom)
	document.addEventListener('mousemove', onDocumentMouseMove, false)
	document.addEventListener('mousedown', onDocumentMouseDown, false)
	window.addEventListener('resize', onWindowResize, false)

	window.addEventListener('resize', onWindowResize, false)
	window.addEventListener('keydown', onKeyDown, true)
	window.addEventListener('keyup', onKeyUp, true)
}

function loadModel(colorMap:String, numberOfColors:Number, legendLayout:String) {
	const loader = new THREE.BufferGeometryLoader()
	loader.load('models/json/pressure.json', function(geometry:THREE.BufferGeometry) {
		geometry.computeVertexNormals()
		geometry.normalizeNormals()
		let material:THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			color: 0xF5F5F5,
			vertexColors: THREE.VertexColors
		})
		let lutColors:number[] = []
		let anyTHREE = THREE as any
	})
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function onKeyDown(event:KeyboardEvent) {
	switch(event.keyCode) {
		case 16: isShiftDown = true; break
	}
}

function onKeyUp(event:KeyboardEvent) {
	switch(event.keyCode) {
		case 16: isShiftDown = false; break
	}	
}

function onDocumentMouseMove(event) {
	event.preventDefault()
	mouse.x = (event.clientX / window.innerWidth) * 2 -1
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
	raycaster.setFromCamera(mouse, camera)
	let intersects = raycaster.intersectObjects(objects)
	if (intersects.length > 0) {
		let intersect = intersects[0]
		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal)
		rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
	}
	render()
}

function onDocumentMouseDown(event:MouseEvent) {
	event.preventDefault()
	mouse.x = (event.clientX / window.innerWidth) * 2 -1
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
	raycaster.setFromCamera(mouse, camera)
	let intersects = raycaster.intersectObjects(objects)
	if (intersects.length > 0) {
		let intersect = intersects[0]
		if (isShiftDown) {
			if (intersect.object !== plane) {
				scene.remove(intersect.object)
				objects.splice(objects.indexOf(intersect.object), 1)
			}
		} else {
			let voxel = new THREE.Mesh(cubeGeo, cubeMaterial)
			voxel.position.copy(intersect.point).add(intersect.face.normal)
			voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
			scene.add(voxel)
			objects.push(voxel)
		}
	}
	render()
}

// function animate() {
// 	requestAnimationFrame(animate)
// 	render()
// 	stats.update()
// }

function render() {
	renderer.render(scene, camera)
}