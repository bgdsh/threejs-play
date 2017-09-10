// add styles
import './style.css'
// three.js
import * as THREE from 'three'


let container
let camera:THREE.PerspectiveCamera, scene:THREE.Scene, raycaster:THREE.Raycaster, renderer:THREE.WebGLRenderer

let mouse = new THREE.Vector2(), INTERSECTED
let radius = 100, theta = 0

init()
animate()

function init() {
	container = document.createElement('div')
	document.body.appendChild(container)

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
	scene = new THREE.Scene()
	scene.background = new THREE.Color(0xf0f0f0)

	let light = new THREE.DirectionalLight(0xffffff, 1)
	light.position.set(1,1,1).normalize()
	scene.add(light)

	let geometry = new THREE.BoxBufferGeometry(20, 20, 20)

	for (let i = 0; i < 2000; i ++) {
		let obj = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
			color: Math.random() * 0xFFFFFF
		}))
		obj.position.x = Math.random() * 800 - 400
		obj.position.y = Math.random() * 800 - 400
		obj.position.z = Math.random() * 800 - 400

		obj.rotation.x = Math.random() * 2 * Math.PI
		obj.rotation.y = Math.random() * 2 * Math.PI
		obj.rotation.z = Math.random() * 2 * Math.PI

		obj.scale.x = Math.random() + 0.5
		obj.scale.y = Math.random() + 0.5
		obj.scale.z = Math.random() + 0.5

		scene.add(obj)
	}

	raycaster = new THREE.Raycaster()

	renderer = new THREE.WebGLRenderer()
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	container.appendChild(renderer.domElement)

	document.addEventListener('mouseMove', onDocumentMouseMove, false)
	window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove(event) {
	event.preventDefault()
	mouse.x = (event.clientX / window.innerWidth) * 2 -1
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
}

function animate() {
	requestAnimationFrame(animate)
	render()
}

function render() {
	theta += 0.1
	camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
	camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta))
	camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
	camera.lookAt(scene.position)

	camera.updateMatrixWorld(true)

	raycaster.setFromCamera(mouse, camera)

	let intersects = raycaster.intersectObjects(scene.children)

	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
			INTERSECTED = intersects[0].object
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex()
			INTERSECTED.material.emissive.setHex(0xff0000)
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex )
		INTERSECTED = null
	}
	renderer.render(scene, camera)
}