import React from 'react';
import { ConfigState } from '../types';
import { DoubleSide } from 'three';

interface CapsuleModelProps {
  config: ConfigState;
  currentStepIndex: number;
}

const CapsuleModel: React.FC<CapsuleModelProps> = ({ config, currentStepIndex }) => {
  // Dimensions
  const width = 11.5;
  const height = 3.3;
  const depth = 3.3;
  
  // Visibility Logic
  const showRoof = currentStepIndex !== 1;

  // Material helpers
  const wallMaterialProps = {
    color: config.wallColor,
    roughness: 0.5,
    metalness: 0.1,
  };

  const frameMaterialProps = {
    color: config.wallColor, 
    roughness: 0.6,
    metalness: 0.2,
  };

  const glassMaterialProps = {
    transparent: true,
    opacity: 0.2,
    roughness: 0,
    metalness: 0.9,
    clearcoat: 1,
    transmission: 0.95,
    thickness: 0.1,
    side: DoubleSide
  };

  // --- REUSABLE COMPONENTS ---

  const CorrugatedPanel: React.FC<{ width: number, height: number, depth: number, horizontal?: boolean }> = ({ width, height, depth, horizontal = false }) => {
    const ribCount = Math.floor((horizontal ? height : width) / 0.3);
    const ribWidth = 0.15;
    const ribDepth = 0.08;
    
    return (
      <group>
        <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...wallMaterialProps} />
        </mesh>
        {Array.from({ length: ribCount }).map((_, i) => {
            const offset = (i - ribCount / 2) * 0.3 + 0.15;
            const x = horizontal ? 0 : offset;
            const y = horizontal ? offset : 0;
            return (
                <mesh key={i} position={[x, y, horizontal ? depth/2 + ribDepth/2 : depth/2 + ribDepth/2]} castShadow receiveShadow>
                     <boxGeometry args={[horizontal ? width : ribWidth, horizontal ? ribWidth : height, ribDepth]} />
                     <meshStandardMaterial {...wallMaterialProps} color={config.wallColor} />
                </mesh>
            )
        })}
      </group>
    );
  };

  const ModernChair: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => (
      <group position={position} rotation={rotation as any}>
          {/* Legs (Tapered) */}
          {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0.22, z]} rotation={[i < 2 ? 0.1 : -0.1, 0, i % 2 === 0 ? 0.1 : -0.1]} castShadow>
                  <cylinderGeometry args={[0.02, 0.01, 0.45]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.8} />
              </mesh>
          ))}
          {/* Seat */}
          <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.4, 0.05, 0.42]} />
              <meshStandardMaterial color="#4b5563" roughness={0.9} />
          </mesh>
          {/* Backrest Supports */}
          <mesh position={[-0.15, 0.65, -0.18]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.03, 0.4, 0.03]} />
              <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.15, 0.65, -0.18]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.03, 0.4, 0.03]} />
              <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* Backrest Curved (Approximated with Box) */}
          <mesh position={[0, 0.85, -0.22]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.38, 0.15, 0.05]} />
              <meshStandardMaterial color="#4b5563" roughness={0.9} />
          </mesh>
      </group>
  );

  return (
    <group position={[0, height / 2, 0]}>
      
      {/* --- STRUCTURAL FRAME --- */}
      <group>
        {/* 4 Corner Posts */}
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} position={[x * (width/2 - 0.15), 0, z * (depth/2 - 0.15)]} castShadow receiveShadow>
                <boxGeometry args={[0.3, height, 0.3]} />
                <meshStandardMaterial {...frameMaterialProps} />
            </mesh>
        ))}

        {/* Long Rails */}
        {[1, -1].map((y, i) => (
             <React.Fragment key={i}>
                 <mesh position={[0, y * (height/2 - 0.15), depth/2 - 0.15]} castShadow receiveShadow>
                    <boxGeometry args={[width - 0.6, 0.3, 0.3]} />
                    <meshStandardMaterial {...frameMaterialProps} />
                 </mesh>
                 <mesh position={[0, y * (height/2 - 0.15), -depth/2 + 0.15]} castShadow receiveShadow>
                    <boxGeometry args={[width - 0.6, 0.3, 0.3]} />
                    <meshStandardMaterial {...frameMaterialProps} />
                 </mesh>
             </React.Fragment>
        ))}
         
         {/* Short Rails */}
         {[1, -1].map((y, i) => (
             <React.Fragment key={i}>
                 <mesh position={[width/2 - 0.15, y * (height/2 - 0.15), 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.3, depth - 0.6]} />
                    <meshStandardMaterial {...frameMaterialProps} />
                 </mesh>
                 <mesh position={[-width/2 + 0.15, y * (height/2 - 0.15), 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.3, depth - 0.6]} />
                    <meshStandardMaterial {...frameMaterialProps} />
                 </mesh>
             </React.Fragment>
        ))}
      </group>

      {/* --- WALLS --- */}
      <mesh position={[0, -height / 2 + 0.2, 0]} receiveShadow>
        <boxGeometry args={[width - 0.4, 0.1, depth - 0.4]} />
        <meshStandardMaterial 
            color={config.floorMaterial === 'wood' ? '#d4a373' : config.floorMaterial === 'tile' ? '#e5e7eb' : '#9ca3af'} 
            roughness={config.floorMaterial === 'tile' ? 0.2 : 0.6}
            metalness={0.1}
        />
      </mesh>

      <group position={[0, height / 2 - 0.15, 0]} visible={showRoof}>
          <mesh rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
               <boxGeometry args={[width-0.6, depth-0.6, 0.05]} />
               <meshStandardMaterial {...wallMaterialProps} />
          </mesh>
           {Array.from({ length: 38 }).map((_, i) => (
               <mesh key={i} position={[-width/2 + 0.5 + i * 0.28, 0.05, 0]} castShadow>
                   <boxGeometry args={[0.14, 0.05, depth-0.6]} />
                   <meshStandardMaterial {...wallMaterialProps} />
               </mesh>
           ))}
      </group>

      <group position={[0, 0, -depth/2 + 0.1]}>
           <CorrugatedPanel width={width - 0.6} height={height - 0.6} depth={0.05} />
      </group>
      
      <group position={[-width/2 + 0.1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
            <CorrugatedPanel width={depth - 0.6} height={height - 0.6} depth={0.05} />
      </group>
      
      <group position={[width/2 - 0.1, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
            <CorrugatedPanel width={depth - 0.6} height={height - 0.6} depth={0.05} />
      </group>

      {/* Front Facade */}
      <group position={[0, 0, depth/2 - 0.1]}>
          {config.windowType === 'standard' ? (
            <group>
                <group position={[-4.2, 0, 0]}><CorrugatedPanel width={3.1} height={height-0.6} depth={0.05} /></group>
                <group position={[0, 0, 0]}><CorrugatedPanel width={2} height={height-0.6} depth={0.05} /></group>
                <group position={[4.2, 0, 0]}><CorrugatedPanel width={3.1} height={height-0.6} depth={0.05} /></group>

                {[-1.6, 1.6].map((x, i) => (
                    <group key={i} position={[x, 0, 0]}>
                        <mesh castShadow receiveShadow><boxGeometry args={[2.1, 2.3, 0.15]} /><meshStandardMaterial color="#333" /></mesh>
                        <mesh><planeGeometry args={[1.9, 2.1]} /><meshPhysicalMaterial {...glassMaterialProps} /></mesh>
                        <mesh position={[0, 1.4, 0]}><boxGeometry args={[2.1, 0.5, 0.05]} /><meshStandardMaterial {...wallMaterialProps} /></mesh>
                        <mesh position={[0, -1.4, 0]}><boxGeometry args={[2.1, 0.5, 0.05]} /><meshStandardMaterial {...wallMaterialProps} /></mesh>
                    </group>
                ))}
            </group>
          ) : (
            <group>
                <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[width - 0.7, height - 0.7, 0.15]} /><meshStandardMaterial color="#111" /></mesh>
                <mesh position={[0, 0, 0.01]}><planeGeometry args={[width - 1, height - 1]} /><meshPhysicalMaterial {...glassMaterialProps} /></mesh>
            </group>
          )}
      </group>

      {/* --- INTERIOR --- */}

      {config.hasKitchen && (
        <group position={[-width / 2 + 1.5, -height / 2 + 0.1, -depth / 2 + 0.6]}>
          {/* Toe Kick */}
          <mesh position={[0, 0.05, -0.05]} castShadow>
              <boxGeometry args={[2, 0.1, 0.5]} />
              <meshStandardMaterial color="#111" />
          </mesh>
          {/* Main Cabinets */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.8, 0.6]} />
            <meshStandardMaterial color="#1f2937" roughness={0.2} />
          </mesh>
          {/* Cabinet Door Splits */}
          <mesh position={[0, 0.5, 0.31]}>
             <boxGeometry args={[0.01, 0.75, 0.01]} />
             <meshStandardMaterial color="#000" />
          </mesh>
           <mesh position={[-0.66, 0.5, 0.31]}>
             <boxGeometry args={[0.01, 0.75, 0.01]} />
             <meshStandardMaterial color="#000" />
          </mesh>
           <mesh position={[0.66, 0.5, 0.31]}>
             <boxGeometry args={[0.01, 0.75, 0.01]} />
             <meshStandardMaterial color="#000" />
          </mesh>

          {/* Countertop */}
          <mesh position={[0, 0.92, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 0.04, 0.64]} />
            <meshStandardMaterial color="#f9fafb" roughness={0.1} metalness={0.1} />
          </mesh>

          {/* Sink Area */}
          <group position={[0.5, 0.94, 0.1]}>
              {/* Basin Visual (Dark Grey) */}
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2,0,0]}>
                  <planeGeometry args={[0.5, 0.35]} />
                  <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
              </mesh>
              {/* High Arc Faucet */}
              <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]}>
                 <torusGeometry args={[0.12, 0.015, 16, 16, Math.PI]} />
                 <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0.12, -0.05, -0.2]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.1]} />
                  <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
              </mesh>
          </group>

           {/* Cooktop */}
           <group position={[-0.5, 0.95, 0.1]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.6, 0.4]} />
                  <meshStandardMaterial color="#111" roughness={0.1} metalness={0.2} />
              </mesh>
              {/* Burners */}
              {[[-0.15, 0.1], [0.15, -0.1], [-0.15, -0.1], [0.15, 0.1]].map(([x, y], i) => (
                  <mesh key={i} position={[x, 0.01, y]} rotation={[-Math.PI/2, 0, 0]}>
                      <ringGeometry args={[0.05, 0.06, 32]} />
                      <meshStandardMaterial color="#666" />
                  </mesh>
              ))}
           </group>

          {/* Upper Floating Shelves */}
          <group position={[0, 1.6, -0.1]}>
               <mesh castShadow>
                   <boxGeometry args={[2, 0.05, 0.25]} />
                   <meshStandardMaterial color="#d4a373" roughness={0.8} />
               </mesh>
               {/* Decor items */}
               <mesh position={[-0.6, 0.1, 0]} castShadow>
                   <cylinderGeometry args={[0.06, 0.06, 0.15]} />
                   <meshStandardMaterial color="#fff" />
               </mesh>
               <mesh position={[-0.4, 0.08, 0]} castShadow>
                   <cylinderGeometry args={[0.05, 0.04, 0.12]} />
                   <meshStandardMaterial color="#818cf8" />
               </mesh>
          </group>
           <group position={[0, 1.9, -0.1]}>
               <mesh castShadow>
                   <boxGeometry args={[2, 0.05, 0.25]} />
                   <meshStandardMaterial color="#d4a373" roughness={0.8} />
               </mesh>
          </group>
        </group>
      )}

      {config.tableType !== 'none' && (
        <group position={[2, -height / 2 + 0.1, 0]}>
          {config.tableType === 'small' ? (
             <group>
                {/* Bistro Table */}
                {/* Base */}
                <mesh position={[0, 0.02, 0]} castShadow>
                   <cylinderGeometry args={[0.25, 0.3, 0.05]} />
                   <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
                </mesh>
                {/* Column */}
                <mesh position={[0, 0.35, 0]} castShadow>
                   <cylinderGeometry args={[0.04, 0.04, 0.7]} />
                   <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
                </mesh>
                {/* Top */}
                <mesh position={[0, 0.72, 0]} castShadow>
                    <cylinderGeometry args={[0.45, 0.45, 0.04]} />
                    <meshStandardMaterial color="#fff" roughness={0.2} />
                </mesh>
                
                {/* 2 Chairs */}
                <ModernChair position={[0.7, 0, 0]} rotation={[0, -Math.PI/2, 0]} />
                <ModernChair position={[-0.7, 0, 0]} rotation={[0, Math.PI/2, 0]} />
             </group>
          ) : (
            <group>
                {/* Industrial Table */}
                {/* Top */}
                <mesh position={[0, 0.75, 0]} castShadow>
                    <boxGeometry args={[1.8, 0.06, 0.9]} />
                    <meshStandardMaterial color="#854d0e" roughness={0.7} map={null} />
                </mesh>
                 {/* Metal Legs (Loop style) */}
                {[-0.7, 0.7].map((x, i) => (
                    <group key={i} position={[x, 0.37, 0]}>
                         {/* Side pillars */}
                         <mesh position={[0, 0, 0.3]}>
                            <boxGeometry args={[0.1, 0.74, 0.05]} />
                            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.5} />
                         </mesh>
                         <mesh position={[0, 0, -0.3]}>
                            <boxGeometry args={[0.1, 0.74, 0.05]} />
                            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.5} />
                         </mesh>
                         {/* Bottom connector */}
                         <mesh position={[0, -0.35, 0]}>
                            <boxGeometry args={[0.1, 0.05, 0.65]} />
                            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.5} />
                         </mesh>
                    </group>
                ))}

                {/* 4 Chairs */}
                {[
                    { pos: [0, 0, -0.7], rot: 0 },
                    { pos: [0, 0, 0.7], rot: Math.PI },
                    { pos: [-0.9, 0, 0], rot: -Math.PI/2 },
                    { pos: [0.9, 0, 0], rot: Math.PI/2 },
                ].map((chair, i) => (
                    <ModernChair key={i} position={chair.pos as any} rotation={[0, chair.rot, 0]} />
                ))}
            </group>
          )}
        </group>
      )}

      {/* --- EXTRAS --- */}
      
      {/* Hide solar panels in Step 1 (Interior) so they don't block the view */}
      {config.solarPanels && currentStepIndex !== 1 && (
        <group position={[0, height / 2 + 0.15, 0]}>
             {/* Racking System */}
             <mesh position={[0, 0.02, 0.5]}>
                <boxGeometry args={[8, 0.05, 0.1]} />
                <meshStandardMaterial color="#888" />
             </mesh>
             <mesh position={[0, 0.02, -0.5]}>
                <boxGeometry args={[8, 0.05, 0.1]} />
                <meshStandardMaterial color="#888" />
             </mesh>

             {/* Panels */}
             {[-2.5, 0, 2.5].map((x) => (
                <group key={x} position={[x, 0.1, 0]} rotation={[-0.1, 0, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[2.2, 0.05, 1.4]} />
                        <meshStandardMaterial color="#ccc" />
                    </mesh>
                    <mesh position={[0, 0.03, 0]}>
                         <boxGeometry args={[2.1, 0.01, 1.3]} />
                         <meshStandardMaterial color="#000" roughness={0.2} metalness={0.8} />
                    </mesh>
                     <mesh position={[0, 0.035, 0]}>
                        <boxGeometry args={[2.1, 0.001, 0.02]} />
                        <meshStandardMaterial color="#333" />
                     </mesh>
                </group>
             ))}
        </group>
      )}

      {config.acUnit && (
        <group position={[-width / 2 - 0.5, -height/2 + 0.8, 0]}>
             <mesh position={[0.3, -0.4, 0]} castShadow>
                <boxGeometry args={[0.4, 0.1, 1]} />
                <meshStandardMaterial color="#444" />
             </mesh>
             <mesh castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.8, 1]} />
                <meshStandardMaterial color="#f3f4f6" />
             </mesh>
             <mesh position={[-0.26, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
                <circleGeometry args={[0.35, 32]} />
                <meshStandardMaterial color="#222" transparent opacity={0.9} />
             </mesh>
        </group>
      )}

    </group>
  );
};

export default CapsuleModel;