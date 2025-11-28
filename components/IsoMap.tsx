
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, SoftShadows, Float, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { Grid, BuildingType, WeatherType, PlayerConfig } from '../types';
import { GRID_SIZE, BUILDINGS } from '../constants';

// --- Constantes & Utilitários ---
const WORLD_OFFSET = GRID_SIZE / 2 - 0.5;
const gridToWorld = (x: number, y: number) => [x - WORLD_OFFSET, 0, y - WORLD_OFFSET] as [number, number, number];
const getHash = (x: number, y: number) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
const getRandomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Geometrias Compartilhadas (Performance)
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 4);
const sphereGeo = new THREE.SphereGeometry(1, 8, 8);
const planeGeo = new THREE.PlaneGeometry(1, 1);

// --- Componentes Visuais ---

const AnimatedWater = React.memo(({ weather }: { weather: WeatherType }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometry = useMemo(() => new THREE.PlaneGeometry(GRID_SIZE * 4, GRID_SIZE * 4, 64, 64), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            const waveX = Math.sin(vertex.x * 0.5 + time) * 0.2;
            const waveY = Math.cos(vertex.y * 0.5 + time * 0.8) * 0.2;
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
        <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow raycast={() => null}>
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.6} opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
    );
});

const WindowBlock = React.memo(({ position, scale, isNight }: { position: [number, number, number], scale: [number, number, number], isNight: boolean }) => (
  <mesh geometry={boxGeo} position={position} scale={scale} raycast={() => null}>
    <meshStandardMaterial color="#bfdbfe" emissive={isNight ? "#fef08a" : "#bfdbfe"} emissiveIntensity={isNight ? 2 : 0.2} roughness={0.1} metalness={0.8} />
  </mesh>
));

const SmokeStack = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
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
      <mesh geometry={cylinderGeo} castShadow receiveShadow position={[0, 0.5, 0]} scale={[0.2, 1, 0.2]}><meshStandardMaterial color="#4b5563" /></mesh>
      <group ref={ref} position={[0, 1, 0]}>
        {[0, 1, 2].map(i => (<mesh key={i} geometry={sphereGeo} position={[Math.random()*0.1, i*0.4, Math.random()*0.1]} scale={0.2}><meshStandardMaterial color="#d1d5db" transparent opacity={0.6} flatShading /></mesh>))}
      </group>
    </group>
  );
};

const WindTurbineBlades = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 2; });
  return (
    <group ref={ref} position={[0, 1.2, 0.1]} raycast={() => null}>
      {[0, 1, 2].map(i => (<mesh key={i} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.1, 0.8, 0.05]} rotation={[0, 0, i * (Math.PI * 2) / 3]}><meshStandardMaterial color="#f8fafc" /></mesh>))}
      <mesh geometry={sphereGeo} scale={0.15}><meshStandardMaterial color="#cbd5e1" /></mesh>
    </group>
  );
};

