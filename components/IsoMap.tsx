
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, SoftShadows, Float, Outlines, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { Grid, BuildingType, WeatherType, PlayerConfig } from '../types';
import { GRID_SIZE, BUILDINGS } from '../constants';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      ringGeometry: any;
      instancedMesh: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      ringGeometry: any;
      instancedMesh: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

// --- Constants & Helpers ---
const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];
const getHash = (x: number, y: number) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
const getRandomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Shared Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 4);
const sphereGeo = new THREE.SphereGeometry(1, 8, 8);

// --- Water Component ---
const AnimatedWater = ({ weather }: { weather: WeatherType }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.PlaneGeometry>(null);
    
    // Create geometry once
    const geometry = useMemo(() => new THREE.PlaneGeometry(GRID_SIZE * 4, GRID_SIZE * 4, 64, 64), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        const time = state.clock.getElapsedTime();
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Simple wave calculation
            const waveX = Math.sin(vertex.x * 0.5 + time) * 0.2;
            const waveY = Math.cos(vertex.y * 0.5 + time * 0.8) * 0.2;
            
            // Mutate Z (which is Up in rotated plane)
            // But since we rotate the mesh -Math.PI/2, local Z is world Y.
            // Wait, standard plane is XY. Displace Z.
            vertex.z = waveX + waveY;
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
    });

    const isNight = weather === 'night';
    const isRain = weather === 'rain';
    const color = isNight ? "#1e3a8a" : (isRain ? "#475569" : "#3b82f6");

    return (
        <mesh 
            ref={meshRef} 
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.8, 0]} 
            receiveShadow
            raycast={() => null}
        >
            <meshStandardMaterial 
                color={color}
                roughness={0.1} 
                metalness={0.6} 
                opacity={0.8} 
                transparent 
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// ... (Rest of components: WindowBlock, WindTurbineBlades, SmokeStack, ProceduralBuilding, CloudSystem, TrafficSystem, Rain) ...
// (Omitting full copy of existing small components for brevity, they remain unchanged. 
//  IMPORTANT: In a real output, I would include everything. 
//  Here I will include them to ensure the file is complete.)

const WindowBlock = React.memo(({ position, scale, isNight }: { position: [number, number, number], scale: [number, number, number], isNight: boolean }) => (
  <mesh geometry={boxGeo} position={position} scale={scale} raycast={() => null}>
    <meshStandardMaterial 
      color="#bfdbfe" 
      emissive={isNight ? "#fef08a" : "#bfdbfe"} 
      emissiveIntensity={isNight ? 2 : 0.2} 
      roughness={0.1} 
      metalness={0.8} 
    />
  </mesh>
));

const WindTurbineBlades = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 2;
  });
  return (
    <group ref={ref} position={[0, 1.2, 0.1]} raycast={() => null}>
      {[0, 1, 2].map(i => (
        <mesh key={i} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.1, 0.8, 0.05]} rotation={[0, 0, i * (Math.PI * 2) / 3]}>
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <mesh geometry={sphereGeo} scale={0.15}>
         <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
};

const SmokeStack = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const cloud = child as THREE.Mesh;
        cloud.position.y += 0.01 + i * 0.005;
        cloud.scale.addScalar(0.005);
        
        const material = cloud.material as THREE.MeshStandardMaterial;
        if (material) {
          material.opacity -= 0.005;
          if (cloud.position.y > 1.5) {
            cloud.position.y = 0;
            cloud.scale.setScalar(0.1 + Math.random() * 0.1);
            material.opacity = 0.6;
          }
        }
      });
    }
  });

  return (
    <group position={position} raycast={() => null}>
      <mesh geometry={cylinderGeo} castShadow receiveShadow position={[0, 0.5, 0]} scale={[0.2, 1, 0.2]}>
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <group ref={ref} position={[0, 1, 0]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} geometry={sphereGeo} position={[Math.random()*0.1, i*0.4, Math.random()*0.1]} scale={0.2}>
            <meshStandardMaterial color="#d1d5db" transparent opacity={0.6} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
};

interface BuildingMeshProps {
  type: BuildingType;
  baseColor: string;
  x: number;
  y: number;
  isNight: boolean;
  opacity?: number;
  transparent?: boolean;
}

