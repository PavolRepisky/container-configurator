import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, CameraControls, PerspectiveCamera } from '@react-three/drei';
import CapsuleModel from './CapsuleModel';
import { ConfigState } from '../types';

interface ExperienceProps {
  config: ConfigState;
  currentStepIndex: number;
}

const CameraHandler: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const smoothTime = 0.8;

    switch (stepIndex) {
      case 0: // Exterior
        controlsRef.current.setLookAt(10, 5, 12, 0, 0, 0, true);
        break;
      case 1: // Interior - Direct Top Down View
        // High Y value to fit the 11.5m length in view. Tiny Z offset avoids gimbal lock.
        controlsRef.current.setLookAt(0, 16, 0.01, 0, 0, 0, true);
        break;
      case 2: // Extras - Zoomed out, different angle to see AC/Roof
        controlsRef.current.setLookAt(-10, 8, 10, 0, 0, 0, true);
        break;
      default:
        controlsRef.current.setLookAt(12, 6, 12, 0, 0, 0, true);
    }
  }, [stepIndex]);

  return <CameraControls ref={controlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />;
};

const Experience: React.FC<ExperienceProps> = ({ config, currentStepIndex }) => {
  return (
    <Canvas shadows className="w-full h-full bg-gray-100">
        <PerspectiveCamera makeDefault position={[12, 6, 12]} fov={45} />
        <CameraHandler stepIndex={currentStepIndex} />
        
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
            position={[5, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-bias={-0.0001} 
        />
        
        <CapsuleModel config={config} currentStepIndex={currentStepIndex} />
        
        <ContactShadows 
            opacity={0.5} 
            scale={30} 
            blur={2} 
            far={4} 
            resolution={256} 
            color="#000000" 
        />
    </Canvas>
  );
};

export default Experience;