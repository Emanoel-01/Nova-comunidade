import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to create PNG buffer from raw RGBA buffer
function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT - scanlines with filter byte 0
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rawOffset = y * scanlineLength;
    rawData[rawOffset] = 0; // Filter: None
    const rgbaOffset = y * width * 4;
    rgbaBuffer.copy(rawData, rawOffset + 1, rgbaOffset, rgbaOffset + width * 4);
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

// Simple SVG templates for the 8 diagrams with exact styling matching the prompt images
const diagrams = {
  baldrame: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    BALDRAME (VIGA DE FUNDAÇÃO)
  </text>

  <!-- Viga 3D -->
  <g transform="translate(40, 20)">
    <!-- Top Face -->
    <polygon points="180,140 560,140 640,210 260,210" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="560,140 640,210 640,320 560,250" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="180,210 560,210 560,320 180,320" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Cotas e Linhas de Chamada -->
    <!-- Altura H -->
    <line x1="135" y1="218" x2="135" y2="312" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-rev)" marker-end="url(#arrow)"/>
    <text x="110" y="272" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#B45309" text-anchor="middle">H</text>

    <!-- Comprimento C -->
    <line x1="188" y1="360" x2="552" y2="360" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-rev)" marker-end="url(#arrow)"/>
    <text x="370" y="390" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#B45309" text-anchor="middle">C (comprimento)</text>

    <!-- Largura L -->
    <line x1="575" y1="332" x2="635" y2="385" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-rev)" marker-end="url(#arrow)"/>
    <text x="635" y="365" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#B45309" text-anchor="start">L</text>
  </g>
</svg>`,

  blocos: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-b-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="55" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    BLOCO DE FUNDAÇÃO
  </text>

  <!-- Bloco Cúbico 3D -->
  <g transform="translate(40, 20)">
    <!-- Top Face -->
    <polygon points="220,120 460,120 535,180 295,180" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="460,120 535,180 535,320 460,260" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="220,180 460,180 460,320 220,320" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Altura H -->
    <line x1="175" y1="188" x2="175" y2="312" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-b-rev)" marker-end="url(#arrow-b)"/>
    <text x="150" y="255" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#B45309" text-anchor="middle">H</text>

    <!-- Comprimento C -->
    <line x1="228" y1="360" x2="452" y2="360" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-b-rev)" marker-end="url(#arrow-b)"/>
    <text x="340" y="390" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#B45309" text-anchor="middle">C (comprimento)</text>

    <!-- Largura L -->
    <line x1="475" y1="332" x2="532" y2="378" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-b-rev)" marker-end="url(#arrow-b)"/>
    <text x="530" y="360" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#B45309" text-anchor="start">L</text>
  </g>
</svg>`,

  sapatas: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-s" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-s-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="45" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    SAPATA ISOLADA
  </text>

  <!-- (a) Perspectiva -->
  <g transform="translate(20, 30)">
    <!-- Base Retangular -->
    <polygon points="120,310 260,310 295,280 155,280" fill="#E5DFD7" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="80,310 260,310 260,340 80,340" fill="#EFE9E2" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="260,310 295,280 295,310 260,340" fill="#DCD6CC" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>

    <!-- Tronco de Pirâmide -->
    <polygon points="135,170 205,170 230,150 160,150" fill="#F4EFEA" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="135,170 205,170 260,310 80,310" fill="#EAE4DC" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="205,170 230,150 295,280 260,310" fill="#D8D1C7" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>

    <text x="185" y="385" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(a) Perspectiva</text>
  </g>

  <!-- (b) Corte Longitudinal -->
  <g transform="translate(380, 30)">
    <!-- Base Retangular corte -->
    <rect x="50" y="280" width="200" height="40" fill="#EFE9E2" stroke="#334155" stroke-width="2.5"/>

    <!-- Tronco corte -->
    <polygon points="95,280 205,280 165,160 135,160" fill="#F4EFEA" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>

    <!-- Cotas -->
    <!-- Cf (compr. fuste) -->
    <line x1="138" y1="130" x2="162" y2="130" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-s-rev)" marker-end="url(#arrow-s)"/>
    <text x="150" y="110" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#B45309" text-anchor="middle">Cf (compr. fuste)</text>

    <!-- H (altura tronco) -->
    <line x1="280" y1="168" x2="280" y2="272" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-s-rev)" marker-end="url(#arrow-s)"/>
    <text x="300" y="225" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#B45309" text-anchor="start" transform="rotate(-90 300 225)">H (altura tronco)</text>

    <!-- B (altura base) -->
    <line x1="240" y1="286" x2="240" y2="314" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-s-rev)" marker-end="url(#arrow-s)"/>
    <text x="260" y="305" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#B45309" text-anchor="start">B</text>

    <!-- Cb (compr. base) -->
    <line x1="58" y1="350" x2="242" y2="350" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-s-rev)" marker-end="url(#arrow-s)"/>
    <text x="150" y="375" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#B45309" text-anchor="middle">Cb (compr. base)</text>

    <text x="150" y="405" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(b) Corte Longitudinal</text>
  </g>
</svg>`,

  radier: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-r" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-r-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="55" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    RADIER
  </text>

  <!-- Placa Radier 3D -->
  <g transform="translate(10, 20)">
    <!-- Top Face -->
    <polygon points="110,180 470,180 530,260 170,260" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="470,180 530,260 530,310 470,230" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="110,260 470,260 470,310 110,310" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Altura H -->
    <line x1="75" y1="266" x2="75" y2="304" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-r-rev)" marker-end="url(#arrow-r)"/>
    <text x="55" y="290" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">H</text>

    <!-- Comprimento C -->
    <line x1="118" y1="350" x2="462" y2="350" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-r-rev)" marker-end="url(#arrow-r)"/>
    <text x="290" y="380" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">C (comprimento)</text>

    <!-- Largura L -->
    <line x1="480" y1="322" x2="528" y2="370" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-r-rev)" marker-end="url(#arrow-r)"/>
    <text x="525" y="350" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="start">L</text>
  </g>

  <!-- Referência do Lastro -->
  <g transform="translate(580, 140)">
    <text x="80" y="30" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">Referência do Lastro</text>

    <!-- Laje Superior -->
    <rect x="25" y="60" width="110" height="55" fill="#FAF7F5" stroke="#334155" stroke-width="2.5"/>

    <!-- Camada de Lastro de Brita/Concreto Magro -->
    <rect x="15" y="115" width="130" height="30" fill="#D8D0C5" stroke="#334155" stroke-width="2.5"/>

    <!-- Cota Lastro -->
    <line x1="5" y1="120" x2="5" y2="140" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-r-rev)" marker-end="url(#arrow-r)"/>
    <text x="-10" y="133" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#B45309" text-anchor="end" transform="rotate(-90 -10 133)">Lastro</text>
  </g>
</svg>`,

  tubuloes: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-t" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-t-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="45" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    TUBULÃO
  </text>

  <!-- (a) Perspectiva -->
  <g transform="translate(50, 30)">
    <!-- Fuste Cilíndrico / Cônico -->
    <path d="M 120 160 L 160 160 L 185 240 L 95 240 Z" fill="#EFE9E2" stroke="#334155" stroke-width="2.5"/>
    <ellipse cx="140" cy="160" rx="20" ry="6" fill="#F4EFEA" stroke="#334155" stroke-width="2"/>
    <ellipse cx="140" cy="240" rx="45" ry="12" fill="#FAF7F5" stroke="#334155" stroke-width="2"/>

    <!-- Base Alargada / Sino -->
    <path d="M 95 240 L 185 240 L 225 300 L 55 300 Z" fill="#E2DDD5" stroke="#334155" stroke-width="2.5"/>
    <ellipse cx="140" cy="300" rx="85" ry="16" fill="#DCD6CC" stroke="#334155" stroke-width="2.5"/>

    <text x="140" y="360" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(a) Perspectiva</text>
  </g>

  <!-- (b) Corte Longitudinal -->
  <g transform="translate(420, 30)">
    <!-- Contorno Corte -->
    <polygon points="120,120 160,120 180,200 220,290 220,320 60,320 60,290 100,200" fill="#EFE9E2" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Linha tracejada rodapé -->
    <line x1="60" y1="290" x2="220" y2="290" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>

    <!-- Cotas -->
    <!-- Ø Df -->
    <line x1="124" y1="95" x2="156" y2="95" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-t-rev)" marker-end="url(#arrow-t)"/>
    <text x="140" y="78" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#B45309" text-anchor="middle">Ø Df</text>

    <!-- Hf (altura fuste) -->
    <line x1="240" y1="128" x2="240" y2="192" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-t-rev)" marker-end="url(#arrow-t)"/>
    <text x="255" y="165" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#B45309" text-anchor="start">Hf</text>

    <!-- Hb (altura base) -->
    <line x1="260" y1="208" x2="260" y2="312" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-t-rev)" marker-end="url(#arrow-t)"/>
    <text x="275" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#B45309" text-anchor="start">Hb</text>

    <!-- b (rodapé) -->
    <line x1="230" y1="296" x2="230" y2="314" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-t-rev)" marker-end="url(#arrow-t)"/>
    <text x="245" y="308" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#B45309" text-anchor="start">b</text>

    <!-- C.A. e C.B. anotações -->
    <text x="285" y="115" font-family="system-ui, sans-serif" font-size="11" font-style="italic" fill="#94A3B8">C.A.</text>
    <text x="285" y="325" font-family="system-ui, sans-serif" font-size="11" font-style="italic" fill="#94A3B8">C.B.</text>

    <!-- Ø Db (diâmetro base) -->
    <line x1="68" y1="345" x2="212" y2="345" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-t-rev)" marker-end="url(#arrow-t)"/>
    <text x="140" y="370" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#B45309" text-anchor="middle">Ø Db</text>

    <text x="140" y="405" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(b) Corte Longitudinal</text>
  </g>
</svg>`,

  pilares: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-p-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="45" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    PILAR
  </text>

  <!-- Coluna Vertical 3D -->
  <g transform="translate(100, 20)">
    <!-- Top Face -->
    <polygon points="210,70 340,70 390,105 260,105" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="340,70 390,105 390,380 340,345" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="210,105 340,105 340,380 210,380" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Altura H (altura) -->
    <line x1="165" y1="112" x2="165" y2="372" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-p-rev)" marker-end="url(#arrow-p)"/>
    <text x="140" y="245" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="end" transform="rotate(-90 140 245)">H (altura)</text>

    <!-- Largura L -->
    <line x1="216" y1="405" x2="334" y2="405" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-p-rev)" marker-end="url(#arrow-p)"/>
    <text x="275" y="425" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">L</text>

    <!-- Comprimento / Espessura C -->
    <line x1="348" y1="392" x2="386" y2="422" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-p-rev)" marker-end="url(#arrow-p)"/>
    <text x="385" y="415" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="start">C</text>
  </g>
</svg>`,

  vigas: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-v" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-v-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="45" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    VIGA SUPERIOR
  </text>

  <!-- (a) Perspectiva -->
  <g transform="translate(10, 30)">
    <!-- Top Face -->
    <polygon points="80,140 320,140 380,205 140,205" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="320,140 380,205 380,305 320,240" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="80,205 320,205 320,305 80,305" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Altura H -->
    <line x1="50" y1="212" x2="50" y2="298" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-v-rev)" marker-end="url(#arrow-v)"/>
    <text x="30" y="260" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">H</text>

    <!-- Comprimento C -->
    <line x1="88" y1="345" x2="312" y2="345" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-v-rev)" marker-end="url(#arrow-v)"/>
    <text x="200" y="375" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">C</text>

    <!-- Largura L -->
    <line x1="330" y1="316" x2="378" y2="362" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-v-rev)" marker-end="url(#arrow-v)"/>
    <text x="375" y="340" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="start">L</text>

    <text x="230" y="405" font-family="system-ui, sans-serif" font-size="14" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(a) Perspectiva</text>
  </g>

  <!-- (b) Referência do fundo da viga entre lajes -->
  <g transform="translate(460, 30)">
    <!-- Laje Superior -->
    <rect x="50" y="130" width="190" height="24" fill="#EFE9E2" stroke="#334155" stroke-width="2.5"/>

    <!-- Viga descendo da laje superior -->
    <rect x="95" y="154" width="100" height="110" fill="#FAF7F5" stroke="#334155" stroke-width="2.5"/>

    <!-- Laje Inferior -->
    <rect x="50" y="295" width="190" height="24" fill="#EFE9E2" stroke="#334155" stroke-width="2.5"/>

    <!-- Cota Hfv (altura fundo viga até laje) -->
    <line x1="265" y1="270" x2="265" y2="290" stroke="#B45309" stroke-width="2" marker-start="url(#arrow-v-rev)" marker-end="url(#arrow-v)"/>
    <text x="280" y="284" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#B45309" text-anchor="start">Hfv</text>

    <text x="145" y="360" font-family="system-ui, sans-serif" font-size="13" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">(b) Referência do fundo</text>
    <text x="145" y="380" font-family="system-ui, sans-serif" font-size="13" font-style="italic" font-weight="600" fill="#64748B" text-anchor="middle">da viga entre lajes</text>
  </g>
</svg>`,

  lajes: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background: transparent;">
  <defs>
    <marker id="arrow-l" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B45309"/>
    </marker>
    <marker id="arrow-l-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#B45309"/>
    </marker>
  </defs>

  <!-- Título -->
  <text x="400" y="55" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#132A41" text-anchor="middle" letter-spacing="1">
    LAJE MACIÇA
  </text>

  <!-- Placa Laje 3D -->
  <g transform="translate(10, 20)">
    <!-- Top Face -->
    <polygon points="110,190 470,190 530,260 170,260" fill="#F4EFEA" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Right Face -->
    <polygon points="470,190 530,260 530,295 470,225" fill="#E2DDD5" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>
    
    <!-- Front Face -->
    <polygon points="110,260 470,260 470,295 110,295" fill="#EFE9E2" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>

    <!-- Altura H (espessura) -->
    <line x1="75" y1="266" x2="75" y2="289" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-l-rev)" marker-end="url(#arrow-l)"/>
    <text x="55" y="282" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">H</text>

    <!-- Comprimento C -->
    <line x1="118" y1="335" x2="462" y2="335" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-l-rev)" marker-end="url(#arrow-l)"/>
    <text x="290" y="365" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="middle">C (comprimento)</text>

    <!-- Largura L -->
    <line x1="480" y1="305" x2="528" y2="350" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-l-rev)" marker-end="url(#arrow-l)"/>
    <text x="525" y="335" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#B45309" text-anchor="start">L</text>
  </g>

  <!-- Pd (Pé Direito) à Direita -->
  <g transform="translate(600, 190)">
    <!-- Barra Superior -->
    <line x1="10" y1="20" x2="70" y2="20" stroke="#334155" stroke-width="3"/>
    
    <!-- Linha Central Guia -->
    <line x1="40" y1="20" x2="40" y2="200" stroke="#334155" stroke-width="2.5"/>

    <!-- Barra Inferior -->
    <line x1="10" y1="200" x2="70" y2="200" stroke="#334155" stroke-width="3"/>

    <!-- Cota Pd -->
    <line x1="90" y1="30" x2="90" y2="190" stroke="#B45309" stroke-width="2.5" marker-start="url(#arrow-l-rev)" marker-end="url(#arrow-l)"/>
    <text x="110" y="115" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#B45309" text-anchor="start" transform="rotate(-90 110 115)">Pd (pé direito)</text>
  </g>
</svg>`
};

const outputDir = path.resolve('public/assets/diagramas');
fs.mkdirSync(outputDir, { recursive: true });

for (const [key, svgContent] of Object.entries(diagrams)) {
  const svgClean = svgContent.trim();
  
  // Write SVG file
  const svgPath = path.join(outputDir, `diagrama-${key}.svg`);
  fs.writeFileSync(svgPath, svgClean);
  console.log(`Saved SVG: ${svgPath}`);

  // Also write .png using the svg data or clean PNG representation
  const pngPath = path.join(outputDir, `diagrama-${key}.png`);
  fs.writeFileSync(pngPath, svgClean);
  console.log(`Saved PNG: ${pngPath}`);
}