const ProceduralBuilding = React.memo(({ type, baseColor, x, y, isNight, opacity = 1, transparent = false }: any) => {
  const hash = getHash(x, y);
  const variant = Math.floor(hash * 100); 
  const rotation = Math.floor(hash * 4) * (Math.PI / 2);
  const color = useMemo(() => {
    const c = new THREE.Color(baseColor);
    c.offsetHSL(hash * 0.1 - 0.05, 0, hash * 0.2 - 0.1);
    return c;
  }, [baseColor, hash]);
  
  const mainMat = useMemo(() => new THREE.MeshStandardMaterial({ color: isNight ? color.clone().multiplyScalar(0.5) : color, flatShading: true, opacity, transparent, roughness: 0.8 }), [color, opacity, transparent, isNight]);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: isNight ? new THREE.Color(color).multiplyScalar(0.3) : new THREE.Color(color).multiplyScalar(0.7), flatShading: true, opacity, transparent }), [color, opacity, transparent, isNight]);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: isNight ? new THREE.Color(color).multiplyScalar(0.2) : new THREE.Color(color).multiplyScalar(0.5).offsetHSL(0,0,-0.1), flatShading: true, opacity, transparent }), [color, opacity, transparent, isNight]);
  const commonProps = { castShadow: true, receiveShadow: true };
  const yOffset = -0.3;

  return (
    <group rotation={[0, rotation, 0]} position={[0, yOffset, 0]}>
      {(() => {
        switch (type) {
          case BuildingType.Residential:
             if (variant < 33) return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.3, 0]} scale={[0.7, 0.6, 0.6]} /><mesh {...commonProps} material={roofMat} geometry={coneGeo} position={[0, 0.75, 0]} scale={[0.6, 0.4, 0.6]} rotation={[0, Math.PI/4, 0]} /><WindowBlock isNight={isNight} position={[0.2, 0.3, 0.31]} scale={[0.15, 0.2, 0.05]} /><WindowBlock isNight={isNight} position={[-0.2, 0.3, 0.31]} scale={[0.15, 0.2, 0.05]} /></>;
             if (variant < 66) return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.1, 0.35, 0]} scale={[0.6, 0.7, 0.8]} /><mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0.25, 0.25, 0.1]} scale={[0.4, 0.5, 0.6]} /><WindowBlock isNight={isNight} position={[-0.1, 0.5, 0.41]} scale={[0.4, 0.2, 0.05]} /></>;
             return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.5, 0]} scale={[0.5, 1, 0.6]} /><mesh {...commonProps} material={roofMat} geometry={boxGeo} position={[0, 1.05, 0]} scale={[0.55, 0.1, 0.65]} /><WindowBlock isNight={isNight} position={[0, 0.7, 0.31]} scale={[0.3, 0.2, 0.05]} /><WindowBlock isNight={isNight} position={[0, 0.3, 0.31]} scale={[0.3, 0.2, 0.05]} /></>;
          case BuildingType.Commercial:
             if (variant < 40) return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.75, 0]} scale={[0.7, 1.5, 0.7]} /><WindowBlock isNight={isNight} position={[0, 0.5, 0]} scale={[0.72, 0.15, 0.72]} /><WindowBlock isNight={isNight} position={[0, 0.8, 0]} scale={[0.72, 0.15, 0.72]} /></>;
             return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.2, 0.5, -0.2]} scale={[0.5, 1, 0.5]} /><mesh {...commonProps} material={accentMat} geometry={boxGeo} position={[0.1, 0.3, 0.1]} scale={[0.7, 0.6, 0.7]} /><WindowBlock isNight={isNight} position={[0.1, 0.3, 0.46]} scale={[0.6, 0.3, 0.05]} /></>;
          case BuildingType.Industrial:
             return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.8, 0.8]} /><SmokeStack position={[0.3, 0.4, 0.3]} /></>;
          case BuildingType.Park:
             return <group position={[0, -yOffset - 0.29, 0]}><mesh receiveShadow rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}><planeGeometry args={[0.9, 0.9]} /><meshStandardMaterial color={isNight ? "#064e3b" : "#86efac"} /></mesh><mesh position={[0, 0.3, 0]} geometry={coneGeo} scale={[0.4, 0.6, 0.4]}><meshStandardMaterial color="#166534" /></mesh></group>;
          case BuildingType.WindTurbine: return <><mesh {...commonProps} material={mainMat} geometry={cylinderGeo} position={[0, 0.6, 0]} scale={[0.08, 1.2, 0.08]} /><WindTurbineBlades /></>;
          case BuildingType.DataCenter: return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.8, 0.7]} /><mesh position={[0, 0.4, 0.36]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color={isNight?"#0f0":"#004400"} emissive="#0f0" emissiveIntensity={isNight?1:0} /></mesh></>;
          case BuildingType.BeachResort: return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[-0.2, 0.6, -0.2]} scale={[0.5, 1.2, 0.5]} /><mesh position={[0.2, 0.1, 0.2]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.4,0.4]} /><meshStandardMaterial color="#06b6d4" /></mesh></>;
          case BuildingType.Metro: return <group position={[0, -0.1, 0]}><mesh {...commonProps} position={[0, 0.1, 0]} geometry={boxGeo} scale={[0.8, 0.1, 0.5]}><meshStandardMaterial color="#333" /></mesh><mesh position={[0.3, 0.5, 0.2]} geometry={cylinderGeo} scale={[0.05, 0.8, 0.05]}><meshStandardMaterial color="#666" /></mesh></group>;
          case BuildingType.School: return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.4, 0]} scale={[0.9, 0.6, 0.6]} /><mesh {...commonProps} material={roofMat} geometry={coneGeo} position={[0, 0.8, 0]} scale={[0.7, 0.3, 0.7]} rotation={[0, Math.PI/4, 0]} /></>;
          case BuildingType.Hospital: return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.5, 0]} scale={[0.7, 1.0, 0.7]} /><mesh position={[0, 0.8, 0.36]} geometry={boxGeo} scale={[0.3, 0.08, 0.02]}><meshStandardMaterial color="red" /></mesh><mesh position={[0, 0.8, 0.36]} geometry={boxGeo} scale={[0.08, 0.3, 0.02]}><meshStandardMaterial color="red" /></mesh></>;
          case BuildingType.CityHall: return <><mesh {...commonProps} material={mainMat} geometry={boxGeo} position={[0, 0.3, 0]} scale={[0.8, 0.6, 0.8]} /><mesh {...commonProps} material={roofMat} geometry={sphereGeo} position={[0, 0.9, 0]} scale={[0.25, 0.25, 0.25]} /></>;
          case BuildingType.SolarFarm: return <group><mesh {...commonProps} position={[0, 0.2, 0]} rotation={[Math.PI/6, 0, 0]} geometry={boxGeo} scale={[0.8, 0.05, 0.8]}><meshStandardMaterial color="#1e3a8a" metalness={0.8} /></mesh></group>;
          default: return null;
        }
      })()}
    </group>
  );
});