const ProceduralBuilding = React.memo(({ type, baseColor, x, y, isNight, opacity = 1, transparent = false }: BuildingMeshProps) => {
  const hash = getHash(x, y);
  const variant = Math.floor(hash * 100); 
  const rotation = Math.floor(hash * 4) * (Math.PI / 2);
  
  const color = useMemo(() => {
    const c = new THREE.Color(baseColor);
    c.offsetHSL(hash * 0.1 - 0.05, 0, hash * 0.2 - 0.1);
    return c;
  }, [baseColor, hash]);

  const mainMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: isNight ? color.clone().multiplyScalar(0.5) : color, 
    flatShading: true, opacity, transparent, roughness: 0.8 
  }), [color, opacity, transparent, isNight]);
  
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: isNight ? new THREE.Color(color).multiplyScalar(0.3) : new THREE.Color(color).multiplyScalar(0.7), 
    flatShading: true, opacity, transparent 
  }), [color, opacity, transparent, isNight]);
  
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: isNight ? new THREE.Color(color).multiplyScalar(0.2) : new THREE.Color(color).multiplyScalar(0.5).offsetHSL(0,0,-0.1), 
    flatShading: true, opacity, transparent 
  }), [color, opacity, transparent, isNight]);

  const commonProps = { castShadow: true, receiveShadow: true };
  const yOffset = -0.3;

  return (
    <group rotation={[0, rotation, 0]} position={[0, yOffset, 0]}>
      {/* Same Building Geometry Logic as before */}
      {(() => {
        switch (type) {
          case BuildingType.Residential:
            if (variant < 33) {
              return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.3, 0]} scale={[0.7, 0.6, 0.6]} />
                  <mesh {...commonProps} material={roofMat} geometry={coneGeo} position={[0, 0.75, 0]} scale={[0.6, 0.4, 0.6]} rotation={[0, Math.PI/4, 0]} />
                  <WindowBlock isNight={isNight} position={[0.2, 0.3, 0.31]} scale={[0.15, 0.2, 0.05]} />
                  <WindowBlock isNight={isNight} position={[-0.2, 0.3, 0.31]} scale={[0.15, 0.2, 0.05]} />
                </>
              );
            } else if (variant < 66) {
              return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.1, 0.35, 0]} scale={[0.6, 0.7, 0.8]} />
                  <mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0.25, 0.25, 0.1]} scale={[0.4, 0.5, 0.6]} />
                  <WindowBlock isNight={isNight} position={[-0.1, 0.5, 0.41]} scale={[0.4, 0.2, 0.05]} />
                </>
              );
            } else {
              return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.5, 0]} scale={[0.5, 1, 0.6]} />
                  <mesh {...commonProps} material={roofMat} geometry={boxGeo} position={[0, 1.05, 0]} scale={[0.55, 0.1, 0.65]} />
                  <WindowBlock isNight={isNight} position={[0, 0.7, 0.31]} scale={[0.3, 0.2, 0.05]} />
                  <WindowBlock isNight={isNight} position={[0, 0.3, 0.31]} scale={[0.3, 0.2, 0.05]} />
                </>
              );
            }
          case BuildingType.Commercial:
            if (variant < 40) {
              const height = 1.5 + hash * 1.5;
              return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, height/2, 0]} scale={[0.7, height, 0.7]} />
                  {Array.from({ length: Math.floor(height * 3) }).map((_, i) => (
                    <WindowBlock isNight={isNight} key={i} position={[0, 0.2 + i * 0.3, 0]} scale={[0.72, 0.15, 0.72]} />
                  ))}
                  <mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0, height + 0.1, 0]} scale={[0.5, 0.2, 0.5]} />
                </>
              );
            } else {
               return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.2, 0.5, -0.2]} scale={[0.5, 1, 0.5]} />
                  <mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0.1, 0.3, 0.1]} scale={[0.7, 0.6, 0.7]} />
                  <WindowBlock isNight={isNight} position={[0.1, 0.3, 0.46]} scale={[0.6, 0.3, 0.05]} />
                </>
               )
            }
          case BuildingType.Industrial:
              return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.8, 0.8]} />
                  <mesh {...commonProps} material={roofMat} geometry={boxGeo} position={[-0.2, 0.9, 0]} scale={[0.4, 0.2, 0.8]} rotation={[0,0,Math.PI/4]} />
                  <mesh {...commonProps} material={roofMat} geometry={boxGeo} position={[0.2, 0.9, 0]} scale={[0.4, 0.2, 0.8]} rotation={[0,0,Math.PI/4]} />
                  <SmokeStack position={[0.3, 0.4, 0.3]} />
                </>
              );
          case BuildingType.Park:
            const treeCount = 1 + Math.floor(hash * 3);
            const positions = [[-0.2, -0.2], [0.2, 0.2], [-0.2, 0.2], [0.2, -0.2]];
            return (
              <group position={[0, -yOffset - 0.29, 0]}> 
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <planeGeometry args={[0.9, 0.9]} />
                    <meshStandardMaterial color={isNight ? "#064e3b" : "#86efac"} />
                </mesh>
                {Array.from({length: treeCount}).map((_, i) => {
                    const pos = positions[i % positions.length];
                    const scale = 0.5 + getHash(x+i, y-i) * 0.5;
                    const treeColor = new THREE.Color("#166534").offsetHSL(0, 0, getHash(x,y+i)*0.2);
                    return (
                    <group key={i} position={[pos[0], 0, pos[1]]} scale={scale} rotation={[0, getHash(i,x)*Math.PI, 0]}>
                        <mesh castShadow receiveShadow material={new THREE.MeshStandardMaterial({ color: '#78350f' })} geometry={cylinderGeo} position={[0, 0.15, 0]} scale={[0.1, 0.3, 0.1]} />
                        <mesh castShadow receiveShadow material={new THREE.MeshStandardMaterial({ color: isNight ? treeColor.multiplyScalar(0.5) : treeColor, flatShading: true })} geometry={coneGeo} position={[0, 0.4, 0]} scale={[0.4, 0.5, 0.4]} />
                        <mesh castShadow receiveShadow material={new THREE.MeshStandardMaterial({ color: isNight ? treeColor.multiplyScalar(0.5) : treeColor, flatShading: true })} geometry={coneGeo} position={[0, 0.65, 0]} scale={[0.3, 0.4, 0.3]} />
                    </group>
                    )
                })}
              </group>
            );
          case BuildingType.WindTurbine:
             return (
               <>
                 <mesh {...commonProps} material={mainMat} geometry={cylinderGeo} position={[0, 0.6, 0]} scale={[0.08, 1.2, 0.08]} />
                 <WindTurbineBlades />
               </>
             );
          case BuildingType.DataCenter:
             return (
               <>
                 <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.8, 0.7]} />
                 <mesh {...commonProps} material={new THREE.MeshStandardMaterial({ color: '#1e1b4b', roughness: 0.2 })} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.92, 0.75, 0.6]} />
                 <mesh position={[0, 0.4, 0.36]}>
                    <planeGeometry args={[0.8, 0.6]} />
                    <meshStandardMaterial color={isNight ? "#00ff00" : "#004400"} emissive="#00ff00" emissiveIntensity={isNight ? 1 : 0} />
                 </mesh>
                 <mesh {...commonProps} material={roofMat} geometry={boxGeo} position={[0, 0.85, 0]} scale={[0.95, 0.1, 0.75]} />
               </>
             );
          case BuildingType.BeachResort:
             return (
               <>
                 <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.2, 0.6, -0.2]} scale={[0.5, 1.2, 0.5]} />
                 <WindowBlock isNight={isNight} position={[-0.2, 0.9, -0.19]} scale={[0.4, 0.2, 0.05]} />
                 <WindowBlock isNight={isNight} position={[-0.2, 0.5, -0.19]} scale={[0.4, 0.2, 0.05]} />
                 <mesh receiveShadow position={[0.2, 0.1, 0.2]} rotation={[-Math.PI/2, 0, 0]}>
                    <planeGeometry args={[0.4, 0.4]} />
                    <meshStandardMaterial color="#06b6d4" />
                 </mesh>
                 <mesh receiveShadow position={[0.2, 0.05, 0.2]}>
                    <boxGeometry args={[0.5, 0.1, 0.5]} />
                    <meshStandardMaterial color="#fbbf24" />
                 </mesh>
                 <mesh position={[0.3, 0.4, 0.3]} geometry={coneGeo} scale={[0.2, 0.1, 0.2]}>
                    <meshStandardMaterial color="#ec4899" />
                 </mesh>
                 <mesh position={[0.3, 0.2, 0.3]} geometry={cylinderGeo} scale={[0.02, 0.4, 0.02]}>
                    <meshStandardMaterial color="#fff" />
                 </mesh>
               </>
             );
          case BuildingType.Metro:
            return (
                <group position={[0, -0.1, 0]}>
                    <mesh {...commonProps} position={[0, 0.1, 0]} geometry={boxGeo} scale={[0.8, 0.1, 0.5]}>
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh {...commonProps} position={[0, 0.15, 0]} geometry={boxGeo} scale={[0.6, 0.05, 0.3]}>
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    <mesh position={[0.3, 0.5, 0.2]} geometry={cylinderGeo} scale={[0.05, 0.8, 0.05]}>
                        <meshStandardMaterial color="#666" />
                    </mesh>
                    <mesh position={[0.3, 0.8, 0.2]} geometry={boxGeo} scale={[0.3, 0.15, 0.05]}>
                        <meshStandardMaterial color="red" />
                    </mesh>
                </group>
            );
          case BuildingType.School:
            return (
                <>
                  <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.6, 0.6]} />
                  <mesh {...commonProps} material={roofMat} geometry={coneGeo} position={[0, 0.8, 0]} scale={[0.7, 0.3, 0.7]} rotation={[0, Math.PI/4, 0]} />
                  <mesh position={[0.3, 0.9, 0.2]} geometry={cylinderGeo} scale={[0.02, 0.5, 0.02]}>
                      <meshStandardMaterial color="#ccc" />
                  </mesh>
                  <mesh position={[0.3, 1.1, 0.2]} geometry={boxGeo} scale={[0.2, 0.15, 0.02]}>
                      <meshStandardMaterial color="blue" />
                  </mesh>
                  <WindowBlock isNight={isNight} position={[-0.2, 0.4, 0.31]} scale={[0.2, 0.2, 0.05]} />
                  <WindowBlock isNight={isNight} position={[0.2, 0.4, 0.31]} scale={[0.2, 0.2, 0.05]} />
                </>
            );
          case BuildingType.CityHall:
              return (
                  <>
                    <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.3, 0]} scale={[0.8, 0.6, 0.8]} />
                    <mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0, 0.7, 0]} scale={[0.5, 0.4, 0.5]} />
                    <mesh {...commonProps} material={roofMat} geometry={sphereGeo} position={[0, 0.9, 0]} scale={[0.25, 0.25, 0.25]} />
                    <mesh position={[0, 0.2, 0.41]} geometry={boxGeo} scale={[0.2, 0.4, 0.05]}>
                        <meshStandardMaterial color="#444" />
                    </mesh>
                    <mesh position={[0.3, 0.3, 0.41]} geometry={cylinderGeo} scale={[0.05, 0.6, 0.05]}>
                        <meshStandardMaterial color="#fff" />
                    </mesh>
                    <mesh position={[-0.3, 0.3, 0.41]} geometry={cylinderGeo} scale={[0.05, 0.6, 0.05]}>
                        <meshStandardMaterial color="#fff" />
                    </mesh>
                  </>
              );
          case BuildingType.Hospital:
              return (
                  <>
                    <mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.5, 0]} scale={[0.7, 1.0, 0.7]} />
                    <mesh position={[0, 0.8, 0.36]} geometry={boxGeo} scale={[0.3, 0.08, 0.02]}>
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <mesh position={[0, 0.8, 0.36]} geometry={boxGeo} scale={[0.08, 0.3, 0.02]}>
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <WindowBlock isNight={isNight} position={[0, 0.3, 0.36]} scale={[0.5, 0.2, 0.05]} />
                  </>
              );
          case BuildingType.SolarFarm:
              return (
                  <group>
                      <mesh {...commonProps} position={[-0.2, 0.2, -0.2]} rotation={[Math.PI/6, 0, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.3]}>
                          <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
                      </mesh>
                      <mesh {...commonProps} position={[0.2, 0.2, -0.2]} rotation={[Math.PI/6, 0, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.3]}>
                          <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
                      </mesh>
                      <mesh {...commonProps} position={[-0.2, 0.2, 0.2]} rotation={[Math.PI/6, 0, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.3]}>
                          <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
                      </mesh>
                      <mesh {...commonProps} position={[0.2, 0.2, 0.2]} rotation={[Math.PI/6, 0, 0]} geometry={boxGeo} scale={[0.3, 0.05, 0.3]}>
                          <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
                      </mesh>
                  </group>
              );
          default:
            return null;
        }
      })()}
    </group>
  );
});

