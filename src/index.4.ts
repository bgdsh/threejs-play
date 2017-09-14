/**
 * Copy geometry/colors/lookuptable code
 */

// add styles
import './style.css'
// three.js
import * as THREE from 'three'
import THREELut from './three.lut'
THREELut(THREE)
import {default as Stats} from 'stats.js/src/Stats'

let container:HTMLDivElement
let camera:THREE.PerspectiveCamera
let scene:THREE.Scene 
let ambientLight:THREE.AmbientLight
let directionalLight:THREE.DirectionalLight
let raycaster:THREE.Raycaster
let renderer:THREE.WebGLRenderer

let colorMap:String
let numberOfColors:Number
let legendLayout:String
let lut

let mouse = new THREE.Vector2()
let position:THREE.Vector3
let mesh:THREE.Mesh
let rotWorldMatrix:THREE.Matrix4
let INTERSECTED
let radius = 100
let theta = 0
let stats

init()
animate()

function init() {
	container = document.createElement('div')
	document.body.appendChild(container)

	// Scene
	scene = new THREE.Scene()
	scene.background = new THREE.Color(0xffffff)

	//Camera
	camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 10000)
	camera.position.x = 17
	camera.position.y = 9
	camera.position.z = 32
	camera.name = 'camera'
	scene.add(camera)

	// Light
	ambientLight = new THREE.AmbientLight(0x4444)
	ambientLight.name = 'ambientLight'
	scene.add(ambientLight)

	colorMap = 'rainbow'
	numberOfColors = 512

	legendLayout = 'vertical'

	loadModel(colorMap, numberOfColors, legendLayout)

	directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
	directionalLight.position.x = 17
	directionalLight.position.y = 9
	directionalLight.position.z = 30
	directionalLight.name = 'directionalLight'
	scene.add(directionalLight)

	renderer = new THREE.WebGLRenderer({antialias: true})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	container.appendChild(renderer.domElement)
	
	stats = new Stats()
	container.appendChild(stats.dom)
	document.addEventListener('mousemove', onDocumentMouseMove, false)
	window.addEventListener('resize', onWindowResize, false)

	window.addEventListener('resize', onWindowResize, false)
	window.addEventListener('keydown', onKeyDown, true)
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
		if ('Lut' in THREE) {
			lut = new anyTHREE.Lut(colorMap, numberOfColors)
			lut.setMax(2000)
			lut.setMin(0)
			const anyGeometry = <any>geometry
			for (let i=0;i < anyGeometry.attributes.pressure.array.length; i++) {
				let colorValue = anyGeometry.attributes.pressure.array[i]
				let color = lut.getColor(colorValue)
				if (color === undefined) {
					console.log('ERROR: ' + colorValue)
				} else {
					lutColors[3*i] = color.r
					lutColors[3*i + 1] = color.g
					lutColors[3*i + 2] = color.b
				}
			}
			geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(lutColors), 3))
			mesh = new THREE.Mesh(geometry, material)
			geometry.computeBoundingBox()
			let boundingBox:THREE.Box3 = geometry.boundingBox
			let center = boundingBox.getCenter()
			if (position === undefined) {
				position = new THREE.Vector3(center.x, center.y, center.z)
			}
			scene.add(mesh)
		}
	})
}

function rotateAroundWorldAxis(object:THREE.Object3D, axis:THREE.Vector3, radians:number) {
	if(!axis) return
	rotWorldMatrix = new THREE.Matrix4()
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians)
	rotWorldMatrix.multiply(object.matrix)

	object.matrix = rotWorldMatrix
	object.rotation.setFromRotationMatrix(object.matrix)
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function onKeyDown(event:KeyboardEvent) {

}

function onDocumentMouseMove(event) {
	event.preventDefault()
	mouse.x = (event.clientX / window.innerWidth) * 2 -1
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
}

function animate() {
	requestAnimationFrame(animate)
	render()
	stats.update()
}

function render() {
	rotateAroundWorldAxis(mesh, position, Math.PI/180)
	renderer.render(scene, camera)
}