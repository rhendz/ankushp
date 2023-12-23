'use client';
import Image from 'next/image';
import Link from 'next/link';

import { Canvas } from '@react-three/fiber';

const Cube = () => {
  return (
    <mesh position={[1, 0, 1]}>
      <boxGeometry />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
};

export default function Home() {
  return (
    <Canvas>
      <directionalLight position={[0, 0, 2]} />

      <mesh position={[-1, 0, 1]}>
        <boxGeometry />
        <meshStandardMaterial color={'orange'} />
      </mesh>
    </Canvas>
  );
}
