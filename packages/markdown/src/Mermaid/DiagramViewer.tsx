import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type WheelEvent,
} from 'react'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Button } from '@soroush.tech/design-system/Button'
import { Icon, type IconName } from '@soroush.tech/design-system/Icon'
import { Modal } from '@soroush.tech/design-system/Modal'

const MIN_SCALE = 0.2
const MAX_SCALE = 5
const ZOOM_STEP = 0.2
const PAN_STEP = 48
// The viewport grows with the diagram between these bounds: tall enough that the controls are
// never clipped on a short diagram, capped so a huge one stays scrollable-by-pan (or fullscreen).
const MIN_HEIGHT = 180
const MAX_HEIGHT = 640

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export interface DiagramViewerProps {
  /** The rendered mermaid SVG markup. */
  svg: string
  /** Show the expand-to-fullscreen control and dialog. Off for the nested (in-dialog) viewer. */
  expandable?: boolean
  /** Fill the parent's height — used by the viewer inside the fullscreen dialog. */
  fill?: boolean
}

/**
 * Wraps a rendered mermaid diagram in a zoom/pan viewport with a themed control cluster
 * (bottom-right: a pan d-pad around a reset, plus zoom in/out) and an expand control
 * (top-right) that opens the diagram in a fullscreen dialog. Drag-to-pan and wheel-to-zoom
 * work too. Only the diagram layer clips; the controls sit above it, so a short diagram never
 * hides them. Everything is a CSS transform — no dependency.
 */
export function DiagramViewer({
  svg,
  expandable = true,
  fill = false,
}: Readonly<DiagramViewerProps>) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  // The diagram's unscaled height (`offsetHeight` ignores the CSS transform), so the inline
  // viewport can grow with zoom to fit instead of clipping.
  const [naturalHeight, setNaturalHeight] = useState(0)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNaturalHeight(contentRef.current!.offsetHeight)
  }, [svg])

  const zoomBy = (delta: number) =>
    setScale((current) => clamp(current + delta, MIN_SCALE, MAX_SCALE))

  const panBy = (dx: number, dy: number) =>
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }))

  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  const closeFullscreen = () => setFullscreen(false)

  // Wheel-zoom is enabled only in fullscreen (`fill`); inline, the wheel scrolls the page instead
  // of the diagram hijacking it.
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    zoomBy(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
  }

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    dragOrigin.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }
    setDragging(true)
  }

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return
    setOffset({ x: event.clientX - dragOrigin.current.x, y: event.clientY - dragOrigin.current.y })
  }

  const endDrag = () => {
    dragOrigin.current = null
    setDragging(false)
  }

  const control = (label: string, icon: IconName, onClick: () => void): ReactNode => (
    <Button
      key={label}
      type="button"
      variant="outlined"
      shape="rounded"
      size="sm"
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} size="1.1rem" />
    </Button>
  )

  // Inline, the viewport height tracks the zoom so a zoomed-in diagram grows to fit rather than
  // clipping; the base is the diagram's own height, bounded so it never starts too short or tall.
  const inlineHeight = Math.max(MIN_HEIGHT, clamp(naturalHeight, MIN_HEIGHT, MAX_HEIGHT) * scale)

  return (
    <>
      <View
        my={fill ? 0 : 2}
        position="relative"
        maxWidth="100%"
        borderRadius="md"
        height={fill ? '100%' : undefined}
      >
        <Flex
          onWheel={fill ? onWheel : undefined}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          overflow="hidden"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
          height={fill ? '100%' : `${inlineHeight}px`}
          // cursor and text-selection are interaction state with no styled-system prop; the
          // diagram is not selectable so a pan-drag never flickers a selection.
          style={{
            cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <View
            ref={contentRef}
            data-testid="diagram-transform"
            // A live CSS transform — dynamic per drag/zoom frame, so inline (not a token/prop).
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center',
              transition: dragging ? 'none' : 'transform 0.12s ease-out',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </Flex>

        {expandable && (
          <View position="absolute" top={1} right={1} zIndex={1}>
            {control('Expand diagram', 'fullscreen', () => setFullscreen(true))}
          </View>
        )}

        <Grid
          position="absolute"
          bottom={1}
          right={1}
          zIndex={1}
          gridTemplateColumns="repeat(3, auto)"
          gap={0.5}
        >
          <span aria-hidden />
          {control('Pan up', 'expand_less', () => panBy(0, -PAN_STEP))}
          {control('Zoom in', 'zoom_in', () => zoomBy(ZOOM_STEP))}
          {control('Pan left', 'chevron_left', () => panBy(-PAN_STEP, 0))}
          {control('Reset view', 'refresh', reset)}
          {control('Pan right', 'chevron_right', () => panBy(PAN_STEP, 0))}
          <span aria-hidden />
          {control('Pan down', 'expand_more', () => panBy(0, PAN_STEP))}
          {control('Zoom out', 'zoom_out', () => zoomBy(-ZOOM_STEP))}
        </Grid>
      </View>

      {expandable && (
        <Modal isOpen={fullscreen} onClose={closeFullscreen}>
          <Flex
            bg="paper"
            role="dialog"
            aria-label="Diagram fullscreen"
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            left={0}
            p={2}
          >
            <View position="absolute" top={2} right={2} zIndex={1}>
              {control('Close', 'close', closeFullscreen)}
            </View>
            <Flex flex={1} minHeight={0}>
              <DiagramViewer svg={svg} expandable={false} fill />
            </Flex>
          </Flex>
        </Modal>
      )}
    </>
  )
}