const CloudSystem = () => {
    const cloudCount = 8;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const clouds = useRef<{x: number, y: number, z: number, scale: number, speed: number}[]>([]);

    useEffect(() => {
        clouds.current = Array.from({length: cloudCount}).map(() => ({
            x: getRandomRange(-20, 20),
            y: getRandomRange(4, 7),
            z: getRandomRange(-20, 20),
            scale: getRandomRange(1, 3),
            speed: getRandomRange(0.5, 1.5)
        }));
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        
        clouds.current.forEach((cloud, i) => {
            cloud.x += cloud.speed * delta;
            if (cloud.x > 30) {
                cloud.x = -30;
                cloud.z = getRandomRange(-20, 20);
            }
            
            dummy.position.set(cloud.x, cloud.y, cloud.z);
            dummy.scale.set(cloud.scale, cloud.scale * 0.4, cloud.scale * 0.8);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[boxGeo, undefined, cloudCount]} raycast={() => null}>
            <meshStandardMaterial color="white" transparent opacity={0.6} flatShading />
        </instancedMesh>
    );
};

const TrafficSystem = ({ grid, isNight }: { grid: Grid, isNight: boolean }) => {
  const roadTiles = useMemo(() => {
    const roads: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) roads.push({x: tile.x, y: tile.y});
    }));
    return roads;
  }, [grid]);

  const carCount = Math.min(roadTiles.length, 30);
  const carsRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null); 
  const carsState = useRef<Float32Array>(new Float32Array(0)); 
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (roadTiles.length < 2) return;
    carsState.current = new Float32Array(carCount * 6);
    for (let i = 0; i < carCount; i++) {
        const startNode = roadTiles[Math.floor(Math.random() * roadTiles.length)];
        carsState.current[i*6] = startNode.x;
        carsState.current[i*6+1] = startNode.y;
        carsState.current[i*6+2] = startNode.x;
        carsState.current[i*6+3] = startNode.y;
        carsState.current[i*6+4] = 1;
        carsState.current[i*6+5] = getRandomRange(0.01, 0.03);
    }
  }, [roadTiles, carCount]);

  useFrame(() => {
    if (!carsRef.current || roadTiles.length < 2 || carsState.current.length === 0) return;

    for (let i = 0; i < carCount; i++) {
      const idx = i * 6;
      let curX = carsState.current[idx];
      let curY = carsState.current[idx+1];
      let tarX = carsState.current[idx+2];
      let tarY = carsState.current[idx+3];
      let progress = carsState.current[idx+4];
      const speed = carsState.current[idx+5];

      progress += speed;

      if (progress >= 1) {
        curX = tarX;
        curY = tarY;
        progress = 0;
        
        const neighbors = roadTiles.filter(t => 
          (Math.abs(t.x - curX) === 1 && t.y === curY) || 
          (Math.abs(t.y - curY) === 1 && t.x === curX)
        );

        if (neighbors.length > 0) {
            const valid = neighbors.length > 1 
                ? neighbors.filter(n => Math.abs(n.x - carsState.current[idx]) > 0.1 || Math.abs(n.y - carsState.current[idx+1]) > 0.1)
                : neighbors;
            const next = valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : neighbors[0];
            tarX = next.x;
            tarY = next.y;
        } else {
            const rnd = roadTiles[Math.floor(Math.random() * roadTiles.length)];
            curX = rnd.x; curY = rnd.y; tarX = rnd.x; tarY = rnd.y;
        }
      }

      carsState.current[idx] = curX;
      carsState.current[idx+1] = curY;
      carsState.current[idx+2] = tarX;
      carsState.current[idx+3] = tarY;
      carsState.current[idx+4] = progress;

      const gx = MathUtils.lerp(curX, tarX, progress);
      const gy = MathUtils.lerp(curY, tarY, progress);
      const dx = tarX - curX;
      const dy = tarY - curY;
      const angle = Math.atan2(dy, dx);
      const offsetAmt = 0.15;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const offX = (-dy/len) * offsetAmt;
      const offY = (dx/len) * offsetAmt;

      const [wx, _, wz] = gridToWorld(gx + offX, gy + offY);

      dummy.position.set(wx, -0.3 + 0.075, wz);
      dummy.rotation.set(0, -angle, 0);
      dummy.scale.set(0.5, 0.15, 0.3); 
      dummy.updateMatrix();
      carsRef.current.setMatrixAt(i, dummy.matrix);
      
      if(lightsRef.current) {
          dummy.scale.set(0.1, 0.1, 0.2);
          dummy.position.set(wx + Math.cos(-angle)*0.3, -0.3 + 0.075, wz + Math.sin(-angle)*0.3);
          dummy.updateMatrix();
          lightsRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    carsRef.current.instanceMatrix.needsUpdate = true;
    if(lightsRef.current) lightsRef.current.instanceMatrix.needsUpdate = true;
  });

  if (roadTiles.length < 2) return null;

  return (
    <group raycast={() => null}>
        <instancedMesh ref={carsRef} args={[boxGeo, undefined, carCount]} castShadow>
        <meshStandardMaterial color={isNight ? "#555" : "#eab308"} roughness={0.5} metalness={0.3} />
        </instancedMesh>
        {isNight && (
            <instancedMesh ref={lightsRef} args={[boxGeo, undefined, carCount]}>
                <meshBasicMaterial color="#ffffcc" />
            </instancedMesh>
        )}
    </group>
  );
};

const Rain = ({ isRaining }: { isRaining: boolean }) => {
    const count = 500;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            arr[i*3] = getRandomRange(-GRID_SIZE, GRID_SIZE);
            arr[i*3+1] = getRandomRange(0, 15);
            arr[i*3+2] = getRandomRange(-GRID_SIZE, GRID_SIZE);
        }
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (!mesh.current || !isRaining) return;
        for(let i=0; i<count; i++) {
            let y = positions[i*3+1];
            y -= delta * 15; // fall speed
            if (y < 0) y = 15;
            positions[i*3+1] = y;

            dummy.position.set(positions[i*3], y, positions[i*3+2]);
            dummy.scale.set(0.05, 0.5, 0.05);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    if (!isRaining) return null;
    return (
        <instancedMesh ref={mesh} args={[boxGeo, undefined, count]} raycast={() => null}>
            <meshBasicMaterial color="#a5f3fc" transparent opacity={0.6} />
        </instancedMesh>
    )
}

const EnvironmentEffects = ({ weather }: { weather: WeatherType }) => {
    const isNight = weather === 'night';
    const isRain = weather === 'rain';
    
    const sunIntensity = isNight ? 0.1 : (isRain ? 0.5 : 2);
    const ambientColor = isNight ? "#1e1b4b" : (isRain ? "#64748b" : "#cceeff");
    const sunColor = isNight ? "#312e81" : "#fffbeb";

    return (
        <group raycast={() => null}>
            <Rain isRaining={isRain} />
            <CloudSystem />
            
            <ambientLight intensity={isNight ? 0.2 : 0.6} color={ambientColor} />
            <directionalLight
              castShadow
              position={[15, 20, 10]}
              intensity={sunIntensity}
              color={sunColor}
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-15} shadow-camera-right={15}
              shadow-camera-top={15} shadow-camera-bottom={-15}
            />

            <AnimatedWater weather={weather} />
        </group>
    )
};

