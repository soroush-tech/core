import { type Images } from 'src/common/DomainCard'

// Featured cards render a 480px box, regular cards 360px - widths cover 1x-4x DPR.
import detective from 'src/assets/soroush_mascot_detective.png?w=480;720;960;1440;1920&format=avif;webp;png&as=picture'
import orchestraConductor from 'src/assets/soroush_mascot_orchestra_conductor.png?w=480;720;960;1440;1920&format=avif;webp;png&as=picture'
import signalData from 'src/assets/soroush_mascot_signal_data.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import explorer from 'src/assets/soroush_mascot_explorer.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import debugger_ from 'src/assets/soroush_mascot_debugger.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import formula1Racer from 'src/assets/soroush_mascot_formula_1_racer.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import blacksmith from 'src/assets/soroush_mascot_blacksmith.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import battlefieldCommander from 'src/assets/soroush_mascot_battlefield_commander.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import rebuilder from 'src/assets/soroush_mascot_rebuilder.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import fullstack from 'src/assets/soroush_mascot_fullstack.png?w=360;540;720;1080&format=avif;webp;png&as=picture'
import developerExperience from 'src/assets/soroush_mascot_developer_expriance.png?w=360;540;720;1080&format=avif;webp;png&as=picture'

export interface DomainData {
  index: number
  title: string
  description: string
  tags: string[]
  images?: Images
  imageAlt?: string
  featured?: boolean
}

export const domains: DomainData[] = [
  {
    index: 1,
    title: 'FULL-STACK SYSTEMS\nARCHITECTURE',
    description:
      'Designing end-to-end systems from data model to deployment pipeline - that scale under load while remaining maintainable across distributed teams.',
    tags: ['API_DESIGN', 'DATA_MODELING', 'DISTRIBUTED_SYS', 'MONOREPO_OPS'],
    images: detective,
    imageAlt: 'Soroush Mascot Full-Stack Systems Architect',
    featured: true,
  },
  {
    index: 2,
    title: 'UI & FRONTEND\nARCHITECTURE',
    description: 'Building immersive, user-friendly interfaces using advanced pipelines.',
    tags: ['REACT', 'WASM', 'STORYBOOK'],
    images: explorer,
    imageAlt: 'Soroush Mascot Frontend with UI blocks',
  },
  {
    index: 3,
    title: 'UNIFIED CROSS-PLATFORM FORGING',
    description:
      'Crafting one core logic engine to dominate web, mobile, and desktop environments.',
    tags: ['TYPESCRIPT', 'REACT_NATIVE', 'ELECTRON'],
    images: blacksmith,
    imageAlt: 'Soroush Mascot Blacksmith forging devices',
  },
  {
    index: 4,
    title: 'LLM PIPELINES &\nVECTOR EMBEDDINGS',
    description: 'Deploying large-scale inference engines and proprietary vector databases.',
    tags: ['RAG', 'MCP', 'AI_INTEGRATION'],
    images: fullstack,
    imageAlt: 'Soroush Mascot AI Scientist in lab',
  },
  {
    index: 5,
    title: 'STRATEGIC INFRASTRUCTURE & MIGRATION',
    description: 'Commanding large-scale cloud deployments and zero-downtime migrations.',
    tags: ['KUBERNETES', 'TERRAFORM', 'WAR_ROOM_OPS'],
    images: battlefieldCommander,
    imageAlt: 'Soroush Mascot Commander in DevOps war room',
  },
  {
    index: 6,
    title: 'FORENSIC DEBUGGING & TRACE LOGS',
    description: 'Investigating system failures and aberrant bug patterns in complex environments.',
    tags: ['STACK_TRACE', 'PROFILING', 'LOG_HARVEST'],
    images: debugger_,
    imageAlt: 'Soroush Mascot Detective with bug footprints',
  },

  {
    index: 7,
    title: 'HYPER-SCALING & LEGACY REFACTORING',
    description: 'Rebuilding legacy monoliths into high-performance, scalable micro-structures.',
    tags: ['DOCKER', 'DOMAIN_SPLIT', 'ZERO_DOWNTIME'],
    images: rebuilder,
    imageAlt: 'Soroush Mascot Cyberpunk Rebuilder Scaling',
  },

  {
    index: 8,
    title: 'BATTLE-TESTED TECH LEADERSHIP',
    description: 'Orchestrating complex team dynamics and technical roadmaps under pressure.',
    tags: ['STRATEGY', 'TEAM_SYNC', 'OUTCOME-FOCUSED'],
    images: orchestraConductor,
    imageAlt: 'Soroush Mascot Battlefield Strategist',
    featured: true,
  },
  {
    index: 9,
    title: 'REAL-TIME SYSTEMS & HIGH-CONCURRENCY',
    description:
      'Focus on live systems requiring extreme synchronization and parallel processing power.',
    tags: ['WEBSOCKETS', 'EVENT_LOOPS', 'LOAD_BALANCER'],
    images: signalData,
    imageAlt: 'Soroush Mascot Signal Real-time system Commander',
  },

  {
    index: 10,
    title: 'LATENCY SUPPRESSION & PERFORMANCE',
    description: "Hunting the 'latency monsters' to achieve sub-second response times.",
    tags: ['LOW_LATENCY', 'BYTE_SPEED', 'IO_OPS'],
    images: formula1Racer,
    imageAlt: 'Soroush Mascot F1 Racer Performance Speed',
  },

  {
    index: 11,
    title: 'DEVELOPER EXPERIENCE &\n' + 'INTERNAL TOOLING',
    description:
      'Empowering engineering teams through streamlined workflows, custom tooling and automation frameworks that accelerate delivery.',
    tags: ['TOOLCHAIN', 'WORKFLOWS', 'CODEGEN'],
    images: developerExperience,
    imageAlt: 'Soroush Mascot F1 Racer Performance Speed',
  },
]
