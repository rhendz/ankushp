'use client';
import Image from 'next/image';
import Link from 'next/link';

import { Canvas } from '@react-three/fiber';
import { Vector3, Color} from 'three';
import React, { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';

// Import Leva only in development
let useControls;
if (process.env.NODE_ENV === 'development') {
  import('leva').then((levaModule) => {
    useControls = levaModule.useControls;
  });
}

const Cone: React.FC<{
  position: Vector3;
  size: [number, number, number, number];
  color: Color | string | number;
}> = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <coneGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const ConeManipulator: React.FC<{
  initialPosition: Vector3;
  initialSize: [number, number, number, number];
  initialColor: Color | string | number;
}> = ({ initialPosition, initialSize, initialColor }) => {
  const ref = useRef<Mesh>();

  // Leva controls for the cone
  const { position, size, color } = useControls && useControls({
    position: { value: initialPosition.toArray(), label: 'Position' },
    size: { value: initialSize, label: 'Size', step: 0.1 },
    color: { value: initialColor.toString(), label: 'Color', format: 'color' },
  });

  return (
    <mesh ref={ref} position={new Vector3(...position)}>
      <coneGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Cube: React.FC<{
  position: Vector3;
  size: [number, number, number];
  color: Color | string | number;
}> = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Sphere: React.FC<{
  position: Vector3;
  size: [number, number, number];
  color: Color | string | number;
}> = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Torus: React.FC<{
  position: Vector3;
  size: [number, number, number, number];
  color: Color | string | number;
}> = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <torusGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};


export default function Home() {
  const initialPosition = new Vector3(0, 0, 0);
  const initialSize: [number, number, number, number] = [1, 1, 1, 32];
  const initialColor: Color | string | number = '#ff0000';

  return (
    <div className='h-screen w-full'>
      <Canvas className='h-full w-full'>
        <directionalLight position={[0, 0, 2]} />

        {/* <group position={[0,0,0]}>
          <Cube position={new Vector3(1,0,0)} color={'red'} size={[1, 1, 1]} />
          <Cube position={new Vector3(-1,0,0)} color={'orange'} size={[1, 1, 1]} />
          <Cube position={new Vector3(-1,2,0)} color={'yellow'} size={[1, 1, 1]} />
          <Cube position={new Vector3(1,2,0)} color={'green'} size={[1, 1, 1]} />
        </group> */}

        <Sphere position={new Vector3(0,0,0)} size={[1,30,30]} color={"orange"}/>
        <Torus position={new Vector3(2,0,0)} size={[0.8,0.1,30,30]} color={"blue"}/>
        {/* <Cone position={new Vector3(-2,0,0)} size={[1,2,32,4]} color={"red"}/> */}
        <ConeManipulator 
          initialPosition={initialPosition}
          initialSize={initialSize}
          initialColor={initialColor}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