// ... (Avatar, RoadMarkings) ... 
const Avatar = ({ player, onAvatarClick, onReachStep }: { 
    player: PlayerConfig, 
    onAvatarClick: () => void, 
    onReachStep: (x: number, y: number) => void 
}) => {
    const group = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
    const speed = 4; // units per second

    useEffect(() => {
        if (player.path.length > 0) {
            const next = player.path[0];
            const [wx, _, wz] = gridToWorld(next.x, next.y);
            setTargetPos(new THREE.Vector3(wx, 0, wz));
            setIsMoving(true);
        } else {
            setTargetPos(null);
            setIsMoving(false);
            const [wx, _, wz] = gridToWorld(player.x, player.y);
            if (group.current) {
                group.current.position.set(wx, 0, wz);
            }
        }
    }, [player.path, player.x, player.y]);

    useFrame((state, delta) => {
        if (targetPos && group.current) {
            const pos = group.current.position;
            const dist = pos.distanceTo(targetPos);
            
            if (dist < 0.05) {
                pos.copy(targetPos);
                setTargetPos(null);
                if (player.path.length > 0) {
                    onReachStep(player.path[0].x, player.path[0].y);
                }
            } else {
                const dir = new THREE.Vector3().subVectors(targetPos, pos).normalize();
                pos.add(dir.multiplyScalar(speed * delta));
                const lookTarget = targetPos.clone();
                lookTarget.y = pos.y;
                group.current.lookAt(lookTarget);
                const bounce = Math.sin(state.clock.elapsedTime * 15) * 0.05;
                group.current.position.y = bounce;
            }
        } else if (group.current) {
             const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05;
             group.current.scale.setScalar(1 + breathe * 0.02);
        }

        if (legsRef.current) {
            if (isMoving) {
                const legSpeed = 15;
                const angle = Math.sin(state.clock.elapsedTime * legSpeed) * 0.5;
                legsRef.current.children[0].rotation.x = angle;
                legsRef.current.children[1].rotation.x = -angle;
            } else {
                legsRef.current.children[0].rotation.x = 0;
                legsRef.current.children[1].rotation.x = 0;
            }
        }
    });

    const pantsColor = player.pantsColor || '#1e293b';
    const shoeColor = player.shoeColor || '#000000';
    const shirtColor = player.color;

    return (
        <group 
            ref={group} 
            position={gridToWorld(player.x, player.y)}
            onClick={(e) => { e.stopPropagation(); onAvatarClick(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <group scale={0.4} position={[0, 0.2, 0]}>
                <group ref={legsRef} position={[0, 0.6, 0]}>
                     <mesh position={[-0.2, -0.3, 0]} geometry={boxGeo} scale={[0.2, 0.6, 0.2]}><meshStandardMaterial color={pantsColor} /></mesh>
                     <mesh position={[0.2, -0.3, 0]} geometry={boxGeo} scale={[0.2, 0.6, 0.2]}><meshStandardMaterial color={pantsColor} /></mesh>
                     <mesh position={[-0.2, -0.65, 0.05]} geometry={boxGeo} scale={[0.22, 0.15, 0.35]}><meshStandardMaterial color={shoeColor} /></mesh>
                     <mesh position={[0.2, -0.65, 0.05]} geometry={boxGeo} scale={[0.22, 0.15, 0.35]}><meshStandardMaterial color={shoeColor} /></mesh>
                </group>
                <mesh castShadow position={[0, 1.0, 0]} geometry={boxGeo} scale={[0.7, 0.8, 0.4]}><meshStandardMaterial color={shirtColor} /></mesh>
                <mesh castShadow position={[0, 1.7, 0]} geometry={sphereGeo} scale={0.5}><meshStandardMaterial color="#ffccaa" /></mesh>
                <group position={[0, 1.7, 0.45]}>
                    {player.face === 'cool' ? (
                        <mesh position={[0, 0.1, 0]} geometry={boxGeo} scale={[0.6, 0.15, 0.05]}><meshStandardMaterial color="black" /></mesh>
                    ) : (
                        <>
                            <mesh position={[0.15, 0.1, 0]} geometry={sphereGeo} scale={0.08}><meshStandardMaterial color="black" /></mesh>
                            <mesh position={[-0.15, 0.1, 0]} geometry={sphereGeo} scale={0.08}><meshStandardMaterial color="black" /></mesh>
                        </>
                    )}
                    {player.face === 'surprised' ? (
                        <mesh position={[0, -0.15, 0]} geometry={sphereGeo} scale={0.08}><meshStandardMaterial color="black" /></mesh>
                    ) : (
                        <mesh position={[0, -0.15, 0]} geometry={boxGeo} scale={[0.2, 0.05, 0.02]}><meshStandardMaterial color="black" /></mesh>
                    )}
                </group>
                {player.hat === 'tophat' && (
                     <group position={[0, 2.1, 0]}>
                        <mesh castShadow geometry={cylinderGeo} scale={[0.7, 0.1, 0.7]} position={[0, -0.2, 0]}><meshStandardMaterial color="#111" /></mesh>
                        <mesh castShadow geometry={cylinderGeo} scale={[0.45, 0.8, 0.45]} position={[0, 0.2, 0]}><meshStandardMaterial color="#111" /></mesh>
                     </group>
                )}
                {player.hat === 'cap' && (
                     <group position={[0, 2.05, 0]} rotation={[-0.2, 0, 0]}>
                        <mesh castShadow geometry={sphereGeo} scale={[0.55, 0.4, 0.55]} position={[0, 0, 0]}><meshStandardMaterial color="#2563eb" /></mesh>
                        <mesh castShadow geometry={boxGeo} scale={[0.5, 0.1, 0.5]} position={[0, 0, 0.4]}><meshStandardMaterial color="#2563eb" /></mesh>
                     </group>
                )}
                {player.hat === 'helmet' && (
                     <group position={[0, 2.1, 0]}>
                         <mesh castShadow geometry={sphereGeo} scale={[0.6, 0.5, 0.6]} position={[0, 0, 0]}><meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} /></mesh>
                     </group>
                )}
                <mesh position={[0, -0.5, 0]} rotation={[-Math.PI/2, 0, 0]}>
                     <ringGeometry args={[1.2, 1.4, 32]} />
                     <meshBasicMaterial color="white" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

const RoadMarkings = React.memo(({ x, y, grid, yOffset }: { x: number; y: number; grid: Grid; yOffset: number }) => {
  const lineMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fbbf24' }), []);
  const lineGeo = useMemo(() => new THREE.PlaneGeometry(0.1, 0.5), []);
  const hasUp = y > 0 && grid[y - 1][x].buildingType === BuildingType.Road;
  const hasDown = y < GRID_SIZE - 1 && grid[y + 1][x].buildingType === BuildingType.Road;
  const hasLeft = x > 0 && grid[y][x - 1].buildingType === BuildingType.Road;
  const hasRight = x < GRID_SIZE - 1 && grid[y][x + 1].buildingType === BuildingType.Road;
  const connections = [hasUp, hasDown, hasLeft, hasRight].filter(Boolean).length;
  
  if (connections === 0) return (<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset, 0]} geometry={lineGeo} material={lineMaterial} />);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset, 0]} raycast={() => null}>
      {(hasUp || hasDown) && (hasLeft || hasRight) && (
        <mesh position={[0, 0, 0.005]} material={lineMaterial}><planeGeometry args={[0.12, 0.12]} /></mesh>
      )}
      {hasUp && <mesh position={[0, 0.25, 0]} geometry={lineGeo} material={lineMaterial} />}
      {hasDown && <mesh position={[0, -0.25, 0]} geometry={lineGeo} material={lineMaterial} />}
      {hasLeft && <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={lineGeo} material={lineMaterial} />}
      {hasRight && <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={lineGeo} material={lineMaterial} />}
    </group>
  );
});

