import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { fragmentShader } from './shaders/FragmentShader';
import { vertexShader } from './shaders/VertexShader';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui'; 
import Bird from './Bird';
import Pipe from './Pipe';

const BLOOM_SCENE = 1;
const FLOOR_SCALE = 5;

export default class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private finalComposer: EffectComposer
    private renderScene: RenderPass
    private outputPass: OutputPass
    private loader: GLTFLoader;
    private controls: OrbitControls;
    private clock: THREE.Clock;

    private bloomPass: UnrealBloomPass;
    private bloomComposer: EffectComposer;
    private mixPass: any;
    private bloomLayer: THREE.Layers;
    private materials: any;
    private bloomParams: any;
    
    bird: Bird;
    private birdModel?: THREE.Object3D;
    private birdMixer?: THREE.AnimationMixer;

    pipes: Pipe[] = [];
    private pipeModel?: THREE.Object3D;
    private pipeModels: { [id: string]: THREE.Object3D } = {};

    private floorModel?: THREE.Object3D;
    private floorMixer?: THREE.AnimationMixer;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.loader = new GLTFLoader();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.materials = [];

        this.renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0.85);

        // const gui = new GUI();

        this.bloomParams = {
            bloomStrength: this.bloomPass.strength,
            bloomThreshold: this.bloomPass.threshold,
            bloomRadius: this.bloomPass.radius,
        };

        this.bloomComposer = new EffectComposer( this.renderer );
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(this.renderScene);
        this.bloomComposer.addPass(this.bloomPass);
        
        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                defines: {}
            }), "baseTexture"
        );
        this.mixPass.needsSwap = true;

        this.outputPass = new OutputPass();

        this.finalComposer = new EffectComposer( this.renderer );

        this.finalComposer.addPass(this.renderScene);
        this.finalComposer.addPass(this.mixPass);
        this.finalComposer.addPass(this.outputPass);

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(BLOOM_SCENE);

        const environment = new RoomEnvironment( this.renderer );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

        this.scene.environment = pmremGenerator.fromScene( environment ).texture;
        
        this.bird = new Bird(0, 0, 0);

        const sphereGeometry = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        sphereGeometry.scale( -1, 1, 1 );
        sphereGeometry.rotateY(-Math.PI / 2);

        // Skybox
        const sphereTexture = new THREE.TextureLoader().load( 'src/assets/space-2638158.jpg' );
        sphereTexture.colorSpace = THREE.SRGBColorSpace;
        const sphereMaterial = new THREE.MeshBasicMaterial( { map: sphereTexture } );

        const mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );

        this.scene.add( mesh );

        this.loader.load('src/assets/drone_concept/scene.gltf', (gltf) => {
            this.birdModel = gltf.scene;
            // this.birdModel.scale.set(0.005, 0.005, 0.005);
            // this.birdModel.rotateY(Math.PI / 2);
            
            this.birdModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.layers.enable(BLOOM_SCENE);
                }
            });

            this.birdMixer = new THREE.AnimationMixer( gltf.scene );
            let action = this.birdMixer.clipAction( gltf.animations[0] );
            action.play();

            this.scene.add(gltf.scene);
        }, undefined, (error) => {
            console.error(error);
        });

        this.loader.load('src/assets/sci-fi_pipes_armored/scene.gltf', (gltf) => {
            this.pipeModel = gltf.scene;

            this.pipeModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.layers.enable(BLOOM_SCENE);
                }
            });

            // this.scene.add(gltf.scene);
        }, undefined, (error) => {
            console.error(error);
        });

        this.loader.load('src/assets/endless_floor_vr/scene.gltf', (gltf) => {
            // const newMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });

            this.floorModel = gltf.scene;
            this.floorModel.scale.set(FLOOR_SCALE, FLOOR_SCALE, FLOOR_SCALE);
            this.floorModel.position.set(0, 0, -50);

            const floorModelParams = {
                emissive: 0xffffff,
                emissiveIntensity: 5,
                metalness: 0.5,
                roughness: 1,
            };

            this.floorModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.layers.enable(BLOOM_SCENE);
                    child.material.emissive = new THREE.Color(floorModelParams.emissive);
                    child.material.emissiveIntensity = floorModelParams.emissiveIntensity;
                    
                    if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.metalness = floorModelParams.metalness;
                        child.material.roughness = floorModelParams.roughness;
                    }
                }
            });

            // gui.add(floorModelParams, 'emissive', 0, 0xffffff).onChange(() => {
            //     this.floorModel?.traverse((child) => {
            //         if (child instanceof THREE.Mesh) {
            //             child.material.emissive = new THREE.Color(floorModelParams.emissive);
            //         }
            //     });
            // });
            // gui.add(floorModelParams, 'emissiveIntensity', 0, 10).onChange(() => {
            //     this.floorModel?.traverse((child) => {
            //         if (child instanceof THREE.Mesh) {
            //             child.material.emissiveIntensity = floorModelParams.emissiveIntensity;
            //         }
            //     });
            // });
            // gui.add(floorModelParams, 'metalness', 0, 1).onChange(() => {
            //     this.floorModel?.traverse((child) => {
            //         if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            //             child.material.metalness = floorModelParams.metalness;
            //         }
            //     });
            // });
            // gui.add(floorModelParams, 'roughness', 0, 1).onChange(() => {
            //     this.floorModel?.traverse((child) => {
            //         if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            //             child.material.roughness = floorModelParams.roughness;
            //         }
            //     });
            // });

            this.floorMixer = new THREE.AnimationMixer( gltf.scene );
            const action = gltf.animations[0];
            const trimmedAction = THREE.AnimationUtils.subclip(action, 'move', 0, 1000);
            this.floorMixer.clipAction(trimmedAction).play();

            this.scene.add(gltf.scene);
        }, undefined, (error) => {
            console.error(error);
        });

        this.camera.position.y = 3;
        this.camera.position.z = 5;
        this.camera.lookAt(0, 0, 0);

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        setInterval(this.spawnPipe.bind(this), 2000);

        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                this.jump();
            }
        });
    }
    
    private nonBloomed(obj: any) {
        if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        }
    }

    private restoreMaterial(obj: any) {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }

    public start() {
        this.animate();
    }

    private animate() {
        const delta = this.clock.getDelta();

        // Bird animation
        if ( this.birdMixer ) this.birdMixer.update( delta );

        this.moveBird(delta);

        this.pipes.forEach((pipe, _) => {
            const pipeModel = this.pipeModels[pipe.id];

            if (pipeModel) {
                this.movePipe(delta, pipe, pipeModel);
            }
        });

        // Floor animation
        if ( this.floorMixer ) this.floorMixer.update( delta * 2 );
        
        this.controls.update();

        this.scene.traverse(this.nonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();

        // this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate.bind(this));
    }

    private spawnPipe() {
        const pipe = new Pipe(Math.random() * 10, 5, -50);
        pipe.velocity.y = -0.2;
        pipe.velocity.z = 0.2;

        this.pipes.push(pipe);

        const pipeModel = this.pipeModel?.clone();
        
        if (pipeModel) {
            pipeModel.position.set(pipe.position.x, pipe.position.y, pipe.position.z);
            pipeModel.scale.set(5, 5, 5);

            this.scene.add(pipeModel);
            this.pipeModels[pipe.id] = pipeModel;
        }

        setTimeout(() => {
            if (pipeModel) {
                this.scene.remove(pipeModel);
                delete this.pipeModels[pipe.id];
            }

            const index = this.pipes.indexOf(pipe);
            if (index > -1) {
                this.pipes.splice(index, 1);
            }
        }, 10000);
    }

    private movePipe(delta: number, pipe: Pipe, pipeModel: THREE.Object3D) {
        if (pipe.position.y <= -5) {
            pipe.position.y = -5;
            pipe.velocity.y = 0;
        }

        pipeModel.position.set(pipe.position.x, pipe.position.y, pipe.position.z);
        pipe.move(delta);
    }

    private moveBird(delta: number) {
        this.birdModel?.position.set(this.bird.position.x, this.bird.position.y, this.bird.position.z);
        // this.birdModel?.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(this.bird.getVelocity().x, this.bird.getVelocity().y, this.bird.getVelocity().z).normalize()));
        this.birdModel?.quaternion.rotateTowards(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(this.bird.velocity.x, this.bird.velocity.y, this.bird.velocity.z).normalize()), delta * 10);

        // Detect collision with floor
        // I'm just going to use constants for the floor's position... I can't do this anymore!
        const floorBottom = -5 * FLOOR_SCALE / 5;
        const floorTop = 3 * FLOOR_SCALE / 5;

        if (this.birdModel && this.birdModel?.position.y <= floorBottom) {
            this.bird.position.y = floorBottom;
        } else if (this.birdModel && this.birdModel?.position.y >= floorTop) {
            this.bird.position.y = floorTop;
        }

        this.bird.move(delta);
    }

    private jump() {
        this.bird.velocity.y = 0.05;
    }
}
