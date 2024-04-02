import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { fragmentShader } from '../shaders/FragmentShader';
import { vertexShader } from '../shaders/VertexShader';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui'; 
import Bird, { BIRD_GRAVITY } from './Bird';
import Pipe from './Pipe';

const BLOOM_SCENE = 1;
const FLOOR_SCALE = 5;

const GLITCH_SCENE = 2;

const PLANET_POSITION = [90, 35, 220] as const;
const RELATIVE_PORTAL_POSITION = [-90, -35, -70] as const;

export enum GameState {
    DESTROY_PLANET,
    ARRIVAL,
    FLAPPY,
    FIX_PLANET,
    DEPARTURE,
}


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
    private frameCount = 0;

    private bloomPass: UnrealBloomPass;
    private glitchPass: GlitchPass;
    private bloomComposer: EffectComposer;
    private mixPass: any;
    private bloomLayer: THREE.Layers;
    private materials: any;
    private bloomParams: any;

    gameState: GameState = GameState.DESTROY_PLANET;
    
    bird?: Bird;
    private birdModel?: THREE.Object3D;
    private birdMixer?: THREE.AnimationMixer;

    bird2d?: Bird;
    private bird2dSprite?: THREE.Sprite;
    private bird2dLightBall?: THREE.Mesh;
    private transformationAnimationProgress = -1;

    pipes: Pipe[] = [];
    private pipeModel?: THREE.Object3D;
    private pipeModels: { [id: string]: THREE.Object3D } = {};

    private floorModel?: THREE.Object3D;
    private floorMixer?: THREE.AnimationMixer;

    private stars: THREE.Object3D[] = [];

    private planeMesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
    private planetMesh?: THREE.Mesh;
    private laserMesh?: THREE.Mesh;
    private laserDirection?: THREE.Vector3;

    private portalModel?: THREE.Object3D;
    private portalMixer?: THREE.AnimationMixer;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // this.camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') as HTMLCanvasElement });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.loader = new GLTFLoader();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.materials = [];

        // const gui = new GUI();

        this.renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0.85);

        this.bloomParams = {
            bloomStrength: this.bloomPass.strength,
            bloomThreshold: this.bloomPass.threshold,
            bloomRadius: this.bloomPass.radius,
        };

        this.bloomComposer = new EffectComposer( this.renderer );
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(this.renderScene);
        this.bloomComposer.addPass(this.bloomPass);
        
        this.glitchPass = new GlitchPass();
        
        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
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
        // this.finalComposer.addPass(this.glitchPass);
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
        
        this.loadSkybox();

        this.loadBird();
        this.loadPipe();
        this.loadFloor();
        this.loadPortal();

        // for (let i = 0; i < 10000; i++) {
        //     this.spawnStar();
        // }

        this.spawnPlanet();
        this.spawnLaser();

        const absolutePortalPosition = PLANET_POSITION.map((pos, index) => pos + RELATIVE_PORTAL_POSITION[index]) as [number, number, number];
        this.camera.position.set(...absolutePortalPosition);
        // this.camera.position.x += 50;
        // this.camera.position.z -= 30;

        this.camera.lookAt(...PLANET_POSITION);
        this.controls.target = new THREE.Vector3(...PLANET_POSITION);

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                this.jump();
            }

            if (event.key === 'a') {
                this.moveLeft();
            }

            if (event.key === 'd') {
                this.moveRight();
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

        this.planeMesh!.material.map!.needsUpdate = true;
    }

    private loadSkybox() {
        const sphereGeometry = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        sphereGeometry.scale( -1, 1, 1 );
        sphereGeometry.rotateY(-Math.PI / 2);

        // Skybox
        const sphereTexture = new THREE.TextureLoader().load( 'src/assets/space.jpg' );
        sphereTexture.colorSpace = THREE.SRGBColorSpace;
        // sphereTexture.
        const sphereMaterial = new THREE.MeshStandardMaterial( { map: sphereTexture, envMapIntensity: 5 } );

        const mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );

        this.scene.add( mesh );
    }

    private loadBird() {
        this.bird = new Bird(0, 0, 0);

        this.loader.load('src/assets/phoenix_bird/scene.gltf', (gltf) => {
            this.birdModel = gltf.scene;
            this.birdModel.scale.set(0.005, 0.005, 0.005);
            this.birdModel.rotateY(Math.PI / 2);
            
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
    }

    private loadPipe() {
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
    }

    private loadFloor() {
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
    }

    private loadPortal() {
        this.loader.load('src/assets/triangular_animated_portal/scene.gltf', (gltf) => {
            this.portalModel = gltf.scene;

            this.portalModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.layers.enable(BLOOM_SCENE);
                }
            });

            this.portalMixer = new THREE.AnimationMixer( gltf.scene );
            let action = this.portalMixer.clipAction( gltf.animations[0] );
            action.play();
        }, undefined, (error) => {
            console.error(error);
        });
    }

    private animate() {
        const delta = this.clock.getDelta();

        // Bird animation
        if ( this.birdMixer ) this.birdMixer.update( delta );

        // Floor animation
        if ( this.floorMixer ) this.floorMixer.update( delta * 2 );

        // Portal animation
        if ( this.portalMixer ) this.portalMixer.update( delta );

        this.planeMesh?.rotateX(delta / 10);
        this.planeMesh?.rotateY(delta / 10);

        if (this.gameState === GameState.DESTROY_PLANET) {
            this.moveLaser(delta);
        }

        if (this.gameState > 0) {
            this.moveBird(delta);

            // Moving pipes
            this.pipes.forEach((pipe, _) => {
                const pipeModel = this.pipeModels[pipe.id];

                if (pipeModel) {
                    this.movePipe(delta, pipe, pipeModel);
                }
            });
        }

        this.controls.update();

        this.scene.traverse(this.nonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();

        this.frameCount++;
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

    private spawnLaser() {
        const geometry = new THREE.CylinderGeometry(1, 1, 1000, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissiveIntensity: 5, emissive: 0xff0000 });

        const laser = new THREE.Mesh(geometry, material);
        laser.position.set(-300, 0, -300);

        laser.layers.enable(BLOOM_SCENE);

        this.laserDirection = new THREE.Vector3(...PLANET_POSITION).sub(laser.position);
        laser.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.laserDirection.clone().normalize());

        this.laserMesh = laser;
        this.scene.add(laser);
    }

    private spawnStar() {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        const starRange = 1000;
        const size = 0.5;

        star.position.set(Math.random() * starRange - starRange / 2, Math.random() * starRange - starRange / 2, Math.random() * starRange - starRange / 2);
        star.scale.set(size, size, size);

        star.layers.enable(BLOOM_SCENE);
        this.scene.add(star);
        this.stars.push(star);
    }

    private async spawnPlanet() {
        const geometry = new THREE.SphereGeometry(50, 50, 50);
        // const texture = new THREE.TextureLoader().load('src/assets/space.jpg');
        // texture.mapping = THREE.EquirectangularReflectionMapping;
        const material = new THREE.MeshPhysicalMaterial({
            roughness: 0, // has to be 0
            metalness: 0, // has to be 0
            color: 0xffffff,
            // envMap: texture,
            transmission: 1,
            ior: 2.33, // controls reflectiveness, value between 1 and 2.33
        })
        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(...PLANET_POSITION);

        const canvas2d = document.getElementById('game2d') as HTMLCanvasElement;
        const game2dTexture = new THREE.CanvasTexture(canvas2d);

        const width = 16 * 5;
        const height = width / canvas2d.width * canvas2d.height;

        const plane = new THREE.PlaneGeometry(width, height);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            map: game2dTexture,
            // transparent: true,
            opacity: 1,
            color: 0xffffff,
            side: THREE.DoubleSide,
        });

        const planeMesh = new THREE.Mesh(plane, planeMaterial);
        planeMesh.position.set(...PLANET_POSITION);

        this.scene.add(planet);
        this.scene.add(planeMesh);

        this.planeMesh = planeMesh;
        this.planetMesh = planet;
    }

    private spawnPortal() {
        if (this.portalModel) {
            this.portalModel.scale.set(5, 5, 5);
            this.portalModel.position.set(PLANET_POSITION[0] - 90, PLANET_POSITION[1] - 35, PLANET_POSITION[2] - 70);
            this.portalModel.rotateX(-Math.PI / 2);
            this.portalModel.rotateZ(-Math.PI / 4);

            this.scene.add(this.portalModel);
        }
    }

    private spawnBird2D() {
        const map = new THREE.TextureLoader().load('src/assets/flappy-bird/sprites/yellowbird-downflap.png');

        const birdPos = PLANET_POSITION.map((pos, index) => pos + RELATIVE_PORTAL_POSITION[index]) as [number, number, number];

        this.bird2d = new Bird(...birdPos);
        this.bird2dSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: 0xffffff }));
        this.bird2dSprite.scale.set(3, 3, 3);

        const multiplier = 0.5;
        this.bird2d.velocity.x = 0;
        this.bird2d.velocity.y = 0;
        this.bird2d.velocity.z = -0.1 * multiplier;

        this.bird2d.acceleration.y = 0;

        const lightBallGeometry = new THREE.SphereGeometry(5, 16, 16);
        const lightBallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 5 });
        this.bird2dLightBall = new THREE.Mesh(lightBallGeometry, lightBallMaterial);
        this.bird2dLightBall.position.set(...birdPos);
        this.bird2dLightBall.scale.set(0, 0, 0);
        this.bird2dLightBall.layers.enable(BLOOM_SCENE);
        this.scene.add(this.bird2dLightBall);

        this.scene.add(this.bird2dSprite);
    }

    private movePipe(delta: number, pipe: Pipe, pipeModel: THREE.Object3D) {
        if (pipe.position.y <= -5) {
            pipe.position.y = -5;
            pipe.velocity.y = 0;
        }

        pipeModel.position.set(pipe.position.x, pipe.position.y, pipe.position.z);
        pipe.move(delta);
    }

    private replacedBird = false;
    private moveBird(delta: number) {
        this.birdModel?.position.set(this.bird!.position.x, this.bird!.position.y, this.bird!.position.z);
        // this.birdModel?.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(this.bird!.velocity.x, this.bird!.velocity.y, this.bird!.velocity.z).normalize()));

        const unitForwards = new THREE.Vector3(0, 0, 1);
        const unitVelocity = new THREE.Vector3(this.bird!.velocity.x, this.bird!.velocity.y, this.bird!.velocity.z).multiplyScalar(3);
        const averageVector = new THREE.Vector3().addVectors(unitForwards, unitVelocity).normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(unitForwards, averageVector);

        targetQuaternion.y += Math.PI / 2;

        this.birdModel?.quaternion.rotateTowards(targetQuaternion, delta * 10);
        // if (this.birdModel?.rotation.y) this.birdModel.rotation.y += Math.PI;

        if (this.gameState === GameState.FLAPPY) {
            // Detect collision with floor
            // I'm just going to use constants for the floor's position... I can't do this anymore!
            const floorBottom = -5 * FLOOR_SCALE / 5;
            const floorTop = 3 * FLOOR_SCALE / 5;
            const floorLeft = -8 * FLOOR_SCALE / 5;
            const floorRight = 8 * FLOOR_SCALE / 5;

            if (this.birdModel && this.birdModel?.position.y <= floorBottom) {
                this.bird!.position.y = floorBottom;
            } else if (this.birdModel && this.birdModel?.position.y >= floorTop) {
                this.bird!.position.y = floorTop;
            } 
            
            if (this.birdModel && this.birdModel?.position.x <= floorLeft) {
                this.bird!.position.x = floorLeft;
            } else if (this.birdModel && this.birdModel?.position.x >= floorRight) {
                this.bird!.position.x = floorRight;
            }

            // Detect collision with pipes
            if (this.birdModel) {
                const birdBox = new THREE.Box3().setFromObject(this.birdModel);

                this.pipes.forEach((pipe, _) => {
                    const pipeModel = this.pipeModels[pipe.id];

                    if (pipeModel) {
                        const pipeBox = new THREE.Box3().setFromObject(pipeModel);

                        if (birdBox.intersectsBox(pipeBox)) {
                            console.log('collision!');
                        }
                    }
                });
            }
        }

        if (this.bird!.velocity.x > 0) {
            this.bird!.velocity.x -= 0.002;
        } else if (this.bird!.velocity.x < 0) {
            this.bird!.velocity.x += 0.002;
        }

        if (!this.replacedBird && this.transformationAnimationProgress >= Math.PI / 2) {
            if (this.bird2dSprite) this.scene.remove(this.bird2dSprite);
            
            this.bird = this.bird2d!;
            this.bird.acceleration.y = BIRD_GRAVITY;
            
            this.replacedBird = true;
        } else if (this.transformationAnimationProgress <= Math.PI && this.transformationAnimationProgress >= 0) {
            const lightBallScale = Math.sin(Math.min(this.transformationAnimationProgress, Math.PI)) ;
            this.bird2dLightBall!.position.set(this.bird2d!.position.x, this.bird2d!.position.y, this.bird2d!.position.z);
            this.bird2dLightBall!.scale.set(lightBallScale, lightBallScale, lightBallScale);
        }

        if (!this.replacedBird) { 
            this.bird2dSprite!.position.set(this.bird2d!.position.x, this.bird2d!.position.y, this.bird2d!.position.z);
            this.bird2dSprite!.material.rotation += 0.02 * delta * 60;
        }

        if (this.transformationAnimationProgress < Math.PI) {
            this.transformationAnimationProgress += 0.01;
        } else {
            this.transformationAnimationProgress = Math.PI;

            if (this.gameState === GameState.ARRIVAL) {
                this.gameState = GameState.FLAPPY;

                // TODO: Rewrite in relation to frame rate
                if (this.gameState === GameState.FLAPPY) setInterval(this.spawnPipe.bind(this), 2000);
            }
        }

        if (this.gameState === GameState.FLAPPY) {
            this.camera.position.x = this.bird!.position.x;
            this.camera.position.y = this.bird!.position.y + 5;
            this.camera.position.z = this.bird!.position.z + 10;

            this.camera.lookAt(this.bird!.position.x, this.bird!.position.y, this.bird!.position.z);
            this.controls.target = new THREE.Vector3(this.bird!.position.x, this.bird!.position.y, this.bird!.position.z);
        }

        // this.camera.position.x = this.bird!.position.x;
        // this.camera.position.y = this.bird!.position.y;

        this.bird!.move(delta);

        if (!this.replacedBird) this.bird2d!.move(delta);
    }

    private laserAnimationProgress = -1.5;
    private moveLaser(delta: number) {
        if (!this.laserMesh) return;

        if (this.laserAnimationProgress < 0) {
            this.laserMesh.position.add(this.laserDirection!.clone().normalize().multiplyScalar(5));
        } else if (this.laserAnimationProgress < 1) {
            const dissapearScale = Math.max(0, 1 - this.laserAnimationProgress);
            this.laserMesh.scale.set(dissapearScale, dissapearScale, dissapearScale);
        }

        (this.laserMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.abs(2 * Math.sin(this.laserAnimationProgress * Math.PI)) + 3;
        this.laserAnimationProgress += 0.01;

        if (this.laserAnimationProgress >= 1) {
            this.laserAnimationProgress = 1;

            this.gameState = GameState.ARRIVAL;
            this.spawnPortal();
            this.spawnBird2D();
        }
    }

    private jump() {
        this.bird!.velocity.y = 0.1;
    }

    private moveLeft() {
        this.bird!.velocity.x = -0.1;
    }

    private moveRight() {
        this.bird!.velocity.x = 0.1;
    }
}