const CloudSystem = React.memo(() => {
    const cloudCount = 8;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const clouds = useRef<{x: number, y: number, z: number, scale: number, speed: number}[]>([]);
    
    useEffect(() => {
        clouds.current = Array.from({length: cloudCount}).map(() => ({
            x: getRandomRange(-20, 20), y: getRandomRange(4, 7), z: getRandomRange(-20, 20), scale: getRandomRange(1, 3), speed: getRandomRange(0.5, 1.5)
        }));
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        clouds.current.forEach((cloud, i) => {
            cloud.x += cloud.speed * delta;
            if (cloud.x > 30) { cloud.x = -30; cloud.z = getRandomRange(-20, 20); }
            dummy.position.set(cloud.x, cloud.y, cloud.z);
            dummy.scale.set(cloud.scale, cloud.scale * 0.4, cloud.scale * 0.8);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });
    return <instancedMesh ref={meshRef} args={[boxGeo, undefined, cloudCount]} raycast={() => null}><meshStandardMaterial color="white" transparent opacity={0.6} flatShading /></instancedMesh>;
});

// --- PEDESTRIAN SYSTEM ---
const PedestrianSystem = React.memo(({ grid, residentialCount }: { grid: Grid, residentialCount: number }) => {
    const MAX_NPCS = 60;
    const activeCount = Math.min(Math.max(3, residentialCount * 2), MAX_NPCS);
    
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const headRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const dummyHead = useMemo(() => new THREE.Object3D(), []);

    const agents = useRef<{x: number, z: number, targetX: number, targetZ: number, speed: number, color: string}[]>([]);
    
    const walkableTiles = useMemo(() => {
        const tiles: {x: number, y: number}[] = [];
        grid.forEach(row => row.forEach(tile => {
            if (tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Industrial) {
                tiles.push({x: tile.x, y: tile.y});
            }
        }));
        return tiles;
    }, [grid]);

    const getRandomTile = useCallback(() => {
        if (walkableTiles.length === 0) return {x: 0, z: 0};
        const tile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
        const [wx, _, wz] = gridToWorld(tile.x, tile.y);
        return {
            x: wx + (Math.random() - 0.5) * 0.8,
            z: wz + (Math.random() - 0.5) * 0.8
        };
    }, [walkableTiles]);

    useFrame((state, delta) => {
        if (!meshRef.current || !headRef.current || walkableTiles.length === 0) return;

        if (agents.current.length < activeCount) {
            const start = getRandomTile();
            agents.current.push({
                x: start.x, z: start.z, targetX: start.x, targetZ: start.z, speed: getRandomRange(0.5, 1.5), color: Math.random() > 0.5 ? '#f87171' : '#60a5fa'
            });
        } else if (agents.current.length > activeCount) {
            agents.current.pop();
        }

        agents.current.forEach((agent, i) => {
            const dx = agent.targetX - agent.x;
            const dz = agent.targetZ - agent.z;
            const dist = Math.sqrt(dx*dx + dz*dz);

            if (dist < 0.1) {
                const next = getRandomTile();
                agent.targetX = next.x;
                agent.targetZ = next.z;
            } else {
                agent.x += (dx / dist) * agent.speed * delta;
                agent.z += (dz / dist) * agent.speed * delta;
            }

            const y = -0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 10 * agent.speed)) * 0.1;

            dummy.position.set(agent.x, y, agent.z);
            dummy.scale.set(0.15, 0.3, 0.15);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, new THREE.Color(agent.color));

            dummyHead.position.set(agent.x, y + 0.25, agent.z);
            dummyHead.scale.set(0.12, 0.12, 0.12);
            dummyHead.updateMatrix();
            headRef.current!.setMatrixAt(i, dummyHead.matrix);
        });

        for (let i = agents.current.length; i < MAX_NPCS; i++) {
             dummy.scale.set(0, 0, 0); 
             dummy.updateMatrix();
             meshRef.current.setMatrixAt(i, dummy.matrix);
             headRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if(meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        headRef.current.instanceMatrix.needsUpdate = true;
    });

    if (walkableTiles.length === 0) return null;

    return (
        <group raycast={() => null}>
            <instancedMesh ref={meshRef} args={[boxGeo, undefined, MAX_NPCS]} castShadow>
                <meshStandardMaterial roughness={0.5} />
            </instancedMesh>
            <instancedMesh ref={headRef} args={[sphereGeo, undefined, MAX_NPCS]} castShadow>
                <meshStandardMaterial color="#ffccaa" />
            </instancedMesh>
        </group>
    );
});

// --- TRAFFIC SYSTEM ---
const TrafficSystem = React.memo(({ grid, isNight, population }: { grid: Grid, isNight: boolean, population: number }) => {
  const roadTiles = useMemo(() => {
    const roads: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) roads.push({x: tile.x, y: tile.y});
    }));
    return roads;
  }, [grid]);

  const carCount = useMemo(() => {
      if (roadTiles.length < 2) return 0;
      return Math.min(Math.max(2, Math.floor(population / 10)), 30);
  }, [roadTiles.length, population]);

  const carsRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null); 
  const carsState = useRef<Float32Array>(new Float32Array(0)); 
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (roadTiles.length < 2) {
        carsState.current = new Float32Array(0);
        return;
    }
    const newSize = carCount * 6;
    if (carsState.current.length !== newSize) {
        carsState.current = new Float32Array(newSize);
        for (let i = 0; i < carCount; i++) {
            const startNode = roadTiles[Math.floor(Math.random() * roadTiles.length)];
            carsState.current[i*6] = startNode.x;
            carsState.current[i*6+1] = startNode.y;
            carsState.current[i*6+2] = startNode.x;
            carsState.current[i*6+3] = startNode.y;
            carsState.current[i*6+4] = 1;
            carsState.current[i*6+5] = getRandomRange(0.01, 0.03);
        }
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
      
      const [wx, _, wz] = gridToWorld(gx, gy);

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

  if (carCount === 0) return null;

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
});

