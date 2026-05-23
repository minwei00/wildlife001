import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations } from '@react-three/drei';

function Model() {
  const { scene, animations } = useGLTF('/Talking.gltf');
  // 1. Get the animation actions from the loaded model
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // 2. Check if there are animations and play the first one
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.keys(actions)[0];
      actions[firstAction].play();
    }
  }, [actions]);

  return <primitive object={scene} scale={[8,9,9]} />;
}

export default function RobotCanvas() {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}