const GroundTile = React.memo(({ type, x, y, grid, onHover, onLeave, onClick, isNight }: any) => {
  const [wx, _, wz] = gridToWorld(x, y);
  let color = '#10b981';
  let topY = -0.3; 
  let thickness = 0.5;
  
  if (type === BuildingType.None) {
    const noise = getHash(x, y);
    color = noise > 0.7 ? '#059669' : noise > 0.3 ? '#10b981' : '#34d399';
    // Terrain variation
    topY = -0.3 + (noise * 0.15); 
  } else if (type === BuildingType.Road) {
    color = '#374151';
    topY = -0.29; 
  } else {
    color = '#d1d5db'; 
    topY = -0.28;
  }
  
  if (isNight && type === BuildingType.None) color = '#064e3b';
  if (isNight && type !== BuildingType.None) color = '#374151';

  return (
    <mesh 
        position={[wx, topY - thickness/2, wz]} 
        receiveShadow castShadow
        onPointerEnter={(e) => { e.stopPropagation(); onHover(x, y); }}
        onPointerOut={(e) => { e.stopPropagation(); onLeave(); }}
        onPointerDown={(e) => { e.stopPropagation(); if (e.button === 0) onClick(x, y); }}
    >
      <boxGeometry args={[1, thickness, 1]} />
      <meshStandardMaterial color={color} flatShading roughness={1} />
      {type === BuildingType.Road && <RoadMarkings x={x} y={y} grid={grid} yOffset={thickness / 2 + 0.001} />}
    </mesh>
  );
});