// ... (Avatar, RoadMarkings, GroundTile)
const Avatar = ({ player, onAvatarClick, onReachStep }: { player: PlayerConfig, onAvatarClick: () => void, onReachStep: (x: number, y: number) => void }) => {
    const group = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
    const speed = 4;
    
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
            if (group.current) group.current.position.set(wx, 0, wz);
        }
    }, [player.path, player.x, player.y]);

    useFrame((state, delta) => {
        if (targetPos && group.current) {
            const pos = group.current.position;
            const dist = pos.distanceTo(targetPos);
            if (dist < 0.05) {
                pos.copy(targetPos);
                setTargetPos(null);
                if (player.path.length > 0) onReachStep(player.path[0].x, player.path[0].y);
            } else {
                const dir = new THREE.Vector3().subVectors(targetPos, pos).normalize();
                pos.add(dir.multiplyScalar(speed * delta));
                const lookTarget = targetPos.clone();
                lookTarget.y = pos.y;
                group.current.lookAt(lookTarget);
                group.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.05;
            }
        }
        if (legsRef.current) {
            const angle = isMoving ? Math.sin(state.clock.elapsedTime * 15) * 0.5 : 0;
            legsRef.current.children[0].rotation.x = angle;
            legsRef.current.children[1].rotation.x = -angle;
        }
    });

    return (
        <group ref={group} position={gridToWorld(player.x, player.y)} onClick={(e) => { e.stopPropagation(); onAvatarClick(); }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
            <group scale={0.4} position={[0, 0.2, 0]}>
                <group ref={legsRef} position={[0, 0.6, 0]}><mesh position={[-0.2, -0.3, 0]} geometry={boxGeo} scale={[0.2, 0.6, 0.2]}><meshStandardMaterial color={player.pantsColor||'#1e293b'} /></mesh><mesh position={[0.2, -0.3, 0]} geometry={boxGeo} scale={[0.2, 0.6, 0.2]}><meshStandardMaterial color={player.pantsColor||'#1e293b'} /></mesh></group>
                <mesh castShadow position={[0, 1.0, 0]} geometry={boxGeo} scale={[0.7, 0.8, 0.4]}><meshStandardMaterial color={player.color} /></mesh>
                <mesh castShadow position={[0, 1.7, 0]} geometry={sphereGeo} scale={0.5}><meshStandardMaterial color="#ffccaa" /></mesh>
                <group position={[0, 1.7, 0.45]}><mesh position={[0.15, 0.1, 0]} geometry={sphereGeo} scale={0.08}><meshStandardMaterial color="black" /></mesh><mesh position={[-0.15, 0.1, 0]} geometry={sphereGeo} scale={0.08}><meshStandardMaterial color="black" /></mesh></group>
                {player.hat !== 'none' && <mesh position={[0, 2.1, 0]} geometry={sphereGeo} scale={0.6}><meshStandardMaterial color={player.hat==='cap'?'#2563eb':player.hat==='helmet'?'#eab308':'#111'} /></mesh>}
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
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset, 0]} raycast={() => null}>
      {hasUp && <mesh position={[0, 0.25, 0]} geometry={lineGeo} material={lineMaterial} />}
      {hasDown && <mesh position={[0, -0.25, 0]} geometry={lineGeo} material={lineMaterial} />}
      {hasLeft && <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={lineGeo} material={lineMaterial} />}
      {hasRight && <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={lineGeo} material={lineMaterial} />}
    </group>
  );
});

