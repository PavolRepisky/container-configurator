import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, CameraControls, PerspectiveCamera } from '@react-three/drei';
import CapsuleModel from './CapsuleModel';
import { useConfigStore } from '../store';
import * as THREE from 'three';

const CameraHandler: React.FC = () => {
  const controlsRef = useRef<CameraControls>(null);
  const isFirstRun = useRef(true);
  const stepIndex = useConfigStore((state) => state.currentStepIndex);

  useEffect(() => {
    if (!controlsRef.current) return;

    // Helper to calculate the shortest rotation path
    const smoothTransition = (targetAzimuth: number, targetPolar: number, targetDist: number) => {
        const controls = controlsRef.current;
        if (!controls) return;

        const currentAzimuth = controls.azimuthAngle;
        const currentPolar = controls.polarAngle;
        const PI2 = Math.PI * 2;
        
        // --- POLE SINGULARITY FIX ---
        const isNearPole = currentPolar < 0.1; 
        
        // 1. Normalize target to 0..2PI
        const t = ((targetAzimuth % PI2) + PI2) % PI2;
        
        // 2. Normalize current to 0..2PI
        // If near pole, startAzimuth logic helps, but for now we just use currentAzimuth
        const c = ((currentAzimuth % PI2) + PI2) % PI2;
        
        // 3. Find shortest difference
        let diff = t - c;
        if (diff < -Math.PI) diff += PI2;
        if (diff > Math.PI) diff -= PI2;
        
        // 4. Calculate Final Azimuth
        let finalAzimuth = currentAzimuth + diff;

        controls.rotateTo(finalAzimuth, targetPolar, true);
        controls.dollyTo(targetDist, true);
        controls.setTarget(0, 0, 0, true);
    };

    // Initial setup
    if (isFirstRun.current) {
        controlsRef.current.setLookAt(12, 6, 12, 0, 0, 0, false);
        isFirstRun.current = false;
        return;
    }

    switch (stepIndex) {
      case 0: // Exterior
        // Target: Front-Right Isometric View
        smoothTransition(Math.PI / 4, Math.PI / 3, 20);
        break;
        
      case 1: // Interior
        // Target: Top Down
        // We use the CURRENT azimuth as the target to prevent any horizontal rotation
        // We use 1e-4 for polar to avoid true singularity at 0
        if (controlsRef.current) {
            const currentAz = controlsRef.current.azimuthAngle;
            controlsRef.current.rotateTo(currentAz, 1e-4, true);
            controlsRef.current.dollyTo(18, true);
            controlsRef.current.setTarget(0, 0, 0, true);
        }
        break;
        
      case 2: // Extras
        // Target: Back-Left View
        smoothTransition(5 * Math.PI / 4, Math.PI / 4, 18);
        break;
    }
  }, [stepIndex]);

  return <CameraControls ref={controlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />;
};

const Experience: React.FC = () => {
  return (
    <Canvas shadows className="w-full h-full bg-gray-100">
        <PerspectiveCamera makeDefault position={[12, 6, 12]} fov={45} />
        <CameraHandler />
        
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
            position={[5, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-bias={-0.0001} 
        />
        
        <CapsuleModel />
        
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