const Cursor = ({ x, y, color }: { x: number, y: number, color: string }) => {
  const [wx, _, wz] = gridToWorld(x, y);
  return (
    <mesh position={[wx, -0.1, wz]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthTest={false} />
      <Outlines thickness={0.05} color="white" />
    </mesh>
  );
};

interface IsoMapProps {
  grid: Grid;
  onTileClick: (x: number, y: number) => void;
  hoveredTool: BuildingType | null;
  population: number;
  weather: WeatherType;
  player: PlayerConfig;
  onAvatarClick: () => void;
  onReachStep: (x: number, y: number) => void;
}

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, population, weather, player, onAvatarClick, onReachStep }) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const handleHover = useCallback((x: number, y: number) => setHoveredTile({ x, y }), []);
  const handleLeave = useCallback(() => setHoveredTile(null), []);

  const showPreview = hoveredTile && 
                      hoveredTool !== null && 
                      grid[hoveredTile.y][hoveredTile.x].buildingType === BuildingType.None && 
                      hoveredTool !== BuildingType.None;
  
  const previewColor = (showPreview && hoveredTool) ? BUILDINGS[hoveredTool].color : 'white';
  const isBulldoze = hoveredTool === BuildingType.None;
  const previewPos = hoveredTile ? gridToWorld(hoveredTile.x, hoveredTile.y) : [0,0,0];
  const isNight = weather === 'night';

  const cursorColor = isBulldoze 
    ? '#ef4444' 
    : (hoveredTool === null ? '#ffffff' : (showPreview ? '#ffffff' : '#000000'));

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
        <OrthographicCamera makeDefault zoom={45} position={[20, 20, 20]} near={-100} far={500} />
        <MapControls enableRotate={true} enableZoom={true} minZoom={20} maxZoom={120} maxPolarAngle={Math.PI / 2.2} minPolarAngle={0.1} target={[0,-0.5,0]} />

        <EnvironmentEffects weather={weather} />

        <group>
          {grid.map((row, y) =>
            row.map((tile, x) => {
              const [wx, _, wz] = gridToWorld(x, y);
              return (
              <React.Fragment key={`${x}-${y}`}>
                <GroundTile 
                    type={tile.buildingType} x={x} y={y} grid={grid}
                    onHover={handleHover} onLeave={handleLeave} onClick={onTileClick} isNight={isNight}
                />
                <group position={[wx, 0, wz]} raycast={() => null}>
                    {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                      <ProceduralBuilding type={tile.buildingType} baseColor={BUILDINGS[tile.buildingType].color} x={x} y={y} isNight={isNight} />
                    )}
                </group>
              </React.Fragment>
            )})
          )}

          {/* Dynamic Elements */}
          <group>
            <TrafficSystem grid={grid} isNight={isNight} />
            
            <Avatar 
                player={player} 
                onAvatarClick={onAvatarClick} 
                onReachStep={onReachStep}
            />

            {showPreview && hoveredTile && hoveredTool && (
              <group position={[previewPos[0], 0, previewPos[2]]}>
                <Float speed={3} rotationIntensity={0} floatIntensity={0.1} floatingRange={[0, 0.1]}>
                  <ProceduralBuilding type={hoveredTool} baseColor={previewColor} x={hoveredTile.x} y={hoveredTile.y} transparent opacity={0.7} isNight={isNight} />
                </Float>
              </group>
            )}
            {hoveredTile && <Cursor x={hoveredTile.x} y={hoveredTile.y} color={cursorColor} />}
          </group>
        </group>
        <SoftShadows size={10} samples={8} />
      </Canvas>
    </div>
  );
};

export default IsoMap;