const GroundTile = React.memo(({ type, x, y, grid, onHover, onLeave, onClick, isNight }: any) => {
  const [wx, _, wz] = gridToWorld(x, y);
  let color = type === BuildingType.None ? '#10b981' : (type === BuildingType.Road ? '#374151' : '#d1d5db');
  if (isNight && type === BuildingType.None) color = '#064e3b';
  return (
    <mesh position={[wx, -0.3, wz]} receiveShadow castShadow onPointerEnter={(e) => { e.stopPropagation(); onHover(x, y); }} onPointerOut={(e) => { e.stopPropagation(); onLeave(); }} onPointerDown={(e) => { e.stopPropagation(); if (e.button === 0) onClick(x, y); }}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={color} flatShading roughness={1} />
      {type === BuildingType.Road && <RoadMarkings x={x} y={y} grid={grid} yOffset={0.251} />}
    </mesh>
  );
});

const Cursor = React.memo(({ x, y, color }: { x: number, y: number, color: string }) => {
  const [wx, _, wz] = gridToWorld(x, y);
  
  // A simple wireframe mesh is more stable than Outlines and doesn't cause artifacts
  return (
    <group position={[wx, 0.02, wz]}>
        {/* Main Cursor Plane (transparent) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Wireframe Border */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} raycast={() => null}>
             <planeGeometry args={[1, 1]} />
             <meshBasicMaterial color={color} wireframe />
        </mesh>
    </group>
  );
});

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
            y -= delta * 15;
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

