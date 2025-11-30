import React from 'react';
import { useConfigStore } from '../store';
import { VARIANT_DIMENSIONS } from '../constants';
import { DoubleSide } from 'three';

const CapsuleModel: React.FC = () => {
  const config = useConfigStore((state) => state.config);
  const currentStepIndex = useConfigStore((state) => state.currentStepIndex);

  // Dimensions determined by variant
  const { width, height } = VARIANT_DIMENSIONS[config.capsuleVariant];
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
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1,
    transmission: 0.95,
    thickness: 0.05, // Physical thickness for refraction
    ior: 1.5,
  };

  const blackMetalProps = {
    color: "#1a1a1a",
    roughness: 0.2,
    metalness: 0.8
  };

  // --- REUSABLE COMPONENTS ---

  const CorrugatedPanel: React.FC<{ width: number, height: number, depth: number, horizontal?: boolean }> = ({ width, height, depth, horizontal = false }) => {
    // Prevent negative dimensions
    const w = Math.max(0.01, width);
    const h = Math.max(0.01, height);
    
    const ribCount = Math.floor((horizontal ? h : w) / 0.3);
    const ribWidth = 0.15;
    const ribDepth = 0.08;
    
    return (
      <group>
        <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, depth]} />
            <meshStandardMaterial {...wallMaterialProps} />
        </mesh>
        {w > 0.3 && Array.from({ length: ribCount }).map((_, i) => {
            const offset = (i - ribCount / 2) * 0.3 + 0.15;
            const x = horizontal ? 0 : offset;
            const y = horizontal ? offset : 0;
            return (
                <mesh key={i} position={[x, y, horizontal ? depth/2 + ribDepth/2 : depth/2 + ribDepth/2]} castShadow receiveShadow>
                     <boxGeometry args={[horizontal ? w : ribWidth, horizontal ? ribWidth : h, ribDepth]} />
                     <meshStandardMaterial {...wallMaterialProps} color={config.wallColor} />
                </mesh>
            )
        })}
      </group>
    );
  };

  const WindowFrame: React.FC<{ width: number; height: number; type?: 'fixed' | 'sliding' | 'panoramic' }> = ({ width, height, type = 'fixed' }) => {
    const frameThickness = 0.1;
    const frameDepth = 0.2;
    const glassThickness = 0.02;

    return (
      <group>
        {/* Outer Frame */}
        {/* Top */}
        <mesh position={[0, height/2 - frameThickness/2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, frameThickness, frameDepth]} />
            <meshStandardMaterial {...blackMetalProps} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -height/2 + frameThickness/2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, frameThickness, frameDepth]} />
            <meshStandardMaterial {...blackMetalProps} />
        </mesh>
        {/* Left */}
        <mesh position={[-width/2 + frameThickness/2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[frameThickness, height - frameThickness*2, frameDepth]} />
            <meshStandardMaterial {...blackMetalProps} />
        </mesh>
        {/* Right */}
        <mesh position={[width/2 - frameThickness/2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[frameThickness, height - frameThickness*2, frameDepth]} />
            <meshStandardMaterial {...blackMetalProps} />
        </mesh>

        {/* Vertical Dividers / Mullions */}
        {type === 'sliding' && (
             <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.08, height - frameThickness*2, frameDepth * 0.9]} />
                <meshStandardMaterial {...blackMetalProps} />
            </mesh>
        )}
        
        {type === 'panoramic' && (
            // Add mullions every 2 meters
            Array.from({ length: Math.floor(width / 2) }).map((_, i, arr) => {
                const offset = (i + 1) * (width / (arr.length + 1)) - width/2;
                return (
                    <mesh key={i} position={[offset, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.08, height - frameThickness*2, frameDepth * 0.9]} />
                        <meshStandardMaterial {...blackMetalProps} />
                    </mesh>
                )
            })
        )}

        {/* Glass Volume */}
        <mesh position={[0, 0, 0]} castShadow={false} receiveShadow>
            <boxGeometry args={[width - frameThickness*2, height - frameThickness*2, glassThickness]} />
            <meshPhysicalMaterial {...glassMaterialProps} />
        </mesh>
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

  // --- FACADE RENDERER HELPER ---
  const renderFacade = () => {
    // Structural constraints
    const innerWidth = width - 0.3; // Total width between corner posts
    const wallHeight = height - 0.6; // Vertical space between rails
    const postOffset = 0.15; // Width of one post/2
    
    // Bounds
    const leftBound = -width / 2 + postOffset;
    const rightBound = width / 2 - postOffset;

    if (config.windowType === 'panoramic') {
        return <WindowFrame width={innerWidth} height={height - 0.4} type="panoramic" />;
    }

    if (config.capsuleVariant === 'nano') {
        // NANO LAYOUT: 1 Door (width 2.5) centered around x=1.0 to leave room for kitchen
        const doorWidth = 2.5;
        const doorCenter = 1.0;
        const doorLeft = doorCenter - doorWidth / 2;
        const doorRight = doorCenter + doorWidth / 2;

        // Calculate Wall Segments
        const leftWallWidth = doorLeft - leftBound;
        const leftWallCenter = leftBound + leftWallWidth / 2;

        const rightWallWidth = rightBound - doorRight;
        const rightWallCenter = doorRight + rightWallWidth / 2;

        return (
            <group>
                {/* Left Wall */}
                {leftWallWidth > 0 && (
                    <group position={[leftWallCenter, 0, 0]}>
                        <CorrugatedPanel width={leftWallWidth} height={wallHeight} depth={0.05} />
                    </group>
                )}
                {/* Door */}
                <group position={[doorCenter, 0, 0]}>
                    <WindowFrame width={doorWidth} height={height - 0.4} type="sliding" />
                </group>
                {/* Right Wall */}
                {rightWallWidth > 0 && (
                    <group position={[rightWallCenter, 0, 0]}>
                        <CorrugatedPanel width={rightWallWidth} height={wallHeight} depth={0.05} />
                    </group>
                )}
            </group>
        );
    } else {
        // STANDARD / MAX LAYOUT: Window (Left) + Door (Right)
        // Let's place them symmetrically
        const unitWidth = 2.5;
        const windowCenter = -width / 4;
        const doorCenter = width / 4;

        // Edges
        const windowLeft = windowCenter - unitWidth / 2;
        const windowRight = windowCenter + unitWidth / 2;
        const doorLeft = doorCenter - unitWidth / 2;
        const doorRight = doorCenter + unitWidth / 2;

        // Wall 1: Far Left (Post to Window)
        const w1Width = windowLeft - leftBound;
        const w1Center = leftBound + w1Width / 2;

        // Wall 2: Center (Window to Door)
        const w2Width = doorLeft - windowRight;
        const w2Center = windowRight + w2Width / 2;

        // Wall 3: Far Right (Door to Post)
        const w3Width = rightBound - doorRight;
        const w3Center = doorRight + w3Width / 2;

        return (
            <group>
                {/* Far Left Wall */}
                {w1Width > 0 && (
                     <group position={[w1Center, 0, 0]}>
                        <CorrugatedPanel width={w1Width} height={wallHeight} depth={0.05} />
                    </group>
                )}
                {/* Window */}
                <group position={[windowCenter, 0, 0]}>
                     <WindowFrame width={unitWidth} height={height - 0.4} type="sliding" />
                </group>
                {/* Center Wall */}
                {w2Width > 0 && (
                     <group position={[w2Center, 0, 0]}>
                        <CorrugatedPanel width={w2Width} height={wallHeight} depth={0.05} />
                    </group>
                )}
                {/* Door */}
                <group position={[doorCenter, 0, 0]}>
                     <WindowFrame width={unitWidth} height={height - 0.4} type="sliding" />
                </group>
                {/* Far Right Wall */}
                {w3Width > 0 && (
                     <group position={[w3Center, 0, 0]}>
                        <CorrugatedPanel width={w3Width} height={wallHeight} depth={0.05} />
                    </group>
                )}
            </group>
        );
    }
  };

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

      {/* --- FLOORS & CEILINGS --- */}
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
      </group>

      {/* --- REAR & SIDE WALLS --- */}
      <group position={[0, 0, -depth/2 + 0.1]}>
           <CorrugatedPanel width={width - 0.6} height={height - 0.6} depth={0.05} />
      </group>
      
      <group position={[-width/2 + 0.1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
            <CorrugatedPanel width={depth - 0.6} height={height - 0.6} depth={0.05} />
      </group>
      
      <group position={[width/2 - 0.1, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
            <CorrugatedPanel width={depth - 0.6} height={height - 0.6} depth={0.05} />
      </group>

      {/* --- FRONT FACADE --- */}
      <group position={[0, 0, depth/2 - 0.1]}>
         {renderFacade()}
      </group>

      {/* --- INTERIOR --- */}

      {config.hasKitchen && (
        // Position relative to left wall
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
        // Position on the right side. For Nano, squeeze it closer to center.
        <group position={[config.capsuleVariant === 'nano' ? 1.5 : 2.5, -height / 2 + 0.1, 0]}>
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
      
      {config.solarPanels && currentStepIndex !== 1 && (
        <group position={[0, height / 2 + 0.15, 0]}>
             {/* Racking System */}
             <mesh position={[0, 0.02, 0.5]}>
                <boxGeometry args={[width - 3, 0.05, 0.1]} />
                <meshStandardMaterial color="#888" />
             </mesh>
             <mesh position={[0, 0.02, -0.5]}>
                <boxGeometry args={[width - 3, 0.05, 0.1]} />
                <meshStandardMaterial color="#888" />
             </mesh>

             {/* Panels */}
             {[-width/4, 0, width/4].map((x, i) => (
                <group key={i} position={[x, 0.1, 0]} rotation={[-0.1, 0, 0]}>
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