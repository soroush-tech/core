import { NetworkGraph } from 'src/common/NetworkGraph'
import { Typography } from '@soroush.tech/design-system/Typography'
import { experienceGraphData } from './ExperienceGraph.data.generated'
import { GraphLegend } from './components/GraphLegend'

export function ExperienceGraph() {
  return (
    <NetworkGraph
      data={experienceGraphData}
      graphChildren={GraphLegend}
      heading={
        <>
          Technology <br />
          <Typography as="span" color="primary">
            Experienced
          </Typography>{' '}
          Graph
        </>
      }
    />
  )
}