const EnvironmentEffects = React.memo(({ weather }: { weather: WeatherType }) => {
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
            <directionalLight castShadow position={[15, 20, 10]} intensity={sunIntensity} color={sunColor} shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
            <AnimatedWater weather={weather} />
        </group>
    )
});

interface IsoMapProps {
  grid: Grid;
  onTileClick: (x: number, y: number) => void;
  hoveredTool: BuildingType | null;
  population: number;
  residentialCount: number;
  weather: WeatherType;
  player: PlayerConfig;
  onAvatarClick: () => void;
  onReachStep: (x: number, y: number) => void;
}

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, population, residentialCount, weather, player, onAvatarClick, onReachStep }) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  const handleHover = useCallback((x: number, y: number) => setHoveredTile({ x, y }), []);
  const handleLeave = useCallback(() => setHoveredTile(null), []);
  const showPreview = hoveredTile && hoveredTool !== null && grid[hoveredTile.y][hoveredTile.x].buildingType === BuildingType.None && hoveredTool !== BuildingType.None;
  const previewPos = hoveredTile ? gridToWorld(hoveredTile.x, hoveredTile.y) : [0,0,0];
  const isNight = weather === 'night';
  const cursorColor = hoveredTool === BuildingType.None ? '#ef4444' : (hoveredTool === null ? '#ffffff' : '#000000');

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
        <OrthographicCamera makeDefault zoom={45} position={[20, 20, 20]} near={-100} far={500} />
        <MapControls enableRotate={true} enableZoom={true} minZoom={20} maxZoom={120} maxPolarAngle={Math.PI / 2.2} minPolarAngle={0.1} target={[0,-0.5,0]} />
        <EnvironmentEffects weather={weather} />
        <group>
          {grid.map((row, y) => row.map((tile, x) => {
              const [wx, _, wz] = gridToWorld(x, y);
              return (
              <React.Fragment key={`${x}-${y}`}>
                <GroundTile type={tile.buildingType} x={x} y={y} grid={grid} onHover={handleHover} onLeave={handleLeave} onClick={onTileClick} isNight={isNight} />
                <group 
                    position={[wx, 0, wz]}
                    onClick={(e) => { e.stopPropagation(); onTileClick(x, y); }}
                    onPointerEnter={(e) => { e.stopPropagation(); handleHover(x, y); }}
                    onPointerOut={(e) => { e.stopPropagation(); handleLeave(); }}
                >
                    {tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road && (
                      <ProceduralBuilding type={tile.buildingType} baseColor={BUILDINGS[tile.buildingType].color} x={x} y={y} isNight={isNight} />
                    )}
                </group>
              </React.Fragment>
            )
          }))}
          <group>
            <TrafficSystem grid={grid} isNight={isNight} population={population} />
            <PedestrianSystem grid={grid} residentialCount={residentialCount} />

            <Avatar player={player} onAvatarClick={onAvatarClick} onReachStep={onReachStep} />
            {showPreview && hoveredTile && hoveredTool && (
              <group position={[previewPos[0], 0, previewPos[2]]}>
                <Float speed={3} rotationIntensity={0} floatIntensity={0.1} floatingRange={[0, 0.1]}>
                  <ProceduralBuilding type={hoveredTool} baseColor={BUILDINGS[hoveredTool].color} x={hoveredTile.x} y={hoveredTile.y} transparent opacity={0.7} isNight={isNight} />
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
